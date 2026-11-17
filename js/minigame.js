/* ============================================================
   minigame.js — RAG RESCUE 技术小游戏
   工作流搭建 + 策略模拟 + 故障排查（本地确定性模拟，无真实模型）
   封装于 IIFE 内，不污染全局；不修改网站任何现有逻辑。
   ============================================================ */

(function () {
  "use strict";

  var root = document.getElementById("rgameRoot");
  var playBtn = document.getElementById("rgamePlayBtn");
  if (!root || !playBtn) return;

  /* ==================== 组件定义 ==================== */
  var DEFS = {
    rewrite: { label: "Query Rewrite",      cat: "query",     color: "#8FA4FF", desc: "对口语化查询进行改写，提升下游各检索通道的召回命中。", cost: 1, latency: 120 },
    bm25:    { label: "BM25 Retrieval",     cat: "retrieval", color: "#5B7CFF", desc: "关键词稀疏检索通道，擅长精确词匹配。", cost: 1, latency: 30 },
    vector:  { label: "Vector Retrieval",   cat: "retrieval", color: "#5B7CFF", desc: "向量语义检索通道，覆盖语义相关性。", cost: 3, latency: 80 },
    graph:   { label: "Knowledge Graph",    cat: "retrieval", color: "#5B7CFF", desc: "知识图谱结构化检索，利用实体关系补充知识。", cost: 4, latency: 150 },
    rrf:     { label: "RRF Fusion",         cat: "fusion",    color: "#FF875D", desc: "按倒数排名融合多路召回结果，消除单通道盲区。", cost: 1, latency: 20 },
    rerank:  { label: "BGE Reranker",       cat: "quality",   color: "#3ECF8E", desc: "交叉编码器对候选做精细相关性重排。", cost: 3, latency: 180 },
    eval:    { label: "Context Evaluation", cat: "quality",   color: "#3ECF8E", desc: "评估上下文是否足以支撑回答，决定生成策略。", cost: 1, latency: 100 },
    gen:     { label: "Answer Generation",  cat: "generate",  color: "#B48CFF", desc: "基于检索上下文生成答案。", cost: 5, latency: 400 },
    cite:    { label: "Citation Validation",cat: "validate",  color: "#FFD35D", desc: "校验答案引用依据，无有效引用时拒答。", cost: 1, latency: 60 },
  };

  /* 连接兼容矩阵（source type -> 允许的 target types） */
  var RET = ["bm25", "vector", "graph"];
  var ALLOWED = {
    rewrite: ["bm25", "vector", "graph", "rrf", "rerank", "eval", "gen"],
    bm25:    ["rrf", "rerank", "eval", "gen"],
    vector:  ["rrf", "rerank", "eval", "gen"],
    graph:   ["rrf", "rerank", "eval", "gen"],
    rrf:     ["rerank", "eval", "gen"],
    rerank:  ["eval", "gen"],
    eval:    ["gen"],
    gen:     ["cite"],
    cite:    [],
  };

  /* ==================== 关卡定义 ==================== */
  var LEVELS = [
    {
      name: "LEVEL 1",
      title: "修复低质量检索",
      brief: "线上问答系统相关性过低，回答经常跑偏。请调整检索策略，把检索质量提升到 75 以上。",
      goalText: "目标：检索质量 ≥ 75 · 资源预算 ≤ 12 · 无致命错误",
      budget: 12, qGoal: 75, gGoal: 0,
      requireNodes: [], requireEdges: [],
      initial: [
        { type: "vector", x: 200, y: 160, params: { top_k: 3 } },
        { type: "gen",    x: 540, y: 160, params: { model: "balanced" } },
      ],
      initialEdges: [[0, 1]],
    },
    {
      name: "LEVEL 2",
      title: "混合检索优化",
      brief: "单一 BM25 关键词通道覆盖不足。请组合 BM25 与向量检索，并使用 RRF Fusion 融合两路结果。",
      goalText: "目标：BM25 与 Vector 均接入 RRF · 检索质量 ≥ 75 · 资源预算 ≤ 16",
      budget: 16, qGoal: 75, gGoal: 0,
      requireNodes: ["bm25", "vector", "rrf"],
      requireEdges: [["bm25", "rrf"], ["vector", "rrf"]],
      initial: [
        { type: "bm25", x: 180, y: 160, params: { top_k: 3 } },
        { type: "gen",  x: 580, y: 160, params: { model: "balanced" } },
      ],
      initialEdges: [[0, 1]],
    },
    {
      name: "LEVEL 3",
      title: "答案质量优化",
      brief: "检索已混合，但答案仍缺依据、幻觉风险高。请加入重排、上下文评估与引用校验，让答案依据质量达到 80。",
      goalText: "目标：检索质量 ≥ 80 · 答案依据 ≥ 80 · Citation Validation 接入 · 资源预算 ≤ 24",
      budget: 24, qGoal: 80, gGoal: 80,
      requireNodes: ["bm25", "vector", "rrf", "cite"],
      requireEdges: [["bm25", "rrf"], ["vector", "rrf"]],
      initial: [
        { type: "bm25",  x: 120, y: 90,  params: { top_k: 3 } },
        { type: "vector",x: 120, y: 250, params: { top_k: 3 } },
        { type: "rrf",   x: 360, y: 170, params: {} },
        { type: "gen",   x: 640, y: 170, params: { model: "balanced" } },
      ],
      initialEdges: [[0, 2], [1, 2], [2, 3]],
    },
  ];

  /* ==================== 状态 ==================== */
  var state = {
    level: 0,
    cleared: [false, false, false],
    nodes: [],          // {id, type, x, y, params}
    edges: [],          // {from, to}
    nextId: 1,
    selected: null,
    pendingFrom: null,  // 连接中的源节点
    running: false,
    lastResult: null,
    firstOpen: true,
  };

  /* ==================== DOM ==================== */
  var $ = function (id) { return document.getElementById(id); };
  var canvasWrap = $("rgameCanvasWrap"), canvas = $("rgameCanvas"),
      svg = $("rgameEdges"), compsEl = $("rgameComps"), levelsEl = $("rgameLevels"),
      goalEl = $("rgameGoal"), logsEl = $("rgameLogs"), diagEl = $("rgameDiag"),
      cfgEl = $("rgameCfg"), winEl = $("rgameWin"), winCard = $("rgameWinCard"),
      selInfo = $("rgameSelectInfo"), mQ = $("rgameMQuality"), mG = $("rgameMGround"),
      mL = $("rgameMLatency"), mB = $("rgameMBudget"),
      runBtn = $("rgameRun"), resetBtn = $("rgameResetLevel"),
      helpEl = $("rgameSideHelp");

  var SVGNS = "http://www.w3.org/2000/svg";
  var nodeEls = {}; // id -> element

  /* ==================== 工具 ==================== */
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function nodeById(id) { return state.nodes.find(function (n) { return n.id === id; }); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  function nodeCost(n) {
    var c = DEFS[n.type].cost;
    if (n.type === "rewrite" && n.params.strategy === "deep") c += 1;
    if (n.type === "rerank" && n.params.mode === "precise") c += 1;
    if (n.params.top_k > 4) c += n.params.top_k - 4;
    return c;
  }
  function nodeLatency(n) {
    var L = DEFS[n.type].latency;
    if (n.type === "rewrite" && n.params.strategy === "deep") L += 40;
    if (n.type === "rerank" && n.params.mode === "precise") L += 40;
    if (n.params.top_k) L += ({ bm25: 5, vector: 10, graph: 15 }[n.type] || 0) * n.params.top_k;
    if (n.type === "gen" && n.params.model === "fast") L -= 150;
    return L;
  }
  function paramBadge(n) {
    var p = n.params, t = n.type;
    if (t === "rewrite") return "strategy: " + (p.strategy || "standard");
    if (t === "rerank") return "mode: " + (p.mode || "standard");
    if (t === "eval") return "threshold: " + (p.threshold || 65);
    if (t === "gen") return "model: " + (p.model || "balanced");
    if (p.top_k) return "top_k: " + p.top_k;
    return "";
  }
  function totalCost() {
    return state.nodes.reduce(function (s, n) { return s + nodeCost(n); }, 0);
  }

  /* ==================== 打开 / 关闭 ==================== */
  playBtn.addEventListener("click", function () {
    if (state.firstOpen) { state.firstOpen = false; loadLevel(0); }
    root.hidden = false;
    document.body.style.overflow = "hidden";
  });
  $("rgameExit").addEventListener("click", closeGame);
  function closeGame() {
    cancelPending();
    root.hidden = true;
    document.body.style.overflow = "";
  }

  document.addEventListener("keydown", function (e) {
    if (!root.hidden && e.key === "Escape") {
      if (state.pendingFrom) cancelPending();
      else closeGame();
    }
    if (!root.hidden && (e.key === "Delete" || e.key === "Backspace")
        && state.selected && !/INPUT|SELECT|TEXTAREA/.test(document.activeElement.tagName)) {
      e.preventDefault();
      deleteNode(state.selected);
    }
  });

  /* ==================== 关卡 ==================== */
  function loadLevel(i) {
    state.level = i;
    var L = LEVELS[i];
    state.nodes = L.initial.map(function (n) {
      return { id: state.nextId++, type: n.type, x: n.x, y: n.y, params: JSON.parse(JSON.stringify(n.params)) };
    });
    state.edges = L.initialEdges.map(function (p) {
      return { from: state.nodes[p[0]].id, to: state.nodes[p[1]].id };
    });
    state.selected = null;
    state.pendingFrom = null;
    state.lastResult = null;
    renderLevels();
    renderGoal();
    renderNodes();
    renderEdges();
    renderCfg();
    renderBudget();
    mQ.textContent = "--"; mG.textContent = "--"; mL.textContent = "--";
    mQ.className = ""; mG.className = "";
    logsEl.innerHTML = '<span class="lg-info">[sys] ' + esc(L.name + " · " + L.title) + " — 画布已就绪，等待运行…</span>";
    diagEl.innerHTML = '<div class="dg dg-info"><i>ℹ</i><span>点击 RUN WORKFLOW 运行当前工作流，运行后显示诊断。</span></div>';
    winEl.hidden = true;
    selInfo.textContent = "未选中节点";
  }

  function renderLevels() {
    levelsEl.innerHTML = "";
    LEVELS.forEach(function (L, i) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "rgame__lvl" + (i === state.level ? " is-current" : "") + (state.cleared[i] ? " is-cleared" : "");
      b.textContent = L.name + (state.cleared[i] ? " ✓" : (i === state.level ? " ▶" : ""));
      var unlocked = i === 0 || state.cleared[i - 1];
      if (!unlocked) { b.disabled = true; b.textContent = L.name + " 🔒"; }
      b.addEventListener("click", function () { if (!state.running) loadLevel(i); });
      levelsEl.appendChild(b);
    });
  }

  function renderGoal() {
    var L = LEVELS[state.level];
    goalEl.innerHTML = "<b>" + esc(L.name + " · " + L.title) + "</b>　" + esc(L.brief) + "<br/><span style='color:#67718C;font-family:monospace;font-size:11px'>" + esc(L.goalText) + "</span>";
  }

  resetBtn.addEventListener("click", function () { if (!state.running) loadLevel(state.level); });

  /* ==================== 组件栏 ==================== */
  (function renderComps() {
    compsEl.innerHTML = "";
    Object.keys(DEFS).forEach(function (t) {
      var d = DEFS[t];
      var el = document.createElement("div");
      el.className = "rgame__comp";
      el.dataset.type = t;
      el.innerHTML = "<i style='background:" + d.color + "'></i>" + d.label + "<small>▲" + d.cost + "</small>";
      compsEl.appendChild(el);
    });
    if (helpEl) {
      helpEl.innerHTML =
        "<b>桌面端</b><br/>· 拖组件进画布<br/>· 拖节点调整位置<br/>· 从右侧圆点拖到目标<br/>· 点击节点配置参数<br/>· Delete 删除节点<br/>· 点击连线可删除<br/><br/><b>移动端</b><br/>· 点组件添加到画布<br/>· 点输出圆点再点目标节点完成连接";
    }
  })();

  /* 组件拖拽添加 / 点击添加 */
  (function initCompDrag() {
    var ghost = null, pendingType = null, startX = 0, startY = 0, moved = false;

    compsEl.addEventListener("pointerdown", function (e) {
      var item = e.target.closest(".rgame__comp");
      if (!item || state.running) return;
      pendingType = item.dataset.type;
      startX = e.clientX; startY = e.clientY; moved = false;
      var onMove = function (ev) {
        if (!moved && Math.abs(ev.clientX - startX) + Math.abs(ev.clientY - startY) > 8) {
          moved = true;
          ghost = document.createElement("div");
          ghost.className = "rgame__ghost";
          ghost.textContent = DEFS[pendingType].label;
          document.body.appendChild(ghost);
        }
        if (ghost) {
          ghost.style.left = ev.clientX + "px";
          ghost.style.top = ev.clientY + "px";
        }
      };
      var onUp = function (ev) {
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
        var inside = false, cx = 0, cy = 0;
        if (ghost) {
          var hit = document.elementFromPoint(ev.clientX, ev.clientY);
          inside = !!(hit && canvasWrap.contains(hit));
          ghost.remove(); ghost = null;
        }
        if (inside) {
          var r = canvasWrap.getBoundingClientRect();
          cx = ev.clientX - r.left + canvasWrap.scrollLeft;
          cy = ev.clientY - r.top + canvasWrap.scrollTop;
        } else {
          cx = canvasWrap.scrollLeft + canvasWrap.clientWidth / 2 - 79 + (Math.random() * 40 - 20);
          cy = canvasWrap.scrollTop + canvasWrap.clientHeight / 2 - 23 + (Math.random() * 40 - 20);
        }
        addNode(pendingType, clamp(cx, 10, 2230), clamp(cy, 10, 1520));
        pendingType = null;
      };
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
    });
  })();

  function addNode(type, x, y) {
    var defaults = { top_k: 3, strategy: "standard", mode: "standard", threshold: 65, model: "balanced" };
    var p = {};
    if (type === "rewrite") { p.strategy = "standard"; }
    if (RET.indexOf(type) >= 0) { p.top_k = 3; }
    if (type === "rerank") { p.mode = "standard"; }
    if (type === "eval") { p.threshold = 65; }
    if (type === "gen") { p.model = "balanced"; }
    var n = { id: state.nextId++, type: type, x: x, y: y, params: p };
    state.nodes.push(n);
    renderNodes(); renderEdges(); renderBudget();
    selectNode(n.id);
    pushLog("info", "已添加组件 " + DEFS[type].label + "（预算占用 " + totalCost() + "/" + LEVELS[state.level].budget + "）");
  }

  /* ==================== 节点渲染 ==================== */
  function renderNodes() {
    canvas.querySelectorAll(".rgame__node").forEach(function (el) { el.remove(); });
    nodeEls = {};
    state.nodes.forEach(function (n) {
      var d = DEFS[n.type];
      var el = document.createElement("div");
      el.className = "rgame__node";
      el.dataset.id = n.id;
      el.style.left = n.x + "px";
      el.style.top = n.y + "px";
      el.style.setProperty("--nc", d.color);
      el.innerHTML =
        '<div class="rgame__node-label">' + esc(d.label) + "</div>" +
        '<div class="rgame__node-param">' + esc(paramBadge(n)) + "</div>" +
        '<span class="rgame__port rgame__port--in" data-port="in"></span>' +
        '<span class="rgame__port rgame__port--out" data-port="out"></span>';
      if (state.selected === n.id) el.classList.add("is-selected");
      canvas.appendChild(el);
      nodeEls[n.id] = el;
    });
  }

  function refreshNodeBadge(n) {
    var el = nodeEls[n.id];
    if (el) el.querySelector(".rgame__node-param").textContent = paramBadge(n);
  }

  /* 端口坐标（基于实际 DOM 尺寸） */
  function portPos(id, side) {
    var el = nodeEls[id];
    var n = nodeById(id);
    if (!el || !n) return { x: n ? n.x : 0, y: n ? n.y : 0 };
    var w = el.offsetWidth, h = el.offsetHeight;
    return { x: side === "out" ? n.x + w : n.x, y: n.y + h / 2 };
  }

  /* ==================== 连线渲染 ==================== */
  function edgePath(a, b) {
    var dx = Math.max(45, Math.abs(b.x - a.x) / 2);
    return "M" + a.x + " " + a.y + " C" + (a.x + dx) + " " + a.y + ", " + (b.x - dx) + " " + b.y + ", " + b.x + " " + b.y;
  }
  function makePath(cls, d, hit) {
    var p = document.createElementNS(SVGNS, "path");
    p.setAttribute("d", d);
    p.setAttribute("fill", "none");
    p.setAttribute("class", cls);
    if (hit) { p.setAttribute("stroke", "transparent"); p.setAttribute("stroke-width", "16"); }
    else { p.setAttribute("stroke", "#4A5B8C"); p.setAttribute("stroke-width", "2"); p.setAttribute("stroke-linecap", "round"); }
    return p;
  }

  function renderEdges() {
    while (svg.firstChild && svg.firstChild.tagName === "defs") break;
    Array.prototype.slice.call(svg.querySelectorAll("path")).forEach(function (p) { p.remove(); });
    state.edges.forEach(function (e) {
      var d = edgePath(portPos(e.from, "out"), portPos(e.to, "in"));
      var hit = makePath("rgame__edge-hit", d, true);
      hit.dataset.edge = e.from + "-" + e.to;
      var line = makePath("rgame__edge-line", d, false);
      line.dataset.edge = e.from + "-" + e.to;
      svg.appendChild(hit);
      svg.appendChild(line);
    });
  }

  svg.addEventListener("pointerdown", function (e) {
    var hit = e.target.closest ? e.target.closest(".rgame__edge-hit") : null;
    if (!hit) return;
    var parts = hit.dataset.edge.split("-");
    var f = +parts[0], t = +parts[1];
    if (state.running) return;
    state.edges = state.edges.filter(function (x) { return !(x.from === f && x.to === t); });
    renderEdges(); renderCfg();
    selInfo.innerHTML = "已删除一条连接";
    e.preventDefault();
  });

  /* ==================== 画布交互（拖动 / 连接 / 选择） ==================== */
  function wouldCycle(from, to) {
    // to 能否到达 from
    var seen = {}, stack = [to];
    while (stack.length) {
      var cur = stack.pop();
      if (cur === from) return true;
      if (seen[cur]) continue;
      seen[cur] = true;
      state.edges.forEach(function (e) { if (e.from === cur) stack.push(e.to); });
    }
    return false;
  }

  function tryConnect(from, to) {
    if (from === to) { flash(to, "不能连接自身"); return false; }
    var ft = nodeById(from).type, tt = nodeById(to).type;
    if ((ALLOWED[ft] || []).indexOf(tt) < 0) {
      flash(to, DEFS[ft].label + " 不能直接连接 " + DEFS[tt].label);
      return false;
    }
    if (wouldCycle(from, to)) { flash(to, "该连接会形成环路，已阻止"); return false; }
    if (state.edges.some(function (e) { return e.from === from && e.to === to; })) {
      flash(to, "连接已存在");
      return false;
    }
    state.edges.push({ from: from, to: to });
    renderEdges(); renderCfg();
    selInfo.innerHTML = "已连接 <b>" + esc(DEFS[ft].label) + "</b> → <b>" + esc(DEFS[tt].label) + "</b>";
    return true;
  }

  function flash(id, msg) {
    var el = nodeEls[id];
    if (el) {
      el.classList.remove("is-shake");
      void el.offsetWidth;
      el.classList.add("is-shake");
    }
    selInfo.innerHTML = "<b>⚠</b> " + esc(msg);
  }

  function cancelPending() {
    state.pendingFrom = null;
    if (tempEdge) { tempEdge.remove(); tempEdge = null; }
    Object.keys(nodeEls).forEach(function (id) {
      var p = nodeEls[id].querySelector(".rgame__port--out");
      if (p) p.classList.remove("is-pending");
    });
  }

  var tempEdge = null;

  canvas.addEventListener("pointerdown", function (e) {
    if (state.running) return;
    var port = e.target.closest(".rgame__port");
    var nodeEl = e.target.closest(".rgame__node");

    /* 输出端口：发起连接 */
    if (port && port.classList.contains("rgame__port--out") && nodeEl) {
      e.preventDefault();
      var fromId = +nodeEl.dataset.id;
      state.pendingFrom = fromId;
      port.classList.add("is-pending");
      selInfo.innerHTML = "连接模式：点击目标节点的左侧圆点完成连接（Esc 取消）";
      var a = portPos(fromId, "out");
      tempEdge = makePath("rgame__edge-line is-temp", "", false);
      tempEdge.setAttribute("stroke", "#FF875D");
      tempEdge.setAttribute("stroke-dasharray", "6 5");
      svg.appendChild(tempEdge);
      var moveHandler = function (ev) {
        var r = canvasWrap.getBoundingClientRect();
        var b = { x: ev.clientX - r.left + canvasWrap.scrollLeft, y: ev.clientY - r.top + canvasWrap.scrollTop };
        if (tempEdge) tempEdge.setAttribute("d", edgePath(a, b));
      };
      var upHandler = function (ev) {
        window.removeEventListener("pointermove", moveHandler);
        window.removeEventListener("pointerup", upHandler);
        var hit = document.elementFromPoint(ev.clientX, ev.clientY);
        var targetNode = hit && hit.closest ? hit.closest(".rgame__node") : null;
        if (targetNode && +targetNode.dataset.id !== fromId) {
          var ok = tryConnect(fromId, +targetNode.dataset.id);
          if (ok) cancelPending();
          else { /* 保持连接模式 */ if (tempEdge) { tempEdge.remove(); tempEdge = null; } }
        } else if (tempEdge) {
          tempEdge.remove(); tempEdge = null; /* 无目标 → 保持点击连接模式 */
        }
      };
      window.addEventListener("pointermove", moveHandler);
      window.addEventListener("pointerup", upHandler);
      return;
    }

    /* 节点体：拖动 / 选择 / 完成连接 */
    if (nodeEl) {
      e.preventDefault();
      var id = +nodeEl.dataset.id;
      var n = nodeById(id);
      var sx = e.clientX, sy = e.clientY, ox = n.x, oy = n.y, didMove = false;
      nodeEl.classList.add("is-dragging");
      var onMove = function (ev) {
        var dx = ev.clientX - sx, dy = ev.clientY - sy;
        if (!didMove && Math.abs(dx) + Math.abs(dy) > 6) didMove = true;
        if (didMove) {
          n.x = clamp(ox + dx, 10, 2230);
          n.y = clamp(oy + dy, 10, 1520);
          nodeEl.style.left = n.x + "px";
          nodeEl.style.top = n.y + "px";
          renderEdgesThrottled();
          if (tempEdge) {
            var a2 = portPos(state.pendingFrom, "out");
            var r2 = canvasWrap.getBoundingClientRect();
            tempEdge.setAttribute("d", edgePath(a2, { x: ev.clientX - r2.left + canvasWrap.scrollLeft, y: ev.clientY - r2.top + canvasWrap.scrollTop }));
          }
        }
      };
      var onUp = function (ev) {
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
        nodeEl.classList.remove("is-dragging");
        if (didMove) { renderEdges(); return; }
        /* 未移动 = 点击 */
        if (state.pendingFrom && state.pendingFrom !== id) {
          var ok = tryConnect(state.pendingFrom, id);
          cancelPending();
          if (ok) return;
        }
        selectNode(id);
      };
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
      return;
    }

    /* 空白处：取消连接 / 取消选择 */
    if (state.pendingFrom) cancelPending();
    else if (state.selected) { state.selected = null; renderCfg(); refreshSelection(); }
  });

  var rafPending = false;
  function renderEdgesThrottled() {
    if (rafPending) return;
    rafPending = true;
    requestAnimationFrame(function () { rafPending = false; renderEdges(); });
  }

  function refreshSelection() {
    Object.keys(nodeEls).forEach(function (id) {
      nodeEls[id].classList.toggle("is-selected", +id === state.selected);
    });
  }

  function selectNode(id) {
    state.selected = id;
    refreshSelection();
    renderCfg();
    var n = nodeById(id);
    if (n) selInfo.innerHTML = "已选中 <b>" + esc(DEFS[n.type].label) + "</b> — 右侧面板可修改参数";
  }

  function deleteNode(id) {
    if (state.running) return;
    var n = nodeById(id);
    if (!n) return;
    state.nodes = state.nodes.filter(function (x) { return x.id !== id; });
    state.edges = state.edges.filter(function (e) { return e.from !== id && e.to !== id; });
    if (state.selected === id) state.selected = null;
    renderNodes(); renderEdges(); renderCfg(); renderBudget();
    selInfo.textContent = "已删除 " + DEFS[n.type].label;
  }

  /* ==================== 配置面板 ==================== */
  function renderCfg() {
    var n = state.selected && nodeById(state.selected);
    if (!n) {
      cfgEl.innerHTML = '<div class="rgame__cfg-empty">未选中节点。<br/><br/>点击画布中的节点，在这里修改它的参数；参数会直接影响模拟结果。</div>';
      return;
    }
    var d = DEFS[n.type];
    var html = '<div class="rgame__cfg-title" style="--nc:' + d.color + '"><i></i>' + esc(d.label) + "</div>" +
      '<div class="rgame__cfg-desc">' + esc(d.desc) + "</div>";

    if (n.type === "rewrite") {
      html += '<div class="rgame__field"><label>STRATEGY 改写深度</label><select data-param="strategy">' +
        '<option value="standard"' + (n.params.strategy === "standard" ? " selected" : "") + '>standard（+18 检索加成）</option>' +
        '<option value="deep"' + (n.params.strategy === "deep" ? " selected" : "") + '>deep（+24，成本 +1）</option></select></div>';
    }
    if (RET.indexOf(n.type) >= 0) {
      html += '<div class="rgame__field"><label>TOP_K 召回数量 <output>' + (n.params.top_k || 3) + "</output></label>" +
        '<input type="range" min="1" max="8" step="1" value="' + (n.params.top_k || 3) + '" data-param="top_k"/></div>';
    }
    if (n.type === "rerank") {
      html += '<div class="rgame__field"><label>MODE 重排强度</label><select data-param="mode">' +
        '<option value="standard"' + (n.params.mode === "standard" ? " selected" : "") + '>standard（+15 质量加成）</option>' +
        '<option value="precise"' + (n.params.mode === "precise" ? " selected" : "") + '>precise（+21，成本 +1）</option></select></div>';
    }
    if (n.type === "eval") {
      html += '<div class="rgame__field"><label>THRESHOLD 质量阈值</label><select data-param="threshold">' +
        [55, 65, 75].map(function (v) { return '<option value="' + v + '"' + ((n.params.threshold || 65) === v ? " selected" : "") + ">" + v + "</option>"; }).join("") +
        "</select></div>";
    }
    if (n.type === "gen") {
      html += '<div class="rgame__field"><label>MODEL 生成模型</label><select data-param="model">' +
        '<option value="balanced"' + (n.params.model === "balanced" ? " selected" : "") + '>balanced（标准）</option>' +
        '<option value="fast"' + (n.params.model === "fast" ? " selected" : "") + '>fast（-5 质量，更快）</option></select></div>';
    }
    if (n.type === "rrf" || n.type === "cite") {
      html += '<div class="rgame__cfg-desc">该组件无参数。' + (n.type === "cite" ? "它会检查答案引用依据，无有效引用时选择拒答。" : "它融合接入的多路召回结果。") + "</div>";
    }
    html += '<div class="rgame__cfg-meta">单次成本 ▲' + nodeCost(n) + " ｜ 单次耗时 ⏱" + nodeLatency(n) + "ms</div>" +
      '<button class="rgame__delbtn" id="rgameDel" type="button">✕ 删除该节点</button>';
    cfgEl.innerHTML = html;

    $("rgameDel").addEventListener("click", function () { deleteNode(n.id); });
    cfgEl.querySelectorAll("[data-param]").forEach(function (input) {
      var key = input.dataset.param;
      var evName = input.tagName === "SELECT" ? "change" : "input";
      input.addEventListener(evName, function () {
        n.params[key] = input.tagName === "SELECT" ? input.value : +input.value;
        var out = cfgEl.querySelector("output");
        if (out && key === "top_k") out.textContent = n.params.top_k;
        refreshNodeBadge(n);
        renderCfgMeta(n);
        renderBudget();
      });
    });
  }

  function renderCfgMeta(n) {
    var meta = cfgEl.querySelector(".rgame__cfg-meta");
    if (meta) meta.innerHTML = "单次成本 ▲" + nodeCost(n) + " ｜ 单次耗时 ⏱" + nodeLatency(n) + "ms";
  }

  /* ==================== 预算显示 ==================== */
  function renderBudget() {
    var L = LEVELS[state.level];
    var cost = totalCost();
    mB.textContent = cost + "/" + L.budget;
    mB.className = cost > L.budget ? "is-bad" : "";
  }

  /* ==================== 日志 ==================== */
  function pushLog(cls, msg) {
    var line = document.createElement("div");
    if (cls) line.className = "lg-" + cls;
    line.textContent = msg;
    logsEl.appendChild(line);
    logsEl.scrollTop = logsEl.scrollHeight;
  }

  /* ==================== 模拟引擎（确定性） ==================== */
  function ancestorsOf(id) {
    var set = {}, stack = [id];
    while (stack.length) {
      var cur = stack.pop();
      state.edges.forEach(function (e) {
        if (e.to === cur && !set[e.from]) { set[e.from] = true; stack.push(e.from); }
      });
    }
    return set;
  }

  function simulate() {
    var L = LEVELS[state.level];
    var res = { fatal: null, quality: 0, grounding: 0, latency: 0, cost: 0, logs: [], diags: [], path: [], genId: null, citeId: null, evalInPath: false };

    res.cost = totalCost();
    if (res.cost > L.budget) {
      res.fatal = "资源预算超支：当前配置 ▲" + res.cost + " / 预算 " + L.budget + "，请删除或简化部分组件。";
      return res;
    }
    var gens = state.nodes.filter(function (n) { return n.type === "gen"; });
    if (!state.nodes.length) { res.fatal = "画布为空：请先从左侧拖入组件。"; return res; }
    if (!gens.length) { res.fatal = "工作流缺少 Answer Generation 节点，无法生成答案。"; return res; }
    var gen = gens[0];
    res.genId = gen.id;
    var anc = ancestorsOf(gen.id);
    if (!anc || Object.keys(anc).length === 0) {
      res.fatal = "Answer Generation 没有任何输入连接，请先把检索/融合结果接入它。";
      return res;
    }
    var sub = {};
    anc[gen.id] = true;
    Object.keys(anc).forEach(function (k) { sub[+k] = true; });

    /* 拓扑排序（子图） */
    var order = [], remaining = {};
    Object.keys(sub).forEach(function (k) { remaining[k] = true; });
    var guard = 0;
    while (Object.keys(remaining).length && guard++ < 500) {
      var progressed = false;
      Object.keys(remaining).map(Number).forEach(function (id) {
        var ready = state.edges.every(function (e) {
          return !(e.to === id && sub[e.from] && remaining[e.from]);
        });
        if (ready) { order.push(id); delete remaining[id]; progressed = true; }
      });
      if (!progressed) break;
    }

    var score = {};      // 节点输出质量
    var conflictWarned = {};
    res.path = order;

    order.forEach(function (id) {
      var n = nodeById(id);
      if (!n) return;
      var type = n.type;
      var inScores = state.edges.filter(function (e) { return e.to === id && sub[e.from] && score[e.from] !== undefined; })
        .map(function (e) { return score[e.from]; });

      if (type === "rewrite") { score[id] = undefined; return; }

      if (RET.indexOf(type) >= 0) {
        var bonus = 0;
        var ancSet = ancestorsOf(id);
        Object.keys(ancSet).map(Number).forEach(function (aid) {
          if (!sub[aid]) return;
          var an = nodeById(aid);
          if (an && an.type === "rewrite") {
            bonus = Math.max(bonus, an.params.strategy === "deep" ? 24 : 18);
          }
        });
        score[id] = baseScore(n) + bonus;
        return;
      }

      /* 需要输入的节点 */
      if (!inScores.length) { score[id] = undefined; return; }

      if (type === "rrf") {
        var rrInputs = state.edges.filter(function (e) { return e.to === id && sub[e.from] && RET.indexOf(nodeById(e.from).type) >= 0 && score[e.from] !== undefined; })
          .map(function (e) { return score[e.from]; }).sort(function (a, b) { return b - a; });
        if (rrInputs.length >= 2) {
          score[id] = Math.round(0.6 * rrInputs[0] + 0.4 * rrInputs[1] + 12);
          res.diags.push({ t: "ok", m: "混合检索生效：RRF 融合 " + rrInputs.length + " 路召回（top2: " + rrInputs[0] + " / " + rrInputs[1] + "）" });
        } else {
          score[id] = rrInputs[0] || undefined;
          res.diags.push({ t: "warn", m: "RRF 只接入了 1 路检索，融合意义不大——建议再接入另一条检索通道。" });
        }
        return;
      }

      /* eval / rerank / gen：多路直接汇入（非 RRF）→ 通道冲突 */
      if (inScores.length > 1) {
        score[id] = Math.max.apply(null, inScores) - 12;
        if (!conflictWarned[id]) {
          conflictWarned[id] = true;
          res.diags.push({ t: "warn", m: "检测到 " + inScores.length + " 路检索结果未融合直接汇入 " + DEFS[type].label + "，通道冲突（-12）：建议使用 RRF Fusion。" });
        }
      } else {
        score[id] = inScores[0];
      }

      if (type === "rerank") {
        var bonus2 = n.params.mode === "precise" ? 21 : 15;
        score[id] = Math.min(98, score[id] + bonus2);
      }
      if (type === "eval") {
        res.evalInPath = true;
        var thr = n.params.threshold || 65;
        if (score[id] < thr) {
          res.diags.push({ t: "warn", m: "Context Evaluation：上下文质量 " + score[id] + " 低于阈值 " + thr + "，建议加强检索或提高 top_k。" });
        }
      }
      if (type === "gen") {
        var q = score[id];
        if (n.params.model === "fast") q -= 5;
        res.quality = Math.max(0, q);
      }
    });

    if (res.quality <= 0) {
      res.fatal = "Answer Generation 没有有效的检索输入（检查中间节点是否缺少连接）。";
      return res;
    }

    /* 引用校验 */
    var cites = state.nodes.filter(function (n) { return n.type === "cite"; });
    var g = Math.min(95, Math.round(res.quality * 0.75));
    if (res.evalInPath) g += 6; else g -= 8;
    var citeNode = null;
    cites.forEach(function (c) { if (state.edges.some(function (e) { return e.from === gen.id && e.to === c.id; })) citeNode = c; });
    if (citeNode) {
      res.citeId = citeNode.id;
      res.path.push(citeNode.id);
      if (res.quality >= 65) { g += 18; }
      else {
        g = 42;
        res.diags.push({ t: "warn", m: "Citation Validation：答案质量 " + res.quality + " 过低且无有效引用，系统选择拒答（幻觉保护）。" });
      }
    } else {
      res.diags.push({ t: "warn", m: "答案未经过 Citation Validation 校验，存在无依据回答风险（ grounding 已扣减）。" });
    }
    res.grounding = clamp(g, 0, 98);

    /* 耗时 = 执行路径 */
    res.latency = res.path.reduce(function (s, id) { var n = nodeById(id); return s + (n ? nodeLatency(n) : 0); }, 0);

    /* 通用诊断 */
    state.nodes.forEach(function (n) {
      if (RET.indexOf(n.type) >= 0 && !res.path.some(function (p) { return nodeById(p) && nodeById(p).type === n.type; }) === false) return;
      if (RET.indexOf(n.type) >= 0 && !state.edges.some(function (e) { return e.from === n.id; })) {
        res.diags.push({ t: "warn", m: DEFS[n.type].label + " 的结果没有接入任何下游节点。" });
      }
    });
    var hasRewriteEffect = order.some(function (id) {
      var n = nodeById(id);
      if (!n || RET.indexOf(n.type) < 0) return false;
      var a = ancestorsOf(id);
      return Object.keys(a).some(function (k) { var an = nodeById(+k); return an && an.type === "rewrite"; });
    });
    var hasRewrite = state.nodes.some(function (n) { return n.type === "rewrite"; });
    if (hasRewrite && !hasRewriteEffect) {
      res.diags.push({ t: "warn", m: "Query Rewrite 未作用于任何检索节点（未在检索上游），改写加成未生效。" });
    }
    if (!res.evalInPath) {
      res.diags.push({ t: "warn", m: "工作流没有 Context Evaluation，系统无法在生成前评估上下文质量。" });
    }
    if (res.quality < L.qGoal) {
      res.diags.push({ t: "info", m: "距目标还差 " + (L.qGoal - res.quality) + " 检索质量：可尝试 Query Rewrite、提高 top_k、接入 RRF 混合检索或增加 Reranker。" });
    }
    if (L.gGoal && res.grounding < L.gGoal) {
      res.diags.push({ t: "info", m: "答案依据不足（" + res.grounding + "/" + L.gGoal + "）：接入 Citation Validation 并保证生成质量 ≥ 65。" });
    }
    if (!res.diags.some(function (d) { return d.t === "ok"; })) {
      res.diags.unshift({ t: "info", m: "基础管线已跑通，但尚未触发任何质量增强组件的正向反馈。" });
    }
    return res;
  }

  function baseScore(n) {
    var k = n.params.top_k || 3;
    if (n.type === "bm25") return 34 + 3 * k;
    if (n.type === "vector") return 38 + 4 * k;
    return 40 + 4 * k; /* graph */
  }

  /* ==================== 运行 ==================== */
  runBtn.addEventListener("click", function () {
    if (state.running) return;
    var L = LEVELS[state.level];
    logsEl.innerHTML = "";
    var res = simulate();

    if (res.fatal) {
      pushLog("err", "[sys] RUN ABORTED — " + res.fatal);
      diagEl.innerHTML = '<div class="dg dg-err"><i>✕</i><span>' + esc(res.fatal) + "</span></div>" +
        (res.cost > L.budget ? '<div class="dg dg-info"><i>ℹ</i><span>预算：▲' + res.cost + " / " + L.budget + "。删除未使用的组件可以释放预算。</span></div>" : "");
      mQ.textContent = "--"; mG.textContent = "--"; mL.textContent = "--";
      selInfo.innerHTML = "<b>✕</b> 运行失败，见下方诊断";
      return;
    }

    state.running = true;
    runBtn.disabled = true;
    winEl.hidden = true;
    var t = 0;
    res.path.forEach(function (id, i) {
      var n = nodeById(id);
      if (!n) return;
      t += nodeLatency(n);
      setTimeout(function () {
        var el = nodeEls[id];
        if (el) {
          el.classList.add("is-running");
          setTimeout(function () { el.classList.remove("is-running"); }, 400);
        }
        state.edges.forEach(function (e) {
          if (e.to === id || e.from === id) {
            var line = svg.querySelector('.rgame__edge-line[data-edge="' + e.from + "-" + e.to + '"]');
            if (line) { line.classList.add("is-active"); setTimeout(function () { line.classList.remove("is-active"); }, 500); }
          }
        });
        var label = DEFS[n.type].label;
        var extra = "";
        if (n.type === "gen") extra = " → 答案质量 " + res.quality;
        if (n.type === "cite") extra = res.quality >= 65 ? " → 引用校验通过" : " → 无有效引用，拒答";
        pushLog("", "[+" + (t / 1000).toFixed(2) + "s] " + label + " 执行完成" + extra);
      }, i * 240);
    });

    setTimeout(function () {
      state.running = false;
      runBtn.disabled = false;
      state.lastResult = res;
      mQ.textContent = res.quality;
      mG.textContent = res.grounding;
      mL.textContent = (res.latency / 1000).toFixed(2) + "s";
      mQ.className = res.quality >= L.qGoal ? "is-good" : (res.quality < 50 ? "is-bad" : "");
      mG.className = res.grounding >= (L.gGoal || 70) ? "is-good" : (res.grounding < 50 ? "is-bad" : "");
      selInfo.innerHTML = "运行完成 — 检索质量 <b>" + res.quality + "</b> / 答案依据 <b>" + res.grounding + "</b>";

      /* 诊断面板 */
      diagEl.innerHTML = res.diags.map(function (d) {
        var icon = { ok: "✓", warn: "⚠", err: "✕", info: "ℹ" }[d.t];
        return '<div class="dg dg-' + d.t + '"><i>' + icon + "</i><span>" + esc(d.m) + "</span></div>";
      }).join("") || '<div class="dg dg-ok"><i>✓</i><span>一切正常。</span></div>';

      if (res.path.indexOf(res.citeId) < 0 && res.citeId) res.path.push(res.citeId);
      checkWin(res);
    }, res.path.length * 240 + 260);
  });

  /* ==================== 通关判定 ==================== */
  function checkWin(res) {
    var L = LEVELS[state.level];
    var ok = res.quality >= L.qGoal
      && (!L.gGoal || res.grounding >= L.gGoal)
      && L.requireNodes.every(function (t) { return state.nodes.some(function (n) { return n.type === t; }); })
      && L.requireEdges.every(function (p) {
        return state.edges.some(function (e) {
          return nodeById(e.from) && nodeById(e.to) &&
            nodeById(e.from).type === p[0] && nodeById(e.to).type === p[1];
        });
      });
    if (!ok) return;

    state.cleared[state.level] = true;
    renderLevels();
    var isFinal = state.level === LEVELS.length - 1;
    var metrics = '<div class="rgame__win-metrics">' +
      "<div>检索质量<b>" + res.quality + "</b></div>" +
      "<div>答案依据<b>" + res.grounding + "</b></div>" +
      "<div>模拟耗时<b>" + (res.latency / 1000).toFixed(2) + "s</b></div>" +
      "<div>资源成本<b>▲" + res.cost + "/" + L.budget + "</b></div></div>";
    winCard.classList.toggle("is-final", isFinal);
    winCard.innerHTML =
      "<h3>" + (isFinal ? "ALL SYSTEMS RESCUED ✓" : "SYSTEM RESCUED ✓") + "</h3>" +
      '<p style="font-size:12.5px;color:#9FB0D0;margin-top:6px">' +
      (isFinal ? "三个关卡全部通关——你已完整实践了 Agentic RAG 的核心链路。" : L.title + " 完成！指标全部达标。") + "</p>" +
      metrics +
      '<div class="rgame__win-actions">' +
      '<button type="button" id="rgameRetry">重新挑战</button>' +
      (isFinal ? '<button type="button" id="rgameFinish" class="is-primary">返回简历</button>'
               : '<button type="button" id="rgameNext" class="is-primary">下一关 →</button>') +
      "</div>";
    winEl.hidden = false;
    pushLog("ok", "[sys] ★ " + L.title + " 通关！质量 " + res.quality + " · 依据 " + res.grounding);

    var next = document.getElementById("rgameNext");
    var retry = document.getElementById("rgameRetry");
    var fin = document.getElementById("rgameFinish");
    if (next) next.addEventListener("click", function () { loadLevel(state.level + 1); });
    if (retry) retry.addEventListener("click", function () { loadLevel(state.level); });
    if (fin) fin.addEventListener("click", closeGame);
  }
})();

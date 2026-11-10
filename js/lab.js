/* ============================================================
   lab.js — Interactive Lab 三个互动模块
   1. RAG 检索挑战（教学演示，非真实模型推理）
   2. Multi-Agent Workflow（点击节点查看职责）
   3. Skill Evolution Loop（逐步推进自进化闭环）
   数据来源：js/data.js
   ============================================================ */

(function () {
  "use strict";

  const D = window.RESUME_DATA;

  /* ==================== Lab 1: RAG 检索挑战 ==================== */
  (function initRagGame() {
    const root = document.getElementById("ragGame");
    if (!root) return;
    const cfg = D.lab.rag;

    document.getElementById("ragQuestion").textContent = cfg.question;

    // 演示用检索结果（场景示意，非真实系统输出）
    const chunks = [
      { src: "chunk_02 · score 0.41", text: "深蹲是一种常见的下肢复合动作，主要锻炼股四头肌、臀大肌与腘绳肌……" },
      { src: "chunk_07 · score 0.36", text: "力量训练前应进行充分热身，训练后注意拉伸与蛋白质补充……" },
      { src: "chunk_11 · score 0.29", text: "健身房器械区使用规范：使用完毕后请将杠铃片归位……" },
    ];
    document.getElementById("ragChunks").innerHTML = chunks
      .map((c) => `<div class="rag-chunk"><small>${c.src}</small>${c.text}</div>`)
      .join("");

    const optWrap = document.getElementById("ragOptions");
    const fb = document.getElementById("ragFeedback");
    const retry = document.getElementById("ragRetry");

    optWrap.innerHTML = cfg.options
      .map(
        (o) => `
      <button class="rag-opt" data-opt="${o.id}">
        ${o.label}
        <small>点击选择这个处理方式</small>
      </button>`
      )
      .join("");

    optWrap.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-opt]");
      if (!btn) return;
      const chosen = cfg.options.find((o) => o.id === btn.dataset.opt);
      // 标记结果
      optWrap.querySelectorAll(".rag-opt").forEach((b) => {
        b.disabled = true;
        const o = cfg.options.find((x) => x.id === b.dataset.opt);
        if (o.score >= 2) b.classList.add("is-correct");
        else if (o.id === chosen.id) b.classList.add("is-wrong");
      });
      fb.innerHTML = `<b>${chosen.verdict} — 你选择了：${chosen.label}</b><p>${chosen.explain}</p>`;
      fb.hidden = false;
      retry.hidden = false;
    });

    retry.addEventListener("click", () => {
      optWrap.querySelectorAll(".rag-opt").forEach((b) => {
        b.disabled = false;
        b.classList.remove("is-correct", "is-wrong");
      });
      fb.hidden = true;
      retry.hidden = true;
    });
  })();

  /* ==================== Lab 2: Multi-Agent Workflow ==================== */
  (function initAgentFlow() {
    const root = document.getElementById("agentFlow");
    if (!root) return;
    const fitmind = D.projects.find((p) => p.id === "fitmind");
    const flow = fitmind.flows.find((f) => f.key === "agents");

    root.innerHTML = flow.nodes
      .map((n, i) => {
        const abbr = n.label.replace(" Agent", "");
        return `
        <div class="agent-node" data-agent="${n.id}" role="button" tabindex="0" aria-label="查看 ${n.label} 职责">
          <h4>${abbr}</h4>
          <span>Agent 0${i + 1}</span>
        </div>
        ${i < flow.nodes.length - 1 ? '<div class="agent-link" aria-hidden="true"></div>' : ""}`;
      })
      .join("");

    const detail = document.getElementById("agentFlowDetail");

    function activate(nodeId) {
      const nodes = [...root.querySelectorAll(".agent-node")];
      const links = [...root.querySelectorAll(".agent-link")];
      const idx = nodes.findIndex((n) => n.dataset.agent === nodeId);
      nodes.forEach((n, i) => n.classList.toggle("is-active", i === idx));
      links.forEach((l, i) => l.classList.toggle("is-lit", i < idx));
      const n = flow.nodes.find((x) => x.id === nodeId);
      detail.hidden = false;
      detail.innerHTML = `
        <h4>${n.label}</h4>
        <p>${n.what}</p>
        <div class="detail-io">
          <span>输入：${n.input}</span>
          <span>输出：${n.output}</span>
          <span>技术：${n.tech}</span>
        </div>`;
    }

    root.addEventListener("click", (e) => {
      const node = e.target.closest("[data-agent]");
      if (node) activate(node.dataset.agent);
    });
    root.addEventListener("keydown", (e) => {
      if (e.key !== "Enter" && e.key !== " ") return;
      const node = e.target.closest("[data-agent]");
      if (node) {
        e.preventDefault();
        activate(node.dataset.agent);
      }
    });
  })();

  /* ==================== Lab 3: Skill Evolution Loop ==================== */
  (function initSkillEvo() {
    const root = document.getElementById("skillEvo");
    if (!root) return;
    const fitmind = D.projects.find((p) => p.id === "fitmind");
    const flow = fitmind.flows.find((f) => f.key === "skill");
    let step = -1; // 当前进行到第几步（-1 = 未开始）

    root.innerHTML = `
      <div class="skill-evo__track">
        ${flow.nodes
          .map(
            (n) => `
          <div class="evo-step" data-step="${n.id}">
            <h4>${n.label}</h4>
            <p>${n.what}</p>
          </div>`
          )
          .join("")}
      </div>
      <div class="skill-evo__ctrl">
        <button class="btn btn--primary btn--small" id="evoNext">开始演进 →</button>
        <button class="btn btn--ghost btn--small" id="evoReset" hidden>重置</button>
        <div class="skill-evo__bar"><i id="evoBar"></i></div>
        <span class="skill-evo__status" id="evoStatus">点击开始，逐步推进闭环</span>
      </div>`;

    const steps = [...root.querySelectorAll(".evo-step")];
    const bar = document.getElementById("evoBar");
    const status = document.getElementById("evoStatus");
    const nextBtn = document.getElementById("evoNext");
    const resetBtn = document.getElementById("evoReset");

    function render() {
      steps.forEach((el, i) => {
        el.classList.toggle("is-done", i < step);
        el.classList.toggle("is-on", i === step);
      });
      bar.style.width = `${((step + 1) / flow.nodes.length) * 100}%`;
      if (step < 0) {
        status.textContent = "点击开始，逐步推进闭环";
        nextBtn.textContent = "开始演进 →";
      } else if (step >= flow.nodes.length - 1) {
        status.textContent = "闭环完成 ✓ 新版本 Skill 已入库，循环继续";
        nextBtn.textContent = "已完成 ✓";
        nextBtn.disabled = true;
      } else {
        status.textContent = `${step + 1} / ${flow.nodes.length} · ${flow.nodes[step].label}`;
        nextBtn.textContent = "下一步 →";
      }
      resetBtn.hidden = step < 0;
    }

    nextBtn.addEventListener("click", () => {
      if (step >= flow.nodes.length - 1) return;
      step += 1;
      render();
    });

    resetBtn.addEventListener("click", () => {
      step = -1;
      nextBtn.disabled = false;
      render();
    });

    render();
  })();
})();

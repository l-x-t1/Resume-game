/* ============================================================
   projects.js — 项目列表渲染 / 可点击流程图 / 项目详情侧边面板
   数据来源：js/data.js（RESUME_DATA.projects）
   ============================================================ */

(function () {
  "use strict";

  const D = window.RESUME_DATA;
  const listEl = document.getElementById("projectsList");

  /* ---------- 流程图（横向节点 + 虚线连接） ---------- */
  function flowHTML(flow, opts) {
    const nodes = flow.nodes
      .map(
        (n, i) => `
      <div class="flow__node${opts?.terminalLast && i === flow.nodes.length - 1 ? " flow__node--terminal" : ""}"
           data-flow="${flow.key || "main"}" data-node="${n.id}" role="button" tabindex="0"
           aria-label="查看节点：${n.label}">
        ${n.label}
      </div>
      ${i < flow.nodes.length - 1 ? '<div class="flow__link" aria-hidden="true"></div>' : ""}`
      )
      .join("");
    return `
      <div class="flow">
        <div class="flow__title">${flow.title}</div>
        <div class="flow__note">${flow.note || ""}</div>
        <div class="flow__track">${nodes}</div>
      </div>`;
  }

  /* ---------- 项目 3：业务流程 ---------- */
  function bizFlowHTML(flow) {
    const steps = flow.nodes
      .map((n, i) => {
        const mine = n.mine
          ? `<span class="biz-badge">我负责</span>`
          : `<span class="biz-badge" style="background:#9aa3b5">参与方模块</span>`;
        return `
        <div class="biz-step${n.mine ? " is-mine" : ""}" data-biz="${n.id}" role="button" tabindex="0"
             aria-label="查看环节：${n.label}">
          <h4>${n.label} ${mine}</h4>
          <p>${n.what}</p>
        </div>
        ${i < flow.nodes.length - 1 ? '<span class="biz-arrow" aria-hidden="true">→</span>' : ""}`;
      })
      .join("");
    return `
      <div class="flow">
        <div class="flow__title">${flow.title}</div>
        <div class="flow__note">${flow.note || ""}</div>
        <div class="biz-flow">${steps}</div>
      </div>`;
  }

  /* ---------- 项目卡片 ---------- */
  function projectCardHTML(p, i) {
    const featured = i === 0;
    let flowSection = "";
    if (p.flow && !p.flows) {
      flowSection = flowHTML({ ...p.flow, key: "main" }, { terminalLast: false });
    }
    if (p.flows) {
      flowSection = p.flows.map((f) => flowHTML(f)).join("");
    }
    if (p.id === "uniform-saas") {
      flowSection = bizFlowHTML(p.flow);
    }
    return `
      <article class="project${featured ? " project--featured" : ""}" data-project="${p.id}">
        <div class="project__top">
          <span class="project__index">${p.index}</span>
          <div class="project__head">
            <h3 class="project__name">${p.name}<span>${p.subtitle}</span></h3>
          </div>
          <div class="project__meta">
            <span class="project__period">${p.period}</span>
            <span class="project__role">${p.role}</span>
          </div>
        </div>
        <p class="project__position">${p.position}</p>
        <div class="project__stack">${p.stack.map((s) => `<span>${s}</span>`).join("")}</div>
        ${flowSection}
        <div class="project__cta">
          <button class="project__open" data-open="${p.id}">查看完整项目细节
            <svg viewBox="0 0 16 16" width="13" height="13" fill="none" aria-hidden="true"><path d="M2 8h11M9 3.5 13.5 8 9 12.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
        </div>
      </article>`;
  }

  listEl.innerHTML = D.projects.map(projectCardHTML).join("");

  /* ---------- 项目详情侧边面板 ---------- */
  const drawer = document.getElementById("projectDrawer");
  const drawerBody = document.getElementById("drawerBody");

  function openDrawer(id) {
    const p = D.projects.find((x) => x.id === id);
    if (!p) return;
    drawerBody.innerHTML = `
      <h3>${p.name}</h3>
      <div class="d-sub">${p.subtitle}</div>
      <div class="d-meta">
        <span>${p.period}</span><span>${p.role}</span>
      </div>
      <div class="d-meta">${p.stack.map((s) => `<span>${s}</span>`).join("")}</div>

      <div class="d-block">
        <h4>项目背景 / BACKGROUND</h4>
        <p>${p.background}</p>
      </div>

      <div class="d-block">
        <h4>核心功能 / FEATURES</h4>
        <ul>${p.features.map((f) => `<li>${f}</li>`).join("")}</ul>
      </div>

      <div class="d-block">
        <h4>个人负责与技术难点 / MY WORK</h4>
        <ul>
          ${p.mine
            .map((m, i) => `<li><span class="d-num">${String(i + 1).padStart(2, "0")}</span>　${m}</li>`)
            .join("")}
        </ul>
      </div>

      <div class="d-block">
        <h4>项目亮点 / HIGHLIGHTS</h4>
        <div class="d-highlight">
          <ul>${p.highlights.map((h) => `<li>${h}</li>`).join("")}</ul>
        </div>
      </div>`;
    drawer.hidden = false;
    document.body.style.overflow = "hidden";
    drawer.querySelector(".drawer__panel").scrollTop = 0;
  }

  window.__closeDrawer = function () {
    if (drawer.hidden) return;
    drawer.hidden = true;
    document.body.style.overflow = "";
  };

  drawer.addEventListener("click", (e) => {
    if (e.target.closest("[data-drawer-close]")) window.__closeDrawer();
  });

  /* ---------- 流程节点 / 业务环节 点击详情 ---------- */
  function findNode(projectId, flowKey, nodeId) {
    const p = D.projects.find((x) => x.id === projectId);
    if (!p) return null;
    if (p.flow && !p.flows) return p.flow.nodes.find((n) => n.id === nodeId);
    if (p.flows) {
      const f = p.flows.find((f) => f.key === flowKey);
      return f && f.nodes.find((n) => n.id === nodeId);
    }
    return null;
  }

  function nodePopHTML(n) {
    return `
      <span class="p-tag">FLOW NODE</span>
      <h4>${n.label}</h4>
      <div class="p-row"><b>作用 / WHAT</b><p>${n.what}</p></div>
      <div class="p-row"><b>输入 / INPUT</b><p>${n.input}</p></div>
      <div class="p-row"><b>输出 / OUTPUT</b><p>${n.output}</p></div>
      <div class="p-row"><b>对应技术 / TECH</b><p>${n.tech}</p></div>`;
  }

  listEl.addEventListener("click", (e) => {
    const openBtn = e.target.closest("[data-open]");
    if (openBtn) {
      openDrawer(openBtn.dataset.open);
      return;
    }
    const node = e.target.closest("[data-flow][data-node]");
    if (node) {
      const card = node.closest("[data-project]");
      const n = findNode(card.dataset.project, node.dataset.flow, node.dataset.node);
      if (n && n.what) {
        listEl.querySelectorAll(".flow__node.is-active").forEach((x) => x.classList.remove("is-active"));
        node.classList.add("is-active");
        window.openPop(nodePopHTML(n));
      }
      return;
    }
    const biz = e.target.closest("[data-biz]");
    if (biz) {
      const p = D.projects.find((x) => x.id === "uniform-saas");
      const n = p.flow.nodes.find((x) => x.id === biz.dataset.biz);
      if (n) {
        window.openPop(`
          <span class="p-tag">BUSINESS MODULE</span>
          <h4>${n.label}</h4>
          <div class="p-row"><b>模块说明</b><p>${n.what}</p></div>
          <div class="p-row"><b>我的参与</b><p>${n.mine ? "该模块由我负责或深度参与，详见" : "该模块由项目组其他成员负责，此处仅展示流程位置，不夸大个人职责。"}</p></div>
          ${n.mine ? "" : ""}
        `);
      }
    }
  });

  // 键盘可达性：Enter / Space 触发
  listEl.addEventListener("keydown", (e) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    const t = e.target.closest("[role='button']");
    if (t) {
      e.preventDefault();
      t.click();
    }
  });
})();

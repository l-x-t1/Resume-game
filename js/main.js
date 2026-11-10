/* ============================================================
   main.js — 全局交互：导航 / 滚动 / 视差 / About 渲染 / 工具函数
   ============================================================ */

(function () {
  "use strict";

  const D = window.RESUME_DATA;

  /* ---------- 工具：Toast ---------- */
  window.showToast = function (msg) {
    const t = document.getElementById("toast");
    t.textContent = msg;
    t.classList.add("is-show");
    clearTimeout(t._timer);
    t._timer = setTimeout(() => t.classList.remove("is-show"), 2200);
  };

  /* ---------- 通用：弹层（技能 / 流程节点详情） ---------- */
  const pop = document.getElementById("pop");
  const popBody = document.getElementById("popBody");

  window.openPop = function (html) {
    popBody.innerHTML = html;
    pop.hidden = false;
    document.body.style.overflow = "hidden";
  };
  window.closePop = function () {
    pop.hidden = true;
    popBody.innerHTML = "";
    document.body.style.overflow = "";
  };
  pop.addEventListener("click", (e) => {
    if (e.target.closest("[data-pop-close]")) closePop();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (!pop.hidden) closePop();
      if (!window.__closeDrawer) return;
      window.__closeDrawer();
    }
  });

  /* ---------- 导航：滚动态 / 移动端菜单 ---------- */
  const nav = document.getElementById("nav");
  const burger = document.getElementById("navBurger");
  const navLinks = document.getElementById("navLinks");

  function onScrollNav() {
    nav.classList.toggle("is-scrolled", window.scrollY > 30);
  }
  window.addEventListener("scroll", onScrollNav, { passive: true });
  onScrollNav();

  burger.addEventListener("click", () => {
    const open = navLinks.classList.toggle("is-open");
    burger.classList.toggle("is-open", open);
    burger.setAttribute("aria-expanded", String(open));
  });
  // 点击菜单项后收起
  navLinks.addEventListener("click", (e) => {
    if (e.target.closest("a")) {
      navLinks.classList.remove("is-open");
      burger.classList.remove("is-open");
    }
  });

  /* ---------- 平滑滚动（含导航高亮） ---------- */
  document.querySelectorAll("[data-nav]").forEach((a) => {
    a.addEventListener("click", (e) => {
      const href = a.getAttribute("href");
      if (!href || !href.startsWith("#")) return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      const top = href === "#hero" ? 0 : target.getBoundingClientRect().top + window.scrollY - 64;
      window.scrollTo({ top, behavior: "smooth" });
    });
  });

  const sections = ["hero", "about", "skills", "projects", "lab", "experience", "contact"]
    .map((id) => document.getElementById(id))
    .filter(Boolean);
  const linkMap = {};
  document.querySelectorAll("#navLinks a").forEach((a) => {
    linkMap[a.getAttribute("href").slice(1)] = a;
  });

  const secObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        Object.values(linkMap).forEach((l) => l.classList.remove("is-active"));
        const link = linkMap[en.target.id];
        if (link) link.classList.add("is-active");
      });
    },
    { rootMargin: "-40% 0px -55% 0px" }
  );
  sections.forEach((s) => secObserver.observe(s));

  /* ---------- Reveal 入场动画 ---------- */
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          en.target.classList.add("is-in");
          revealObserver.unobserve(en.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  document.querySelectorAll(".reveal").forEach((el) => revealObserver.observe(el));

  /* ---------- Hero 视差（尊重 reduced motion） ---------- */
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!reduced) {
    const layers = document.querySelectorAll("[data-parallax]");
    let rafId = null;
    window.addEventListener("mousemove", (e) => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        const cx = (e.clientX / window.innerWidth - 0.5) * 2;
        const cy = (e.clientY / window.innerHeight - 0.5) * 2;
        layers.forEach((el) => {
          const s = parseFloat(el.dataset.parallax) || 20;
          el.style.transform = `translate(${(-cx * s) / 10}px, ${(-cy * s) / 10}px)`;
        });
        rafId = null;
      });
    }, { passive: true });
  }

  /* ---------- 返回顶部 ---------- */
  const toTop = document.getElementById("toTop");
  window.addEventListener("scroll", () => {
    toTop.classList.toggle("is-show", window.scrollY > 600);
  }, { passive: true });
  toTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

  /* ---------- About 渲染 ---------- */
  (function renderAbout() {
    const lines = document.getElementById("aboutLines");
    lines.innerHTML = D.about.lines.map((l) => `<li>${l}</li>`).join("");

    const kw = document.getElementById("aboutKeywords");
    kw.innerHTML = D.about.keywords.map((k) => `<span>${k}</span>`).join("");

    const facts = document.getElementById("aboutFacts");
    facts.innerHTML = D.profile.meta
      .map((m) => `<div class="fact"><dt>${m.label}</dt><dd>${m.value}</dd></div>`)
      .join("");
  })();

  /* ---------- Skills 渲染 ---------- */
  (function renderSkills() {
    const grid = document.getElementById("skillsGrid");
    grid.innerHTML = D.skills
      .map(
        (cat) => `
      <div class="skill-card">
        <div class="skill-card__head"><h3>${cat.category}</h3><span>${cat.nameZh}</span></div>
        <p class="skill-card__desc">${cat.desc}</p>
        <div class="skill-card__tags">
          ${cat.tags
            .map(
              (t, i) =>
                `<button class="skill-tag" data-cat="${cat.category}" data-i="${i}">${t.name}</button>`
            )
            .join("")}
        </div>
      </div>`
      )
      .join("");

    grid.addEventListener("click", (e) => {
      const tag = e.target.closest(".skill-tag");
      if (!tag) return;
      const cat = D.skills.find((c) => c.category === tag.dataset.cat);
      const t = cat && cat.tags[+tag.dataset.i];
      if (!t) return;
      window.openPop(`
        <span class="p-tag">${cat.category}</span>
        <h4>${t.name}</h4>
        <div class="p-row"><b>解决什么问题</b><p>${t.what}</p></div>
        <div class="p-row"><b>用在哪</b><p>${t.where}</p></div>
        <div class="p-row"><b>在项目中的作用</b><p>${t.role}</p></div>
      `);
    });
  })();

  /* ---------- Contact：复制邮箱 ---------- */
  document.getElementById("copyEmail").addEventListener("click", async () => {
    const email = D.profile.email;
    try {
      await navigator.clipboard.writeText(email);
      showToast("邮箱已复制：" + email);
    } catch {
      // 兼容非安全上下文
      const ta = document.createElement("textarea");
      ta.value = email;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
      showToast("邮箱已复制：" + email);
    }
  });
})();

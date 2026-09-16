const pages = [...document.querySelectorAll("[data-page]")];
const navLinks = [...document.querySelectorAll(".nav a[href^='#']")];
const schoolBanner = document.getElementById("schoolBanner");
const searchInput = document.getElementById("siteSearch");
const CHECK_KEY = "wuxi-handbook-checks-v1";

function currentPage() {
  return (location.hash || "#home").slice(1) || "home";
}

function showPage(id) {
  const exists = pages.some((p) => p.dataset.page === id);
  const target = exists ? id : "home";
  pages.forEach((p) => p.classList.toggle("active", p.dataset.page === target));
  navLinks.forEach((a) => {
    const on = a.getAttribute("href") === `#${target}`;
    a.classList.toggle("active", on);
    if (on) a.setAttribute("aria-current", "page");
    else a.removeAttribute("aria-current");
  });
  document.querySelector(".nav")?.classList.remove("open");
  window.scrollTo(0, 0);
}

function setSchool(mode) {
  document.body.classList.remove("view-wx", "view-th", "view-all");
  document.body.classList.add(`view-${mode}`);
  localStorage.setItem("wuxi-handbook-school", mode);
  document.querySelectorAll(".school-switch button").forEach((btn) => {
    btn.classList.remove("active-all", "active-wx", "active-th");
    if (btn.dataset.school === mode) btn.classList.add(`active-${mode === "all" ? "all" : mode}`);
  });
  if (mode === "wx") {
    schoolBanner.textContent = "当前只看无锡学院口径。学分、系统、文号请勿套用到太湖学院。";
  } else if (mode === "th") {
    schoolBanner.textContent = "当前只看无锡太湖学院口径。认定一览表、三口分责请勿套用无锡学院规则。";
  }
}

function bindTabs() {
  document.querySelectorAll("[data-tabs]").forEach((group) => {
    const buttons = [...group.querySelectorAll("[data-tab]")];
    const panels = [...group.parentElement.querySelectorAll(":scope > .tab-panel")];
    buttons.forEach((btn) => {
      btn.addEventListener("click", () => {
        buttons.forEach((b) => b.classList.toggle("active", b === btn));
        panels.forEach((p) => p.classList.toggle("active", p.dataset.panel === btn.dataset.tab));
      });
    });
  });
}

function loadChecks() {
  try {
    return JSON.parse(localStorage.getItem(CHECK_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveChecks(data) {
  localStorage.setItem(CHECK_KEY, JSON.stringify(data));
}

function bindChecklists() {
  const stored = loadChecks();
  document.querySelectorAll("[data-check-group]").forEach((group) => {
    const key = group.dataset.checkGroup;
    const boxes = [...group.querySelectorAll('input[type="checkbox"]')];
    const bar = group.querySelector(".progress > span");
    const count = group.querySelector("[data-count]");
    const saved = stored[key] || {};
    boxes.forEach((box) => {
      box.checked = Boolean(saved[box.dataset.id]);
      box.addEventListener("change", () => {
        const next = loadChecks();
        next[key] = next[key] || {};
        next[key][box.dataset.id] = box.checked;
        saveChecks(next);
        updateProgress();
      });
    });
    group.querySelectorAll("[data-meta]").forEach((input) => {
      input.value = saved[`meta:${input.dataset.meta}`] || "";
      input.addEventListener("input", () => {
        const next = loadChecks();
        next[key] = next[key] || {};
        next[key][`meta:${input.dataset.meta}`] = input.value;
        saveChecks(next);
      });
    });
    function updateProgress() {
      const done = boxes.filter((b) => b.checked).length;
      const pct = boxes.length ? Math.round((done / boxes.length) * 100) : 0;
      if (bar) bar.style.width = `${pct}%`;
      if (count) count.textContent = `${done} / ${boxes.length}`;
    }
    updateProgress();
  });
}

function bindSearch() {
  if (!searchInput) return;
  searchInput.addEventListener("input", () => {
    const q = searchInput.value.trim();
    document.querySelectorAll(".search-hit").forEach((el) => el.classList.remove("search-hit"));
    if (q.length < 2) return;
    const page = pages.find((p) => p.classList.contains("active"));
    const nodes = [...page.querySelectorAll("h2, h3, h4, p, li, td, summary")];
    const hit = nodes.find((n) => n.textContent.includes(q));
    if (hit) {
      hit.classList.add("search-hit");
      hit.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  });
}

window.addEventListener("hashchange", () => showPage(currentPage()));
document.getElementById("menuBtn")?.addEventListener("click", () => {
  document.querySelector(".nav")?.classList.toggle("open");
});
document.querySelectorAll(".school-switch button").forEach((btn) => {
  btn.addEventListener("click", () => setSchool(btn.dataset.school));
});

showPage(currentPage());
setSchool(localStorage.getItem("wuxi-handbook-school") || "all");
bindTabs();
bindChecklists();
bindSearch();

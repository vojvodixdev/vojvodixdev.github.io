/* Portfolio – Nikola Vojvodić · JavaScript (bez biblioteka) */

const FORM_URL = "https://formspree.io/f/mppqglyp";
const CV_URL = "cv/Nikola_Vojvodic_CV.pdf";
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
const root = document.documentElement;
const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];
const escapeHtml = s => s.replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

/* ---------- Prevodi ---------- */
const EN = {
  "nav.aria": "Navigation", "nav.home": "Nikola Vojvodić, home", "nav.projects": "Projects", "nav.about": "About", "nav.tools": "Tools", "nav.contact": "Contact",
  "hero.avail": "Available for work", "hero.cta1": "View projects", "hero.cta2": "Send a message",
  "hero.scroll": "Scroll down", "hero.scrollt": "Scroll", "f.toparia": "Back to top", "cv.dl": "Download CV",
  "ed.aria": "Code editor", "ed.files": "Files",
  "k.open": "Command palette", "k.title": "Command palette", "k.ph": "Type a command or search…", "k.qaria": "Search commands", "k.list": "Commands",
  "k.move": "move", "k.run": "open", "k.close": "close",
  "proj.eyebrow": "What I've built", "proj.title": "Projects", "proj.lead": "Open any project live and browse its full source code.",
  "btn.live": "Live preview", "btn.gh": "Code on GitHub",
  "fr.altm": "FlakeRadar on a phone", "fr.meta": "2026 · full-stack · developer tool",
  "fr.desc": "A tool that finds flaky tests in CI, the ones that fail with no change in the code, and tells developers which failures in a pull request are real and which are known noise.",
  "fr.f1": "A score for every test, from same-commit conflicts and a Wilson confidence interval",
  "fr.f2": "Pull request comments that separate real regressions from known flaky tests",
  "fr.f3": "Dashboard with each test's history, a failure trend and the CI time lost to flakiness",
  "fr.f4": "Works with GitHub Actions, GitLab CI and others, with nothing to install",
  "fr.f5": "49 automated tests, CI on Node 22 and 24, and a Docker image",
  "k.altm": "Knjigoteka on a phone", "k.meta": "2026 · PWA · bachelor thesis, graded 10/10",
  "k.desc": "A progressive web app for searching books in the Open Library catalogue and keeping a personal reading shelf. It works offline and installs on phone and desktop like a native app.",
  "k.f1": "Search with filters, sorting and shareable links",
  "k.f2": "A shelf drawn as a real bookcase, with ratings, notes and reading stats",
  "k.f3": "Service worker with three caching strategies, fully usable offline",
  "k.f4": "Light and dark theme, Serbian and English interface",
  "k.f5": "40 unit and 34 end-to-end tests, with automated accessibility checks and a real offline run",
  "le.altm": "Last Ember on a phone", "le.meta": "2026 · restaurant website · concept",
  "le.desc": "A website for a late-night burger bar in Belgrade, with a menu, cart and table booking. Everything runs in the browser, with no framework and no build step.",
  "le.f1": "A burger that builds itself as you scroll, with a static version for reduced motion",
  "le.f2": "Menu with search, filters, allergens and extras",
  "le.f3": "Cart with delivery, promo codes, tips and pickup time slots",
  "le.f4": "Table booking and a live open / closed status",
  "le.f5": "The whole site in English and Serbian",
  "ab.eyebrow": "Who I am", "ab.title": "About me",
  "ab.p1": "I'm <strong>Nikola Vojvodić</strong>, a full-stack developer from Čačak, Serbia, with a degree in Information Technology (Faculty of Technical Sciences Čačak, 2026). I build complete, working web applications in JavaScript, from <strong>developer tools</strong> with a backend and database and <strong>offline-first PWAs</strong> to interactive websites.",
  "ab.p2": "I build every project from scratch, with attention to clean code, <strong>accessibility and automated testing</strong>. Every project on this page has a live version and its full source code on GitHub, and the tests run automatically on every change.",
  "ab.k1": "Role", "ab.v1": "Full-stack developer", "ab.k2": "Location", "ab.v2": "Čačak, Serbia",
  "ab.k6": "Education", "ab.v6": "Information Technology, Faculty of Technical Sciences Čačak (2022–2026). Bachelor thesis on PWAs, graded 10/10.",
  "ab.k3": "Focus", "ab.v3": "PWAs, accessibility (WCAG 2.1), automated testing, React",
  "ab.k4": "Languages", "ab.v4": "Serbian (native), English (professional working proficiency)",
  "t.eyebrow": "What I use", "t.title": "Tools & technologies",
  "t.lead": "My core stack up top, everything else grouped by area below. Each tool shows which project you can see it in.",
  "c.eyebrow": "Say hello", "c.title": "Let's<br><span>talk.</span>",
  "c.lead": "Got a job, a project or just a question? Send me a message and I'll reply within a day or two.", "c.copy": "Copy",
  "c.name": "Name", "c.nameph": "Your name", "c.emailph": "name@example.com", "c.subj": "Subject", "c.subjph": "Job, project, collaboration…",
  "c.msg": "Message", "c.msgph": "Tell me what it's about", "c.send": "Send message"
};

const MESSAGES = {
  sr: { sending: "Šaljem…", empty: "Upiši ime i poruku.", email: "Upiši ispravnu email adresu da bih mogao da ti odgovorim.",
        sent: "Hvala! Poruka je poslata, javiću ti se uskoro.", failed: "Poruka nije poslata. Proveri internet vezu i pokušaj ponovo.",
        light: "Uključi svetlu temu", dark: "Uključi tamnu temu", copied: "Email adresa je kopirana", noResults: "Nema rezultata" },
  en: { sending: "Sending…", empty: "Please enter your name and a message.", email: "Please enter a valid email address so I can reply.",
        sent: "Thanks! Your message was sent, I'll get back to you soon.", failed: "Message not sent. Check your internet connection and try again.",
        light: "Switch to light mode", dark: "Switch to dark mode", copied: "Email address copied", noResults: "No results" }
};
let lang = "en";
const message = key => MESSAGES[lang][key];

/* ---------- Jezik ---------- */
const I18N_ATTRS = { "data-i18n": "innerHTML", "data-i18n-ph": "placeholder", "data-i18n-aria": "aria-label", "data-i18n-alt": "alt" };
const SR = {};

function eachTranslatable(fn) {
  for (const [attr, prop] of Object.entries(I18N_ATTRS)) {
    $$(`[${attr}]`).forEach(el => fn(el, el.getAttribute(attr), prop));
  }
}
const readProp = (el, prop) => prop === "aria-label" ? el.getAttribute(prop) : el[prop];
const writeProp = (el, prop, value) => prop === "aria-label" ? el.setAttribute(prop, value) : (el[prop] = value);

function setLang(newLang) {
  lang = newLang;
  const dict = lang === "en" ? EN : SR;
  eachTranslatable((el, key, prop) => { if (dict[key] != null) writeProp(el, prop, dict[key]); });
  root.lang = lang === "en" ? "en" : "sr-Latn";
  $$(".lang-switch button").forEach(b => b.setAttribute("aria-pressed", b.dataset.lang === lang));
  renderCode();
  renderTools();
  updateModeLabel();
  $("#form-msg").textContent = "";
}
$$(".lang-switch button").forEach(b => b.addEventListener("click", () => setLang(b.dataset.lang)));

/* ---------- Tema (tamna / svetla) ---------- */
let mode = root.dataset.mode || "dark";

function updateModeLabel() {
  const button = $("#mode-btn");
  button.title = message(mode === "light" ? "dark" : "light");
  button.setAttribute("aria-label", button.title);
}
function applyMode() {
  root.dataset.mode = mode;
  try { localStorage.setItem("pf-mode", mode); } catch (e) {}
  updateModeLabel();
}

$("#mode-btn").addEventListener("click", e => {
  mode = mode === "light" ? "dark" : "light";
  if (!document.startViewTransition || reduceMotion || document.hidden) return applyMode();

  const r = e.currentTarget.getBoundingClientRect();
  const x = r.left + r.width / 2, y = r.top + r.height / 2;
  const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
  root.classList.add("theming");
  const transition = document.startViewTransition(applyMode);
  transition.ready.then(() => root.animate(
    { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
    { duration: 700, easing: "cubic-bezier(.65, 0, .35, 1)", pseudoElement: "::view-transition-new(root)" }
  )).catch(() => {});
  transition.finished.finally(() => root.classList.remove("theming"));
});

/* ---------- Editor u hero delu ---------- */
const FILES = {
  nikola: {
    kind: "JavaScript",
    en: `const nikola = {
  name: "Nikola Vojvodić",
  role: "Full-stack developer",
  location: "Čačak, Serbia",
  stack: [
    "React", "JavaScript", "HTML", "CSS",
    "TypeScript", "Node.js", "Tailwind",
    "PWA", "Fastify", "Playwright"
  ],
  loves: ["fast websites", "accessibility"],
  available: true,
};

export default nikola;`,
    sr: `const nikola = {
  ime: "Nikola Vojvodić",
  uloga: "Full-stack developer",
  lokacija: "Čačak, Srbija",
  stack: [
    "React", "JavaScript", "HTML", "CSS",
    "TypeScript", "Node.js", "Tailwind",
    "PWA", "Fastify", "Playwright"
  ],
  volim: ["brze sajtove", "pristupačnost"],
  dostupan: true,
};

export default nikola;`
  },
  projects: {
    kind: "JSON",
    en: `[
  { "name": "FlakeRadar",
    "type": "developer tool",
    "tests": 49 },
  { "name": "Knjigoteka",
    "type": "offline-first PWA",
    "tests": 74 },
  { "name": "Last Ember",
    "type": "restaurant website",
    "dependencies": 0 }
]

// click a name to jump to the project`,
    sr: `[
  { "name": "FlakeRadar",
    "type": "alat za developere",
    "tests": 49 },
  { "name": "Knjigoteka",
    "type": "offline-first PWA",
    "tests": 74 },
  { "name": "Last Ember",
    "type": "sajt za restoran",
    "dependencies": 0 }
]

// klikni na ime da odeš do projekta`
  },
  readme: {
    kind: "Markdown",
    en: `# Nikola Vojvodić

Full-stack developer from Čačak, Serbia.
I build web apps that are fast,
accessible and covered by tests.

## Right now
- Improving FlakeRadar

## Contact
- [Send a message](#kontakt)
- [GitHub](github.com/vojvodixdev)`,
    sr: `# Nikola Vojvodić

Full-stack developer iz Čačka. Pravim
web aplikacije koje su brze, pristupačne
i pokrivene testovima.

## Trenutno
- Unapređujem FlakeRadar

## Kontakt
- [Pošalji poruku](#kontakt)
- [GitHub](github.com/vojvodixdev)`
  }
};
const PROJECT_LINKS = { '"FlakeRadar"': "#p-flakeradar", '"Knjigoteka"': "#p-knjigoteka", '"Last Ember"': "#p-last-ember" };

const CODE_TOKENS = /(\/\/.*)|("[^"]*"?)(?=\s*:)|("[^"]*"?)|\b(const|export|default)\b|\b(true|false|\d+)\b|([\p{L}_]+)(?=:)|([{}[\],;:=])/gu;

function colorCode(line) {
  let html = "", last = 0;
  for (const match of line.matchAll(CODE_TOKENS)) {
    const [text, comment, key, string, keyword, literal, prop] = match;
    const cls = comment ? "c" : key || prop ? "p" : string ? "s" : keyword ? "k" : literal ? "l" : "u";
    html += escapeHtml(line.slice(last, match.index));
    html += PROJECT_LINKS[string]
      ? `<a class="s" href="${PROJECT_LINKS[string]}">${escapeHtml(text)}</a>`
      : `<span class="${cls}">${escapeHtml(text)}</span>`;
    last = match.index + text.length;
  }
  return html + escapeHtml(line.slice(last));
}

function colorMarkdown(line) {
  if (line.startsWith("#")) return `<span class="h">${escapeHtml(line)}</span>`;
  return escapeHtml(line)
    .replace(/^- /, '<span class="u">- </span>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/, (_, text, url) => {
      const external = !url.startsWith("#");
      const href = external ? "https://" + url : url;
      return `<span class="u">[</span><a class="s" href="${href}"${external ? ' target="_blank" rel="noopener"' : ""}>${text}</a>` +
             `<span class="u">](</span><span class="c">${url}</span><span class="u">)</span>`;
    });
}

let file = "nikola";
let typingFrame = 0;

function drawCode(upto = Infinity) {
  const { kind, [lang]: text } = FILES[file];
  const lines = text.split("\n");
  const shown = text.slice(0, upto).split("\n");
  const color = kind === "Markdown" ? colorMarkdown : colorCode;

  $("#ed-gutter").innerHTML = lines.map((_, i) => `<span data-ln="${i}">${i + 1}</span>`).join("");
  $("#ed-code").innerHTML = lines.map((_, i) => {
    if (i >= shown.length) return `<span class="ln" data-ln="${i}"></span>`;
    const cursor = i === shown.length - 1 ? '<span class="cursor"></span>' : "";
    return `<span class="ln" data-ln="${i}">${color(shown[i])}${cursor}</span>`;
  }).join("");
  $("#ed-pos").textContent = `${kind} · UTF-8 · Ln ${shown.length}, Col ${shown.at(-1).length + 1}`;
}

function renderCode() {
  cancelAnimationFrame(typingFrame);
  typingFrame = 0;
  drawCode();
}

function typeCode() {
  const total = FILES[file][lang].length;
  const start = performance.now() + 350, duration = Math.min(1900, total * 4.5);
  const step = now => {
    const upto = Math.max(0, Math.floor(total * (now - start) / duration));
    drawCode(upto);
    typingFrame = upto < total ? requestAnimationFrame(step) : 0;
  };
  typingFrame = requestAnimationFrame(step);
}

const tabs = $$(".ed-tab");
function openFile(name, focusTab = false) {
  tabs.forEach(tab => {
    const selected = tab.dataset.file === name;
    tab.setAttribute("aria-selected", selected);
    tab.tabIndex = selected ? 0 : -1;
    if (selected && focusTab) tab.focus();
  });
  $("#ed-panel").setAttribute("aria-labelledby", "tab-" + name);
  if (name === file && !typingFrame) return;
  file = name;
  renderCode();
  if (!reduceMotion) {
    const panel = $("#ed-panel");
    panel.classList.remove("swap");
    void panel.offsetWidth;
    panel.classList.add("swap");
  }
}
tabs.forEach((tab, i) => {
  tab.addEventListener("click", () => openFile(tab.dataset.file));
  tab.addEventListener("keydown", e => {
    const move = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
    if (!move) return;
    e.preventDefault();
    openFile(tabs[(i + move + tabs.length) % tabs.length].dataset.file, true);
  });
});

const inspectTargets = $$("[data-inspect]");
let inspected = null;

function highlightLine(line, on) {
  if (file !== "nikola") return;
  $$(`#ed-code [data-ln="${line}"], #ed-gutter [data-ln="${line}"]`).forEach(el => el.classList.toggle("hl", on));
}
function inspect(target) {
  if (target === inspected) return;
  if (inspected) { inspected.classList.remove("inspected"); highlightLine(inspected.dataset.ln, false); }
  inspected = target;
  if (target) { target.classList.add("inspected"); highlightLine(target.dataset.ln, true); }
}
inspectTargets.forEach(el => {
  el.addEventListener("pointerenter", e => { if (e.pointerType === "mouse") highlightLine(el.dataset.ln, true); });
  el.addEventListener("pointerleave", () => highlightLine(el.dataset.ln, false));
});
$("#ed-code").addEventListener("pointerover", e => {
  if (e.pointerType !== "mouse" || file !== "nikola") return;
  const line = e.target.closest(".ln");
  inspect(line ? inspectTargets.find(el => el.dataset.ln === line.dataset.ln) || null : null);
});
$("#ed-code").addEventListener("pointerleave", () => inspect(null));

/* ---------- Alati i tehnologije ---------- */
const PROJECTS = { F: ["FlakeRadar", "#p-flakeradar"], K: ["Knjigoteka", "#p-knjigoteka"], L: ["Last Ember", "#p-last-ember"] };
const TOOLS = [
  { name: "React", area: "core", used: "F", sr: "komponente, hooks, state", en: "components, hooks, state" },
  { name: "JavaScript", area: "core", used: "KL", sr: "ES2022+, moduli, async", en: "ES2022+, modules, async" },
  { name: "Tailwind CSS", area: "core", used: "", sr: "utility klase, teme", en: "utility classes, theming" },
  { name: "HTML5", area: "core", used: "KL", sr: "semantika, pristupačnost", en: "semantics, accessibility" },
  { name: "CSS3", area: "core", used: "KL", sr: "grid, flexbox, animacije", en: "grid, flexbox, animations" },
  { name: "PWA", area: "web", used: "K", sr: "manifest, instalacija, offline", en: "manifest, install, offline" },
  { name: "Service Worker", area: "web", used: "K", sr: "Cache API, ažuriranja", en: "Cache API, updates" },
  { name: "REST API", area: "web", used: "K", sr: "fetch, greške, keš", en: "fetch, errors, cache" },
  { name: "i18n", area: "web", used: "KL", sr: "prevodi, Intl", en: "translations, Intl" },
  { name: "TypeScript", area: "web", used: "F", sr: "tipovi, deljeni API ugovori", en: "types, shared API contracts" },
  { name: "SQL", area: "data", used: "F", sr: "upiti, šeme", en: "queries, schemas" },
  { name: "SQLite", area: "data", used: "F", sr: "migracije, indeksi, transakcije", en: "migrations, indexes, transactions" },
  { name: "Fastify", area: "data", used: "F", sr: "REST API, validacija", en: "REST APIs, validation" },
  { name: "Node.js", area: "data", used: "FK", sr: "API serveri, skripte", en: "API servers, scripts" },
  { name: "Python", area: "data", used: "", sr: "skripte", en: "scripting" },
  { name: "Playwright", area: "qa", used: "K", sr: "34 end-to-end testa", en: "34 end-to-end tests" },
  { name: "node:test", area: "qa", used: "K", sr: "40 unit testova", en: "40 unit tests" },
  { name: "axe-core", area: "qa", used: "K", sr: "automatska provera pristupačnosti", en: "automated accessibility checks" },
  { name: "Vitest", area: "qa", used: "F", sr: "49 unit i API testova", en: "49 unit and API tests" },
  { name: "WCAG 2.1", area: "qa", used: "KL", sr: "standard pristupačnosti", en: "accessibility standard" },
  { name: "Git", area: "tool", used: "F", sr: "verzionisanje", en: "version control" },
  { name: "GitHub", area: "tool", used: "F", sr: "repozitorijumi, PR", en: "repos, pull requests" },
  { name: "GitHub Actions", area: "tool", used: "F", sr: "CI, testovi na više verzija", en: "CI, multi-version test runs" },
  { name: "Docker", area: "tool", used: "F", sr: "multi-stage image", en: "multi-stage images" },
  { name: "npm", area: "tool", used: "FK", sr: "paketi, workspaces", en: "packages, workspaces" },
  { name: "VS Code", area: "tool", used: "", sr: "editor, debug", en: "editor, debugging" },
  { name: "Figma", area: "tool", used: "", sr: "dizajn, prototipovi", en: "design, prototypes" }
];
const AREAS = {
  web: { sr: "Web platforma", en: "Web platform" },
  data: { sr: "Backend i podaci", en: "Backend & data" },
  qa: { sr: "Kvalitet i testovi", en: "Quality & testing" },
  tool: { sr: "Alati", en: "Tools" }
};
const TOOL_TEXT = {
  sr: { core: "Glavni stack", more: "Takođe koristim", primary: "Primarni", used: "Vidi se u", soon: "Novi projekat uskoro",
        hint: "Izaberi alat za detalje.", in: "u projektu", legend: "korišćeno u projektima" },
  en: { core: "Core stack", more: "Also in my toolkit", primary: "Primary", used: "Seen in", soon: "New project coming soon",
        hint: "Pick a tool to see details.", in: "in", legend: "used in my projects" }
};

function renderTools() {
  const text = TOOL_TEXT[lang];
  const projectLinks = used => used.split("").map(c => `<a href="${PROJECTS[c][1]}">${PROJECTS[c][0]}</a>`).join("");

  const card = (tool, i) => `
    <li class="el${i === 0 ? " featured" : ""}">
      <span class="el-name">${tool.name}</span>
      <span class="el-desc">${tool[lang]}</span>
      ${i === 0 ? `<span class="el-k">${text.primary}</span>` : ""}
      ${tool.used
        ? `<span class="el-used"><small>${text.used}</small>${projectLinks(tool.used)}</span>`
        : `<span class="el-used none"><small>${text.soon}</small></span>`}
    </li>`;

  const group = area => {
    const tools = TOOLS.filter(t => t.area === area);
    const pills = tools.map(t => `<li class="pill" tabindex="0" data-name="${t.name}">${t.used ? "<b></b>" : ""}${t.name}</li>`).join("");
    return `
      <div class="grp" style="--c: var(--c-${area})">
        <p class="grp-h"><i></i>${AREAS[area][lang]}<small>${tools.length}</small></p>
        <ul class="pills">${pills}</ul>
      </div>`;
  };

  $("#ptable").innerHTML = `
    <div>
      <p class="label st-label">${text.core}</p>
      <ul class="core">${TOOLS.filter(t => t.area === "core").map(card).join("")}</ul>
    </div>
    <div>
      <p class="label st-label">${text.more}</p>
      <div class="groups">${Object.keys(AREAS).map(group).join("")}</div>
    </div>
    <p class="pt-tip" id="pt-tip" aria-live="polite"><span class="pt-legend"><i></i>${text.legend}</span><span>· ${text.hint}</span></p>`;
}

function showTool(pill) {
  const tool = TOOLS.find(t => t.name === pill.dataset.name), text = TOOL_TEXT[lang];
  $$(".pill.on").forEach(p => p.classList.remove("on"));
  pill.classList.add("on");
  const where = tool.used ? ` · ${text.in} <em>${tool.used.split("").map(c => PROJECTS[c][0]).join(", ")}</em>` : "";
  $("#pt-tip").innerHTML = `<span><b>${tool.name}</b> · ${tool[lang]}${where}</span>`;
}
for (const type of ["pointerover", "click", "focusin"]) {
  $("#ptable").addEventListener(type, e => {
    const pill = e.target.closest(".pill");
    if (pill) showTool(pill);
  });
}

/* ---------- Komandna paleta (Ctrl + K) ---------- */
const palette = $("#cmdk");
const search = $("#cmdk-q");
const resultList = $("#cmdk-list");

const ICONS = {
  go: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  box: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18"/>',
  out: '<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
  file: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/>',
  down: '<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>',
  copy: '<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/>',
  theme: '<path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z"/>',
  lang: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
  code: '<path d="M8 7l-5 5 5 5M16 7l5 5-5 5"/>'
};
const GROUPS = { nav: { sr: "Idi na", en: "Go to" }, proj: { sr: "Projekti", en: "Projects" }, act: { sr: "Akcije", en: "Actions" }, link: { sr: "Linkovi", en: "Links" } };

const goTo = selector => () => {
  $(selector).scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
  history.replaceState(null, "", selector === "#top" ? location.pathname : selector);
};
const openUrl = url => () => window.open(url, "_blank", "noopener");
const openInEditor = name => () => { goTo("#top")(); openFile(name); };
function downloadCv() {
  const link = Object.assign(document.createElement("a"), { href: CV_URL, download: "" });
  document.body.append(link);
  link.click();
  link.remove();
}

const COMMANDS = [
  { group: "nav", icon: "go", sr: "Projekti", en: "Projects", keys: "work radovi", run: goTo("#projekti") },
  { group: "nav", icon: "go", sr: "O meni", en: "About me", keys: "about bio", run: goTo("#o-meni") },
  { group: "nav", icon: "go", sr: "Alati i tehnologije", en: "Tools & technologies", keys: "stack skills vestine", run: goTo("#alati") },
  { group: "nav", icon: "go", sr: "Kontakt", en: "Contact", keys: "email poruka message", run: goTo("#kontakt") },
  { group: "proj", icon: "box", sr: "FlakeRadar", en: "FlakeRadar", keys: "flaky ci tests", run: goTo("#p-flakeradar") },
  { group: "proj", icon: "out", sr: "FlakeRadar uživo", en: "FlakeRadar live demo", keys: "flaky demo", hint: "↗", run: openUrl("https://vojvodixdev.github.io/flakeradar/") },
  { group: "proj", icon: "box", sr: "Knjigoteka", en: "Knjigoteka", keys: "pwa books knjige", run: goTo("#p-knjigoteka") },
  { group: "proj", icon: "out", sr: "Knjigoteka uživo", en: "Knjigoteka live demo", keys: "pwa demo knjige", hint: "↗", run: openUrl("https://vojvodixdev.github.io/knjigoteka/") },
  { group: "proj", icon: "box", sr: "Last Ember", en: "Last Ember", keys: "restaurant restoran burger", run: goTo("#p-last-ember") },
  { group: "proj", icon: "out", sr: "Last Ember uživo", en: "Last Ember live demo", keys: "restaurant demo burger", hint: "↗", run: openUrl("https://vojvodixdev.github.io/last-ember/") },
  { group: "act", icon: "copy", sr: "Kopiraj email adresu", en: "Copy email address", keys: "mail kontakt", run: () => copyEmail() },
  { group: "act", icon: "file", sr: "Pogledaj CV", en: "View CV", keys: "resume pdf", hint: "PDF", run: openUrl(CV_URL) },
  { group: "act", icon: "down", sr: "Preuzmi CV", en: "Download CV", keys: "resume pdf download", hint: "PDF", run: downloadCv },
  { group: "act", icon: "theme", sr: () => message(mode === "light" ? "dark" : "light"), en: () => message(mode === "light" ? "dark" : "light"),
    keys: "tema theme mode dark light svetla tamna", run: () => $("#mode-btn").click() },
  { group: "act", icon: "lang", sr: "Switch to English", en: "Prebaci na srpski", keys: "jezik language english srpski", run: () => setLang(lang === "en" ? "sr" : "en") },
  { group: "act", icon: "code", sr: "Otvori projects.json u editoru", en: "Open projects.json in the editor", keys: "editor json", run: openInEditor("projects") },
  { group: "act", icon: "code", sr: "Otvori README.md u editoru", en: "Open README.md in the editor", keys: "editor readme markdown", run: openInEditor("readme") },
  { group: "link", icon: "out", sr: "GitHub profil", en: "GitHub profile", keys: "code kod repo", hint: "↗", run: openUrl("https://github.com/vojvodixdev") },
  { group: "link", icon: "out", sr: "LinkedIn", en: "LinkedIn", keys: "linkedin", hint: "↗", run: openUrl("https://www.linkedin.com/in/nikola-vojvodi%C4%87-324a79419") }
];

let results = [];
let active = 0;
let opener = null;

const plain = s => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "dj");
const labelOf = cmd => typeof cmd[lang] === "function" ? cmd[lang]() : cmd[lang];

function drawPalette() {
  const words = plain(search.value).split(/\s+/).filter(Boolean);
  const matches = cmd => words.every(w => plain(`${labelOf(cmd)} ${cmd.sr} ${cmd.en} ${cmd.keys}`).includes(w));
  const inLabel = cmd => words.every(w => plain(labelOf(cmd)).includes(w));
  results = COMMANDS.filter(matches);
  if (words.length) results.sort((a, b) => inLabel(b) - inLabel(a));
  active = Math.min(active, Math.max(0, results.length - 1));

  if (!results.length) {
    resultList.innerHTML = `<li class="cmdk-empty" role="presentation">${message("noResults")}</li>`;
    search.removeAttribute("aria-activedescendant");
    return;
  }
  let html = "", group = "";
  results.forEach((cmd, i) => {
    if (!words.length && cmd.group !== group) {
      group = cmd.group;
      html += `<li class="cmdk-grp" role="presentation">${GROUPS[group][lang]}</li>`;
    }
    html += `<li class="cmdk-opt" role="option" id="cmd-${i}" data-i="${i}" aria-selected="${i === active}">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[cmd.icon]}</svg>
      <span>${escapeHtml(labelOf(cmd))}</span>${cmd.hint ? `<small aria-hidden="true">${cmd.hint}</small>` : ""}</li>`;
  });
  resultList.innerHTML = html;
  selectResult(active, false);
}

function selectResult(i, scroll = true) {
  active = i;
  $$(".cmdk-opt").forEach(opt => opt.setAttribute("aria-selected", Number(opt.dataset.i) === i));
  const option = $("#cmd-" + i);
  if (!option) return;
  search.setAttribute("aria-activedescendant", option.id);
  if (scroll) option.scrollIntoView({ block: "nearest" });
}

function openPalette() {
  if (palette.open) return;
  opener = document.activeElement;
  search.value = "";
  active = 0;
  drawPalette();
  palette.showModal();
  search.focus();
}

function closePalette(restoreFocus = true) {
  if (!palette.open) return;
  palette.close();
  if (restoreFocus && opener) opener.focus();
}

function runResult(i) {
  if (!results[i]) return;
  closePalette(false);
  results[i].run();
}

if (typeof palette.showModal === "function") {
  $("#cmdk-kbd").textContent = /Mac|iPhone|iPad/.test(navigator.platform) ? "⌘ K" : "Ctrl K";
  $("#cmdk-btn").addEventListener("click", openPalette);
  search.addEventListener("input", () => { active = 0; drawPalette(); });
  search.addEventListener("keydown", e => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      const move = e.key === "ArrowDown" ? 1 : -1;
      if (results.length) selectResult((active + move + results.length) % results.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      runResult(active);
    }
  });
  resultList.addEventListener("click", e => { const opt = e.target.closest(".cmdk-opt"); if (opt) runResult(Number(opt.dataset.i)); });
  resultList.addEventListener("pointermove", e => { const opt = e.target.closest(".cmdk-opt"); if (opt && Number(opt.dataset.i) !== active) selectResult(Number(opt.dataset.i), false); });
  palette.addEventListener("click", e => { if (e.target === palette) closePalette(); });
  palette.addEventListener("cancel", e => { e.preventDefault(); closePalette(); });
  addEventListener("keydown", e => {
    const typing = e.target.closest("input, textarea, select, [contenteditable]");
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); palette.open ? closePalette() : openPalette(); }
    else if (e.key === "/" && !typing && !palette.open) { e.preventDefault(); openPalette(); }
  });
} else {
  $("#cmdk-btn").hidden = true;
}

/* ---------- Animacije pri skrolovanju ---------- */
const toTop = $("#to-top");
addEventListener("scroll", () => toTop.classList.toggle("show", scrollY > 700), { passive: true });
toTop.addEventListener("click", () => scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" }));

const navLinks = $$(".nav ul a");
const sectionSpy = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) navLinks.forEach(a => a.setAttribute("aria-current", a.hash === "#" + entry.target.id));
  });
}, { rootMargin: "-45% 0px -50% 0px" });
["projekti", "o-meni", "alati", "kontakt"].forEach(id => sectionSpy.observe(document.getElementById(id)));

function typeLabel(el) {
  const full = el.textContent;
  const text = document.createTextNode("");
  const cursor = document.createElement("span");
  cursor.className = "cursor";
  el.replaceChildren(text, cursor);
  let i = 0;
  const tick = () => {
    if (!text.isConnected) return;
    text.data = full.slice(0, ++i);
    if (i < full.length) setTimeout(tick, 38 + Math.random() * 40);
    else setTimeout(() => cursor.remove(), 1400);
  };
  setTimeout(tick, 260);
}

function startScrollAnimations() {
  const below = el => el.getBoundingClientRect().top > innerHeight * 0.85;

  const revealer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.remove("pre");
      revealer.unobserve(entry.target);
    });
  }, { rootMargin: "0px 0px -8% 0px" });
  $$(".sec-head, .proj, .photo, .about-text, .facts, .ptable, .contact .wrap > *").forEach(el => {
    el.classList.add("reveal");
    if (below(el)) { el.classList.add("pre"); revealer.observe(el); }
  });

  const labelTyper = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      labelTyper.unobserve(entry.target);
      typeLabel(entry.target);
    });
  }, { rootMargin: "0px 0px -12% 0px" });
  $$(".label.blue").filter(below).forEach(el => labelTyper.observe(el));

  $$(".shots").forEach(shots => {
    shots.addEventListener("pointermove", e => {
      if (e.pointerType !== "mouse") return;
      const r = shots.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      shots.style.setProperty("--ry", x * 6 + "deg");
      shots.style.setProperty("--rx", y * -4 + "deg");
      shots.style.setProperty("--px", x * -14 + "px");
      shots.style.setProperty("--py", y * -10 + "px");
    });
    shots.addEventListener("pointerleave", () => shots.removeAttribute("style"));
  });
}

/* ---------- Kontakt ---------- */
let toastTimer = 0;
function toast(text) {
  const box = $("#toast");
  box.textContent = text;
  box.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => box.classList.remove("show"), 2200);
}

function copyEmail() {
  const email = $("#mail").textContent;
  if (navigator.clipboard) navigator.clipboard.writeText(email).then(() => toast(message("copied")), () => toast(email));
  else toast(email);
}
$("#copy-mail").addEventListener("click", copyEmail);

$("#contact-form").addEventListener("submit", async e => {
  e.preventDefault();
  const form = e.currentTarget;
  const button = $("#f-submit");
  const status = $("#form-msg");
  const say = (text, kind = "") => { status.textContent = text; status.className = "form-msg " + kind; };
  const { ime, email, poruka } = form.elements;

  if (!ime.value.trim() || !poruka.value.trim()) return say(message("empty"), "err");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) { email.focus(); return say(message("email"), "err"); }

  const label = button.textContent;
  button.disabled = true;
  button.textContent = message("sending");
  say("");
  try {
    const response = await fetch(FORM_URL, { method: "POST", body: new FormData(form), headers: { Accept: "application/json" } });
    if (!response.ok) throw new Error(response.status);
    form.reset();
    say(message("sent"), "ok");
  } catch (err) {
    say(message("failed"), "err");
  } finally {
    button.disabled = false;
    button.textContent = label;
  }
});

/* ---------- Pokretanje ---------- */
eachTranslatable((el, key, prop) => { SR[key] = readProp(el, prop); });
setLang("en");
if (!reduceMotion) {
  typeCode();
  startScrollAnimations();
}

console.log(
  "%c👋 Hej, developeru!%c\nOvaj sajt radi bez frejmvorka i bez build koraka. Kod: https://github.com/vojvodixdev/vojvodixdev.github.io\nHi there! No framework, no build step. Source: https://github.com/vojvodixdev/vojvodixdev.github.io\nTip: Ctrl + K",
  "font: 700 16px system-ui; color: #4d8dff;", "font: 12px ui-monospace, monospace; color: #8794b4;"
);

import "./style.css";
import { collections, schema } from "./data.js";
import { topics } from "./challenges.js";
import { runQuery, resultsEqual } from "./engine.js";

// ---------------------------------------------------------------- state
const STORE_KEY = "mmdb.progress.v1";
const loadProgress = () => {
  try { return new Set(JSON.parse(localStorage.getItem(STORE_KEY)) || []); }
  catch { return new Set(); }
};
const saveProgress = () => localStorage.setItem(STORE_KEY, JSON.stringify([...solved]));

const solved = loadProgress();
const flatChallenges = [];
topics.forEach((t, ti) => t.challenges.forEach((c, ci) => flatChallenges.push({ ...c, ti, ci, topic: t })));
const totalCount = flatChallenges.length;

let current = 0;          // index into flatChallenges
let hintsShown = 0;
let solutionShown = false;
let conceptOpen = true;   // the "Concepts" lesson card starts open on a topic's first challenge

// ---------------------------------------------------------------- helpers
const el = (tag, props = {}, ...kids) => {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (k === "class") n.className = v;
    else if (k === "html") n.innerHTML = v;
    else if (k.startsWith("on")) n.addEventListener(k.slice(2), v);
    else n.setAttribute(k, v);
  }
  for (const kid of kids.flat()) if (kid != null) n.append(kid.nodeType ? kid : document.createTextNode(kid));
  return n;
};

function highlightJSON(value) {
  const json = JSON.stringify(value, null, 2);
  if (json === undefined) return String(value);
  return json
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"([^"]+)":/g, '<span class="k">"$1"</span>:')
    .replace(/: "([^"]*)"/g, ': <span class="s">"$1"</span>')
    .replace(/: (-?\d+\.?\d*)/g, ': <span class="n">$1</span>')
    .replace(/: (true|false)/g, ': <span class="b">$1</span>')
    .replace(/: null/g, ': <span class="null">null</span>');
}

const diffLabel = (d) => ["", "BEGINNER", "INTERMEDIATE", "ADVANCED"][d];

// ---------------------------------------------------------------- app shell
const app = document.getElementById("app");

const overallBar = el("i");
const overallText = el("span");
const menuToggle = el("button", { class: "btn-ghost menu-toggle", "aria-label": "Toggle topics", onclick: toggleSidebar }, "☰");
const topbar = el("div", { class: "topbar" },
  menuToggle,
  el("div", { class: "brand" },
    el("span", { class: "leaf" }, "🍃"),
    el("div", {}, el("div", {}, "Master MongoDB"), el("small", {}, "100 hands-on challenges · beginner → advanced"))
  ),
  el("div", { class: "spacer" }),
  el("div", { class: "overall" }, overallText, el("div", { class: "bar" }, overallBar)),
  el("button", { class: "btn-ghost", onclick: openDb }, el("span", { class: "btn-icon" }, "📚"), el("span", { class: "btn-label" }, " Database")),
  el("button", { class: "btn-ghost", onclick: resetProgress }, el("span", { class: "btn-icon" }, "↺"), el("span", { class: "btn-label" }, " Reset"))
);

const sidebar = el("div", { class: "sidebar" });
const main = el("div", { class: "main" });
const sidebarBack = el("div", { class: "sidebar-back", onclick: closeSidebar });
const layout = el("div", { class: "layout" }, sidebar, sidebarBack, main);

// database modal
const modalBack = el("div", { class: "modal-back", onclick: closeDb });
const modalBody = el("div", { class: "body" });
const modalTabs = el("div", { class: "tabs" });
const modal = el("div", { class: "modal" },
  el("header", {}, el("h3", {}, "📚 Sample Database"), el("button", { class: "btn-ghost", onclick: closeDb }, "✕ Close")),
  modalTabs, modalBody
);

app.append(topbar, layout, modalBack, modal);

// ---------------------------------------------------------------- sidebar
function renderSidebar() {
  sidebar.innerHTML = "";
  const activeTopic = flatChallenges[current].ti;
  topics.forEach((t, ti) => {
    const doneInTopic = t.challenges.filter((c) => solved.has(c.id)).length;
    const chList = el("div", { class: "ch-list" });
    t.challenges.forEach((c, ci) => {
      const idx = flatChallenges.findIndex((f) => f.id === c.id);
      const isDone = solved.has(c.id);
      const item = el("div", {
        class: `ch-item${idx === current ? " active" : ""}${isDone ? " done" : ""}`,
        onclick: () => go(idx)
      },
        el("span", { class: "dot" }, isDone ? "✓" : ""),
        el("span", { class: "cname" }, `${ci + 1}. ${c.title}`),
        el("span", { class: `diff d${c.difficulty}` }, "●".repeat(c.difficulty))
      );
      chList.append(item);
    });
    const topicEl = el("div", { class: `topic${ti === activeTopic ? " open" : ""}` },
      el("div", { class: "topic-head", onclick: (e) => {
        const node = e.currentTarget.parentElement;
        node.classList.toggle("open");
      } },
        el("span", { class: "chev" }, "▶"),
        el("span", { class: "tname" }, t.name),
        el("span", { class: "tcount" }, `${doneInTopic}/${t.challenges.length}`)
      ),
      el("div", { class: "topic-blurb" }, t.blurb),
      chList
    );
    sidebar.append(topicEl);
  });
}

// ---------------------------------------------------------------- main view
function renderMain() {
  const ch = flatChallenges[current];
  const isDone = solved.has(ch.id);
  main.innerHTML = "";

  const editor = el("textarea", { class: "editor", spellcheck: "false" });
  editor.value = ch.starter;
  editor.addEventListener("keydown", (e) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const s = editor.selectionStart, en = editor.selectionEnd;
      editor.value = editor.value.slice(0, s) + "  " + editor.value.slice(en);
      editor.selectionStart = editor.selectionEnd = s + 2;
    }
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") { e.preventDefault(); check(); }
  });

  const outputArea = el("div", { class: "output" });
  const hintArea = el("div");
  const solutionArea = el("div");

  function runOnly() {
    const res = runQuery(editor.value, collections);
    outputArea.innerHTML = "";
    if (!res.ok) {
      outputArea.append(el("div", { class: "banner bad" }, "⚠ " + res.error));
      return;
    }
    outputArea.append(resultBox("Your result", res.value, true));
  }

  function check() {
    const res = runQuery(editor.value, collections);
    outputArea.innerHTML = "";
    if (!res.ok) {
      outputArea.append(el("div", { class: "banner bad" }, "⚠ " + res.error),
        el("div", { class: "empty-hint" }, "Fix the error above, then run again. Stuck? Try a hint."));
      return;
    }
    const expected = runQuery(ch.solution, collections).value;
    const pass = resultsEqual(res.value, expected, ch.ordered);
    if (pass) {
      const firstTime = !solved.has(ch.id);
      solved.add(ch.id); saveProgress();
      renderSidebar(); updateOverall();
      const banner = el("div", { class: "banner ok" },
        el("div", {},
          el("div", {}, firstTime ? "✅ Correct! Challenge solved." : "✅ Correct!"),
          el("div", { class: "explain" }, ch.explanation)
        ));
      outputArea.append(banner, resultBox("Your result", res.value, true));
      // refresh header pill
      const pill = document.getElementById("solvePill");
      if (pill) { pill.className = "pill solved"; pill.textContent = "✓ SOLVED"; }
    } else {
      outputArea.append(
        el("div", { class: "banner bad" }, "❌ Not quite — your result doesn't match the expected output. Compare below."),
        el("div", { class: `result-cols${ch.ordered ? "" : ""}` },
          resultBox(`Your result (${countLabel(res.value)})`, res.value, false),
          resultBox(`Expected (${countLabel(expected)})`, expected, false)
        ),
        ch.ordered ? el("div", { class: "empty-hint" }, "Note: order matters for this challenge.") : null
      );
    }
  }

  const hintBtn = el("button", { class: "btn secondary", onclick: () => {
    if (hintsShown < ch.hints.length) hintsShown++;
    renderHints();
  } }, "💡 Hint");

  function renderHints() {
    hintArea.innerHTML = "";
    if (hintsShown > 0) {
      const ul = el("ul", { class: "hint-list" });
      for (let i = 0; i < hintsShown; i++) ul.append(el("li", {}, ch.hints[i]));
      hintArea.append(el("div", { class: "section-label" }, "Hints"), ul);
    }
    hintBtn.disabled = hintsShown >= ch.hints.length;
    hintBtn.textContent = hintsShown >= ch.hints.length ? "💡 No more hints" : `💡 Hint (${hintsShown}/${ch.hints.length})`;
  }

  const solBtn = el("button", { class: "btn secondary", onclick: () => {
    solutionShown = !solutionShown;
    renderSolution();
  } }, "👁 Solution");

  function renderSolution() {
    solutionArea.innerHTML = "";
    solBtn.textContent = solutionShown ? "🙈 Hide solution" : "👁 Solution";
    if (solutionShown) {
      solutionArea.append(
        el("div", { class: "solution-box" },
          el("div", { class: "section-label" }, "Reference solution"),
          el("pre", {}, ch.solution),
          el("button", { class: "btn secondary", onclick: () => { editor.value = ch.solution; } }, "⤵ Load into editor")
        )
      );
    }
  }

  main.append(
    el("div", { class: "main-inner" },
      el("div", { class: "crumb" }, `${ch.topic.name}  ·  Challenge ${ch.ci + 1} of 10`),
      el("h1", { class: "challenge-title" },
        ch.title,
        el("span", { id: "solvePill", class: isDone ? "pill solved" : `pill d${ch.difficulty}` },
          isDone ? "✓ SOLVED" : diffLabel(ch.difficulty))
      ),
      conceptCard(ch.topic),
      el("div", { class: "prompt" }, ch.prompt),
      el("div", { class: "section-label" }, "Your query"),
      el("div", { class: "editor-wrap" },
        el("div", { class: "editor-bar" }, el("div", { class: "dotrow" }, el("i"), el("i"), el("i")), "mongosh"),
        editor
      ),
      el("div", { class: "toolbar" },
        el("button", { class: "btn primary", onclick: check }, "✓ Check answer"),
        el("button", { class: "btn secondary", onclick: runOnly }, "▶ Run"),
        hintBtn, solBtn,
        el("button", { class: "btn secondary", onclick: () => { editor.value = ch.starter; } }, "↺ Reset code"),
        el("span", { class: "grow" }),
        el("span", { class: "kbd" }, "⌘/Ctrl + Enter to check")
      ),
      hintArea,
      solutionArea,
      outputArea,
      el("div", { class: "nav-row" },
        el("button", { class: "btn secondary", onclick: () => go(current - 1), disabled: current === 0 ? "" : null }, "← Previous"),
        el("button", { class: "btn primary", onclick: () => go(current + 1), disabled: current === totalCount - 1 ? "" : null }, "Next →")
      )
    )
  );
  renderHints();
  renderSolution();
  editor.focus();
}

function conceptCard(topic) {
  const c = topic.concept;
  if (!c) return null;

  const body = el("div", { class: "concept-body" },
    el("p", { class: "concept-summary" }, c.summary),
    el("div", { class: "concept-cols" },
      el("div", {},
        el("div", { class: "concept-h" }, "Key concepts"),
        el("ul", { class: "concept-points" }, c.points.map((p) => el("li", {}, p)))
      ),
      el("div", {},
        el("div", { class: "concept-h" }, "Syntax cheat-sheet"),
        el("div", { class: "concept-syntax" }, c.syntax.map((s) =>
          el("div", { class: "syn-row" },
            el("code", {}, s.code),
            s.note ? el("span", { class: "syn-note" }, s.note) : null
          )
        ))
      )
    ),
    el("div", { class: "concept-tip" }, el("strong", {}, "Pro tip: "), c.tip)
  );

  const card = el("div", { class: `concept${conceptOpen ? " open" : ""}` });
  const head = el("div", { class: "concept-head", onclick: () => {
    conceptOpen = !conceptOpen;
    card.classList.toggle("open", conceptOpen);
    caret.textContent = conceptOpen ? "▾" : "▸";
  } },
    el("span", { class: "concept-icon" }, "📖"),
    el("span", { class: "concept-title" }, "Concepts to learn"),
    el("span", { class: "concept-sub" }, "— read before you drill this topic")
  );
  const caret = el("span", { class: "concept-caret" }, conceptOpen ? "▾" : "▸");
  head.append(caret);
  card.append(head, body);
  return card;
}

function resultBox(title, value, single) {
  return el("div", { class: `result-cols ${single ? "single" : ""}` },
    el("div", { class: "result-box" },
      el("h4", {}, el("span", {}, title), el("span", {}, countLabel(value))),
      el("pre", { class: "json", html: highlightJSON(value) })
    )
  );
}

function countLabel(v) {
  if (Array.isArray(v)) return `${v.length} doc${v.length === 1 ? "" : "s"}`;
  if (v === null || v === undefined) return "null";
  if (typeof v === "object") return "1 doc";
  return typeof v;
}

// ---------------------------------------------------------------- nav / progress
function go(i) {
  if (i < 0 || i >= totalCount) return;
  current = i;
  hintsShown = 0; solutionShown = false;
  conceptOpen = flatChallenges[i].ci === 0; // auto-open the lesson on each topic's first challenge
  renderSidebar();
  renderMain();
  main.scrollTop = 0;
  closeSidebar(); // collapse the mobile drawer after picking a challenge
}

// ---------------------------------------------------------------- mobile drawer
function toggleSidebar() {
  const open = sidebar.classList.toggle("open");
  sidebarBack.classList.toggle("show", open);
}
function closeSidebar() {
  sidebar.classList.remove("open");
  sidebarBack.classList.remove("show");
}

function updateOverall() {
  const n = [...solved].filter((id) => flatChallenges.some((c) => c.id === id)).length;
  overallText.textContent = `${n} / ${totalCount} solved`;
  overallBar.style.width = `${(n / totalCount) * 100}%`;
}

function resetProgress() {
  if (!confirm("Reset all progress? This clears every solved challenge.")) return;
  solved.clear(); saveProgress();
  renderSidebar(); updateOverall(); renderMain();
}

// ---------------------------------------------------------------- database modal
function openDb() {
  modalBack.classList.add("show");
  modal.classList.add("show");
  buildDbTabs("movies");
}
function closeDb() { modalBack.classList.remove("show"); modal.classList.remove("show"); }
function buildDbTabs(active) {
  modalTabs.innerHTML = "";
  Object.keys(collections).forEach((name) => {
    modalTabs.append(el("button", {
      class: name === active ? "active" : "",
      onclick: () => buildDbTabs(name)
    }, `${name} (${collections[name].length})`));
  });
  modalBody.innerHTML = "";
  modalBody.append(
    el("div", { class: "schema-note" }, `Fields: ${schema[active]}`),
    el("pre", { class: "json", html: highlightJSON(collections[active]) })
  );
}
document.addEventListener("keydown", (e) => { if (e.key === "Escape") { closeDb(); closeSidebar(); } });

// ---------------------------------------------------------------- boot
renderSidebar();
renderMain();
updateOverall();

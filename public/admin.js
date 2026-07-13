/* Admin — vanilla JS with Supabase Auth + REST */
(() => {
  const SUPABASE_URL = "https://dhgsxfamykjswemarmel.supabase.co";
  const APIKEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRoZ3N4ZmFteWtqc3dlbWFybWVsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAyOTU2NTksImV4cCI6MjA5NTg3MTY1OX0.4l17mmMgLhynGvflTjKRuOI4hG43-Mr3r9AmjEsBkMM";
  const SESSION_KEY = "zitny_admin_session_v1";

  /* ---- Utilities ---- */
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const uid = () => Math.random().toString(36).slice(2, 10);
  const el = (tag, attrs = {}, ...children) => {
    const n = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (v == null || v === false) continue;
      if (k === "class") n.className = v;
      else if (k.startsWith("on") && typeof v === "function") n.addEventListener(k.slice(2), v);
      else n.setAttribute(k, v === true ? "" : v);
    }
    for (const c of children) {
      if (c == null || c === false) continue;
      n.append(c.nodeType ? c : document.createTextNode(String(c)));
    }
    return n;
  };
  const toast = (msg, kind = "ok") => {
    const t = $("#toast");
    t.textContent = msg;
    t.className = "toast " + kind;
    t.hidden = false;
    clearTimeout(toast._t);
    toast._t = setTimeout(() => { t.hidden = true; }, 2600);
  };

  /* ---- Session ---- */
  let session = null;
  try { session = JSON.parse(localStorage.getItem(SESSION_KEY) || "null"); } catch {}

  const saveSession = (s) => {
    session = s;
    if (s) localStorage.setItem(SESSION_KEY, JSON.stringify(s));
    else localStorage.removeItem(SESSION_KEY);
  };

  const authHeaders = () => ({
    apikey: APIKEY,
    Authorization: `Bearer ${session?.access_token || APIKEY}`,
    "Content-Type": "application/json",
    Accept: "application/json",
  });

  /* ---- Supabase REST helpers ---- */
  async function login(email, password) {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method: "POST",
      headers: { apikey: APIKEY, "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error_description || body.msg || "Přihlášení selhalo");
    }
    const s = await res.json();
    saveSession({
      access_token: s.access_token,
      refresh_token: s.refresh_token,
      expires_at: Date.now() + (s.expires_in ?? 3600) * 1000,
      user: s.user,
    });
  }

  async function refreshIfNeeded() {
    if (!session) return false;
    if (Date.now() < (session.expires_at - 60_000)) return true;
    try {
      const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`, {
        method: "POST",
        headers: { apikey: APIKEY, "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: session.refresh_token }),
      });
      if (!res.ok) throw new Error("refresh");
      const s = await res.json();
      saveSession({
        access_token: s.access_token,
        refresh_token: s.refresh_token,
        expires_at: Date.now() + (s.expires_in ?? 3600) * 1000,
        user: s.user,
      });
      return true;
    } catch {
      saveSession(null);
      return false;
    }
  }

  async function logout() {
    try {
      await fetch(`${SUPABASE_URL}/auth/v1/logout`, { method: "POST", headers: authHeaders() });
    } catch {}
    saveSession(null);
    showLogin();
  }

  async function sbSelect(path) {
    await refreshIfNeeded();
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, { headers: authHeaders() });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  }

  async function sbUpsertContent(data) {
    await refreshIfNeeded();
    const res = await fetch(`${SUPABASE_URL}/rest/v1/site_content?on_conflict=id`, {
      method: "POST",
      headers: { ...authHeaders(), Prefer: "resolution=merge-duplicates,return=minimal" },
      body: JSON.stringify({ id: 1, data, updated_at: new Date().toISOString() }),
    });
    if (!res.ok) throw new Error(await res.text());
  }

  async function sbDelete(path) {
    await refreshIfNeeded();
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, { method: "DELETE", headers: authHeaders() });
    if (!res.ok) throw new Error(await res.text());
  }

  async function logAction(action) {
    try {
      await fetch(`${SUPABASE_URL}/rest/v1/audit_logs`, {
        method: "POST",
        headers: { ...authHeaders(), Prefer: "return=minimal" },
        body: JSON.stringify({ who: session?.user?.email || "admin", action }),
      });
    } catch {}
  }

  /* ---- App state ---- */
  let content = { about: {}, projects: [], workshops: [], achievements: [], sponsors: [] };
  let messages = [];
  let logs = [];

  async function loadAll() {
    const rows = await sbSelect("site_content?select=data&id=eq.1");
    const d = rows[0]?.data || {};
    content = {
      about: d.about || { heading: "", body: "" },
      projects: d.projects || [],
      workshops: d.workshops || [],
      achievements: d.achievements || [],
      sponsors: d.sponsors || [],
    };
    try { messages = await sbSelect("contact_messages?select=*&order=created_at.desc"); } catch { messages = []; }
    try { logs = await sbSelect("audit_logs?select=*&order=at.desc&limit=200"); } catch { logs = []; }
  }

  async function saveContent(action) {
    try {
      await sbUpsertContent(content);
      if (action) logAction(action);
      toast("Uloženo");
    } catch (e) {
      console.error(e);
      toast("Uložení selhalo", "err");
    }
  }

  /* ---- Rendering ---- */
  function header(title, subtitle, actions) {
    const h = el("div", { class: "admin-h" },
      el("div", {}, el("h1", {}, title), subtitle ? el("p", {}, subtitle) : null),
      actions ? el("div", { class: "card-actions" }, ...(Array.isArray(actions) ? actions : [actions])) : null
    );
    return h;
  }

  function field(label, name, value, opts = {}) {
    const input = opts.textarea
      ? el("textarea", { name, rows: opts.rows || 3 }, value || "")
      : el("input", { name, type: opts.type || "text", value: value ?? "" });
    return el("label", { class: "field" }, el("span", {}, label), input);
  }

  function selectField(label, name, value, options) {
    const sel = el("select", { name });
    options.forEach((o) => {
      const opt = el("option", { value: o.value }, o.label);
      if (o.value === value) opt.setAttribute("selected", "");
      sel.append(opt);
    });
    return el("label", { class: "field" }, el("span", {}, label), sel);
  }

  function formValues(form) {
    const fd = new FormData(form);
    const obj = {};
    fd.forEach((v, k) => { obj[k] = typeof v === "string" ? v.trim() : v; });
    return obj;
  }

  /* ---- Projects tab ---- */
  function renderProjects() {
    const root = $("#tab-projects");
    root.replaceChildren();
    root.append(header("Projekty", `${content.projects.length} položek`));

    const form = el("form", { class: "card form-block", onsubmit: (e) => {
      e.preventDefault();
      const v = formValues(form);
      if (!v.title) return;
      content.projects.push({
        id: uid(),
        title: v.title,
        status: v.status || "Aktivní",
        category: v.category || "major",
        description: v.description || "",
        esa: v.esa === "on",
        image: v.image || undefined,
      });
      saveContent(`Přidán projekt: ${v.title}`).then(renderProjects);
      form.reset();
    } });
    form.append(
      el("div", { class: "card-title" }, "+ Přidat projekt"),
      el("div", { class: "field-row" }, field("Název", "title", ""), field("Stav", "status", "")),
      el("div", { class: "field-row" },
        selectField("Kategorie", "category", "major", [
          { value: "major", label: "Hlavní" }, { value: "minor", label: "ESA" }, { value: "past", label: "Realizované" },
        ]),
        field("URL obrázku (volitelné)", "image", ""),
      ),
      field("Popis", "description", "", { textarea: true, rows: 3 }),
      el("label", { class: "field", style: "flex-direction:row;align-items:center;gap:8px" },
        el("input", { type: "checkbox", name: "esa" }),
        el("span", {}, "Pod patronací ESA")
      ),
      el("button", { class: "btn btn-primary", type: "submit" }, "Přidat")
    );
    root.append(form);

    content.projects.forEach((p, idx) => {
      const card = el("div", { class: "card" });
      const view = el("div", { class: "card-row" },
        el("div", {},
          el("div", { class: "card-title" }, p.title, p.esa ? el("span", { style: "margin-left:8px;color:#b7a6ff;font-size:11px" }, "ESA") : null),
          el("div", { class: "card-meta" }, `${p.category} · ${p.status}`),
          el("div", { class: "card-desc" }, p.description || "")
        ),
        el("div", { class: "card-actions" },
          el("button", { class: "icon-btn", onclick: () => editProject(idx, card) }, "Upravit"),
          el("button", { class: "icon-btn danger", onclick: () => {
            if (!confirm(`Smazat projekt "${p.title}"?`)) return;
            content.projects.splice(idx, 1);
            saveContent(`Smazán projekt: ${p.title}`).then(renderProjects);
          } }, "Smazat"),
        )
      );
      card.append(view);
      root.append(card);
    });
  }

  function editProject(idx, card) {
    const p = content.projects[idx];
    const form = el("form", { class: "form-block", onsubmit: (e) => {
      e.preventDefault();
      const v = formValues(form);
      content.projects[idx] = { ...p, ...v, esa: v.esa === "on" };
      saveContent(`Upraven projekt: ${v.title}`).then(renderProjects);
    } });
    form.append(
      el("div", { class: "field-row" }, field("Název", "title", p.title), field("Stav", "status", p.status)),
      el("div", { class: "field-row" },
        selectField("Kategorie", "category", p.category, [
          { value: "major", label: "Hlavní" }, { value: "minor", label: "ESA" }, { value: "past", label: "Realizované" },
        ]),
        field("URL obrázku", "image", p.image || ""),
      ),
      field("Popis", "description", p.description || "", { textarea: true, rows: 3 }),
      el("label", { class: "field", style: "flex-direction:row;align-items:center;gap:8px" },
        (() => { const cb = el("input", { type: "checkbox", name: "esa" }); if (p.esa) cb.setAttribute("checked", ""); return cb; })(),
        el("span", {}, "Pod patronací ESA")
      ),
      el("div", { class: "card-actions" },
        el("button", { class: "btn btn-primary", type: "submit" }, "Uložit"),
        el("button", { class: "icon-btn", type: "button", onclick: renderProjects }, "Zrušit"),
      )
    );
    card.replaceChildren(form);
  }

  /* ---- Simple list tab (workshops, achievements, sponsors) ---- */
  function renderSimpleList(key, cfg) {
    const root = $("#tab-" + cfg.tab);
    root.replaceChildren();
    root.append(header(cfg.title, `${content[key].length} položek`));

    const form = el("form", { class: "card form-block", onsubmit: (e) => {
      e.preventDefault();
      const v = formValues(form);
      if (!v[cfg.mainField]) return;
      content[key].push({ id: uid(), ...v });
      saveContent(`Přidáno: ${v[cfg.mainField]}`).then(() => renderSimpleList(key, cfg));
      form.reset();
    } });
    form.append(el("div", { class: "card-title" }, "+ Přidat"));
    cfg.fields.forEach((f) => form.append(field(f.label, f.name, "", f.opts)));
    form.append(el("button", { class: "btn btn-primary", type: "submit" }, "Přidat"));
    root.append(form);

    content[key].forEach((item, idx) => {
      const card = el("div", { class: "card" });
      const view = el("div", { class: "card-row" },
        el("div", {},
          el("div", { class: "card-title" }, item[cfg.mainField]),
          cfg.metaField ? el("div", { class: "card-meta" }, item[cfg.metaField] || "") : null,
          cfg.descField ? el("div", { class: "card-desc" }, item[cfg.descField] || "") : null,
        ),
        el("div", { class: "card-actions" },
          el("button", { class: "icon-btn", onclick: () => {
            const editForm = el("form", { class: "form-block", onsubmit: (e) => {
              e.preventDefault();
              const v = formValues(editForm);
              content[key][idx] = { ...item, ...v };
              saveContent(`Upraveno: ${v[cfg.mainField]}`).then(() => renderSimpleList(key, cfg));
            } });
            cfg.fields.forEach((f) => editForm.append(field(f.label, f.name, item[f.name] || "", f.opts)));
            editForm.append(el("div", { class: "card-actions" },
              el("button", { class: "btn btn-primary", type: "submit" }, "Uložit"),
              el("button", { class: "icon-btn", type: "button", onclick: () => renderSimpleList(key, cfg) }, "Zrušit"),
            ));
            card.replaceChildren(editForm);
          } }, "Upravit"),
          el("button", { class: "icon-btn danger", onclick: () => {
            if (!confirm(`Smazat "${item[cfg.mainField]}"?`)) return;
            content[key].splice(idx, 1);
            saveContent(`Smazáno: ${item[cfg.mainField]}`).then(() => renderSimpleList(key, cfg));
          } }, "Smazat"),
        )
      );
      card.append(view);
      root.append(card);
    });
  }

  /* ---- About tab ---- */
  function renderAbout() {
    const root = $("#tab-about");
    root.replaceChildren();
    root.append(header("O nás", "Text v úvodní sekci"));
    const form = el("form", { class: "card form-block", onsubmit: (e) => {
      e.preventDefault();
      const v = formValues(form);
      content.about = { heading: v.heading, body: v.body };
      saveContent("Upravena sekce O nás");
    } });
    form.append(
      field("Nadpis", "heading", content.about.heading || ""),
      field("Text", "body", content.about.body || "", { textarea: true, rows: 6 }),
      el("button", { class: "btn btn-primary", type: "submit" }, "Uložit"),
    );
    root.append(form);
  }

  /* ---- Messages tab ---- */
  function renderMessages() {
    const root = $("#tab-messages");
    root.replaceChildren();
    root.append(header("Zprávy z kontaktního formuláře", `${messages.length} zpráv`));
    if (!messages.length) { root.append(el("div", { class: "empty" }, "Zatím žádné zprávy.")); return; }
    messages.forEach((m) => {
      const card = el("div", { class: "card" },
        el("div", { class: "card-row" },
          el("div", {},
            el("div", { class: "card-title" }, m.name, el("span", { style: "color:var(--muted);font-weight:400;margin-left:8px" }, `<${m.email}>`)),
            el("div", { class: "card-meta" }, new Date(m.created_at).toLocaleString("cs-CZ")),
            el("div", { class: "card-desc", style: "white-space:pre-wrap;margin-top:10px;color:var(--fg)" }, m.message)
          ),
          el("div", { class: "card-actions" },
            el("a", { class: "icon-btn", href: `mailto:${m.email}` }, "Odpovědět"),
            el("button", { class: "icon-btn danger", onclick: async () => {
              if (!confirm("Smazat zprávu?")) return;
              try {
                await sbDelete(`contact_messages?id=eq.${m.id}`);
                messages = messages.filter((x) => x.id !== m.id);
                toast("Smazáno");
                renderMessages();
              } catch (e) { console.error(e); toast("Smazání selhalo", "err"); }
            } }, "Smazat"),
          )
        )
      );
      root.append(card);
    });
  }

  /* ---- Logs tab ---- */
  function renderLogs() {
    const root = $("#tab-logs");
    root.replaceChildren();
    root.append(header("Historie změn", `${logs.length} záznamů`));
    if (!logs.length) { root.append(el("div", { class: "empty" }, "Zatím žádné záznamy.")); return; }
    logs.forEach((l) => {
      root.append(el("div", { class: "card" },
        el("div", { class: "card-meta" }, `${new Date(l.at).toLocaleString("cs-CZ")} · ${l.who}`),
        el("div", { class: "card-title", style: "margin-top:4px;font-weight:500;font-size:14px" }, l.action),
      ));
    });
  }

  /* ---- Tabs ---- */
  const RENDERERS = {
    projects: renderProjects,
    workshops: () => renderSimpleList("workshops", {
      tab: "workshops", title: "Workshopy",
      mainField: "title", metaField: "date", descField: "description",
      fields: [
        { label: "Název", name: "title" },
        { label: "Termín", name: "date" },
        { label: "Popis", name: "description", opts: { textarea: true, rows: 3 } },
      ],
    }),
    achievements: () => renderSimpleList("achievements", {
      tab: "achievements", title: "Úspěchy",
      mainField: "label", metaField: "metric", descField: "description",
      fields: [
        { label: "Metrika (např. 2×, ESA, 1 000+)", name: "metric" },
        { label: "Popisek", name: "label" },
        { label: "Poznámka", name: "description" },
      ],
    }),
    sponsors: () => renderSimpleList("sponsors", {
      tab: "sponsors", title: "Partneři",
      mainField: "name", metaField: "tier", descField: "domain",
      fields: [
        { label: "Název", name: "name" },
        { label: "Doména (pro logo.dev)", name: "domain" },
        { label: "Web (URL)", name: "url" },
        { label: "URL loga (volitelné)", name: "logo" },
        { label: "Úroveň (main / general / media)", name: "tier" },
      ],
    }),
    about: renderAbout,
    messages: renderMessages,
    logs: renderLogs,
  };

  function switchTab(name) {
    $$(".admin-nav button").forEach((b) => b.classList.toggle("active", b.dataset.tab === name));
    $$(".tab").forEach((t) => (t.hidden = t.id !== "tab-" + name));
    RENDERERS[name]();
  }

  /* ---- Boot ---- */
  function showLogin() {
    $("#appView").hidden = true;
    $("#loginView").hidden = false;
  }

  async function showApp() {
    $("#loginView").hidden = true;
    $("#appView").hidden = false;
    $("#userEmail").textContent = session?.user?.email || "";
    try {
      await loadAll();
      switchTab("projects");
    } catch (e) {
      console.error(e);
      toast("Načtení selhalo — možná nemáte oprávnění admin", "err");
      if (String(e).includes("401") || String(e).includes("permission")) {
        saveSession(null); showLogin();
      }
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    $("#loginForm").addEventListener("submit", async (e) => {
      e.preventDefault();
      const status = $("#loginStatus");
      const btn = $("#loginSubmit");
      const { email, password } = formValues(e.currentTarget);
      status.textContent = ""; status.className = "form-status";
      btn.disabled = true; btn.textContent = "Přihlašuji…";
      try {
        await login(email, password);
        await showApp();
      } catch (err) {
        status.textContent = err.message || "Přihlášení selhalo";
        status.className = "form-status err";
      } finally {
        btn.disabled = false; btn.textContent = "Přihlásit se";
      }
    });
    $("#logoutBtn").addEventListener("click", logout);
    $$(".admin-nav button").forEach((b) => b.addEventListener("click", () => switchTab(b.dataset.tab)));

    if (session?.access_token) showApp();
    else showLogin();
  });
})();

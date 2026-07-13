/* zitny.eu — pure vanilla JS */
(() => {
  const SUPABASE_URL = "https://dhgsxfamykjswemarmel.supabase.co";
  const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRoZ3N4ZmFteWtqc3dlbWFybWVsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAyOTU2NTksImV4cCI6MjA5NTg3MTY1OX0.4l17mmMgLhynGvflTjKRuOI4hG43-Mr3r9AmjEsBkMM";
  const HEADERS = {
    apikey: SUPABASE_KEY,
    Authorization: `Bearer ${SUPABASE_KEY}`,
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  /* ---- Utils ---- */
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const el = (tag, attrs = {}, ...children) => {
    const n = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (v == null || v === false) continue;
      if (k === "class") n.className = v;
      else if (k === "html") n.innerHTML = v;
      else if (k.startsWith("on") && typeof v === "function") n.addEventListener(k.slice(2), v);
      else n.setAttribute(k, v === true ? "" : v);
    }
    for (const c of children) {
      if (c == null || c === false) continue;
      n.append(c.nodeType ? c : document.createTextNode(String(c)));
    }
    return n;
  };
  const escape = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c]));

  /* ---- Default content (fallback) ---- */
  const DEFAULTS = {
    about: {
      heading: "Mladí inženýři s pohledem k hvězdám",
      body: "Jsme nezisková iniciativa mladých nadšenců, kteří propojují vesmírné technologie, vědu a vzdělávání. Realizujeme projekty pod patronací Evropské vesmírné agentury ESA, organizujeme workshopy pro školy a spolupracujeme s veřejnými i bezpečnostními složkami.",
    },
    achievements: [
      { id: "a1", metric: "2×", label: "Ocenění AirVision", description: "Mezinárodní ekologický summit" },
      { id: "a2", metric: "ESA", label: "Oficiální patronace", description: "Patronace nad jednotlivými projekty" },
      { id: "a3", metric: "1 000+", label: "Účastníků programů", description: "Děti, studenti i veřejnost" },
      { id: "a4", metric: "2", label: "Spolupráce s IZS", description: "HZS Středočeského kraje, JSDH Řevnice" },
    ],
    projects: [
      { id: "p1", category: "major", title: "AirVision", status: "2× oceněno", description: "Vlajkový projekt zaměřený na monitoring kvality ovzduší pomocí dronů a senzorické platformy. Dvojnásobný laureát Mezinárodního ekologického summitu." },
      { id: "p2", category: "major", title: "Cartographia Bohemica Kalifornia", status: "Aktivní", description: "Mapovací projekt propojující český a kalifornský terén — kombinace satelitních dat, dronového snímkování a otevřené kartografie." },
      { id: "p3", category: "major", esa: true, title: "Den s Vesmírem", status: "Pod patronací ESA", description: "Vzdělávací program pro školy a organizace. Zábavné aktivity spojené s vesmírem, raketami a drony." },
      { id: "p4", category: "minor", esa: true, title: "AstroPi Challenge — Mission Zero", status: "Pod patronací ESA", description: "Programátorská výzva ESA, ve které kód našich týmů poběží na palubě ISS." },
      { id: "p5", category: "minor", esa: true, title: "SpaceLab", status: "Pod patronací ESA", description: "Studentský vědecký program ESA — návrh a realizace experimentů v simulovaném vesmírném prostředí." },
      { id: "p6", category: "minor", esa: true, title: "MoonCamp Challenge", status: "Pod patronací ESA", description: "Mezinárodní výzva ESA na návrh udržitelné lunární základny." },
      { id: "p7", category: "past", title: "Spolupráce s HZS Středočeského kraje", status: "Realizováno", description: "Společné cvičení a sdílení know-how v oblasti dronových technologií." },
      { id: "p8", category: "past", title: "Spolupráce s JSDH Řevnice", status: "Realizováno", description: "Podpora a školení Jednotky sboru dobrovolných hasičů Řevnice v nasazení moderních technologií." },
    ],
    workshops: [
      { id: "w1", title: "Den s Vesmírem", description: "Celodenní program plný experimentů, raketových modelů, dronových aktivit a setkání s lidmi z oboru.", date: "Celoročně — na objednávku" },
      { id: "w2", title: "Pohodový den pro Dům Ronalda McDonalda", description: "Charitativní program pro děti a rodiny — pouštění raket, astronomické pozorování a tvořivé dílny.", date: "Plánováno" },
    ],
    sponsors: [
      { id: "s1", name: "ESA", domain: "esa.int", url: "https://www.esa.int" },
      { id: "s2", name: "HZS Středočeského kraje", domain: "hzscr.cz", url: "https://www.hzscr.cz" },
      { id: "s3", name: "JSDH Řevnice", domain: "revnice.cz", url: "https://www.revnice.cz" },
      { id: "s4", name: "AstroPi", domain: "astro-pi.org", url: "https://astro-pi.org" },
      { id: "s5", name: "MoonCamp", domain: "mooncampchallenge.org", url: "https://mooncampchallenge.org" },
      { id: "s6", name: "Pizzzza.cz", domain: "pizzzza.cz", url: "https://pizzzza.cz" },
    ],
  };

  /* ---- Fetch content ---- */
  async function fetchContent() {
    try {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/site_content?select=data&id=eq.1`,
        { headers: HEADERS }
      );
      if (!res.ok) throw new Error(String(res.status));
      const rows = await res.json();
      const data = rows[0]?.data;
      if (!data) return DEFAULTS;
      return {
        about: data.about ?? DEFAULTS.about,
        achievements: data.achievements ?? DEFAULTS.achievements,
        projects: data.projects ?? DEFAULTS.projects,
        workshops: data.workshops ?? DEFAULTS.workshops,
        sponsors: data.sponsors ?? DEFAULTS.sponsors,
      };
    } catch (e) {
      console.warn("Použit fallback obsah:", e);
      return DEFAULTS;
    }
  }

  /* ---- Render ---- */
  function renderAbout(about) {
    if (!about) return;
    const h = $("#aboutHeading");
    const b = $("#aboutBody");
    if (h && about.heading) h.textContent = about.heading;
    if (b && about.body) b.textContent = about.body;
  }

  function renderAchievements(list) {
    const root = $("#achievementsGrid");
    if (!root) return;
    root.replaceChildren(...list.map((a) =>
      el("div", { class: "ach reveal" },
        el("div", { class: "ach-metric" }, a.metric),
        el("div", { class: "ach-label" }, a.label),
        el("div", { class: "ach-desc" }, a.description || "")
      )
    ));
  }

  function projectCard(p) {
    const head = el("div", { class: "proj-head" },
      el("span", { class: "proj-status" }, p.status || "Aktivní"),
      p.esa ? el("span", { class: "proj-esa" }, "ESA") : null
    );
    const children = [head];
    if (p.image) children.push(el("img", { class: "proj-img", src: p.image, alt: p.title, loading: "lazy" }));
    children.push(el("h4", { class: "proj-title" }, p.title));
    children.push(el("p", { class: "proj-desc" }, p.description || ""));
    return el("article", { class: "proj reveal" }, ...children);
  }

  function renderProjects(list) {
    const groups = { major: [], minor: [], past: [] };
    list.forEach((p) => (groups[p.category] ?? groups.major).push(p));
    const mount = (id, arr) => {
      const root = $("#" + id);
      if (!root) return;
      root.replaceChildren(...arr.map(projectCard));
    };
    mount("projectsMajor", groups.major);
    mount("projectsMinor", groups.minor);
    mount("projectsPast", groups.past);
  }

  function renderWorkshops(list) {
    const root = $("#workshopsGrid");
    if (!root) return;
    root.replaceChildren(...list.map((w) =>
      el("article", { class: "ws reveal" },
        el("h4", { class: "ws-title" }, w.title),
        w.date ? el("div", { class: "ws-date" }, w.date) : null,
        el("p", { class: "ws-desc" }, w.description || "")
      )
    ));
  }

  function sponsorCard(s) {
    const inner = s.logo
      ? el("img", { src: s.logo, alt: s.name, loading: "lazy" })
      : s.domain
        ? el("img", { src: `https://img.logo.dev/${s.domain}?token=pk_X-1b4t_XQ0OQvzYBnfhOhg&size=200&format=png&retina=true`, alt: s.name, loading: "lazy",
            onerror: (ev) => { ev.currentTarget.replaceWith(document.createTextNode(s.name)); } })
        : document.createTextNode(s.name);
    const a = el(s.url ? "a" : "div", {
      class: "sp reveal",
      ...(s.url ? { href: s.url, target: "_blank", rel: "noopener noreferrer", "aria-label": s.name } : {}),
    }, inner);
    return a;
  }

  function renderSponsors(list) {
    const root = $("#sponsorsGrid");
    if (!root) return;
    root.replaceChildren(...list.map(sponsorCard));
  }

  /* ---- Nav ---- */
  function setupNav() {
    const btn = $("#navToggle");
    const menu = $("#mobileMenu");
    if (!btn || !menu) return;
    const toggle = (open) => {
      const isOpen = open ?? btn.getAttribute("aria-expanded") !== "true";
      btn.setAttribute("aria-expanded", String(isOpen));
      menu.hidden = !isOpen;
      menu.dataset.open = String(isOpen);
    };
    btn.addEventListener("click", () => toggle());
    menu.addEventListener("click", (e) => {
      if (e.target instanceof HTMLAnchorElement) toggle(false);
    });
  }

  /* ---- Reveal on scroll ---- */
  function setupReveal() {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("visible");
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -60px 0px" });
    $$(".reveal").forEach((n) => io.observe(n));
  }

  /* ---- Contact form ---- */
  function setupForm() {
    const form = $("#contactForm");
    const status = $("#formStatus");
    const submit = $("#contactSubmit");
    if (!form) return;
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      status.textContent = "";
      status.className = "form-status";
      const fd = new FormData(form);
      const payload = {
        name: String(fd.get("name") || "").trim(),
        email: String(fd.get("email") || "").trim(),
        message: String(fd.get("message") || "").trim(),
      };
      if (!payload.name || !payload.email || !payload.message) {
        status.textContent = "Vyplňte prosím všechna pole.";
        status.classList.add("err");
        return;
      }
      submit.disabled = true;
      submit.textContent = "Odesílám…";
      try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/contact_messages`, {
          method: "POST",
          headers: { ...HEADERS, Prefer: "return=minimal" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error(await res.text());
        form.reset();
        status.textContent = "Děkujeme! Ozveme se co nejdříve.";
        status.classList.add("ok");
      } catch (err) {
        console.error(err);
        status.textContent = "Odeslání selhalo. Zkuste to prosím později nebo napište na info@zitny.eu.";
        status.classList.add("err");
      } finally {
        submit.disabled = false;
        submit.textContent = "Odeslat zprávu";
      }
    });
  }

  /* ---- Smooth anchor with nav offset ---- */
  function setupAnchors() {
    document.addEventListener("click", (e) => {
      const t = e.target;
      if (!(t instanceof HTMLElement)) return;
      const a = t.closest('a[href^="#"]');
      if (!a) return;
      const id = a.getAttribute("href").slice(1);
      if (!id) return;
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      const y = target.getBoundingClientRect().top + window.scrollY - 68;
      window.scrollTo({ top: y, behavior: "smooth" });
    });
  }

  /* ---- Boot ---- */
  async function boot() {
    $("#year").textContent = new Date().getFullYear();
    setupNav();
    setupAnchors();
    setupForm();
    const data = await fetchContent();
    renderAbout(data.about);
    renderAchievements(data.achievements);
    renderProjects(data.projects);
    renderWorkshops(data.workshops);
    renderSponsors(data.sponsors);
    setupReveal();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();

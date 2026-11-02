import { useEffect, useState, useSyncExternalStore } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
const defaultContent = {
  about: {
    heading: "Mladí inženýři s pohledem k hvězdám",
    body: "Jsme nezisková iniciativa mladých nadšenců, kteří propojují vesmírné technologie, vědu a vzdělávání. Realizujeme projekty pod patronací Evropské vesmírné agentury ESA, organizujeme workshopy pro školy a spolupracujeme s veřejnými i bezpečnostními složkami.",
  },
  achievements: [
    {
      id: "a1",
      metric: "2×",
      label: "Ocenění AirVision",
      description: "Mezinárodní ekologický summit",
    },
    {
      id: "a2",
      metric: "ESA",
      label: "Oficiální patronace",
      description: "Patronace nad jednotlivými projekty",
    },
    {
      id: "a3",
      metric: "1 000+",
      label: "Účastníků programů",
      description: "Děti, studenti i veřejnost",
    },
    {
      id: "a4",
      metric: "2",
      label: "Spolupráce s IZS",
      description: "HZS Středočeského kraje, JSDH Řevnice",
    },
  ],
  projects: [
    {
      id: "p1",
      category: "major",
      title: "AirVision",
      status: "2× oceněno",
      description:
        "Vlajkový projekt zaměřený na monitoring kvality ovzduší pomocí dronů a senzorické platformy. Dvojnásobný laureát Mezinárodního ekologického summitu. (Projekt bude brzy přejmenován.)",
    },
    {
      id: "p2",
      category: "major",
      title: "Cartographia Bohemica Kalifornia",
      status: "Aktivní",
      description:
        "Mapovací projekt propojující český a kalifornský terén — kombinace satelitních dat, dronového snímkování a otevřené kartografie.",
    },
    {
      id: "p3",
      category: "major",
      esa: true,
      title: "Den s Vesmírem",
      status: "Pod patronací ESA",
      description:
        "Vzdělávací program pro školy a organizace. Zábavné aktivity spojené s vesmírem, raketami a drony — pod oficiální patronací ESA.",
    },
    {
      id: "p4",
      category: "minor",
      esa: true,
      title: "AstroPi Challenge — Mission Zero",
      status: "Pod patronací ESA",
      description:
        "Programátorská výzva ESA, ve které kód našich týmů poběží na palubě Mezinárodní vesmírné stanice (ISS).",
    },
    {
      id: "p5",
      category: "minor",
      esa: true,
      title: "SpaceLab",
      status: "Pod patronací ESA",
      description:
        "Studentský vědecký program ESA — návrh a realizace experimentů v simulovaném vesmírném prostředí.",
    },
    {
      id: "p6",
      category: "minor",
      esa: true,
      title: "MoonCamp Challenge",
      status: "Pod patronací ESA",
      description:
        "Mezinárodní výzva ESA na návrh udržitelné lunární základny. Vedeme studentské týmy k vlastním návrhům.",
    },
    {
      id: "p7",
      category: "past",
      title: "Spolupráce s HZS Středočeského kraje",
      status: "Realizováno",
      description:
        "Společné cvičení a sdílení know-how v oblasti dronových technologií s Hasičským záchranným sborem Středočeského kraje.",
    },
    {
      id: "p8",
      category: "past",
      title: "Spolupráce s JSDH Řevnice",
      status: "Realizováno",
      description:
        "Podpora a školení Jednotky sboru dobrovolných hasičů Řevnice v nasazení moderních technologií při zásahu.",
    },
  ],
  workshops: [
    {
      id: "w1",
      title: "Den s Vesmírem",
      description:
        "Celodenní program plný experimentů, raketových modelů, dronových aktivit a setkání s lidmi z oboru. Pro školy, menší i větší organizace.",
      date: "Celoročně — na objednávku",
    },
    {
      id: "w2",
      title: "Pohodový den pro Dům Ronalda McDonalda",
      description:
        "Plánovaný charitativní program pro děti a rodiny v Domě Ronalda McDonalda — pouštění raket, astronomické pozorování a tvořivé dílny.",
      date: "Plánováno",
    },
  ],
  sponsors: [
    { id: "s1", name: "ESA", tier: "general" },
    { id: "s2", name: "HZS Středočeského kraje", tier: "main" },
    { id: "s3", name: "JSDH Řevnice", tier: "main" },
    { id: "s4", name: "AstroPi", tier: "media" },
    { id: "s5", name: "MoonCamp", tier: "media" },
  ],
};
const defaultData = { ...defaultContent, messages: [], logs: [] };
let state = defaultData;
let initialized = false;
let initStarted = false;
const listeners = /* @__PURE__ */ new Set();
const emit = () => listeners.forEach((l) => l());
const setState = (s) => {
  state = s;
  emit();
};
const getSnapshot = () => state;
async function loadAdminData() {
  const [{ data: msgs }, { data: logs }] = await Promise.all([
    supabase.from("contact_messages").select("*").order("created_at", { ascending: false }),
    supabase.from("audit_logs").select("*").order("at", { ascending: false }).limit(200),
  ]);
  setState({
    ...state,
    messages: (msgs ?? []).map((m) => ({
      id: m.id,
      name: m.name,
      email: m.email,
      message: m.message,
      createdAt: m.created_at,
    })),
    logs: (logs ?? []).map((l) => ({ id: l.id, who: l.who, action: l.action, at: l.at })),
  });
}
async function init() {
  if (initStarted) return;
  initStarted = true;
  try {
    const { data: row } = await supabase
      .from("site_content")
      .select("data")
      .eq("id", 1)
      .maybeSingle();
    let content;
    if (!row) {
      await supabase.from("site_content").insert({ id: 1, data: defaultContent });
      content = defaultContent;
    } else {
      content = { ...defaultContent, ...row.data };
    }
    setState({ ...state, ...content });
    initialized = true;
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session) {
      try {
        await loadAdminData();
      } catch {
        // not logged in as admin yet — ignore, loadAdminData() retries on SIGNED_IN
      }
    }
    supabase
      .channel("site-sync")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "site_content" },
        (payload) => {
          const d = payload.new?.data;
          if (d) setState({ ...state, ...d });
        },
      )
      .subscribe();
    supabase.auth.onAuthStateChange(async (event) => {
      if (event === "SIGNED_IN") {
        try {
          await loadAdminData();
        } catch (e) {
          console.error(e);
        }
      } else if (event === "SIGNED_OUT") {
        setState({ ...state, messages: [], logs: [] });
      }
    });
  } catch (err) {
    console.error("Inicializace cloud dat selhala:", err);
    toast.error("Nepodařilo se načíst data z cloudu");
  }
}
let saveTimer = null;
let pendingContent = null;
function scheduleSave(content) {
  pendingContent = content;
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(async () => {
    const c = pendingContent;
    pendingContent = null;
    saveTimer = null;
    if (!c) return;
    try {
      const { error } = await supabase
        .from("site_content")
        .upsert({ id: 1, data: c, updated_at: /* @__PURE__ */ new Date().toISOString() });
      if (error) {
        console.error(error);
        toast.error(`Uložení do cloudu selhalo: ${error.message}`);
      }
    } catch (err) {
      console.error(err);
      toast.error(`Uložení do cloudu selhalo: ${err instanceof Error ? err.message : String(err)}`);
    }
  }, 400);
}
function useSite() {
  const data = useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    getSnapshot,
    () => defaultData,
  );
  useEffect(() => {
    if (!initStarted) init();
  }, []);
  const update = (patch) => {
    const next = typeof patch === "function" ? patch(state) : { ...state, ...patch };
    setState(next);
    const content = {
      about: next.about,
      projects: next.projects,
      workshops: next.workshops,
      achievements: next.achievements,
      sponsors: next.sponsors,
    };
    scheduleSave(content);
  };
  const log = async (who, action) => {
    let row, error;
    try {
      ({ data: row, error } = await supabase
        .from("audit_logs")
        .insert({ who, action })
        .select()
        .single());
    } catch (err) {
      console.error(err);
      return;
    }
    if (error || !row) {
      if (error) console.error(error);
      return;
    }
    if (!state.logs.some((l) => l.id === row.id)) {
      setState({
        ...state,
        logs: [{ id: row.id, who: row.who, action: row.action, at: row.at }, ...state.logs].slice(
          0,
          200,
        ),
      });
    }
  };
  const addMessage = async (msg) => {
    try {
      const { error } = await supabase.from("contact_messages").insert(msg);
      if (error) {
        console.error(error);
        toast.error("Nepodařilo se odeslat zprávu");
        return false;
      }
      return true;
    } catch (err) {
      console.error(err);
      toast.error("Nepodařilo se odeslat zprávu");
      return false;
    }
  };
  const deleteMessage = async (id) => {
    setState({ ...state, messages: state.messages.filter((m) => m.id !== id) });
    try {
      const { error } = await supabase.from("contact_messages").delete().eq("id", id);
      if (error) {
        console.error(error);
        toast.error("Smazání selhalo");
      }
    } catch (err) {
      console.error(err);
      toast.error("Smazání selhalo");
    }
  };
  const importFromLocalStorage = async () => {
    try {
      const raw = localStorage.getItem("zitny-site-data-v3");
      if (!raw) {
        toast.info("V prohlížeči nejsou žádná lokální data");
        return;
      }
      const parsed = JSON.parse(raw);
      const content = {
        about: parsed.about ?? defaultContent.about,
        projects: parsed.projects ?? [],
        workshops: parsed.workshops ?? [],
        achievements: parsed.achievements ?? [],
        sponsors: parsed.sponsors ?? [],
      };
      const { error } = await supabase
        .from("site_content")
        .upsert({ id: 1, data: content, updated_at: /* @__PURE__ */ new Date().toISOString() });
      if (error) throw error;
      setState({ ...state, ...content });
      toast.success("Lokální data nahrána do cloudu");
    } catch (err) {
      console.error(err);
      toast.error("Import selhal");
    }
  };
  return {
    data,
    initialized,
    update,
    log,
    addMessage,
    deleteMessage,
    importFromLocalStorage,
    reset: () => update(() => ({ ...defaultContent, messages: state.messages, logs: state.logs })),
  };
}
const USERNAME_TO_EMAIL = {
  admin: { email: "admin@zitny.eu", role: "Hlavní administrátor" },
  koordinator: { email: "koordinator@zitny.eu", role: "Koordinátor projektů" },
  editor: { email: "editor@zitny.eu", role: "Editor obsahu" },
};
const EMAIL_TO_USERNAME = Object.fromEntries(
  Object.entries(USERNAME_TO_EMAIL).map(([u, v]) => [v.email, u]),
);
function deriveUsername(sessionUser) {
  if (!sessionUser?.email) return null;
  return EMAIL_TO_USERNAME[sessionUser.email] ?? sessionUser.email;
}
function useAuth() {
  const [session, setSession] = useState(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);
  const username = deriveUsername(session?.user ?? null);
  const role = username ? USERNAME_TO_EMAIL[username]?.role : void 0;
  return {
    ready,
    user: username,
    authed: !!session,
    role,
    accounts: Object.entries(USERNAME_TO_EMAIL).map(([u, v]) => ({ user: u, role: v.role })),
    login: async (u, p) => {
      const key = u.trim().toLowerCase();
      const mapped = USERNAME_TO_EMAIL[key];
      const email = mapped?.email ?? (key.includes("@") ? key : null);
      if (!email) return false;
      const { error } = await supabase.auth.signInWithPassword({ email, password: p });
      return !error;
    },
    logout: async () => {
      await supabase.auth.signOut();
    },
  };
}
const uid = () => Math.random().toString(36).slice(2, 10);
export { uid, useAuth, useSite };

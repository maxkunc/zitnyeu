import { useEffect, useSyncExternalStore } from "react";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";
import { toast } from "sonner";

export type Project = {
  id: string;
  title: string;
  description: string;
  status: string;
  category: "major" | "minor" | "past";
  esa?: boolean;
  image?: string;
};

export type Workshop = {
  id: string;
  title: string;
  description: string;
  date?: string;
};

export type Achievement = {
  id: string;
  metric: string;
  label: string;
  description: string;
};

export type Sponsor = {
  id: string;
  name: string;
  tier?: "general" | "main" | "media";
  url?: string;
  logo?: string;
};

export type Message = {
  id: string;
  name: string;
  email: string;
  message: string;
  createdAt: string;
};

export type AuditLog = {
  id: string;
  who: string;
  action: string;
  at: string;
};

/** Obsah uložený v cloudu (site_content.data) */
type CloudContent = {
  about: { heading: string; body: string };
  projects: Project[];
  workshops: Workshop[];
  achievements: Achievement[];
  sponsors: Sponsor[];
};

export type SiteData = CloudContent & {
  messages: Message[];
  logs: AuditLog[];
};

const defaultContent: CloudContent = {
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

const defaultData: SiteData = { ...defaultContent, messages: [], logs: [] };

// ---- store ----
let state: SiteData = defaultData;
let initialized = false;
let initStarted = false;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
const setState = (s: SiteData) => {
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
    let content: CloudContent;
    if (!row) {
      // INSERT je chráněno RLS — proběhne jen pokud je přihlášen admin.
      await supabase
        .from("site_content")
        .insert({ id: 1, data: defaultContent as unknown as Json });
      content = defaultContent;
    } else {
      content = { ...defaultContent, ...(row.data as Partial<CloudContent>) };
    }
    setState({ ...state, ...content });
    initialized = true;

    // Admin panel je bez přihlášení veřejný, takže zprávy a historii načteme rovnou.
    try {
      await loadAdminData();
    } catch (e) {
      console.error(e);
    }

    // Realtime — pouze veřejný site_content (contact_messages už není v publikaci)
    supabase
      .channel("site-sync")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "site_content" },
        (payload: RealtimePostgresChangesPayload<{ data: Json }>) => {
          const d = (payload.new as { data?: Json })?.data as Partial<CloudContent> | undefined;
          if (d) setState({ ...state, ...d });
        },
      )
      .subscribe();
  } catch (err) {
    console.error("Inicializace cloud dat selhala:", err);
    toast.error("Nepodařilo se načíst data z cloudu");
  }
}

let saveTimer: ReturnType<typeof setTimeout> | null = null;
let pendingContent: CloudContent | null = null;

function scheduleSave(content: CloudContent) {
  pendingContent = content;
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(async () => {
    const c = pendingContent;
    pendingContent = null;
    saveTimer = null;
    if (!c) return;
    const { error } = await supabase
      .from("site_content")
      .upsert({ id: 1, data: c as unknown as Json, updated_at: new Date().toISOString() });
    if (error) {
      console.error(error);
      toast.error("Uložení do cloudu selhalo");
    }
  }, 400);
}

export function useSite() {
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

  const update = (patch: Partial<SiteData> | ((d: SiteData) => SiteData)) => {
    const next = typeof patch === "function" ? patch(state) : { ...state, ...patch };
    setState(next);
    const content: CloudContent = {
      about: next.about,
      projects: next.projects,
      workshops: next.workshops,
      achievements: next.achievements,
      sponsors: next.sponsors,
    };
    scheduleSave(content);
  };

  const log = async (who: string, action: string) => {
    const { data: row, error } = await supabase
      .from("audit_logs")
      .insert({ who, action })
      .select()
      .single();
    if (error || !row) return;
    // realtime listener doplní stav; pro jistotu lokálně přidáme, pokud chybí
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

  const addMessage = async (msg: { name: string; email: string; message: string }) => {
    const { error } = await supabase.from("contact_messages").insert(msg);
    if (error) {
      console.error(error);
      toast.error("Nepodařilo se odeslat zprávu");
      return false;
    }
    return true;
  };

  const deleteMessage = async (id: string) => {
    setState({ ...state, messages: state.messages.filter((m) => m.id !== id) });
    const { error } = await supabase.from("contact_messages").delete().eq("id", id);
    if (error) {
      console.error(error);
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
      const content: CloudContent = {
        about: parsed.about ?? defaultContent.about,
        projects: parsed.projects ?? [],
        workshops: parsed.workshops ?? [],
        achievements: parsed.achievements ?? [],
        sponsors: parsed.sponsors ?? [],
      };
      const { error } = await supabase
        .from("site_content")
        .upsert({ id: 1, data: content as unknown as Json, updated_at: new Date().toISOString() });
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

// ---- Admin panel je veřejný (bez přihlášení) ----
// `user` zůstává jen jako popisek pro atribuci v historii změn (audit_logs.who).
export function useAuth() {
  return { user: "admin" };
}

export const uid = () => Math.random().toString(36).slice(2, 10);

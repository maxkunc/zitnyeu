import { useEffect, useState, useSyncExternalStore } from "react";

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

export type SiteData = {
  about: { heading: string; body: string };
  projects: Project[];
  workshops: Workshop[];
  achievements: Achievement[];
  sponsors: Sponsor[];
  messages: Message[];
  logs: AuditLog[];
};

const KEY = "zitny-site-data-v3";

const defaultData: SiteData = {
  about: {
    heading: "Mladí inženýři s pohledem k hvězdám",
    body: "Jsme nezisková iniciativa mladých nadšenců, kteří propojují vesmírné technologie, vědu a vzdělávání. Realizujeme projekty pod patronací Evropské vesmírné agentury, organizujeme workshopy pro školy a spolupracujeme s veřejnými i bezpečnostními složkami.",
  },
  achievements: [
    { id: "a1", metric: "2×", label: "Ocenění AirVision", description: "Mezinárodní ekologický summit" },
    { id: "a2", metric: "ESA", label: "Oficiální patronace", description: "Patronace nad jednotlivými projekty" },
    { id: "a3", metric: "1 000+", label: "Účastníků programů", description: "Děti, studenti i veřejnost" },
    { id: "a4", metric: "2", label: "Spolupráce s IZS", description: "HZS Středočeského kraje, JSDH Řevnice" },
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
      description: "Programátorská výzva ESA, ve které kód našich týmů poběží na palubě Mezinárodní vesmírné stanice (ISS).",
    },
    {
      id: "p5",
      category: "minor",
      esa: true,
      title: "SpaceLab",
      status: "Pod patronací ESA",
      description: "Studentský vědecký program ESA — návrh a realizace experimentů v simulovaném vesmírném prostředí.",
    },
    {
      id: "p6",
      category: "minor",
      esa: true,
      title: "MoonCamp Challenge",
      status: "Pod patronací ESA",
      description: "Mezinárodní výzva ESA na návrh udržitelné lunární základny. Vedeme studentské týmy k vlastním návrhům.",
    },
    {
      id: "p7",
      category: "past",
      title: "Spolupráce s HZS Středočeského kraje",
      status: "Realizováno",
      description: "Společné cvičení a sdílení know-how v oblasti dronových technologií s Hasičským záchranným sborem Středočeského kraje.",
    },
    {
      id: "p8",
      category: "past",
      title: "Spolupráce s JSDH Řevnice",
      status: "Realizováno",
      description: "Podpora a školení Jednotky sboru dobrovolných hasičů Řevnice v nasazení moderních technologií při zásahu.",
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
  messages: [],
  logs: [],
};

function read(): SiteData {
  if (typeof window === "undefined") return defaultData;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultData;
    return { ...defaultData, ...JSON.parse(raw) };
  } catch {
    return defaultData;
  }
}

const listeners = new Set<() => void>();
let cache: SiteData | null = null;

function getSnapshot(): SiteData {
  if (cache === null) cache = read();
  return cache;
}

function emit() {
  listeners.forEach((l) => l());
}

function write(next: SiteData) {
  cache = next;
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch (err) {
      console.error("Nepodařilo se uložit data (možná překročená kvóta localStorage):", err);
      if (typeof window !== "undefined") {
        // dynamic import aby nevznikl cyklus
        import("sonner").then(({ toast }) =>
          toast.error("Úložiště prohlížeče je plné. Zmenšete obrázky nebo odstraňte staré.")
        );
      }
    }
  }
  emit();
}

export function useSite() {
  const data = useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    getSnapshot,
    () => defaultData
  );

  return {
    data,
    update: (patch: Partial<SiteData> | ((d: SiteData) => SiteData)) => {
      const next = typeof patch === "function" ? patch(data) : { ...data, ...patch };
      write(next);
    },
    log: (who: string, action: string) => {
      const entry: AuditLog = { id: uid(), who, action, at: new Date().toISOString() };
      const next = { ...data, logs: [entry, ...(data.logs || [])].slice(0, 200) };
      write(next);
    },
    reset: () => write(defaultData),
  };
}

// 3 mock účty
const ACCOUNTS: Record<string, { pass: string; role: string }> = {
  admin: { pass: "esa2026", role: "Hlavní administrátor" },
  koordinator: { pass: "stratos", role: "Koordinátor projektů" },
  editor: { pass: "rocket", role: "Editor obsahu" },
};

const AUTH_KEY = "zitny-admin-auth-v2";

export function useAuth() {
  const [user, setUser] = useState<string | null>(null);
  useEffect(() => {
    setUser(localStorage.getItem(AUTH_KEY));
  }, []);
  return {
    user,
    authed: !!user,
    role: user ? ACCOUNTS[user]?.role : undefined,
    accounts: Object.entries(ACCOUNTS).map(([u, v]) => ({ user: u, role: v.role })),
    login: (u: string, p: string) => {
      const acc = ACCOUNTS[u.trim()];
      if (acc && acc.pass === p) {
        localStorage.setItem(AUTH_KEY, u.trim());
        setUser(u.trim());
        return true;
      }
      return false;
    },
    logout: () => {
      localStorage.removeItem(AUTH_KEY);
      setUser(null);
    },
  };
}

export const uid = () => Math.random().toString(36).slice(2, 10);

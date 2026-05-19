import { useEffect, useState, useSyncExternalStore } from "react";

export type Project = {
  id: string;
  title: string;
  description: string;
  status: string;
  category: "major" | "minor" | "esa";
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
  url?: string;
};

export type Message = {
  id: string;
  name: string;
  email: string;
  message: string;
  createdAt: string;
};

export type SiteData = {
  about: { heading: string; body: string };
  projects: Project[];
  workshops: Workshop[];
  achievements: Achievement[];
  sponsors: Sponsor[];
  messages: Message[];
};

const KEY = "zitny-site-data-v1";

const defaultData: SiteData = {
  about: {
    heading: "Mladí inženýři s pohledem k hvězdám",
    body: "Jsme nezisková organizace mladých nadšenců, kteří propojují vesmírné technologie, vědu a vzdělávání. Stavíme experimenty, organizujeme workshopy a spolupracujeme s předními evropskými institucemi včetně Evropské vesmírné agentury.",
  },
  achievements: [
    { id: "a1", metric: "12+", label: "Úspěšných startů", description: "Stratosférické a raketové experimenty" },
    { id: "a2", metric: "4", label: "Ocenění ESA", description: "Patronace nad našimi projekty" },
    { id: "a3", metric: "2 500", label: "Účastníků workshopů", description: "Děti i studenti napříč ČR" },
    { id: "a4", metric: "30+", label: "Realizovaných misí", description: "Od konceptu po výstup dat" },
  ],
  projects: [
    { id: "p1", category: "major", title: "Mise STRATOS-3", status: "Aktivní", description: "Stratosférická sonda s vlastní telemetrií, palubním AI klasifikátorem oblak a návratovou kapslí." },
    { id: "p2", category: "major", title: "CubeSat ORION-1", status: "Vývoj", description: "1U CubeSat zaměřený na měření radiace v nízké oběžné dráze, plánovaný start 2026." },
    { id: "p3", category: "major", title: "Lunar Rover Prototype", status: "Prototyp", description: "Šestikolový průzkumný rover testovaný v simulovaném regolitu." },
    { id: "p4", category: "minor", title: "Senzorový balónek EDU", status: "Dokončeno", description: "Vzdělávací sada pro školy — teplota, tlak, GPS." },
    { id: "p5", category: "minor", title: "Ground Station Lite", status: "Aktivní", description: "Modulární pozemní stanice pro příjem APT a LoRa." },
    { id: "p6", category: "minor", title: "Open Telemetry Kit", status: "Beta", description: "Open-source telemetrický stack pro amatérské mise." },
    { id: "p7", category: "esa", title: "ESA Climate Detectives", status: "Pod patronací ESA", description: "Analýza satelitních dat o lokální klimatické změně ve spolupráci s ESA." },
    { id: "p8", category: "esa", title: "ESA Moon Camp Challenge", status: "Pod patronací ESA", description: "Návrh lunární základny – vítězný tým evropského kola." },
  ],
  workshops: [
    { id: "w1", title: "Den s vesmírem", description: "Celodenní program plný experimentů, modelů raket a setkání s inženýry z oboru. Pro školy i veřejnost.", date: "Celoročně" },
    { id: "w2", title: "Pohodový den pro Dům Ronalda McDonalda", description: "Charitativní program pro děti a rodiny — pouštění raket, astronomické pozorování a tvořivé dílny.", date: "Každoročně" },
  ],
  sponsors: [
    { id: "s1", name: "ESA" },
    { id: "s2", name: "CzechInvest" },
    { id: "s3", name: "ČVUT" },
    { id: "s4", name: "AVANT" },
    { id: "s5", name: "Honeywell" },
    { id: "s6", name: "Skylink" },
  ],
  messages: [],
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
    localStorage.setItem(KEY, JSON.stringify(next));
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
    reset: () => write(defaultData),
  };
}

export function useAuth() {
  const [authed, setAuthed] = useState<boolean>(false);
  useEffect(() => {
    setAuthed(localStorage.getItem("zitny-admin-auth") === "1");
  }, []);
  return {
    authed,
    login: (user: string, pass: string) => {
      if (user === "admin" && pass === "esa2026") {
        localStorage.setItem("zitny-admin-auth", "1");
        setAuthed(true);
        return true;
      }
      return false;
    },
    logout: () => {
      localStorage.removeItem("zitny-admin-auth");
      setAuthed(false);
    },
  };
}

export const uid = () => Math.random().toString(36).slice(2, 10);

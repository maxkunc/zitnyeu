import { useSyncExternalStore } from "react";

export type Lang = "cs" | "en";

const KEY = "zitny-lang";
const listeners = new Set<() => void>();
let current: Lang | null = null;

function read(): Lang {
  if (typeof window === "undefined") return "cs";
  const v = localStorage.getItem(KEY);
  return v === "en" ? "en" : "cs";
}

function getSnapshot(): Lang {
  if (current === null) current = read();
  return current;
}

export function setLang(l: Lang) {
  current = l;
  if (typeof window !== "undefined") {
    localStorage.setItem(KEY, l);
    document.documentElement.lang = l;
  }
  listeners.forEach((cb) => cb());
}

export function useLang() {
  const lang = useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    getSnapshot,
    () => "cs" as Lang
  );
  const T = dict[lang];
  return { lang, setLang, t: (k: keyof typeof dict.cs) => T[k] ?? dict.cs[k] };
}

const dict = {
  cs: {
    nav_home: "Domů",
    nav_about: "O nás",
    nav_achievements: "Úspěchy",
    nav_projects: "Projekty",
    nav_workshops: "Workshopy & Akce",
    nav_sponsors: "Partneři",
    nav_contacts: "Kontakty",

    hero_badge: "Pod patronací Evropské vesmírné agentury",
    hero_title_1: "Budujeme cestu mladých",
    hero_title_2: "k",
    hero_title_3: "hvězdám",
    hero_desc:
      "zitny.eu je tým mladých inženýrů, vědců a snílků. Realizujeme vesmírné projekty, létáme do stratosféry a inspirujeme další generaci skrze workshopy a přednášky.",
    hero_cta_projects: "Naše projekty",
    hero_cta_contact: "Kontaktujte nás",
    stat_missions: "Misí",
    stat_esa: "ESA projektů",
    stat_participants: "Účastníků",
    stat_experiments: "Experimentů",

    label_about: "O nás",
    label_achievements: "Úspěchy",
    label_projects: "Projekty",
    label_workshops: "Workshopy & Akce",
    label_partners: "Partneři",
    label_contacts: "Kontakty",

    achievements_title_a: "Čísla, která nás",
    achievements_title_b: "posouvají",

    projects_title_a: "Od stratosféry až po",
    projects_title_b: "oběžnou dráhu",
    projects_major: "Velké projekty",
    projects_minor: "Menší projekty & výzvy",
    projects_done: "Realizované spolupráce",
    projects_esa_badge: "OFICIÁLNÍ PATRONACE ESA",
    projects_esa_title: "Projekty pod patronací Evropské vesmírné agentury",
    projects_esa_desc:
      "Mise a programy realizované ve spolupráci s ESA Education a partnerskými institucemi.",

    workshops_title_a: "Nabízíme",
    workshops_title_b: "workshopy",
    workshops_title_c: "a přednášky.",
    workshops_desc:
      "Vzdělávací programy pro školy, firmy i veřejnost. Učíme zábavně, prakticky a s pohledem k hvězdám.",
    workshops_cta: "Nezávazná poptávka workshopu",

    sponsors_title_a: "Důvěřují nám",
    sponsors_title_b: "partneři",
    sponsors_cta_title: "Staňte se naším partnerem",
    sponsors_cta_desc:
      "Hledáme generální, hlavní i mediální partnery. Připojte se k misi, která inspiruje další generaci.",
    sponsors_cta_btn: "Stát se partnerem",

    contacts_title_a: "Pojďme spolu",
    contacts_title_b: "startovat",
    contacts_desc:
      "Máte zájem o workshop, spolupráci nebo se chcete na něco zeptat? Napište nám — všechny zprávy chodí na info@zitny.eu.",
    contact_email: "E-mail",
    contact_phone: "Telefon",
    contact_account: "Bankovní účet",
    contact_account_note:
      "Podpořte naše mise. Každá koruna pomáhá mladým lidem dosáhnout hvězd.",
    form_name: "Jméno",
    form_email_placeholder: "Váš e-mail",
    form_message: "Vaše zpráva…",
    form_send: "Odeslat zprávu",
    form_sent: "Zpráva odeslána. Brzy se ozveme.",
    form_invalid: "Vyplňte prosím všechna pole správně.",
    footer_tagline: "Cesta k hvězdám.",
  },
  en: {
    nav_home: "Home",
    nav_about: "About",
    nav_achievements: "Achievements",
    nav_projects: "Projects",
    nav_workshops: "Workshops & Events",
    nav_sponsors: "Partners",
    nav_contacts: "Contact",

    hero_badge: "Under patronage of the European Space Agency",
    hero_title_1: "Building a path for young people",
    hero_title_2: "to the",
    hero_title_3: "stars",
    hero_desc:
      "zitny.eu is a team of young engineers, scientists and dreamers. We run space projects, fly to the stratosphere and inspire the next generation through workshops and talks.",
    hero_cta_projects: "Our projects",
    hero_cta_contact: "Get in touch",
    stat_missions: "Missions",
    stat_esa: "ESA projects",
    stat_participants: "Participants",
    stat_experiments: "Experiments",

    label_about: "About",
    label_achievements: "Achievements",
    label_projects: "Projects",
    label_workshops: "Workshops & Events",
    label_partners: "Partners",
    label_contacts: "Contact",

    achievements_title_a: "The numbers that",
    achievements_title_b: "move us forward",

    projects_title_a: "From the stratosphere to",
    projects_title_b: "low Earth orbit",
    projects_major: "Flagship projects",
    projects_minor: "Smaller projects & challenges",
    projects_done: "Past collaborations",
    projects_esa_badge: "OFFICIAL ESA PATRONAGE",
    projects_esa_title: "Projects under European Space Agency patronage",
    projects_esa_desc:
      "Missions and programs carried out in cooperation with ESA Education and partner institutions.",

    workshops_title_a: "We run",
    workshops_title_b: "workshops",
    workshops_title_c: "and talks.",
    workshops_desc:
      "Educational programs for schools, companies and the public. We teach in a fun, hands-on way — always with eyes on the stars.",
    workshops_cta: "Request a workshop",

    sponsors_title_a: "Trusted by our",
    sponsors_title_b: "partners",
    sponsors_cta_title: "Become our partner",
    sponsors_cta_desc:
      "We are looking for general, main and media partners. Join a mission that inspires the next generation.",
    sponsors_cta_btn: "Become a partner",

    contacts_title_a: "Let's",
    contacts_title_b: "launch together",
    contacts_desc:
      "Interested in a workshop, cooperation, or have a question? Write to us — all messages are forwarded to info@zitny.eu.",
    contact_email: "E-mail",
    contact_phone: "Phone",
    contact_account: "Bank account",
    contact_account_note:
      "Support our missions. Every contribution helps young people reach the stars.",
    form_name: "Name",
    form_email_placeholder: "Your e-mail",
    form_message: "Your message…",
    form_send: "Send message",
    form_sent: "Message sent. We'll get back to you soon.",
    form_invalid: "Please fill in all fields correctly.",
    footer_tagline: "Path to the stars.",
  },
} as const;

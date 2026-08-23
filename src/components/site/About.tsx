import { useSite } from "@/lib/site-store";
import { Satellite, Telescope, Cpu, Globe2 } from "lucide-react";
import { useLang } from "@/lib/i18n";

const icons = [Satellite, Telescope, Cpu, Globe2];

export function About() {
  const { data } = useSite();
  const { t, lang } = useLang();

  const cards =
    lang === "en"
      ? [
          { i: 0, t: "Drone platforms", d: "Custom drones for monitoring and mapping." },
          { i: 1, t: "Geology", d: "Observation, data, open science." },
          { i: 2, t: "Embedded HW", d: "In-house onboard electronics." },
          { i: 3, t: "Education", d: "Workshops for schools and the public." },
        ]
      : [
          { i: 0, t: "Dronové platformy", d: "Vlastní drony pro monitoring a mapování." },
          { i: 1, t: "Geologie", d: "Pozorování, data, otevřená věda." },
          { i: 2, t: "Embedded HW", d: "Vlastní palubní elektronika." },
          { i: 3, t: "Vzdělávání", d: "Workshopy pro školy i veřejnost." },
        ];

  return (
    <section id="o-nas" className="relative py-24">
      <div className="mx-auto max-w-7xl px-6">
        <SectionLabel>{t("label_about")}</SectionLabel>
        <div className="mt-6 grid lg:grid-cols-2 gap-12 items-start">
          <div>
            <h2 className="font-display text-4xl md:text-5xl font-bold leading-tight">
              {data.about.heading}
            </h2>
            <p className="mt-6 text-muted-foreground leading-relaxed text-lg">{data.about.body}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {cards.map((c) => {
              const I = icons[c.i];
              return (
                <div
                  key={c.t}
                  className="glass rounded-xl p-5 hover:border-primary/40 transition-colors group"
                >
                  <I className="h-6 w-6 text-primary mb-3 group-hover:scale-110 transition-transform" />
                  <h3 className="font-display font-semibold">{c.t}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{c.d}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <span className="h-px w-12 bg-primary" />
      <span className="text-xs uppercase tracking-[0.25em] text-primary font-mono">{children}</span>
    </div>
  );
}

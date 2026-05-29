import { useSite } from "@/lib/site-store";
import { SectionLabel } from "./About";
import { Calendar, ArrowRight, Heart, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLang } from "@/lib/i18n";

const visuals = [
  { icon: Rocket, tint: "from-primary/40 to-accent/20" },
  { icon: Heart, tint: "from-accent/40 to-primary/10" },
];

export function Workshops() {
  const { data } = useSite();
  const { t } = useLang();
  return (
    <section id="workshopy" className="relative py-24">
      <div className="mx-auto max-w-7xl px-6">
        <SectionLabel>{t("label_workshops")}</SectionLabel>
        <h2 className="mt-6 font-display text-4xl md:text-5xl font-bold max-w-3xl">
          {t("workshops_title_a")} <span className="text-gradient-cyber">{t("workshops_title_b")}</span> {t("workshops_title_c")}
        </h2>
        <p className="mt-4 max-w-2xl text-muted-foreground">{t("workshops_desc")}</p>

        <div className="mt-12 grid md:grid-cols-2 gap-5">
          {data.workshops.map((w, i) => {
            const V = visuals[i % visuals.length];
            const Icon = V.icon;
            return (
              <article key={w.id} className="group relative glass rounded-2xl overflow-hidden hover:shadow-glow transition-shadow">
                <div className={`relative h-44 bg-gradient-to-br ${V.tint} overflow-hidden`}>
                  <div className="absolute inset-0 grid-bg opacity-40" />
                  <Icon className="absolute right-6 bottom-6 h-20 w-20 text-foreground/20 group-hover:scale-110 transition-transform" />
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 text-xs text-primary font-mono">
                    <Calendar className="h-3.5 w-3.5" />
                    {w.date}
                  </div>
                  <h3 className="mt-3 font-display text-2xl font-bold">{w.title}</h3>
                  <p className="mt-2 text-muted-foreground">{w.description}</p>
                </div>
              </article>
            );
          })}
        </div>

        <div className="mt-10 flex justify-center">
          <Button asChild size="lg" className="bg-gradient-cyber text-primary-foreground shadow-glow hover:opacity-90">
            <a href="#kontakty">{t("workshops_cta")} <ArrowRight className="ml-2 h-4 w-4" /></a>
          </Button>
        </div>
      </div>
    </section>
  );
}

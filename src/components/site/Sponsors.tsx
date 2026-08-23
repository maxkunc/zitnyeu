import { useSite } from "@/lib/site-store";
import { SectionLabel } from "./About";
import { Button } from "@/components/ui/button";
import { Handshake, ArrowRight } from "lucide-react";
import { useLang } from "@/lib/i18n";

const TIER_LABEL_CS: Record<string, string> = {
  general: "Generální",
  main: "Hlavní",
  media: "Mediální",
};
const TIER_LABEL_EN: Record<string, string> = {
  general: "General",
  main: "Main",
  media: "Media",
};

export function Sponsors() {
  const { data } = useSite();
  const { t, lang } = useLang();
  const tiers = lang === "en" ? TIER_LABEL_EN : TIER_LABEL_CS;
  const doubled = [...data.sponsors, ...data.sponsors];

  return (
    <section id="sponzori" className="relative py-24">
      <div className="mx-auto max-w-7xl px-6">
        <SectionLabel>{t("label_partners")}</SectionLabel>
        <h2 className="mt-6 font-display text-4xl md:text-5xl font-bold max-w-3xl">
          {t("sponsors_title_a")}{" "}
          <span className="text-gradient-cyber">{t("sponsors_title_b")}</span>.
        </h2>
      </div>

      <div className="mt-12 relative overflow-hidden">
        <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
        <div className="flex gap-6 animate-marquee w-max">
          {doubled.map((s, i) => (
            <div
              key={`${s.id}-${i}`}
              className="glass rounded-xl px-8 py-5 min-w-[220px] flex items-center gap-4"
            >
              <div className="h-16 w-16 aspect-square shrink-0 rounded-2xl bg-white/5 overflow-hidden flex items-center justify-center">
                {s.logo ? (
                  <img src={s.logo} alt={s.name} className="h-full w-full object-cover" />
                ) : (
                  <span className="font-display text-lg font-bold text-muted-foreground">
                    {s.name.slice(0, 2).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="text-left">
                {s.tier && (
                  <span className="block text-[10px] font-mono uppercase tracking-wider text-primary">
                    {tiers[s.tier]}
                  </span>
                )}
                <span className="font-display text-sm font-bold tracking-wide text-foreground">
                  {s.name}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 mt-16">
        <div className="relative overflow-hidden rounded-3xl glass border-primary/40 p-8 md:p-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
          <div className="relative max-w-2xl">
            <div className="inline-flex items-center gap-2 text-primary mb-3">
              <Handshake className="h-5 w-5" />
              <span className="text-xs uppercase tracking-[0.2em] font-mono">
                {t("sponsors_cta_btn")}
              </span>
            </div>
            <h3 className="font-display text-2xl md:text-3xl font-bold">
              {t("sponsors_cta_title")}
            </h3>
            <p className="mt-2 text-muted-foreground">{t("sponsors_cta_desc")}</p>
          </div>
          <Button
            asChild
            size="lg"
            className="relative bg-gradient-cyber text-primary-foreground shadow-glow shrink-0"
          >
            <a href="#kontakty">
              {t("sponsors_cta_btn")} <ArrowRight className="ml-2 h-4 w-4" />
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}

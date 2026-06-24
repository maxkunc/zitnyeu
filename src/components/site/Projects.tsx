import { useSite } from "@/lib/site-store";
import { SectionLabel } from "./About";
import { Award, Radio, FlaskConical, CheckCircle2 } from "lucide-react";
import { useLang } from "@/lib/i18n";

export function Projects() {
  const { data } = useSite();
  const { t } = useLang();
  const major = data.projects.filter((p) => p.category === "major");
  const minor = data.projects.filter((p) => p.category === "minor");
  const past = data.projects.filter((p) => p.category === "past");

  return (
    <section id="projekty" className="relative py-24">
      <div className="mx-auto max-w-7xl px-6">
        <SectionLabel>{t("label_projects")}</SectionLabel>
        <h2 className="mt-6 font-display text-4xl md:text-5xl font-bold max-w-3xl">
          {t("projects_title_a")} <span className="text-gradient-cyber">{t("projects_title_b")}</span>.
        </h2>

        {major.length > 0 && (
          <div className="mt-16">
            <SubHeading icon={<Radio className="h-4 w-4" />} title={t("projects_major")} />
            <div className="mt-6 grid lg:grid-cols-2 gap-5">
              {major.map((p) => (
                <div key={p.id} className="relative glass rounded-2xl overflow-hidden">
                  <div className="relative h-48 bg-gradient-to-br from-primary/30 via-accent/10 to-transparent overflow-hidden">
                    {p.image ? (
                      <img src={p.image} alt={p.title} className="absolute inset-0 h-full w-full object-cover" />
                    ) : (
                      <>
                        <div className="absolute inset-0 grid-bg opacity-50" />
                        <div className="absolute inset-0 starfield opacity-60" />
                      </>
                    )}
                    <span className="absolute top-4 left-4 inline-flex items-center gap-1.5 rounded-full bg-background/70 backdrop-blur px-3 py-1 text-xs font-mono">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                      {p.status}
                    </span>
                    {p.esa && <EsaBadge />}
                  </div>
                  <div className="p-6">
                    <h4 className="font-display text-xl font-bold">{p.title}</h4>
                    <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{p.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {minor.length > 0 && (
          <div className="mt-20">
            <SubHeading icon={<FlaskConical className="h-4 w-4" />} title={t("projects_minor")} />
            <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {minor.map((p) => (
                <div key={p.id} className="relative glass rounded-xl overflow-hidden">
                  {p.image && (
                    <div className="relative h-32 overflow-hidden">
                      <img src={p.image} alt={p.title} className="h-full w-full object-cover" />
                      {p.esa && <EsaBadge />}
                    </div>
                  )}
                  <div className="p-5">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-display font-semibold">{p.title}</h4>
                      <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-1 rounded bg-primary/15 text-primary shrink-0">{p.status}</span>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">{p.description}</p>
                    {p.esa && !p.image && (
                      <div className="mt-3 inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-primary">
                        <Award className="h-3 w-3" /> Pod patronací ESA
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {past.length > 0 && (
          <div className="mt-20">
            <SubHeading icon={<CheckCircle2 className="h-4 w-4" />} title={t("projects_done")} />
            <div className="mt-6 grid sm:grid-cols-2 gap-3">
              {past.map((p) => (
                <div key={p.id} className="glass rounded-xl p-5 border-l-2 border-accent/60">
                  <div className="flex items-center justify-between">
                    <h4 className="font-display font-semibold">{p.title}</h4>
                    <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-1 rounded bg-accent/20 text-accent-foreground">{p.status}</span>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{p.description}</p>
                  {p.esa && (
                    <div className="mt-3 inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-primary">
                      <Award className="h-3 w-3" /> Pod patronací ESA
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function EsaBadge() {
  return (
    <span className="absolute top-4 right-4 inline-flex items-center gap-1.5 rounded-full bg-gradient-cyber px-3 py-1 text-[10px] font-mono font-semibold text-primary-foreground shadow-glow uppercase tracking-wider">
      <Award className="h-3 w-3" /> ESA
    </span>
  );
}

function SubHeading({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-primary/15 text-primary">{icon}</span>
      <h3 className="font-display text-2xl font-bold">{title}</h3>
    </div>
  );
}

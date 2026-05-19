import { useSite } from "@/lib/site-store";
import { SectionLabel } from "./About";
import { ArrowUpRight, Award, Radio, FlaskConical } from "lucide-react";

export function Projects() {
  const { data } = useSite();
  const major = data.projects.filter((p) => p.category === "major");
  const minor = data.projects.filter((p) => p.category === "minor");
  const esa = data.projects.filter((p) => p.category === "esa");

  return (
    <section id="projekty" className="relative py-24">
      <div className="mx-auto max-w-7xl px-6">
        <SectionLabel>Projekty</SectionLabel>
        <h2 className="mt-6 font-display text-4xl md:text-5xl font-bold max-w-3xl">
          Od stratosféry až po <span className="text-gradient-cyber">oběžnou dráhu</span>.
        </h2>

        {/* Velké projekty */}
        <div className="mt-16">
          <SubHeading icon={<Radio className="h-4 w-4" />} title="Velké projekty" />
          <div className="mt-6 grid lg:grid-cols-3 gap-5">
            {major.map((p) => (
              <article
                key={p.id}
                className="group relative glass rounded-2xl overflow-hidden hover:border-primary/50 transition-all"
              >
                <div className="relative h-48 bg-gradient-to-br from-primary/30 via-accent/10 to-transparent overflow-hidden">
                  <div className="absolute inset-0 grid-bg opacity-50" />
                  <div className="absolute inset-0 starfield opacity-60" />
                  <span className="absolute top-4 left-4 inline-flex items-center gap-1.5 rounded-full bg-background/60 backdrop-blur px-3 py-1 text-xs font-mono">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                    {p.status}
                  </span>
                </div>
                <div className="p-6">
                  <h4 className="font-display text-xl font-bold flex items-start justify-between gap-2">
                    {p.title}
                    <ArrowUpRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                  </h4>
                  <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{p.description}</p>
                </div>
              </article>
            ))}
          </div>
        </div>

        {/* Menší projekty */}
        <div className="mt-20">
          <SubHeading icon={<FlaskConical className="h-4 w-4" />} title="Menší projekty" />
          <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {minor.map((p) => (
              <div
                key={p.id}
                className="glass rounded-xl p-5 hover:border-primary/40 hover:translate-y-[-2px] transition-all"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-display font-semibold">{p.title}</h4>
                  <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-1 rounded bg-primary/15 text-primary">
                    {p.status}
                  </span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{p.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ESA */}
        <div className="mt-20">
          <div className="relative rounded-3xl overflow-hidden glass border-primary/40 shadow-glow p-8 md:p-12">
            <div className="absolute inset-0 starfield" />
            <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-primary/30 blur-3xl" />
            <div className="relative">
              <div className="inline-flex items-center gap-2 rounded-full bg-gradient-cyber px-4 py-1.5 text-xs font-mono font-semibold text-primary-foreground">
                <Award className="h-3.5 w-3.5" />
                OFFICIAL ESA PATRONAGE
              </div>
              <h3 className="mt-6 font-display text-3xl md:text-4xl font-bold max-w-2xl">
                Projekty pod patronací Evropské vesmírné agentury
              </h3>
              <p className="mt-3 text-muted-foreground max-w-2xl">
                Elitní mise vyvíjené a podporované ve spolupráci s ESA Education a partnerskými institucemi.
              </p>

              <div className="mt-10 grid md:grid-cols-2 gap-5">
                {esa.map((p) => (
                  <div
                    key={p.id}
                    className="relative rounded-2xl p-6 bg-background/50 border border-primary/30 hover:border-primary transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <h4 className="font-display text-xl font-bold">{p.title}</h4>
                      <Award className="h-5 w-5 text-primary shrink-0" />
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">{p.description}</p>
                    <div className="mt-4 inline-flex items-center gap-2 text-xs font-mono text-primary">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                      {p.status}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function SubHeading({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-primary/15 text-primary">
        {icon}
      </span>
      <h3 className="font-display text-2xl font-bold">{title}</h3>
    </div>
  );
}

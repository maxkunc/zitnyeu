import { useSite } from "@/lib/site-store";
import { SectionLabel } from "./About";

export function Achievements() {
  const { data } = useSite();
  return (
    <section id="uspechy" className="relative py-24">
      <div className="mx-auto max-w-7xl px-6">
        <SectionLabel>Úspěchy</SectionLabel>
        <h2 className="mt-6 font-display text-4xl md:text-5xl font-bold max-w-2xl">
          Čísla, která nás <span className="text-gradient-cyber">posouvají</span>.
        </h2>

        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {data.achievements.map((a, i) => (
            <div
              key={a.id}
              className="relative glass rounded-2xl p-8 overflow-hidden hover:shadow-glow transition-shadow"
            >
              <span className="absolute top-4 right-4 font-mono text-xs text-primary/60">
                0{i + 1}
              </span>
              <div className="font-display text-5xl md:text-6xl font-bold text-gradient-cyber">
                {a.metric}
              </div>
              <div className="mt-3 font-semibold">{a.label}</div>
              <p className="mt-1 text-sm text-muted-foreground">{a.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

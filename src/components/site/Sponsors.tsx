import { useSite } from "@/lib/site-store";
import { SectionLabel } from "./About";

export function Sponsors() {
  const { data } = useSite();
  const doubled = [...data.sponsors, ...data.sponsors];
  return (
    <section id="sponzori" className="relative py-24">
      <div className="mx-auto max-w-7xl px-6">
        <SectionLabel>Sponzoři</SectionLabel>
        <h2 className="mt-6 font-display text-4xl md:text-5xl font-bold max-w-3xl">
          Důvěřují nám <span className="text-gradient-cyber">partneři</span>.
        </h2>
      </div>

      <div className="mt-12 relative overflow-hidden">
        <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
        <div className="flex gap-6 animate-marquee w-max">
          {doubled.map((s, i) => (
            <div
              key={`${s.id}-${i}`}
              className="glass rounded-xl px-10 py-6 min-w-[200px] flex items-center justify-center text-center"
            >
              <span className="font-display text-xl font-bold tracking-wider text-muted-foreground hover:text-foreground transition-colors">
                {s.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

import { Rocket, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section id="domu" className="relative pt-32 pb-32 overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-40 [mask-image:linear-gradient(to_bottom,black_60%,transparent)]" />
      <div className="absolute inset-0 starfield [mask-image:linear-gradient(to_bottom,black_70%,transparent)]" />
      <div className="absolute top-1/4 right-0 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
      <div className="absolute bottom-0 left-0 h-96 w-96 rounded-full bg-accent/10 blur-3xl" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-background pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-6">
        <div className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs text-muted-foreground mb-8">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          Pod patronací Evropské vesmírné agentury
        </div>

        <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold leading-[0.95] max-w-5xl">
          Budujeme cestu mladých<br />
          k <span className="text-gradient-cyber">hvězdám</span>.
        </h1>

        <p className="mt-8 max-w-2xl text-lg text-muted-foreground leading-relaxed">
          zitny.eu je tým mladých inženýrů, vědců a snílků. Realizujeme vesmírné projekty,
          vyvíjíme satelity, létáme do stratosféry a inspirujeme další generaci skrze workshopy a přednášky.
        </p>

        <div className="mt-10 flex flex-wrap gap-3">
          <Button asChild size="lg" className="bg-gradient-cyber text-primary-foreground shadow-glow hover:opacity-90 animate-pulse-glow">
            <a href="#projekty">
              Naše projekty <ArrowRight className="ml-2 h-4 w-4" />
            </a>
          </Button>
          <Button asChild size="lg" variant="outline" className="border-border bg-background/30 backdrop-blur-md">
            <a href="#kontakty">Kontaktujte nás</a>
          </Button>
        </div>

        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl">
          {[
            { v: "12+", l: "Misí" },
            { v: "4", l: "ESA projektů" },
            { v: "2 500", l: "Účastníků" },
            { v: "30+", l: "Experimentů" },
          ].map((s) => (
            <div key={s.l} className="border-l-2 border-primary/60 pl-4">
              <div className="font-display text-3xl font-bold">{s.v}</div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground mt-1">{s.l}</div>
            </div>
          ))}
        </div>

        <Rocket className="hidden md:block absolute right-12 bottom-12 h-24 w-24 text-primary/30 animate-float -rotate-45" />
      </div>
    </section>
  );
}

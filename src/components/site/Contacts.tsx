import { SectionLabel } from "./About";
import { Mail, Phone, MapPin, Github, Linkedin, Instagram, Rocket } from "lucide-react";

export function Contacts() {
  return (
    <section id="kontakty" className="relative py-24">
      <div className="mx-auto max-w-7xl px-6">
        <SectionLabel>Kontakty</SectionLabel>
        <h2 className="mt-6 font-display text-4xl md:text-5xl font-bold max-w-3xl">
          Pojďme spolu <span className="text-gradient-cyber">startovat</span>.
        </h2>
        <p className="mt-6 max-w-2xl text-muted-foreground">
          Máte zájem o workshop, spolupráci nebo se chcete na něco zeptat? Ozvěte se nám.
        </p>

        <div className="mt-12 grid md:grid-cols-2 gap-6 max-w-3xl">
          <ContactRow icon={<Mail />} label="E-mail" value="info@zitny.eu" href="mailto:info@zitny.eu" />
          <ContactRow icon={<Phone />} label="Telefon" value="+420 777 123 456" href="tel:+420777123456" />
          <ContactRow icon={<MapPin />} label="Adresa" value="Technická 2, 166 27 Praha 6" />
          <div className="pt-2">
            <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4">Sledujte nás</div>
            <div className="flex gap-3">
              {[
                { I: Github, h: "https://github.com" },
                { I: Linkedin, h: "https://linkedin.com" },
                { I: Instagram, h: "https://instagram.com" },
              ].map(({ I, h }, i) => (
                <a
                  key={i}
                  href={h}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-11 w-11 items-center justify-center rounded-lg glass hover:border-primary hover:text-primary transition-colors"
                >
                  <I className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>
        </div>

        <footer className="mt-24 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Rocket className="h-4 w-4 text-primary" />
            <span>© {new Date().getFullYear()} zitny.eu — Cesta k hvězdám.</span>
          </div>
          <div className="font-mono text-xs">Made with ❤️ in Prague</div>
        </footer>
      </div>
    </section>
  );
}

function ContactRow({ icon, label, value, href }: { icon: React.ReactNode; label: string; value: string; href?: string }) {
  const inner = (
    <div className="flex items-center gap-4 group">
      <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl glass text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
        {icon}
      </span>
      <div>
        <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
        <div className="font-display text-lg font-semibold">{value}</div>
      </div>
    </div>
  );
  return href ? <a href={href}>{inner}</a> : inner;
}

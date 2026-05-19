import { useState } from "react";
import { useSite, uid } from "@/lib/site-store";
import { SectionLabel } from "./About";
import { Mail, Phone, MapPin, Github, Linkedin, Instagram, Send, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { z } from "zod";

const schema = z.object({
  name: z.string().trim().min(2, "Zadejte jméno").max(100),
  email: z.string().trim().email("Neplatný e-mail").max(255),
  message: z.string().trim().min(5, "Zpráva je krátká").max(1000),
});

export function Contacts() {
  const { update } = useSite();
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sending, setSending] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = schema.safeParse(form);
    if (!result.success) {
      toast.error(result.error.issues[0].message);
      return;
    }
    setSending(true);
    update((d) => ({
      ...d,
      messages: [
        { id: uid(), ...result.data, createdAt: new Date().toISOString() },
        ...d.messages,
      ],
    }));
    setTimeout(() => {
      toast.success("Zpráva odeslána. Brzy se ozveme!");
      setForm({ name: "", email: "", message: "" });
      setSending(false);
    }, 400);
  };

  return (
    <section id="kontakty" className="relative py-24">
      <div className="mx-auto max-w-7xl px-6">
        <SectionLabel>Kontakty</SectionLabel>
        <h2 className="mt-6 font-display text-4xl md:text-5xl font-bold max-w-3xl">
          Pojďme spolu <span className="text-gradient-cyber">startovat</span>.
        </h2>

        <div className="mt-12 grid lg:grid-cols-2 gap-10">
          <div className="space-y-6">
            <ContactRow icon={<Mail />} label="E-mail" value="info@zitny.eu" href="mailto:info@zitny.eu" />
            <ContactRow icon={<Phone />} label="Telefon" value="+420 777 123 456" href="tel:+420777123456" />
            <ContactRow icon={<MapPin />} label="Adresa" value="Technická 2, 166 27 Praha 6" />

            <div className="pt-6 border-t border-border">
              <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4">
                Sledujte nás
              </div>
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

          <form onSubmit={submit} className="glass rounded-2xl p-6 md:p-8 space-y-4">
            <div>
              <label className="text-xs uppercase tracking-wider text-muted-foreground">Jméno</label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Jan Novák"
                className="mt-1 bg-background/40 border-border"
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider text-muted-foreground">E-mail</label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="vy@example.com"
                className="mt-1 bg-background/40 border-border"
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider text-muted-foreground">Zpráva</label>
              <Textarea
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                rows={5}
                placeholder="Rádi byste workshop, spolupráci, nebo se na něco zeptat?"
                className="mt-1 bg-background/40 border-border resize-none"
              />
            </div>
            <Button
              type="submit"
              disabled={sending}
              size="lg"
              className="w-full bg-gradient-cyber text-primary-foreground shadow-glow hover:opacity-90"
            >
              {sending ? "Odesílám..." : (
                <>Odeslat zprávu <Send className="ml-2 h-4 w-4" /></>
              )}
            </Button>
          </form>
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

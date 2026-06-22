import { useState } from "react";
import { SectionLabel } from "./About";
import { Mail, Phone, Rocket, Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useSite } from "@/lib/site-store";
import { useLang } from "@/lib/i18n";
import { toast } from "sonner";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email().max(120),
  message: z.string().min(5).max(2000),
});

export function Contacts() {
  const { t } = useLang();
  const { addMessage } = useSite();
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sending, setSending] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const r = schema.safeParse(form);
    if (!r.success) {
      toast.error(t("form_invalid"));
      return;
    }
    setSending(true);
    const ok = await addMessage(r.data);
    if (ok) {
      const subject = encodeURIComponent(`Web zitny.eu — zpráva od ${r.data.name}`);
      const body = encodeURIComponent(`${r.data.message}\n\n— ${r.data.name} <${r.data.email}>`);
      window.location.href = `mailto:info@zitny.eu?subject=${subject}&body=${body}`;
      toast.success(t("form_sent"));
      setForm({ name: "", email: "", message: "" });
    }
    setSending(false);
  };

  return (
    <section id="kontakty" className="relative py-24">
      <div className="mx-auto max-w-7xl px-6">
        <SectionLabel>{t("label_contacts")}</SectionLabel>
        <h2 className="mt-6 font-display text-4xl md:text-5xl font-bold max-w-3xl">
          {t("contacts_title_a")} <span className="text-gradient-cyber">{t("contacts_title_b")}</span>.
        </h2>
        <p className="mt-6 max-w-2xl text-muted-foreground">{t("contacts_desc")}</p>

        <div className="mt-12 grid lg:grid-cols-2 gap-10">
          <div className="space-y-5">
            <ContactRow icon={<Mail />} label={t("contact_email")} value="info@zitny.eu" href="mailto:info@zitny.eu" />
            <ContactRow icon={<Phone />} label={t("contact_phone")} value="+420 733 721 205" href="tel:+420733721205" />
          </div>

          <form onSubmit={submit} className="glass rounded-2xl p-6 md:p-8 shadow-card space-y-4">
            <Input
              placeholder={t("form_name")}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="bg-background/40 h-12"
              required
            />
            <Input
              type="email"
              placeholder={t("form_email_placeholder")}
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="bg-background/40 h-12"
              required
            />
            <Textarea
              placeholder={t("form_message")}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              className="bg-background/40 min-h-[160px]"
              required
            />
            <Button type="submit" disabled={sending} size="lg" className="w-full bg-gradient-cyber text-primary-foreground shadow-glow">
              <Send className="h-4 w-4 mr-2" />
              {t("form_send")}
            </Button>
            <p className="text-[11px] text-muted-foreground text-center font-mono">
              → info@zitny.eu
            </p>
          </form>
        </div>

        <footer className="mt-24 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Rocket className="h-4 w-4 text-primary" />
            <span>© {new Date().getFullYear()} zitny.eu — {t("footer_tagline")}</span>
          </div>
          <div className="font-mono text-[11px] opacity-70">made by reddos</div>
        </footer>
      </div>
    </section>
  );
}

function ContactRow({ icon, label, value, href }: { icon: React.ReactNode; label: string; value: string; href?: string }) {
  const inner = (
    <div className="flex items-center gap-4 group glass rounded-2xl p-5 hover:border-primary/50 transition-colors">
      <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-cyber text-primary-foreground shadow-glow">
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

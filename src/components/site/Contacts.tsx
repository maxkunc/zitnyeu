import { SectionLabel } from "./About";
import { Mail, Phone, Rocket } from "lucide-react";
import { useLang } from "@/lib/i18n";

export function Contacts() {
  const { t } = useLang();

  return (
    // min-h-screen (+ centering) on this last section guarantees at least one viewport's
    // worth of scroll room below it — otherwise the browser can't scroll far enough for a
    // "#kontakty" anchor jump to reach the viewport top on tall screens, leaving the tail of
    // the previous section peeking out above, overlapping the fixed nav.
    <section id="kontakty" className="relative min-h-screen py-24 flex items-center">
      <div className="mx-auto max-w-3xl px-6 w-full">
        <SectionLabel>{t("label_contacts")}</SectionLabel>
        <h2 className="mt-6 font-display text-4xl md:text-5xl font-bold">
          {t("contacts_title_a")}{" "}
          <span className="text-gradient-cyber">{t("contacts_title_b")}</span>.
        </h2>
        <p className="mt-6 text-muted-foreground">{t("contacts_desc")}</p>

        <div className="mt-12 grid sm:grid-cols-2 gap-5">
          <ContactRow
            icon={<Mail />}
            label={t("contact_email")}
            value="info@zitny.eu"
            href="mailto:info@zitny.eu"
          />
          <ContactRow
            icon={<Phone />}
            label={t("contact_phone")}
            value="+420 733 721 205"
            href="tel:+420733721205"
          />
        </div>

        <footer className="mt-24 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Rocket className="h-4 w-4 text-primary" />
            <span>
              © {new Date().getFullYear()} zitny.eu — {t("footer_tagline")}
            </span>
          </div>
          <div className="font-mono text-[11px] opacity-70">made by reddos</div>
        </footer>
      </div>
    </section>
  );
}

function ContactRow({
  icon,
  label,
  value,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  href?: string;
}) {
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

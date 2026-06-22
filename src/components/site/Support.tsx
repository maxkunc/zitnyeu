import { useState } from "react";
import { SectionLabel } from "./About";
import { Landmark, Copy, Check, Rocket, Heart, Sparkles, Stars, Satellite } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLang } from "@/lib/i18n";
import { toast } from "sonner";

const ACCOUNT = "97295342/5500";
const IBAN = "CZ8255000000000097295342";

const AMOUNTS = [200, 500, 1000, 2500];

export function Support() {
  const { t } = useLang();
  const [copied, setCopied] = useState<string | null>(null);
  const [amount, setAmount] = useState<number | null>(500);

  const copy = async (value: string, key: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(key);
      toast.success(t("support_copied"));
      setTimeout(() => setCopied(null), 1800);
    } catch {
      toast.error("Clipboard error");
    }
  };

  const qrUrl = amount
    ? `https://api.qrserver.com/v1/create-qr-code/?size=320x320&margin=0&bgcolor=0b0f1a&color=7dd3fc&data=${encodeURIComponent(
        `SPD*1.0*ACC:${IBAN}*AM:${amount}.00*CC:CZK*MSG:Podpora zitny.eu`,
      )}`
    : `https://api.qrserver.com/v1/create-qr-code/?size=320x320&margin=0&bgcolor=0b0f1a&color=7dd3fc&data=${encodeURIComponent(
        `SPD*1.0*ACC:${IBAN}*CC:CZK*MSG:Podpora zitny.eu`,
      )}`;

  return (
    <section id="prispet" className="relative py-28 overflow-hidden">
      {/* ambient background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 h-[520px] w-[820px] rounded-full bg-primary/20 blur-[140px]" />
        <div className="absolute bottom-0 right-0 h-[360px] w-[360px] rounded-full bg-accent/20 blur-[120px]" />
        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, hsl(var(--primary)) 1px, transparent 0)",
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center">
          <SectionLabel>{t("support_label")}</SectionLabel>
          <h2 className="mt-6 font-display text-4xl md:text-6xl font-bold tracking-tight">
            {t("support_title_a")}{" "}
            <span className="text-gradient-cyber">{t("support_title_b")}</span>
          </h2>
          <p className="mt-6 max-w-2xl mx-auto text-muted-foreground text-lg">
            {t("support_desc")}
          </p>
        </div>

        <div className="mt-14 grid lg:grid-cols-5 gap-8 items-stretch">
          {/* LEFT — donation card */}
          <div className="lg:col-span-3 relative group">
            <div className="absolute -inset-px rounded-3xl bg-gradient-cyber opacity-60 blur-xl group-hover:opacity-90 transition-opacity" />
            <div className="relative glass rounded-3xl p-8 md:p-10 shadow-card border border-primary/20 h-full">
              <div className="flex items-center gap-3 text-xs uppercase tracking-[0.25em] text-primary font-mono">
                <Sparkles className="h-4 w-4" />
                {t("support_pick_amount")}
              </div>

              <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
                {AMOUNTS.map((a) => (
                  <button
                    key={a}
                    onClick={() => setAmount(a)}
                    className={`relative rounded-2xl border px-4 py-5 text-center transition-all ${
                      amount === a
                        ? "border-primary bg-primary/10 shadow-glow scale-[1.02]"
                        : "border-border hover:border-primary/50 hover:bg-primary/5"
                    }`}
                  >
                    <div className="font-display text-2xl font-bold">{a}</div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground mt-0.5">
                      Kč
                    </div>
                  </button>
                ))}
              </div>

              <div className="mt-4">
                <label className="text-xs uppercase tracking-wider text-muted-foreground font-mono">
                  {t("support_custom")}
                </label>
                <div className="mt-2 flex items-center gap-2 rounded-2xl border border-border bg-background/40 px-4 py-3 focus-within:border-primary transition-colors">
                  <input
                    type="number"
                    min={1}
                    value={amount ?? ""}
                    onChange={(e) =>
                      setAmount(e.target.value ? Number(e.target.value) : null)
                    }
                    placeholder="—"
                    className="flex-1 bg-transparent outline-none font-display text-2xl font-bold"
                  />
                  <span className="text-muted-foreground font-mono text-sm">CZK</span>
                </div>
              </div>

              {/* bank details */}
              <div className="mt-8 space-y-3">
                <BankRow
                  label={t("support_account")}
                  value={ACCOUNT}
                  onCopy={() => copy(ACCOUNT, "acc")}
                  copied={copied === "acc"}
                  icon={<Landmark className="h-4 w-4" />}
                />
                <BankRow
                  label="IBAN"
                  value={IBAN}
                  onCopy={() => copy(IBAN, "iban")}
                  copied={copied === "iban"}
                  icon={<Satellite className="h-4 w-4" />}
                />
              </div>

              <Button
                size="lg"
                className="mt-8 w-full bg-gradient-cyber text-primary-foreground shadow-glow font-display text-base"
                onClick={() => copy(ACCOUNT, "acc")}
              >
                <Heart className="h-4 w-4 mr-2 fill-current" />
                {t("support_cta")}
              </Button>
            </div>
          </div>

          {/* RIGHT — QR + perks */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <div className="relative glass rounded-3xl p-6 border border-border overflow-hidden">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-cyber opacity-70" />
              <div className="text-xs uppercase tracking-[0.25em] text-primary font-mono text-center">
                {t("support_qr_title")}
              </div>
              <div className="mt-4 relative mx-auto w-fit">
                <div className="absolute -inset-3 rounded-2xl bg-primary/30 blur-2xl" />
                <div className="relative rounded-2xl border border-primary/40 bg-[#0b0f1a] p-3 shadow-glow">
                  <img
                    src={qrUrl}
                    alt="QR platba"
                    className="h-52 w-52 md:h-56 md:w-56"
                    loading="lazy"
                  />
                </div>
              </div>
              <p className="mt-4 text-center text-xs text-muted-foreground font-mono">
                {amount ? `${amount} CZK · ${ACCOUNT}` : ACCOUNT}
              </p>
            </div>

            <ul className="glass rounded-3xl p-6 border border-border space-y-3">
              <Perk icon={<Rocket className="h-4 w-4" />} text={t("support_perk_1")} />
              <Perk icon={<Stars className="h-4 w-4" />} text={t("support_perk_2")} />
              <Perk icon={<Heart className="h-4 w-4" />} text={t("support_perk_3")} />
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

function BankRow({
  label,
  value,
  onCopy,
  copied,
  icon,
}: {
  label: string;
  value: string;
  onCopy: () => void;
  copied: boolean;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl bg-background/40 border border-border px-4 py-3 hover:border-primary/40 transition-colors">
      <div className="flex items-center gap-3 min-w-0">
        <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-cyber text-primary-foreground">
          {icon}
        </span>
        <div className="min-w-0">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono">
            {label}
          </div>
          <div className="font-mono text-sm md:text-base font-semibold truncate">
            {value}
          </div>
        </div>
      </div>
      <button
        onClick={onCopy}
        className="shrink-0 inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-mono hover:border-primary hover:bg-primary/10 transition-colors"
      >
        {copied ? <Check className="h-3.5 w-3.5 text-primary" /> : <Copy className="h-3.5 w-3.5" />}
        {copied ? "OK" : "Copy"}
      </button>
    </div>
  );
}

function Perk({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <li className="flex items-start gap-3">
      <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/15 text-primary">
        {icon}
      </span>
      <span className="text-sm text-muted-foreground leading-relaxed">{text}</span>
    </li>
  );
}

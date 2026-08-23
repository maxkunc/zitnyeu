import { useEffect, useState } from "react";
import { Menu, X, Languages } from "lucide-react";
import logoUrl from "@/assets/zitair-logo.png";
import { useLang } from "@/lib/i18n";

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { lang, setLang, t } = useLang();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { href: "#domu", label: t("nav_home") },
    { href: "#o-nas", label: t("nav_about") },
    { href: "#uspechy", label: t("nav_achievements") },
    { href: "#projekty", label: t("nav_projects") },
    { href: "#workshopy", label: t("nav_workshops") },
    { href: "#sponzori", label: t("nav_sponsors") },
    { href: "#prispet", label: t("support_label") },
    { href: "#kontakty", label: t("nav_contacts") },
  ];

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all ${scrolled ? "glass shadow-card" : "bg-transparent"}`}
    >
      <div className="mx-auto max-w-7xl px-6 py-3 flex items-center justify-between gap-4">
        <a href="#domu" className="flex items-center gap-3 group shrink-0">
          <span className="relative inline-flex h-10 w-10 items-center justify-center">
            <span className="absolute inset-0 rounded-full bg-primary/20 blur-md group-hover:bg-primary/40 transition-colors" />
            <img
              src={logoUrl}
              alt="ŽitAir"
              className="relative h-9 w-9 object-contain invert opacity-90 group-hover:opacity-100 transition-all group-hover:rotate-12"
            />
          </span>
          <span className="font-display text-xl font-bold tracking-tight">
            zitny<span className="text-primary">.eu</span>
          </span>
        </a>

        <nav className="hidden lg:flex items-center gap-1">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden sm:inline-flex items-center rounded-full glass overflow-hidden text-xs font-mono">
            <Languages className="h-3.5 w-3.5 ml-3 mr-1 text-muted-foreground" />
            <button
              onClick={() => setLang("cs")}
              className={`px-2.5 py-1.5 transition-colors ${lang === "cs" ? "text-primary font-bold" : "text-muted-foreground hover:text-foreground"}`}
              aria-pressed={lang === "cs"}
            >
              CZ
            </button>
            <span className="text-border">|</span>
            <button
              onClick={() => setLang("en")}
              className={`px-2.5 py-1.5 pr-3 transition-colors ${lang === "en" ? "text-primary font-bold" : "text-muted-foreground hover:text-foreground"}`}
              aria-pressed={lang === "en"}
            >
              EN
            </button>
          </div>
          <button
            className="lg:hidden p-2 rounded-md hover:bg-secondary"
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="lg:hidden glass border-t border-border">
          <div className="px-6 py-3 flex flex-col">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="py-2 text-sm text-muted-foreground hover:text-foreground"
              >
                {l.label}
              </a>
            ))}
            <div className="flex gap-2 pt-3">
              <button
                onClick={() => setLang("cs")}
                className={`px-3 py-1.5 rounded-md text-xs font-mono ${lang === "cs" ? "bg-primary text-primary-foreground" : "glass"}`}
              >
                CZ
              </button>
              <button
                onClick={() => setLang("en")}
                className={`px-3 py-1.5 rounded-md text-xs font-mono ${lang === "en" ? "bg-primary text-primary-foreground" : "glass"}`}
              >
                EN
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

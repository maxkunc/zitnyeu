import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Rocket, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const links = [
  { href: "#domu", label: "Domů" },
  { href: "#o-nas", label: "O nás" },
  { href: "#uspechy", label: "Úspěchy" },
  { href: "#projekty", label: "Projekty" },
  { href: "#workshopy", label: "Workshopy & Akce" },
  { href: "#sponzori", label: "Sponzoři" },
  { href: "#kontakty", label: "Kontakty" },
];

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all ${
        scrolled ? "glass shadow-card" : "bg-transparent"
      }`}
    >
      <div className="mx-auto max-w-7xl px-6 py-3 flex items-center justify-between">
        <a href="#domu" className="flex items-center gap-2 group">
          <span className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-cyber shadow-glow">
            <Rocket className="h-5 w-5 text-primary-foreground" />
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
          <Link to="/admin" className="hidden sm:inline">
            <Button variant="outline" size="sm" className="border-primary/40 text-primary hover:bg-primary/10">
              Admin
            </Button>
          </Link>
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
          </div>
        </div>
      )}
    </header>
  );
}

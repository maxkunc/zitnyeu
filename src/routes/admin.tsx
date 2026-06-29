import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth, useSite, uid, type Project, type Workshop, type Achievement, type Sponsor } from "@/lib/site-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Rocket, LayoutDashboard, FolderKanban, GraduationCap, Trophy,
  Building2, Inbox, LogOut, Plus, Trash2, ExternalLink, Lock, History, Menu, Save, Check,
} from "lucide-react";
import { toast } from "sonner";
import { handleImageUpload } from "@/lib/image-utils";

export default function AdminRoute() {
  useEffect(() => { document.title = "Admin — zitny.eu"; }, []);
  return <AdminPage />;
}

type Tab = "overview" | "projects" | "workshops" | "achievements" | "sponsors" | "messages" | "logs";

function AdminPage() {
  const { authed, ready, user, role, login, logout } = useAuth();
  const [tab, setTab] = useState<Tab>("overview");
  const [navOpen, setNavOpen] = useState(false);

  if (!ready) return <div className="min-h-screen flex items-center justify-center text-muted-foreground text-sm">Načítám…</div>;
  if (!authed) return <LoginScreen onLogin={login} />;

  const items: { id: Tab; label: string; icon: typeof Rocket }[] = [
    { id: "overview", label: "Přehled", icon: LayoutDashboard },
    { id: "projects", label: "Projekty", icon: FolderKanban },
    { id: "workshops", label: "Workshopy", icon: GraduationCap },
    { id: "achievements", label: "Úspěchy", icon: Trophy },
    { id: "sponsors", label: "Partneři", icon: Building2 },
    { id: "messages", label: "Zprávy", icon: Inbox },
    { id: "logs", label: "Historie změn", icon: History },
  ];

  const currentLabel = items.find((i) => i.id === tab)?.label ?? "";

  const NavContent = ({ onPick }: { onPick?: () => void }) => (
    <div className="flex flex-col h-full">
      <Link to="/" className="flex items-center gap-2 mb-6" onClick={onPick}>
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-cyber shadow-glow">
          <Rocket className="h-5 w-5 text-primary-foreground" />
        </span>
        <div>
          <div className="font-display font-bold">zitny.eu</div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Mission control</div>
        </div>
      </Link>

      <div className="glass rounded-lg p-3 mb-6">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Přihlášen</div>
        <div className="font-display font-bold mt-0.5">{user}</div>
        <div className="text-xs text-primary">{role}</div>
      </div>

      <nav className="flex flex-col gap-1 flex-1">
        {items.map((it) => {
          const I = it.icon;
          const active = tab === it.id;
          return (
            <button
              key={it.id}
              onClick={() => { setTab(it.id); onPick?.(); }}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                active ? "bg-primary/15 text-primary border border-primary/30" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              <I className="h-4 w-4" />
              {it.label}
            </button>
          );
        })}
      </nav>

      <div className="flex flex-col gap-2 pt-4 border-t border-border">
        <Link to="/" onClick={onPick}>
          <Button variant="outline" size="sm" className="w-full justify-start">
            <ExternalLink className="h-4 w-4 mr-2" /> Zobrazit web
          </Button>
        </Link>
        <Button variant="ghost" size="sm" onClick={() => { logout(); onPick?.(); }} className="w-full justify-start text-muted-foreground">
          <LogOut className="h-4 w-4 mr-2" /> Odhlásit
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[260px_1fr]">
      {/* Mobile top bar */}
      <header className="lg:hidden sticky top-0 z-40 glass border-b border-border flex items-center justify-between px-4 py-3">
        <Sheet open={navOpen} onOpenChange={setNavOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Menu">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[280px] p-5 bg-sidebar">
            <NavContent onPick={() => setNavOpen(false)} />
          </SheetContent>
        </Sheet>
        <div className="flex items-center gap-2">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-gradient-cyber">
            <Rocket className="h-4 w-4 text-primary-foreground" />
          </span>
          <div className="font-display font-bold text-sm">{currentLabel}</div>
        </div>
        <div className="text-[10px] uppercase tracking-wider text-primary font-mono">{user}</div>
      </header>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex border-r border-border bg-sidebar p-5 flex-col">
        <NavContent />
      </aside>

      <main className="p-4 sm:p-6 lg:p-8 overflow-auto">
        {tab === "overview" && <Overview />}
        {tab === "projects" && <ProjectsAdmin />}
        {tab === "workshops" && <WorkshopsAdmin />}
        {tab === "achievements" && <AchievementsAdmin />}
        {tab === "sponsors" && <SponsorsAdmin />}
        {tab === "messages" && <MessagesAdmin />}
        {tab === "logs" && <LogsAdmin />}
      </main>
    </div>
  );
}

function LoginScreen({ onLogin }: { onLogin: (u: string, p: string) => Promise<boolean> }) {
  const [u, setU] = useState("");
  const [p, setP] = useState("");
  const [loading, setLoading] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const ok = await onLogin(u, p);
    setLoading(false);
    if (!ok) toast.error("Neplatné přihlašovací údaje");
  };
  return (
    <div className="min-h-screen flex items-center justify-center px-6 relative">
      <div className="absolute inset-0 starfield opacity-50" />
      <form onSubmit={submit} className="relative glass rounded-2xl p-8 w-full max-w-md shadow-glow">
        <div className="flex items-center gap-3 mb-6">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-cyber">
            <Lock className="h-5 w-5 text-primary-foreground" />
          </span>
          <div>
            <h1 className="font-display text-2xl font-bold">Admin přihlášení</h1>
            <p className="text-xs text-muted-foreground">zitny.eu mission control</p>
          </div>
        </div>
        <div className="space-y-3">
          <Input value={u} onChange={(e) => setU(e.target.value)} placeholder="Uživatel" className="bg-background/40" autoComplete="username" />
          <Input value={p} onChange={(e) => setP(e.target.value)} type="password" placeholder="Heslo" className="bg-background/40" autoComplete="current-password" />
        </div>
        <Button type="submit" disabled={loading} className="w-full mt-6 bg-gradient-cyber text-primary-foreground shadow-glow">
          {loading ? "Přihlašuji…" : "Přihlásit se"}
        </Button>
      </form>
    </div>
  );
}

function Section({ title, subtitle, children, onSave }: { title: string; subtitle?: string; children: React.ReactNode; onSave?: () => void }) {
  const [saved, setSaved] = useState(false);
  const handle = () => {
    onSave?.();
    setSaved(true);
    toast.success("Změny uloženy a propsány na web");
    setTimeout(() => setSaved(false), 1800);
  };
  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold">{title}</h2>
          {subtitle && <p className="text-muted-foreground mt-1 text-sm sm:text-base">{subtitle}</p>}
        </div>
        {onSave && (
          <Button onClick={handle} className="bg-gradient-cyber text-primary-foreground shadow-glow shrink-0 self-start">
            {saved ? <Check className="h-4 w-4 mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            {saved ? "Uloženo" : "Uložit změny"}
          </Button>
        )}
      </div>
      <div className="mt-6 sm:mt-8">{children}</div>
      {onSave && (
        <div className="mt-8 flex justify-end">
          <Button onClick={handle} size="lg" className="bg-gradient-cyber text-primary-foreground shadow-glow">
            {saved ? <Check className="h-4 w-4 mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            {saved ? "Uloženo" : "Uložit změny"}
          </Button>
        </div>
      )}
    </div>
  );
}

function Overview() {
  const { data, importFromLocalStorage, initialized } = useSite();
  const stats = [
    { l: "Projektů celkem", v: data.projects.length },
    { l: "Velkých", v: data.projects.filter((p) => p.category === "major").length },
    { l: "S patronací ESA", v: data.projects.filter((p) => p.esa).length },
    { l: "Workshopů", v: data.workshops.length },
    { l: "Partnerů", v: data.sponsors.length },
    { l: "Zpráv", v: data.messages.length },
  ];
  const hasLocal = typeof window !== "undefined" && !!localStorage.getItem("zitny-site-data-v3");
  return (
    <Section title="Přehled" subtitle={initialized ? "Aktuální stav obsahu webu zitny.eu — synchronizováno s cloudem" : "Načítám data z cloudu…"}>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((s) => (
          <div key={s.l} className="glass rounded-xl p-6">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">{s.l}</div>
            <div className="font-display text-4xl font-bold mt-2 text-gradient-cyber">{s.v}</div>
          </div>
        ))}
      </div>
      {hasLocal && (
        <div className="mt-8 glass rounded-xl p-5 border border-primary/30">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="font-display font-semibold">Lokální data v prohlížeči</div>
              <p className="text-sm text-muted-foreground mt-1">Před přechodem na cloud jste editovali obsah lokálně. Můžete ho jednorázově nahrát do cloudu (přepíše současný cloud obsah).</p>
            </div>
            <Button onClick={importFromLocalStorage} className="bg-gradient-cyber text-primary-foreground shrink-0">
              Nahrát do cloudu
            </Button>
          </div>
        </div>
      )}
    </Section>
  );
}

function ProjectsAdmin() {
  const { data, update, log } = useSite();
  const { user } = useAuth();
  const [draft, setDraft] = useState<Project>({ id: "", title: "", description: "", status: "Aktivní", category: "major", esa: false, image: "" });

  const add = () => {
    if (!draft.title.trim()) return toast.error("Zadejte název");
    update((d) => ({ ...d, projects: [{ ...draft, id: uid() }, ...d.projects] }));
    log(user!, `Přidal projekt „${draft.title}"`);
    setDraft({ id: "", title: "", description: "", status: "Aktivní", category: "major", esa: false, image: "" });
    toast.success("Projekt přidán");
  };
  const remove = (id: string, title: string) => {
    update((d) => ({ ...d, projects: d.projects.filter((p) => p.id !== id) }));
    log(user!, `Smazal projekt „${title}"`);
  };
  const edit = (id: string, patch: Partial<Project>) =>
    update((d) => ({ ...d, projects: d.projects.map((p) => (p.id === id ? { ...p, ...patch } : p)) }));
  const commitEdit = (title: string) => log(user!, `Upravil projekt „${title}"`);

  const onFile = handleImageUpload;

  return (
    <Section title="Projekty" subtitle="Velké projekty, menší výzvy a realizované spolupráce. ESA patronace je vlastnost projektu — zapnutelná pro libovolnou kategorii." onSave={() => log(user!, "Uložil sekci Projekty")}>
      <div className="glass rounded-xl p-5 mb-6 space-y-3">
        <div className="grid md:grid-cols-2 gap-3">
          <Input placeholder="Název projektu" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} className="bg-background/40" />
          <Input placeholder="Status (např. Aktivní)" value={draft.status} onChange={(e) => setDraft({ ...draft, status: e.target.value })} className="bg-background/40" />
          <select value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value as Project["category"] })} className="bg-background/40 border border-border rounded-md px-3 h-10 text-sm">
            <option value="major">Velký projekt</option>
            <option value="minor">Menší / výzva</option>
            <option value="past">Realizováno</option>
          </select>
          <label className="flex items-center gap-2 text-sm glass rounded-md px-3 h-10 cursor-pointer">
            <input type="checkbox" checked={!!draft.esa} onChange={(e) => setDraft({ ...draft, esa: e.target.checked })} />
            Pod patronací ESA
          </label>
        </div>
        <Textarea placeholder="Popis" value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} className="bg-background/40" rows={2} />
        <div className="grid md:grid-cols-[1fr_auto_auto] gap-3 items-center">
          <Input placeholder="URL obrázku (nebo nahrajte)" value={draft.image || ""} onChange={(e) => setDraft({ ...draft, image: e.target.value })} className="bg-background/40" />
          <input type="file" accept="image/*" onChange={onFile((url) => setDraft({ ...draft, image: url }))} className="text-xs" />
          <Button onClick={add} className="bg-gradient-cyber text-primary-foreground">
            <Plus className="h-4 w-4 mr-2" /> Přidat projekt
          </Button>
        </div>
        {draft.image && <img src={draft.image} alt="" className="h-20 rounded-md object-cover" />}
      </div>

      <div className="grid gap-3">
        {data.projects.map((p) => (
          <div key={p.id} className="glass rounded-xl p-4 grid md:grid-cols-[80px_1fr_140px_140px_auto_auto] gap-3 items-start">
            {p.image ? (
              <img src={p.image} alt={p.title} className="h-20 w-20 rounded-md object-cover" />
            ) : (
              <div className="h-20 w-20 rounded-md grid-bg border border-border" />
            )}
            <div className="space-y-2">
              <Input value={p.title} onChange={(e) => edit(p.id, { title: e.target.value })} onBlur={() => commitEdit(p.title)} className="bg-background/40 font-semibold" />
              <Textarea value={p.description} onChange={(e) => edit(p.id, { description: e.target.value })} onBlur={() => commitEdit(p.title)} className="bg-background/40" rows={2} />
              <div className="flex items-center gap-2">
                <Input placeholder="URL obrázku" value={p.image || ""} onChange={(e) => edit(p.id, { image: e.target.value })} className="bg-background/40 text-xs h-8" />
                <input type="file" accept="image/*" onChange={onFile((url) => { edit(p.id, { image: url }); commitEdit(p.title); })} className="text-xs w-32" />
              </div>
            </div>
            <Input value={p.status} onChange={(e) => edit(p.id, { status: e.target.value })} onBlur={() => commitEdit(p.title)} className="bg-background/40" />
            <select value={p.category} onChange={(e) => { edit(p.id, { category: e.target.value as Project["category"] }); commitEdit(p.title); }} className="bg-background/40 border border-border rounded-md px-3 h-10 text-sm">
              <option value="major">Velký</option>
              <option value="minor">Menší</option>
              <option value="past">Realizováno</option>
            </select>
            <label className="flex items-center gap-2 text-xs whitespace-nowrap">
              <input type="checkbox" checked={!!p.esa} onChange={(e) => { edit(p.id, { esa: e.target.checked }); commitEdit(p.title); }} />
              ESA
            </label>
            <Button variant="ghost" size="icon" onClick={() => remove(p.id, p.title)} className="text-destructive">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </Section>
  );
}

function WorkshopsAdmin() {
  const { data, update, log } = useSite();
  const { user } = useAuth();
  const [draft, setDraft] = useState<Workshop>({ id: "", title: "", description: "", date: "" });
  const add = () => {
    if (!draft.title.trim()) return toast.error("Zadejte název");
    update((d) => ({ ...d, workshops: [{ ...draft, id: uid() }, ...d.workshops] }));
    log(user!, `Přidal workshop „${draft.title}"`);
    setDraft({ id: "", title: "", description: "", date: "" });
  };
  const remove = (id: string, title: string) => {
    update((d) => ({ ...d, workshops: d.workshops.filter((w) => w.id !== id) }));
    log(user!, `Smazal workshop „${title}"`);
  };
  const edit = (id: string, patch: Partial<Workshop>) =>
    update((d) => ({ ...d, workshops: d.workshops.map((w) => (w.id === id ? { ...w, ...patch } : w)) }));

  return (
    <Section title="Workshopy & Akce" subtitle="Den s Vesmírem, Dům Ronalda McDonalda a další" onSave={() => log(user!, "Uložil sekci Workshopy")}>
      <div className="glass rounded-xl p-5 mb-6 grid md:grid-cols-2 gap-3">
        <Input placeholder="Název" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} className="bg-background/40" />
        <Input placeholder="Termín" value={draft.date} onChange={(e) => setDraft({ ...draft, date: e.target.value })} className="bg-background/40" />
        <Textarea placeholder="Popis" value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} className="md:col-span-2 bg-background/40" rows={2} />
        <Button onClick={add} className="md:col-span-2 bg-gradient-cyber text-primary-foreground">
          <Plus className="h-4 w-4 mr-2" /> Přidat akci
        </Button>
      </div>
      <div className="grid gap-3">
        {data.workshops.map((w) => (
          <div key={w.id} className="glass rounded-xl p-4 grid md:grid-cols-[1fr_180px_auto] gap-3 items-start">
            <div>
              <Input value={w.title} onChange={(e) => edit(w.id, { title: e.target.value })} onBlur={() => log(user!, `Upravil workshop „${w.title}"`)} className="bg-background/40 font-semibold" />
              <Textarea value={w.description} onChange={(e) => edit(w.id, { description: e.target.value })} className="bg-background/40 mt-2" rows={2} />
            </div>
            <Input value={w.date || ""} onChange={(e) => edit(w.id, { date: e.target.value })} className="bg-background/40" />
            <Button variant="ghost" size="icon" onClick={() => remove(w.id, w.title)} className="text-destructive">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </Section>
  );
}

function AchievementsAdmin() {
  const { data, update, log } = useSite();
  const { user } = useAuth();
  const [draft, setDraft] = useState<Achievement>({ id: "", metric: "", label: "", description: "" });
  const add = () => {
    if (!draft.metric.trim()) return;
    update((d) => ({ ...d, achievements: [...d.achievements, { ...draft, id: uid() }] }));
    log(user!, `Přidal úspěch „${draft.label}"`);
    setDraft({ id: "", metric: "", label: "", description: "" });
  };
  const remove = (id: string, label: string) => {
    update((d) => ({ ...d, achievements: d.achievements.filter((a) => a.id !== id) }));
    log(user!, `Smazal úspěch „${label}"`);
  };
  const edit = (id: string, patch: Partial<Achievement>) =>
    update((d) => ({ ...d, achievements: d.achievements.map((a) => (a.id === id ? { ...a, ...patch } : a)) }));

  return (
    <Section title="Úspěchy" subtitle="Klíčová čísla a milníky" onSave={() => log(user!, "Uložil sekci Úspěchy")}>
      <div className="glass rounded-xl p-5 mb-6 grid md:grid-cols-4 gap-3">
        <Input placeholder="Číslo" value={draft.metric} onChange={(e) => setDraft({ ...draft, metric: e.target.value })} className="bg-background/40" />
        <Input placeholder="Popisek" value={draft.label} onChange={(e) => setDraft({ ...draft, label: e.target.value })} className="bg-background/40" />
        <Input placeholder="Detail" value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} className="bg-background/40" />
        <Button onClick={add} className="bg-gradient-cyber text-primary-foreground">
          <Plus className="h-4 w-4 mr-2" /> Přidat
        </Button>
      </div>
      <div className="grid gap-3">
        {data.achievements.map((a) => (
          <div key={a.id} className="glass rounded-xl p-4 grid md:grid-cols-[120px_1fr_2fr_auto] gap-3 items-center">
            <Input value={a.metric} onChange={(e) => edit(a.id, { metric: e.target.value })} className="bg-background/40 font-display text-lg font-bold" />
            <Input value={a.label} onChange={(e) => edit(a.id, { label: e.target.value })} className="bg-background/40" />
            <Input value={a.description} onChange={(e) => edit(a.id, { description: e.target.value })} className="bg-background/40" />
            <Button variant="ghost" size="icon" onClick={() => remove(a.id, a.label)} className="text-destructive">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </Section>
  );
}

function SponsorsAdmin() {
  const { data, update, log } = useSite();
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [tier, setTier] = useState<Sponsor["tier"]>("main");
  const [logo, setLogo] = useState("");
  const [domain, setDomain] = useState("");

  const onFile = handleImageUpload;

  const add = () => {
    if (!name.trim()) return;
    update((d) => ({ ...d, sponsors: [...d.sponsors, { id: uid(), name, tier, logo, domain: domain.trim() || undefined } as Sponsor] }));
    log(user!, `Přidal partnera „${name}"`);
    setName(""); setLogo(""); setDomain("");
  };
  const remove = (id: string, n: string) => {
    update((d) => ({ ...d, sponsors: d.sponsors.filter((s) => s.id !== id) }));
    log(user!, `Smazal partnera „${n}"`);
  };
  const editSponsor = (id: string, patch: Partial<Sponsor>) =>
    update((d) => ({ ...d, sponsors: d.sponsors.map((s) => (s.id === id ? { ...s, ...patch } : s)) }));

  return (
    <Section title="Partneři" subtitle="Generální, hlavní a mediální partneři. Můžete nahrát logo (PNG s průhledným pozadím funguje nejlépe)." onSave={() => log(user!, "Uložil sekci Partneři")}>
      <div className="glass rounded-xl p-5 mb-6 space-y-3">
        <div className="grid md:grid-cols-[1fr_180px_auto] gap-3">
          <Input placeholder="Název partnera" value={name} onChange={(e) => setName(e.target.value)} className="bg-background/40" />
          <select value={tier} onChange={(e) => setTier(e.target.value as Sponsor["tier"])} className="bg-background/40 border border-border rounded-md px-3 h-10 text-sm">
            <option value="general">Generální</option>
            <option value="main">Hlavní</option>
            <option value="media">Mediální</option>
          </select>
          <Button onClick={add} className="bg-gradient-cyber text-primary-foreground shrink-0">
            <Plus className="h-4 w-4 mr-2" /> Přidat
          </Button>
        </div>
        <div className="flex items-center gap-3">
          <Input placeholder="URL loga (nebo nahrajte)" value={logo} onChange={(e) => setLogo(e.target.value)} className="bg-background/40" />
          <input type="file" accept="image/*" onChange={onFile(setLogo)} className="text-xs" />
          {logo && <img src={logo} alt="" className="h-10 w-10 object-contain bg-white/5 rounded" />}
        </div>
        <Input placeholder="Doména pro logo.dev (např. esa.int) — automaticky stáhne logo" value={domain} onChange={(e) => setDomain(e.target.value)} className="bg-background/40" />
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {data.sponsors.map((s) => (
          <div key={s.id} className="glass rounded-xl p-4 flex items-center gap-3">
            <div className="h-14 w-14 shrink-0 rounded-md bg-white/5 border border-border flex items-center justify-center overflow-hidden">
              {s.logo ? <img src={s.logo} alt={s.name} className="h-full w-full object-contain" /> : <Building2 className="h-5 w-5 text-muted-foreground" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-display font-semibold truncate">{s.name}</div>
              <select value={s.tier || "main"} onChange={(e) => editSponsor(s.id, { tier: e.target.value as Sponsor["tier"] })} className="bg-background/40 border border-border rounded-md px-2 h-7 text-xs mt-1">
                <option value="general">Generální</option>
                <option value="main">Hlavní</option>
                <option value="media">Mediální</option>
              </select>
              <div className="flex items-center gap-1 mt-1">
                <Input placeholder="URL loga" value={s.logo || ""} onChange={(e) => editSponsor(s.id, { logo: e.target.value })} className="bg-background/40 text-xs h-7" />
                <input type="file" accept="image/*" onChange={onFile((url) => editSponsor(s.id, { logo: url }))} className="text-[10px] w-24" />
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => remove(s.id, s.name)} className="text-destructive">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </Section>
  );
}

function MessagesAdmin() {
  const { data, deleteMessage } = useSite();
  const remove = (id: string) => deleteMessage(id);
  return (
    <Section title="Příchozí zprávy" subtitle="Zprávy z kontaktního formuláře (přesměrované také na info@zitny.eu)">
      {data.messages.length === 0 ? (
        <div className="glass rounded-xl p-12 text-center text-muted-foreground">Zatím žádné zprávy.</div>
      ) : (
        <div className="glass rounded-xl overflow-x-auto">
          <table className="w-full text-sm min-w-[600px]">
            <thead className="bg-secondary/50">
              <tr className="text-left">
                <th className="px-4 py-3 font-medium">Jméno</th>
                <th className="px-4 py-3 font-medium">E-mail</th>
                <th className="px-4 py-3 font-medium">Zpráva</th>
                <th className="px-4 py-3 font-medium">Datum</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {data.messages.map((m) => (
                <tr key={m.id} className="border-t border-border">
                  <td className="px-4 py-3 font-semibold">{m.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{m.email}</td>
                  <td className="px-4 py-3 max-w-md">{m.message}</td>
                  <td className="px-4 py-3 text-muted-foreground font-mono text-xs">{new Date(m.createdAt).toLocaleString("cs-CZ")}</td>
                  <td className="px-4 py-3">
                    <Button variant="ghost" size="icon" onClick={() => remove(m.id)} className="text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Section>
  );
}

function LogsAdmin() {
  const { data } = useSite();
  return (
    <Section title="Historie změn" subtitle="Kdo a kdy upravoval obsah webu">
      {!data.logs || data.logs.length === 0 ? (
        <div className="glass rounded-xl p-12 text-center text-muted-foreground">Zatím žádné záznamy.</div>
      ) : (
        <div className="glass rounded-xl overflow-x-auto">
          <table className="w-full text-sm min-w-[520px]">
            <thead className="bg-secondary/50">
              <tr className="text-left">
                <th className="px-4 py-3 font-medium w-40">Uživatel</th>
                <th className="px-4 py-3 font-medium">Akce</th>
                <th className="px-4 py-3 font-medium w-48">Datum</th>
              </tr>
            </thead>
            <tbody>
              {data.logs.map((l) => (
                <tr key={l.id} className="border-t border-border">
                  <td className="px-4 py-3 font-semibold text-primary">{l.who}</td>
                  <td className="px-4 py-3">{l.action}</td>
                  <td className="px-4 py-3 text-muted-foreground font-mono text-xs">{new Date(l.at).toLocaleString("cs-CZ")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Section>
  );
}

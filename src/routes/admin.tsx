import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth, useSite, uid, type Project, type Workshop, type Achievement, type Sponsor } from "@/lib/site-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Rocket, LayoutDashboard, FolderKanban, GraduationCap, Trophy,
  Building2, Inbox, LogOut, Plus, Trash2, ExternalLink, Lock,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — zitny.eu" }] }),
  component: AdminPage,
});

type Tab = "overview" | "projects" | "workshops" | "achievements" | "sponsors" | "messages";

function AdminPage() {
  const { authed, login, logout } = useAuth();
  const [tab, setTab] = useState<Tab>("overview");

  if (!authed) return <LoginScreen onLogin={login} />;

  const items: { id: Tab; label: string; icon: typeof Rocket }[] = [
    { id: "overview", label: "Přehled", icon: LayoutDashboard },
    { id: "projects", label: "Projekty", icon: FolderKanban },
    { id: "workshops", label: "Workshopy", icon: GraduationCap },
    { id: "achievements", label: "Úspěchy", icon: Trophy },
    { id: "sponsors", label: "Sponzoři", icon: Building2 },
    { id: "messages", label: "Zprávy", icon: Inbox },
  ];

  return (
    <div className="min-h-screen grid grid-cols-[260px_1fr]">
      <aside className="border-r border-border bg-sidebar p-5 flex flex-col">
        <Link to="/" className="flex items-center gap-2 mb-8">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-cyber shadow-glow">
            <Rocket className="h-5 w-5 text-primary-foreground" />
          </span>
          <div>
            <div className="font-display font-bold">zitny.eu</div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Admin panel</div>
          </div>
        </Link>

        <nav className="flex flex-col gap-1 flex-1">
          {items.map((it) => {
            const I = it.icon;
            const active = tab === it.id;
            return (
              <button
                key={it.id}
                onClick={() => setTab(it.id)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                  active
                    ? "bg-primary/15 text-primary border border-primary/30"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                <I className="h-4 w-4" />
                {it.label}
              </button>
            );
          })}
        </nav>

        <div className="flex flex-col gap-2 pt-4 border-t border-border">
          <Link to="/">
            <Button variant="outline" size="sm" className="w-full justify-start">
              <ExternalLink className="h-4 w-4 mr-2" /> Zobrazit web
            </Button>
          </Link>
          <Button variant="ghost" size="sm" onClick={logout} className="w-full justify-start text-muted-foreground">
            <LogOut className="h-4 w-4 mr-2" /> Odhlásit
          </Button>
        </div>
      </aside>

      <main className="p-8 overflow-auto">
        {tab === "overview" && <Overview />}
        {tab === "projects" && <ProjectsAdmin />}
        {tab === "workshops" && <WorkshopsAdmin />}
        {tab === "achievements" && <AchievementsAdmin />}
        {tab === "sponsors" && <SponsorsAdmin />}
        {tab === "messages" && <MessagesAdmin />}
      </main>
    </div>
  );
}

function LoginScreen({ onLogin }: { onLogin: (u: string, p: string) => boolean }) {
  const [u, setU] = useState("admin");
  const [p, setP] = useState("");
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onLogin(u, p)) toast.error("Neplatné přihlašovací údaje");
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
          <Input value={u} onChange={(e) => setU(e.target.value)} placeholder="Uživatel" className="bg-background/40" />
          <Input value={p} onChange={(e) => setP(e.target.value)} type="password" placeholder="Heslo" className="bg-background/40" />
        </div>
        <Button type="submit" className="w-full mt-6 bg-gradient-cyber text-primary-foreground shadow-glow">
          Přihlásit se
        </Button>
        <p className="mt-4 text-xs text-muted-foreground text-center font-mono">
          Demo: admin / esa2026
        </p>
      </form>
    </div>
  );
}

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="font-display text-3xl font-bold">{title}</h2>
      {subtitle && <p className="text-muted-foreground mt-1">{subtitle}</p>}
      <div className="mt-8">{children}</div>
    </div>
  );
}

function Overview() {
  const { data } = useSite();
  const stats = [
    { l: "Projektů celkem", v: data.projects.length },
    { l: "Velkých", v: data.projects.filter((p) => p.category === "major").length },
    { l: "ESA", v: data.projects.filter((p) => p.category === "esa").length },
    { l: "Workshopů", v: data.workshops.length },
    { l: "Sponzorů", v: data.sponsors.length },
    { l: "Zpráv", v: data.messages.length },
  ];
  return (
    <Section title="Přehled" subtitle="Aktuální stav obsahu webu zitny.eu">
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((s) => (
          <div key={s.l} className="glass rounded-xl p-6">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">{s.l}</div>
            <div className="font-display text-4xl font-bold mt-2 text-gradient-cyber">{s.v}</div>
          </div>
        ))}
      </div>
    </Section>
  );
}

function ProjectsAdmin() {
  const { data, update } = useSite();
  const [draft, setDraft] = useState<Project>({
    id: "", title: "", description: "", status: "Aktivní", category: "major",
  });

  const add = () => {
    if (!draft.title.trim()) return toast.error("Zadejte název");
    update((d) => ({ ...d, projects: [{ ...draft, id: uid() }, ...d.projects] }));
    setDraft({ id: "", title: "", description: "", status: "Aktivní", category: "major" });
    toast.success("Projekt přidán");
  };
  const remove = (id: string) =>
    update((d) => ({ ...d, projects: d.projects.filter((p) => p.id !== id) }));
  const edit = (id: string, patch: Partial<Project>) =>
    update((d) => ({ ...d, projects: d.projects.map((p) => (p.id === id ? { ...p, ...patch } : p)) }));

  return (
    <Section title="Projekty" subtitle="Spravujte velké, menší a ESA projekty">
      <div className="glass rounded-xl p-5 mb-6">
        <div className="grid md:grid-cols-2 gap-3">
          <Input placeholder="Název projektu" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} className="bg-background/40" />
          <Input placeholder="Status (např. Aktivní)" value={draft.status} onChange={(e) => setDraft({ ...draft, status: e.target.value })} className="bg-background/40" />
          <select value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value as Project["category"] })} className="bg-background/40 border border-border rounded-md px-3 h-10 text-sm">
            <option value="major">Velký projekt</option>
            <option value="minor">Menší projekt</option>
            <option value="esa">ESA patronace</option>
          </select>
          <Button onClick={add} className="bg-gradient-cyber text-primary-foreground">
            <Plus className="h-4 w-4 mr-2" /> Přidat projekt
          </Button>
        </div>
        <Textarea placeholder="Popis" value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} className="mt-3 bg-background/40" rows={2} />
      </div>

      <div className="grid gap-3">
        {data.projects.map((p) => (
          <div key={p.id} className="glass rounded-xl p-4 grid md:grid-cols-[1fr_140px_140px_auto] gap-3 items-start">
            <div>
              <Input value={p.title} onChange={(e) => edit(p.id, { title: e.target.value })} className="bg-background/40 font-semibold" />
              <Textarea value={p.description} onChange={(e) => edit(p.id, { description: e.target.value })} className="bg-background/40 mt-2" rows={2} />
            </div>
            <Input value={p.status} onChange={(e) => edit(p.id, { status: e.target.value })} className="bg-background/40" />
            <select value={p.category} onChange={(e) => edit(p.id, { category: e.target.value as Project["category"] })} className="bg-background/40 border border-border rounded-md px-3 h-10 text-sm">
              <option value="major">Velký</option>
              <option value="minor">Menší</option>
              <option value="esa">ESA</option>
            </select>
            <Button variant="ghost" size="icon" onClick={() => remove(p.id)} className="text-destructive">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </Section>
  );
}

function WorkshopsAdmin() {
  const { data, update } = useSite();
  const [draft, setDraft] = useState<Workshop>({ id: "", title: "", description: "", date: "" });
  const add = () => {
    if (!draft.title.trim()) return toast.error("Zadejte název");
    update((d) => ({ ...d, workshops: [{ ...draft, id: uid() }, ...d.workshops] }));
    setDraft({ id: "", title: "", description: "", date: "" });
  };
  const remove = (id: string) => update((d) => ({ ...d, workshops: d.workshops.filter((w) => w.id !== id) }));
  const edit = (id: string, patch: Partial<Workshop>) =>
    update((d) => ({ ...d, workshops: d.workshops.map((w) => (w.id === id ? { ...w, ...patch } : w)) }));

  return (
    <Section title="Workshopy & Akce" subtitle="Den s vesmírem, Dům Ronalda McDonalda a další">
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
              <Input value={w.title} onChange={(e) => edit(w.id, { title: e.target.value })} className="bg-background/40 font-semibold" />
              <Textarea value={w.description} onChange={(e) => edit(w.id, { description: e.target.value })} className="bg-background/40 mt-2" rows={2} />
            </div>
            <Input value={w.date || ""} onChange={(e) => edit(w.id, { date: e.target.value })} className="bg-background/40" />
            <Button variant="ghost" size="icon" onClick={() => remove(w.id)} className="text-destructive">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </Section>
  );
}

function AchievementsAdmin() {
  const { data, update } = useSite();
  const [draft, setDraft] = useState<Achievement>({ id: "", metric: "", label: "", description: "" });
  const add = () => {
    if (!draft.metric.trim()) return;
    update((d) => ({ ...d, achievements: [...d.achievements, { ...draft, id: uid() }] }));
    setDraft({ id: "", metric: "", label: "", description: "" });
  };
  const remove = (id: string) => update((d) => ({ ...d, achievements: d.achievements.filter((a) => a.id !== id) }));
  const edit = (id: string, patch: Partial<Achievement>) =>
    update((d) => ({ ...d, achievements: d.achievements.map((a) => (a.id === id ? { ...a, ...patch } : a)) }));

  return (
    <Section title="Úspěchy" subtitle="Klíčová čísla a milníky">
      <div className="glass rounded-xl p-5 mb-6 grid md:grid-cols-4 gap-3">
        <Input placeholder="Číslo (12+)" value={draft.metric} onChange={(e) => setDraft({ ...draft, metric: e.target.value })} className="bg-background/40" />
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
            <Button variant="ghost" size="icon" onClick={() => remove(a.id)} className="text-destructive">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </Section>
  );
}

function SponsorsAdmin() {
  const { data, update } = useSite();
  const [name, setName] = useState("");
  const add = () => {
    if (!name.trim()) return;
    update((d) => ({ ...d, sponsors: [...d.sponsors, { id: uid(), name } as Sponsor] }));
    setName("");
  };
  const remove = (id: string) => update((d) => ({ ...d, sponsors: d.sponsors.filter((s) => s.id !== id) }));

  return (
    <Section title="Sponzoři" subtitle="Partneři a podporovatelé">
      <div className="glass rounded-xl p-5 mb-6 flex gap-3">
        <Input placeholder="Název sponzora" value={name} onChange={(e) => setName(e.target.value)} className="bg-background/40" />
        <Button onClick={add} className="bg-gradient-cyber text-primary-foreground shrink-0">
          <Plus className="h-4 w-4 mr-2" /> Přidat
        </Button>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {data.sponsors.map((s) => (
          <div key={s.id} className="glass rounded-xl p-4 flex items-center justify-between">
            <span className="font-display font-semibold">{s.name}</span>
            <Button variant="ghost" size="icon" onClick={() => remove(s.id)} className="text-destructive">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </Section>
  );
}

function MessagesAdmin() {
  const { data, update } = useSite();
  const remove = (id: string) => update((d) => ({ ...d, messages: d.messages.filter((m) => m.id !== id) }));
  return (
    <Section title="Příchozí zprávy" subtitle="Zprávy z kontaktního formuláře">
      {data.messages.length === 0 ? (
        <div className="glass rounded-xl p-12 text-center text-muted-foreground">
          Zatím žádné zprávy.
        </div>
      ) : (
        <div className="glass rounded-xl overflow-hidden">
          <table className="w-full text-sm">
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
                  <td className="px-4 py-3 text-muted-foreground font-mono text-xs">
                    {new Date(m.createdAt).toLocaleString("cs-CZ")}
                  </td>
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

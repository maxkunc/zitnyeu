import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSite } from "@/lib/site-store";
import { resolveProjectImage } from "@/lib/project-images";
import { ArrowLeft, Award } from "lucide-react";

export const Route = createFileRoute("/projekty/$id")({
  component: ProjectDetail,
  head: ({ params }) => ({
    meta: [
      { title: `Projekt — ${params.id}` },
      { name: "description", content: "Detail projektu Žitný EU." },
    ],
  }),
});

function ProjectDetail() {
  const { id } = Route.useParams();
  const { data, initialized } = useSite();
  const project = data.projects.find((p) => p.id === id);

  if (!project) {
    if (!initialized) {
      return (
        <div className="min-h-screen grid place-items-center text-muted-foreground">Načítání…</div>
      );
    }
    return (
      <div className="min-h-screen grid place-items-center px-6">
        <div className="text-center">
          <p className="font-mono text-sm text-muted-foreground">Projekt nenalezen.</p>
          <Link
            to="/"
            hash="projekty"
            className="mt-4 inline-flex items-center gap-2 text-primary hover:underline"
          >
            <ArrowLeft className="h-4 w-4" /> Zpět na projekty
          </Link>
        </div>
      </div>
    );
  }

  const image = resolveProjectImage(project);

  return (
    <article className="min-h-screen pb-24">
      <div className="relative h-[42vh] min-h-[280px] bg-gradient-to-br from-primary/30 via-accent/10 to-transparent overflow-hidden">
        {image ? (
          <img
            src={image}
            alt={project.title}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <>
            <div className="absolute inset-0 grid-bg opacity-50" />
            <div className="absolute inset-0 starfield opacity-60" />
          </>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        <div className="absolute top-6 left-6">
          <Link
            to="/"
            hash="projekty"
            className="inline-flex items-center gap-2 rounded-full bg-background/70 backdrop-blur px-4 py-2 text-sm font-mono hover:bg-background transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Zpět
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-6 -mt-16 relative">
        <div className="glass rounded-2xl p-8">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 text-primary px-3 py-1 text-xs font-mono">
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              {project.status}
            </span>
            {/* Skip when the status pill already says as much (e.g. "Pod patronací ESA")
                — showing the same phrase twice reads like a mistake, not emphasis. */}
            {project.esa && !/esa/i.test(project.status) && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-cyber px-3 py-1 text-[10px] font-mono font-semibold text-primary-foreground uppercase tracking-wider">
                <Award className="h-3 w-3" /> Pod patronací ESA
              </span>
            )}
          </div>
          <h1 className="mt-5 font-display text-4xl md:text-5xl font-bold">{project.title}</h1>
          <p className="mt-6 text-base md:text-lg text-muted-foreground leading-relaxed whitespace-pre-wrap">
            {project.description}
          </p>
        </div>
      </div>
    </article>
  );
}

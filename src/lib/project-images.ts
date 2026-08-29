// Project cover images are committed files under src/assets/<slug>.<ext> (bundled at build
// time), not a live upload — matched to a project by slugifying its title, e.g. the project
// titled "AirVision" resolves to src/assets/airvision.jpg.
const files = import.meta.glob("/src/assets/*.{png,jpg,jpeg,webp,gif,avif,svg}", {
  eager: true,
  import: "default",
}) as Record<string, string>;

export function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const bySlug: Record<string, string> = {};
for (const [path, url] of Object.entries(files)) {
  const base = path.slice(path.lastIndexOf("/") + 1).replace(/\.[^.]+$/, "");
  bySlug[slugify(base)] = url;
}

export function projectAssetImage(title: string): string | undefined {
  return bySlug[slugify(title)];
}

/** The image to actually render for a project: an explicit override (e.g. a hotlinked URL) wins, otherwise fall back to src/assets/<slug>.<ext>. */
export function resolveProjectImage(project: {
  title: string;
  image?: string;
}): string | undefined {
  return project.image || projectAssetImage(project.title);
}

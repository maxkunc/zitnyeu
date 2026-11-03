const files = import.meta.glob("/src/assets/*.{png,jpg,jpeg,webp,gif,avif,svg}", {
  eager: true,
  import: "default",
});
function slugify(value) {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
const bySlug = {};
for (const [path, url] of Object.entries(files)) {
  const base = path.slice(path.lastIndexOf("/") + 1).replace(/\.[^.]+$/, "");
  bySlug[slugify(base)] = url;
}
function projectAssetImage(title) {
  return bySlug[slugify(title)];
}
function isLoadableImageUrl(value) {
  if (!value) return false;
  // Admin-panel content occasionally ends up with a repo-relative path (e.g.
  // "src/assets/foo.jpg") typed into the override field by mistake -- that's never
  // something a browser can load as-is, so treat it the same as no override at all
  // rather than rendering a broken <img>.
  return /^(https?:\/\/|data:|\/)/.test(value);
}
function resolveProjectImage(project) {
  return (
    (isLoadableImageUrl(project.image) ? project.image : null) || projectAssetImage(project.title)
  );
}
export { projectAssetImage, resolveProjectImage, slugify };

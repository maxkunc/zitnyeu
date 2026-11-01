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
function resolveProjectImage(project) {
  return project.image || projectAssetImage(project.title);
}
export { projectAssetImage, resolveProjectImage, slugify };

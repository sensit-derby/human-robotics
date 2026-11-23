export function sitePath(path: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  return path.startsWith("/") && !path.startsWith("//") ? `${base}${path}` : path;
}

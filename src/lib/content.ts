import { getCollection, type CollectionEntry } from "astro:content";

export type Person = CollectionEntry<"people">;
export type Publication = CollectionEntry<"publications">;
export type Figure = CollectionEntry<"figures">;

// Tag vocabulary (must match the `areas` enum in content.config.ts). A paper may
// carry several — a topic/population, a method/approach, and a publication type.
export type AreaSlug =
  | "human-robot-interaction"
  | "robot-control"
  | "robot-sensing"
  | "3d-computer-vision"
  | "rehabilitation-robotics"
  | "applied-ai"
  | "digital-engineering"
  | "methods"
  | "theory"
  | "review"
  | "letter";

export const AREA_LABELS: Record<AreaSlug, string> = {
  "human-robot-interaction": "Human–robot interaction",
  "robot-control": "Robot control and learning",
  "robot-sensing": "Robot sensing",
  "3d-computer-vision": "3D vision",
  "rehabilitation-robotics": "Rehabilitation robotics",
  "applied-ai": "Applied AI and machine learning",
  "digital-engineering": "Digital twins and systems engineering",
  methods: "Methods & open tools",
  theory: "Theory & modeling",
  review: "Review",
  letter: "Letter / commentary",
};

// Research-page sections, grouped (topics vs. approaches), with blurbs.
export const RESEARCH_GROUPS: {
  title: string;
  showWithoutPublications?: boolean;
  areas: { slug: AreaSlug; blurb: string }[];
}[] = [
  {
    title: "Research topics",
    showWithoutPublications: true,
    areas: [
      { slug: "human-robot-interaction", blurb: "We study how people can guide and work with robots through haptic feedback, teleoperation, and physical interaction." },
      { slug: "robot-sensing", blurb: "We develop tactile sensors, electronic skin, and sensing systems that help robots perceive their surroundings and interactions." },
      { slug: "3d-computer-vision", blurb: "We develop ways to reconstruct and render 3D scenes from images and video, including methods for novel view synthesis and volumetric video." },
      { slug: "rehabilitation-robotics", blurb: "We study assistive devices and robotic rehabilitation, including how muscle signals can help systems respond to a person's intended movement." },
      { slug: "robot-control", blurb: "We explore force control, fault-tolerant control, and methods that let robots learn tasks from experience or demonstrations." },
    ],
  },
  {
    title: "Approaches",
    areas: [
      { slug: "methods", blurb: "Reproducible, open tooling and shared resources that make the lab's work possible." },
      { slug: "theory", blurb: "Conceptual and computational frameworks that tie the lab's empirical work together." },
      { slug: "applied-ai", blurb: "Research on learning from data for engineering, healthcare, and intelligent systems." },
      { slug: "digital-engineering", blurb: "Research on digital twins, engineering decision support, and the governance of shared digital systems." },
    ],
  },
];

// Publications filter chips, grouped (slugs reference AREA_LABELS).
export const FILTER_GROUPS: { title: string; slugs: AreaSlug[] }[] = [
  { title: "Topic", slugs: ["human-robot-interaction", "robot-control", "robot-sensing", "3d-computer-vision", "rehabilitation-robotics"] },
  { title: "Approach", slugs: ["applied-ai", "digital-engineering", "methods", "theory"] },
  { title: "Type", slugs: ["review", "letter"] },
];

/** Research-page groups → each area with its most-recent pubs (capped) + total count. */
export async function getResearchGroups(limit = 4) {
  const pubs = await getPublications();
  return RESEARCH_GROUPS.map((g) => ({
    title: g.title,
    areas: g.areas
      .map((a) => {
        const all = pubs.filter((p) => p.data.areas.includes(a.slug));
        return { slug: a.slug, label: AREA_LABELS[a.slug], blurb: a.blurb, pubs: all.slice(0, limit), total: all.length };
      })
      .filter((a) => g.showWithoutPublications || a.total > 0),
  })).filter((g) => g.areas.length > 0);
}

/** Count of publications per area slug (for filter-chip labels). */
export async function getAreaCounts() {
  const pubs = await getPublications();
  const counts: Partial<Record<AreaSlug, number>> = {};
  for (const p of pubs) for (const a of p.data.areas as AreaSlug[]) counts[a] = (counts[a] || 0) + 1;
  return counts;
}

// Display order of groups within the People page.
export const GROUP_ORDER = [
  "Faculty",
  "Researchers",
  "Staff",
  "Students",
  "Affiliates",
  "Alumni",
] as const;

const byOrder = (a: Person, b: Person) => a.data.order - b.data.order;

/** People grouped and ordered: current groups first, then Alumni. */
export async function getGroupedPeople() {
  const people = await getCollection("people");
  return GROUP_ORDER.map((group) => ({
    group,
    people: people.filter((p) => p.data.group === group).sort(byOrder),
  })).filter((g) => g.people.length > 0);
}

/** Publications newest-first. */
export async function getPublications() {
  const pubs = await getCollection("publications");
  return pubs.sort(
    (a, b) => b.data.year - a.data.year || a.data.title.localeCompare(b.data.title),
  );
}

/** Only rights-confirmed figures may ever be rendered (hard gate). */
export async function getConfirmedFigures() {
  const figs = await getCollection("figures");
  return figs
    .filter((f) => f.data.rightsConfirmed === true)
    .sort((a, b) => a.data.order - b.data.order);
}

/** Rights-confirmed figures grouped by their publication, ordered for display. */
export async function getFiguresByPaper() {
  const figs = await getConfirmedFigures();
  const pubById = new Map((await getCollection("publications")).map((p) => [p.id, p]));
  const groups = new Map<string, { paper: Publication; figures: Figure[]; order: number }>();
  for (const f of figs) {
    const id = f.data.paper.id;
    const paper = pubById.get(id);
    if (!paper) continue;
    if (!groups.has(id)) groups.set(id, { paper, figures: [], order: f.data.order });
    groups.get(id)!.figures.push(f);
  }
  // Order a paper's figures by figure number parsed from the legend (Figure 2,
  // 5, 9, …); a graphical abstract (no number) leads, anything unparsed trails.
  const figNum = (caption: string) => {
    const m = /^\s*fig(?:ure)?\.?\s*(\d+)/i.exec(caption);
    if (m) return Number(m[1]);
    if (/graphical abstract/i.test(caption)) return 0;
    return Number.POSITIVE_INFINITY;
  };
  const arr = [...groups.values()];
  for (const g of arr) g.figures.sort((a, b) => figNum(a.data.caption) - figNum(b.data.caption));
  // Papers chronological, most recent first.
  arr.sort((a, b) => b.paper.data.year - a.paper.data.year || a.order - b.order);
  return arr;
}

// --- author <-> person matching (best-effort, for profile pages) -----------

const normAlpha = (s: string) =>
  s.toLowerCase().normalize("NFKD").replace(/[^a-z]/g, "");

export interface PersonKey {
  initial: string;
  last: string;
}

export function personKey(name: string): PersonKey {
  const base = name.split(",")[0].trim(); // drop trailing credentials
  const toks = base.split(/\s+/);
  return {
    initial: (normAlpha(toks[0])[0] || ""),
    last: normAlpha(toks[toks.length - 1] || ""),
  };
}

/** Does a CV-style author string ("Miller GN", "Ortega-Marquez J") name this person? */
export function authorIsPerson(author: string, pk: PersonKey): boolean {
  if (!pk.last) return false;
  const m = author.trim().match(/^(.*?)\s+([A-Za-z]{1,4})$/);
  const wholeLast = normAlpha(m ? m[1] : author);
  const initials = m ? m[2].toLowerCase() : "";
  const lastOk = wholeLast.includes(pk.last);
  const initialOk = !pk.initial || !initials || initials[0] === pk.initial;
  return lastOk && initialOk;
}

/** Prefer the recorded member IDs for curated publications. */
export function publicationHasMember(pub: Publication, person: Person): boolean {
  if (pub.data.members) return pub.data.members.some(({ id }) => id === person.id);
  const pk = personKey(person.data.name);
  return pub.data.authors.some((author) => authorIsPerson(author, pk));
}

/** Publications authored by a person, preserving the input order. */
export function publicationsForPerson(person: Person, pubs: Publication[]) {
  return pubs.filter((pub) => publicationHasMember(pub, person));
}

/** Build an `isMentee(authorString)` predicate from the people collection. */
export function menteeMatcher(people: Person[]) {
  const students = people
    .filter((person) => person.data.group === "Students")
    .map((person) => personKey(person.data.name));
  return (author: string) => students.some((student) => authorIsPerson(author, student));
}

// Site-wide singletons (identity, contact, social, navigation).
// Kept here rather than in a content collection so layout components can
// import them directly.

export interface NavItem {
  label: string;
  href: string;
}

export interface SiteConfig {
  name: string;
  shortName: string;
  university: string;
  url: string;
  description: string;
  nav: NavItem[];
}

export const site: SiteConfig = {
  name: "Human-Centric Robotics",
  shortName: "HCR",
  university: "University of Derby",
  // Your production URL (used for canonical links + sitemap). Set your domain.
  url: "https://sensit-derby.github.io/human-robotics/",
  description:
    "We study how robots can perceive the world, respond reliably, and work with people. " +
    "Our research spans human–robot interaction, robot control, and 3D computer vision.",
  nav: [
    { label: "People", href: "/people" },
    { label: "Research", href: "/research" },
    { label: "Publications", href: "/publications" },
    { label: "Contact", href: "/contact" },
  ],
};

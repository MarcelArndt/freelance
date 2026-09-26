/**
 * Single Source of Truth für alles, was an mehreren Stellen auftaucht:
 * Kontaktdaten, Profile, Sprungziele und Seiten.
 *
 * Alles, was in mehr als einer Section oder Component vorkommt, gehört
 * hierhin – nicht in die `text.json` daneben. Dort bleibt der Fließtext, der
 * nur zu dieser einen Section gehört.
 */

export const site = {
	owner: "Marcel Arndt",
	email: "info@arndt-marcel.de",
} as const;

/** Fertiger mailto-Link – erspart das `mailto:` an jeder Fundstelle. */
export const mailto = `mailto:${site.email}`;

/**
 * Sprungziele auf der Startseite. Der Wert muss der `id` der jeweiligen
 * Section entsprechen; die Sections setzen dazu `scroll-margin-top`, weil der
 * Header fixiert darüber liegt.
 */
export const anchors = {
	preise: "#preise",
	faq: "#faq",
	kontakt: "#kontakt",
} as const;

/**
 * Eigene Seiten. Alles, was noch auf "#" steht, existiert noch nicht –
 * beim Anlegen reicht dann die Änderung an dieser einen Stelle.
 */
export const pages = {
	leistungen: "#offer",
	whyMe: "#whyMe",
	impressum: "#",
	datenschutz: "#",
} as const;

/** Profile für die `SocialMediaComponent`. */
export const socials = [
	{ label: "E-Mail", href: mailto, icon: "/assets/logo/social-media/email.svg" },
	{ label: "GitHub", href: "#", icon: "/assets/logo/social-media/github.svg" },
	{ label: "LinkedIn", href: "#", icon: "/assets/logo/social-media/linkedin.svg" },
];

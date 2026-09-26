export interface InViewOptions {
	/** Wie viel vom Element sichtbar sein muss (0–1), bevor ausgelöst wird. */
	threshold?: number;
	/** Verschiebt den Auslösebereich, z.B. um erst kurz nach dem Rand zu starten. */
	rootMargin?: string;
	/** true = Animation läuft jedes Mal neu, wenn das Element den Viewport verlässt. */
	repeat?: boolean;
}

/**
 * Ruft `onEnter` auf, sobald ein Element in den Viewport scrollt.
 * Ersetzt die reinen CSS-Scroll-Animationen (animation-timeline: view()),
 * die aktuell nur Chromium unterstützt.
 *
 * Ohne IntersectionObserver-Support werden alle Elemente sofort ausgelöst,
 * damit nie ein leerer Balken oder Ring stehen bleibt.
 */
export function observeInView(
	elements: ArrayLike<Element>,
	onEnter: (element: Element) => void,
	onLeave?: (element: Element) => void,
	{ threshold = 0.35, rootMargin = "0px 0px -10% 0px", repeat = false }: InViewOptions = {},
) {
	const targets = Array.from(elements);
	if (!targets.length) return;

	if (typeof IntersectionObserver === "undefined") {
		targets.forEach(onEnter);
		return;
	}

	const observer = new IntersectionObserver(
		(entries) => {
			for (const entry of entries) {
				if (entry.isIntersecting) {
					onEnter(entry.target);
					if (!repeat) observer.unobserve(entry.target);
				} else if (repeat) {
					onLeave?.(entry.target);
				}
			}
		},
		{ threshold, rootMargin },
	);

	targets.forEach((element) => observer.observe(element));
	return observer;
}

/**
 * Führt `callback` erst nach dem nächsten gerenderten Frame aus.
 * Nötig, damit Elemente, die beim Laden schon im Viewport liegen, ihren
 * leeren Startzustand einmal rendern – sonst springt die Transition
 * direkt auf den Endwert und man sieht keine Animation.
 */
export function nextFrame(callback: () => void) {
	requestAnimationFrame(() => requestAnimationFrame(callback));
}

/** Liest ein numerisches data-Attribut mit Fallback. */
export function readNumber(element: Element, attribute: string, fallback = 0) {
	const value = Number(element.getAttribute(attribute));
	return Number.isFinite(value) ? value : fallback;
}
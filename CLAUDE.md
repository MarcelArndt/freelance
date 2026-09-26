# Freelancer-Website (Astro)

Statische Astro-Seite, deutschsprachig (`<html lang="de">`). Kein UI-Framework, kein Tailwind,
keine Content Collections. Genau zwei Dependencies: `astro` und `gsap`.

Code-Kommentare und Texte sind auf Deutsch. Eingerückt wird mit **Tabs**.

## Development

Dev-Server immer im Hintergrund starten:

```
astro dev --background
```

Verwalten mit `astro dev stop`, `astro dev status`, `astro dev logs`.

Sieht die Seite nach Umbauten an `.astro`-Dateien kaputt aus (altes CSS, Styles fehlen):
**zuerst den Dev-Server neu starten**, bevor der Fehler im Code gesucht wird.

`astro check` braucht `@astrojs/check` und fragt interaktiv nach der Installation – nicht
aufrufen. Zum Verifizieren stattdessen `astro build` nutzen.

## Projektstruktur

| Pfad | Inhalt |
|---|---|
| `src/pages/index.astro` | Einzige Seite. Setzt nur `BaseLayout` + die Sections in Reihenfolge zusammen. |
| `src/layouts/BaseLayout.astro` | `<head>`, globale CSS-Imports, Header, Toaster, Slot. |
| `src/sections/<name>-section/` | Je Section ein Ordner mit `<Name>Section.astro` + `text.json`. |
| `src/components/` | Wiederverwendbare Bausteine, `PascalCaseComponent.astro`. |
| `src/styles/` | `variables.css` (Tokens), `styles.css` (globale Klassen), `fonts.css`. |
| `src/lib/gsap.ts` | GSAP-Einstieg. |
| `src/lib/site.ts` | **Single Source of Truth** für E-Mail, Profile, Sprungziele und Seiten. |
| `src/utils/scripts/` | `inView.ts`, `toaster.ts`, `validation.ts` (Formular-Prüfung). |
| `public/assets/svgs/<thema>/` | Icons, thematisch gruppiert (z.B. `what-i-build/`). |
| `public/images/`, `public/fonts/`, `public/logo/` | Statische Assets. |
| `screens/` | Design-Vorlagen als JPG, benannt wie die Section (`what-i-build-for-you.jpg`). |

**Screenshots aus `screens/` sind die Layout-Vorgabe.** Wird auf so einen Screen verwiesen,
zuerst lesen, dann bauen – Icons und Texte weichen dabei bewusst ab.

## Sections

Aufbau jeder Section:

```astro
---
import content from "./text.json";

export interface Props { title?: string; }
const { title = content.title }: Props = Astro.props;
---

<section class="build bg-grey">
	<div class="inner-content-wrapper">
		<div class="build__content">…</div>
	</div>
</section>
```

- **Alle Texte liegen in `text.json`** neben der Section, nie hartcodiert im Markup.
  Props überschreiben die Defaults aus der JSON.
- **Was mehrfach vorkommt, gehört nicht in die `text.json`, sondern in `src/lib/site.ts`:**
  E-Mail-Adresse, Social-Profile, Sprungziele (`#preise`, `#faq`, `#kontakt`) und
  Seiten wie Impressum oder Datenschutz. In der JSON bleibt nur der Fließtext dieser
  einen Section. Noch nicht existierende Ziele stehen dort als `"#"` – beim Anlegen
  ändert sich dann genau eine Zeile.
- Jede Section mit `id` braucht `scroll-margin-top: var(--header-height)`, weil der
  Header fixiert darüber liegt.
- `.inner-content-wrapper` (global) begrenzt auf `--inner-content-width` und zentriert.
- Klassen BEM-artig mit dem Section-Kürzel als Präfix: `.build__title`, `.card--dark`.
- Neue Section anlegen → in `src/pages/index.astro` einhängen.

## Components

Vor dem Anlegen neuer Components **immer erst `src/components/` durchsehen** – vieles ist da,
manches liegt als **leere Platzhalter-Datei** bereit und soll gefüllt statt neu erstellt werden.

Vorhanden und nutzbar: `CardComponent` (Icon/Titel/Text/Link, `variant="light"|"dark"`, `hover`),
`GridCardComponent` (responsives Karten-Grid), `IconsComponent`, `ParagrafComponent`,
`LoadingBarComponent`, `ScoreRingComponent`, `SliderComponent`, `RampCurtainComponent`,
`CurtainComponent`, `HeaderComponent`, `NavigationComponent`, `LogoComponent`,
`SocialMediaComponent`.

Noch leer (Platzhalter): `InputComponent`, `Form-Component`, `ToasterComponent`,
`Footer-Component`.

Konventionen:

- `export interface Props` mit Defaults beim Destructuring, optionales `class?: string`
  wird per `class:list` durchgereicht.
- Konfiguration läuft über **CSS-Custom-Properties in einem inline zusammengebauten
  `varStyle`-String**, nicht über `define:vars` – das funktioniert bei dynamischen Tags
  (`<Tag>`) nicht.
- `IconsComponent` liest das SVG zur Buildzeit aus `public/`, entfernt `width`/`height` und
  färbt über `fill: currentColor`. Farbe also am Elternelement per `color` setzen.

## Styling

- `variables.css`: Farben (`--accent`, `--ink-1…6`, `--bg-*`), Schriftgrößen (`--h1…--h5`,
  `--p-xs…--p-xl`), Breiten (`--max-page-width`, `--inner-content-width`), Button-Tokens.
  Neue projektweite Werte gehören hierhin, nicht in die Section.
- `styles.css`: globale Bausteine und Utilities – `.inner-content-wrapper`, `.subline`,
  `.btn` / `.ghost`, `.greybox`, `.split-box`, `.box-flex`, `.bg-grey`, `.text-gradient`.
  Buttons sind global gestylt, es gibt bewusst keine Button-Component.
- Schriften über `var(--font)`, `var(--headline)`, `var(--meta)`.
- **Hover-Konvention:** 3px nach oben, `transition … 0.25s ease-in-out` – so wie die Buttons.
- Section-Styles bleiben scoped im `<style>`-Block. Klassen, die an ein Child-Component
  gereicht werden, brauchen `:global()`, weil das Element die Scope-ID des Childs trägt
  und nicht die der Section: `.build :global(.build__cards) { … }`.

## Animationen (GSAP)

Import immer über `src/lip/gsap.ts` – dort ist ScrollTrigger schon registriert.

- Startzustände von Intro-Animationen hängen an `html.js` im scoped CSS, damit ohne
  JavaScript nichts unsichtbar bleibt. Das Animations-Script setzt danach
  `document.documentElement.setAttribute("data-animations-ready", "")`; das `BaseLayout`
  hebt die Startzustände sonst nach 4s selbst auf.
- `prefers-reduced-motion: reduce` in jeder Animation abfangen.
- **GSAP und CSS-Hover auf demselben Element vertragen sich nicht.** Animiert GSAP einen
  Transform, schreibt es ein inline `transform` und setzt `translate`/`scale`/`rotate` auf
  `none` – ein CSS-Hover mit `transform` ist damit tot. Lösung: am Ende per
  `onComplete: () => gsap.set(el, { clearProps: "transform,opacity" })` ans CSS zurückgeben
  (räumt auch das `translate: none` weg) und den Hover über die eigenständige
  `translate`-Property fahren, damit `transform` nicht in der `transition` steht.
- **Bei `scrub` zählen nur Verhältnisse**, nicht Sekunden: die Timeline-Länge wird auf die
  Scrollstrecke gestreckt. `stagger` deutlich kleiner als `duration` halten, `ease: "none"`,
  und mit einem leeren Tween am Ende (`tl.to({}, { duration: 0.75 })`) puffern, damit die
  letzte Karte nicht erst am letzten Pixel fertig ist.
- Für einfache Reveals ohne GSAP gibt es `observeInView()` aus `src/utils/scripts/inView.ts`.

## Offene Punkte (`TODO.md`)

Im Root liegt `TODO.md`. Dort wird festgehalten, was beim Bauen bewusst offen bleibt
oder nebenbei auffällt – **immer mitpflegen, ohne dass extra danach gefragt wird.**

Hinein gehören:

- Platzhalter, die noch echte Werte brauchen: fehlende Endpunkte, `href="#"`,
  Blindtexte, nicht existierende Seiten.
- Was für den nächsten Schritt fehlt, aber nicht Teil des Auftrags war
  (Spam-Schutz, leere Platzhalter-Components, fehlende Sprungziele).
- Widersprüche, die beim Bauen auffallen – z.B. dieselbe Angabe an zwei Stellen
  unterschiedlich.

Je Eintrag: kurz was fehlt, warum, und **wo es einzufügen ist** – mit Datei und
Zeile (`ContactSection.astro:46`). Sortiert nach Section, erledigte Punkte werden
gelöscht statt abgehakt. Am Ende der Antwort kurz nennen, was neu dazugekommen ist.

## Dokumentation

Vollständige Doku: https://docs.astro.build

- [Seiten, dynamische Routen, Middleware](https://docs.astro.build/en/guides/routing/)
- [Astro-Components](https://docs.astro.build/en/basics/astro-components/)
- [Styles](https://docs.astro.build/en/guides/styling/)
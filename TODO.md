# Offene Punkte

## Zentrale Quelle (`src/lib/site.ts`)

Alles, was mehrfach vorkommt, steht dort: E-Mail, Profile, Sprungziele, Seiten.
Diese Werte warten noch auf echte Ziele – jeweils **eine** Zeile in
`src/lib/site.ts`, nicht mehr an mehreren Stellen:

- `socials`: GitHub und LinkedIn stehen auf `"#"` – echte Profil-URLs eintragen.
- `pages.leistungen`, `pages.projekte`: es gibt weder Seite noch Section dazu.
  Entweder Sections mit `id` ergänzen (dann `anchors` statt `pages`) oder Seiten
  unter `src/pages/` anlegen.
- `pages.impressum`, `pages.datenschutz`: Seiten fehlen. Ohne Datenschutzseite
  zeigt die Zustimmung im Kontaktformular ins Leere — rechtlich der dringendste
  Punkt dieser Liste.

## Pakete-Section

### Preise und Leistungen sind aus dem Screen übernommen

`src/sections/pakete-section/text.json` enthält 1.500 € / 3.500 € / 640 € pro Tag
und die Leistungslisten aus der Vorlage. Das sind verbindliche Aussagen —
vor dem Livegang prüfen, ebenso die Fußnote zu MwSt. und Hosting-Kosten.

## FAQ-Section

### 1. Antworten sind von mir geschrieben

Die fünf Fragen stammen aus dem Screen, die Antworten in
`src/sections/faq-section/text.json` habe ich formuliert. Preisangaben
(„0 bis 10 € Hosting"), Projektdauern und die Aussage zum CMS bitte
gegenlesen — das sind Zusagen an Kunden.

### 2. Strukturierte Daten fehlen

Für eine FAQ lohnt sich `FAQPage`-Markup (schema.org), damit die Fragen in
der Google-Suche auftauchen können.

**Einzufügen:** `<script type="application/ld+json">` in `FaqSection.astro`,
gefüllt aus derselben `items`-Liste wie das Accordion.

## Kontakt-Section

### 1. Versand-Anbindung fehlt

Aktuell verschickt das Formular nichts. Ohne `action` wartet `send()` nur kurz,
loggt die Daten in die Konsole und meldet Erfolg
(`src/components/Form-Component.astro:104`). Der `fetch`-Zweig darunter
ist fertig und läuft los, sobald ein Endpunkt gesetzt ist.

**Einzufügen:** in `src/sections/contact-section/ContactSection.astro` am
`<FormComponent … />` ein `action="https://…"` ergänzen. Erwartet wird ein
POST mit `FormData` (Felder `name`, `email`, `message`, `privacy`) und ein
Status < 400 als Erfolg – passt so zu Formspree, Basin oder einer eigenen
Route.

Danach zu prüfen:

- Spam-Schutz (Honeypot-Feld oder Captcha) – noch gar nicht vorhanden.
- Wohin die Mail geht und ob der Absender eine Bestätigung bekommt.

### 2. Rückmeldung nach dem Absenden

Erfolg und Fehler landen aktuell als Textzeile unter dem Button
(`.form__status`). Der Toaster wäre der passendere Ort, aber
`src/components/ToasterComponent.astro` ist noch leer – `toaster.ts` erwartet
die Attribute `[toaster-wrapper]`, `[toaster-content-wrapper]`,
`[toaster-text-wrapper]`, `[toaster-close-button]` und die Icon-Attribute.

**Einzufügen:** wenn die Component steht, in
`src/components/Form-Component.astro` `setStatus()` durch `setToaster()`
ersetzen.

## Hero-Section

### 1. „< 50 kB JavaScript" ist knapp

`src/sections/hero-section/text.json` (`stats`) verspricht „< 50 kB JavaScript im
Standardfall". Gemessener Stand (`astro build`, Summe aus `dist/_astro/*.js` plus
den inline in die HTML gebackenen Skripten): **121,5 kB roh, 48,9 kB gzip,
43,7 kB brotli** – die Aussage stimmt, aber mit nur ~5 kB Puffer.

Davon sind 38,6 kB brotli allein GSAP (`gsap.8V_bJGvz.js` über `src/lib/gsap.ts`),
der eigene Code liegt bei ~5 kB. **Jedes zusätzliche GSAP-Plugin (Flip, Draggable,
SplitText) reißt die Grenze.** Vor dem Livegang und nach jedem neuen Plugin
nachmessen; sonst entweder den Wert im `stats`-Eintrag anheben oder GSAP durch
Web Animations API + `observeInView()` (`src/utils/scripts/inView.ts`) ersetzen.

### 2. Die beiden Buttons haben kein Ziel

`HeroSection.astro:195` rendert zweimal „Projekt anfragen" als `<button>` ohne
Verhalten. Die Navigation und die Paketkarten springen inzwischen auf
`#kontakt`.

**Einzufügen:** entweder `<a class="btn" href={anchors.kontakt}>` daraus machen
(Ziel aus `src/lib/site.ts`) oder den zweiten Button mit einem eigenen Text
belegen – aktuell steht dort zweimal derselbe.

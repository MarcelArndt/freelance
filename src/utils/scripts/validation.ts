/**
 * Kleine Validierungs-Hilfsklasse für Formulare ohne Framework.
 *
 * Die Regeln stehen als data-Attribute am Feld, nicht im Script:
 *
 *   <input data-validate="required email" />
 *   <textarea data-validate="required minLength" data-min-length="20" />
 *   <input type="checkbox" data-validate="checked" />
 *
 * Zustand schreibt die Klasse an den umgebenden `[data-field]`-Container
 * (`data-state="valid" | "invalid"`). Die Farbe des Unterstrichs hängt im CSS
 * daran – so weiß das Script nichts über Optik und die Components nichts über
 * die Prüflogik.
 */

export type ValidationRule = "required" | "email" | "minLength" | "maxLength" | "checked";

export interface ValidatorOptions {
	/** Läuft nach jeder Prüfung mit dem Gesamtstatus des Formulars. */
	onChange?: (isValid: boolean) => void;
}

type Control = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

/** Bewusst locker: verlangt nur Name, @, Domain mit Punkt und Endung. */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;

const MESSAGES: Record<ValidationRule, string> = {
	required: "Bitte ausfüllen.",
	email: "Bitte eine gültige E-Mail-Adresse angeben.",
	minLength: "Bitte mindestens {min} Zeichen schreiben.",
	maxLength: "Bitte höchstens {max} Zeichen schreiben.",
	checked: "Bitte bestätigen.",
};

export class FormValidator {
	private form: HTMLFormElement;
	private options: ValidatorOptions;
	private controls: Control[] = [];
	/** Felder, die einmal verlassen wurden – erst dann darf rot erscheinen. */
	private touched = new WeakSet<Control>();

	constructor(form: HTMLFormElement, options: ValidatorOptions = {}) {
		this.form = form;
		this.options = options;
	}

	/** Hängt die Listener an und meldet den Startzustand zurück. */
	init() {
		this.controls = Array.from(this.form.querySelectorAll<Control>("[data-validate]"));

		this.controls.forEach((control) => {
			// Checkboxen haben kein sinnvolles "tippen" – bei ihnen zählt
			// direkt das change-Event als Berührung.
			const isCheckbox = control instanceof HTMLInputElement && control.type === "checkbox";

			control.addEventListener(isCheckbox ? "change" : "input", () => {
				if (isCheckbox) this.touched.add(control);
				this.check(control);
			});

			control.addEventListener("blur", () => {
				this.touched.add(control);
				this.check(control);
			});
		});

		this.options.onChange?.(this.isValid());
		return this;
	}

	/** Stiller Gesamtcheck – schreibt nichts ins Markup. */
	isValid() {
		return this.controls.every((control) => this.getError(control) === null);
	}

	/** Prüft alle Felder und markiert sie sichtbar. Für den Submit gedacht. */
	validateAll() {
		this.controls.forEach((control) => {
			this.touched.add(control);
			this.check(control);
		});
		return this.isValid();
	}

	/** Setzt Zustände und Fehlertexte zurück, z.B. nach erfolgreichem Versand. */
	reset() {
		this.touched = new WeakSet<Control>();
		this.controls.forEach((control) => {
			this.paint(control, "", "");
		});
		this.options.onChange?.(this.isValid());
	}

	/** Erstes fehlerhaftes Feld – praktisch, um dorthin zu springen. */
	firstInvalid() {
		return this.controls.find((control) => this.getError(control) !== null) ?? null;
	}

	/**
	 * Prüft ein einzelnes Feld und schreibt den Zustand ins Markup.
	 * Rot gibt es erst nach der ersten Berührung, grün sofort – sonst
	 * schimpft das Formular schon beim ersten Buchstaben.
	 */
	private check(control: Control) {
		const error = this.getError(control);
		const isEmpty = this.getValue(control).length === 0;
		const wasTouched = this.touched.has(control);

		if (error) {
			this.paint(control, wasTouched ? "invalid" : "", wasTouched ? error : "");
		} else {
			// Ein leeres, optionales Feld ist gültig, aber nicht "richtig
			// ausgefüllt" – das bleibt neutral.
			this.paint(control, isEmpty ? "" : "valid", "");
		}

		this.options.onChange?.(this.isValid());
	}

	/** Gibt die erste verletzte Regel als Meldung zurück, sonst null. */
	private getError(control: Control): string | null {
		const rules = this.getRules(control);
		const value = this.getValue(control);
		const isChecked = control instanceof HTMLInputElement && control.checked;

		for (const rule of rules) {
			switch (rule) {
				case "required":
					if (!value) return this.message(control, rule);
					break;
				case "checked":
					if (!isChecked) return this.message(control, rule);
					break;
				case "email":
					// Ohne "required" darf das Feld leer bleiben – geprüft wird
					// nur, was auch drinsteht.
					if (value && !EMAIL_PATTERN.test(value)) return this.message(control, rule);
					break;
				case "minLength": {
					const min = Number(control.getAttribute("data-min-length") ?? 0);
					if (value && value.length < min) {
						return this.message(control, rule).replace("{min}", String(min));
					}
					break;
				}
				case "maxLength": {
					const max = Number(control.getAttribute("data-max-length") ?? 0);
					if (max && value.length > max) {
						return this.message(control, rule).replace("{max}", String(max));
					}
					break;
				}
			}
		}

		return null;
	}

	private getRules(control: Control): ValidationRule[] {
		return (control.getAttribute("data-validate") ?? "")
			.split(/\s+/)
			.filter(Boolean) as ValidationRule[];
	}

	private getValue(control: Control) {
		return control.value.trim();
	}

	/** `data-message-email="…"` überschreibt den Standardtext einer Regel. */
	private message(control: Control, rule: ValidationRule) {
		return control.getAttribute(`data-message-${rule.toLowerCase()}`) ?? MESSAGES[rule];
	}

	/** Schreibt Zustand und Fehlertext an den `[data-field]`-Container. */
	private paint(control: Control, state: "valid" | "invalid" | "", message: string) {
		const field = control.closest<HTMLElement>("[data-field]");
		if (!field) return;

		if (state) {
			field.setAttribute("data-state", state);
		} else {
			field.removeAttribute("data-state");
		}

		control.setAttribute("aria-invalid", state === "invalid" ? "true" : "false");

		const errorBox = field.querySelector<HTMLElement>("[data-field-error]");
		if (errorBox) errorBox.textContent = message;
	}
}

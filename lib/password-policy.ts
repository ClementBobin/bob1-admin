/**
 * Password rules for the public password-reset page. They mirror the API's PasswordPolicy (Bob1.Modules.Identity), which stays
 * the authority: it also knows the whole email and last name, and refuses reusing the current password.
 */
export const PASSWORD_MIN = 12;
export const PASSWORD_MAX = 128;

// A password containing one of these is guessed in seconds, whatever else it contains.
const COMMON_WORDS = ["password", "motdepasse", "azerty", "qwerty", "123456", "000000", "admin", "welcome", "bienvenue", "bob1", "basket"];

export type PasswordRule = { id: string; label: string; ok: boolean };

/** `personal`: words that must not appear in the password (first name...). Pieces under 3 characters are ignored, as on the API. */
export function passwordRules(password: string, personal: string[] = []): PasswordRule[] {
  const lower = password.toLowerCase();
  const forbidden = personal.flatMap((word) => word.split(/[^\p{L}\p{N}]+/u)).filter((part) => part.length >= 3);
  return [
    { id: "length", label: `Entre ${PASSWORD_MIN} et ${PASSWORD_MAX} caractères`, ok: password.length >= PASSWORD_MIN && password.length <= PASSWORD_MAX },
    { id: "lower", label: "Une lettre minuscule", ok: /\p{Ll}/u.test(password) },
    { id: "upper", label: "Une lettre majuscule", ok: /\p{Lu}/u.test(password) },
    { id: "digit", label: "Un chiffre", ok: /\p{Nd}/u.test(password) },
    { id: "symbol", label: "Un caractère spécial (! - _ ? # espace…)", ok: /[^\p{L}\p{Nd}]/u.test(password) },
    { id: "repeat", label: "Pas de caractère répété 4 fois de suite", ok: !/(.)\1{3,}/u.test(password) },
    { id: "common", label: "Aucun mot trop courant (password, azerty, 123456, basket…)", ok: !COMMON_WORDS.some((word) => lower.includes(word)) },
    ...(forbidden.length > 0
      ? [{ id: "personal", label: "Ne contient pas votre prénom", ok: !forbidden.some((part) => lower.includes(part.toLowerCase())) }]
      : []),
  ];
}

/** What the API answers when it refuses a password (problem code -> message for the person). */
export const PASSWORD_API_MESSAGES: Record<string, string> = {
  "password.too_short": `Le mot de passe doit contenir au moins ${PASSWORD_MIN} caractères.`,
  "password.too_long": `Le mot de passe ne doit pas dépasser ${PASSWORD_MAX} caractères.`,
  "password.no_lower": "Le mot de passe doit contenir une lettre minuscule.",
  "password.no_upper": "Le mot de passe doit contenir une lettre majuscule.",
  "password.no_digit": "Le mot de passe doit contenir un chiffre.",
  "password.no_symbol": "Le mot de passe doit contenir un caractère spécial.",
  "password.repeated": "Le mot de passe ne doit pas répéter 4 fois le même caractère de suite.",
  "password.common": "Le mot de passe contient un mot trop courant. Choisissez-en un moins prévisible.",
  "password.personal": "Le mot de passe ne doit contenir ni votre nom, ni votre prénom, ni votre adresse e-mail.",
  "password.same_as_current": "Le nouveau mot de passe doit être différent de l'actuel.",
};

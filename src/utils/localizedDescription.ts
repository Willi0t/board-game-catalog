import en from '../data/descriptions/en.json';
import sv from '../data/descriptions/sv.json';
import fr from '../data/descriptions/fr.json';
import de from '../data/descriptions/de.json';
import es from '../data/descriptions/es.json';
import type { Language } from '../i18n/translations';
import type { Game } from '../types/game';

const descriptions: Partial<
  Record<Language, Readonly<Record<string, string>>>
> = {
  en,
  sv,
  fr,
  de,
  es,
};

export default function localizedDescription(
  game: Game,
  language: Language,
  presentation: 'summary' | 'mobile' | 'full',
) {
  const original =
    presentation === 'summary'
      ? game.description
      : game.longDescription || game.description;
  // A long description is a separate source text and needs its own translation.
  const english =
    original === game.description ? descriptions.en?.[game.id] : undefined;
  const translation =
    original === game.description
      ? descriptions[language]?.[game.id]
      : undefined;
  return translation?.trim()
    ? { text: translation, language }
    : {
        text: english ?? original,
        language: english ? 'en' : (game.descriptionLanguage ?? 'sv'),
      };
}

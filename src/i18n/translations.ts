import * as sv from './sv';
import * as en from './en';
import * as fr from './fr';
import * as de from './de';
import * as es from './es';

export const languageNames = {
  sv: 'Svenska',
  en: 'English',
  fr: 'Français',
  de: 'Deutsch',
  es: 'Español',
};
export type Language = keyof typeof languageNames;
export type Message = keyof typeof sv.messages;
type Tag = keyof typeof sv.tags;
type Locale = { messages: Record<Message, string>; tags: Record<Tag, string> };
const locales: Record<Language, Locale> = { sv, en, fr, de, es };

export function isLanguage(value: string | null): value is Language {
  return value !== null && Object.hasOwn(languageNames, value);
}

export type Translate = (
  key: Message,
  ...values: (string | number | null)[]
) => string;
export type TranslateTag = (tag: string) => string;

export function getTranslations(language: Language) {
  const { messages, tags } = locales[language];
  const tagLabels: Readonly<Partial<Record<string, string>>> = tags;
  const t: Translate = (key, ...values) =>
    messages[key].replace(/\{(\d+)\}/g, (match, index) => {
      const value = values[Number(index)];
      return value === undefined ? match : String(value ?? '');
    });
  const tagLabel: TranslateTag = (tag) =>
    Object.hasOwn(tagLabels, tag) ? (tagLabels[tag] ?? tag) : tag;
  return { t, tagLabel };
}

export const swedish = getTranslations('sv');

// Search also accepts translated tags from any language, so a saved query
// keeps matching the same titles after a language switch.
const searchLabels = new Map(
  (Object.keys(sv.tags) as Tag[]).map((tag) => [
    tag,
    [...new Set(Object.values(locales).map(({ tags }) => tags[tag]))].join(' '),
  ]),
);
export const tagSearchText = (tag: string) =>
  searchLabels.get(tag as Tag) ?? '';

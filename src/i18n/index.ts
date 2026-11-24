import de from './de.json'
import en from './en.json'
export type Lang = 'de' | 'en'
type Dict = Record<string, string>
// One language file per language. To add a language: create the JSON file and register it here.
const languages: Record<Lang, Dict> = { de: de as Dict, en: en as Dict }
const STORAGE_KEY = 'skyjitter.lang'
function detectDefault(): Lang {
  const browser = (navigator.language || 'en').slice(0, 2).toLowerCase()
  return browser === 'de' ? 'de' : 'en'
}
let current: Lang = (localStorage.getItem(STORAGE_KEY) as Lang | null) ?? detectDefault()
// t('levelStart', { level: 3 }) replaces {level} placeholders
export function t(key: string, params: Record<string, string | number> = {}): string {
  let text = languages[current][key] ?? languages.en[key] ?? key
  for (const [k, v] of Object.entries(params)) {
    text = text.replace(`{${k}}`, String(v))
  }
  return text
}
export function getLanguage(): Lang {
  return current
}
export function setLanguage(lang: Lang): void {
  current = lang
  localStorage.setItem(STORAGE_KEY, lang)
}
export function availableLanguages(): Lang[] {
  return Object.keys(languages) as Lang[]
}

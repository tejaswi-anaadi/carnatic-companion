// Language context + translation helpers for English / Sanskrit (Devanagari).
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { GOVINDA_NAMES, DIKSHITAR_NAMES, CHAKRAS } from './melakartha.js'
import { SWARA_LABEL } from './swaras.js'
import * as DEV from './devanagari.js'

const LanguageCtx = createContext({
  lang: 'en',
  setLang: () => {},
  hasDevanagari: false,
})

const STORAGE_KEY = 'cc.lang'

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    if (typeof window === 'undefined') return 'en'
    return window.localStorage.getItem(STORAGE_KEY) || 'en'
  })
  const setLang = useCallback((l) => {
    setLangState(l)
    try { window.localStorage.setItem(STORAGE_KEY, l) } catch {}
  }, [])
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang === 'sa' ? 'sa' : 'en'
    }
  }, [lang])

  const value = useMemo(() => ({
    lang, setLang, hasDevanagari: true,
  }), [lang, setLang])

  return <LanguageCtx.Provider value={value}>{children}</LanguageCtx.Provider>
}

export function useLanguage() {
  return useContext(LanguageCtx)
}

// Convenience hook: returns translator functions bound to the current lang.
// Each function falls back to English when Devanagari is unavailable.
export function useT() {
  const { lang } = useLanguage()
  return useMemo(() => {
    const useDev = lang === 'sa'
    return {
      lang,
      govinda: (n) => (useDev && DEV.GOVINDA_DEVANAGARI?.[n - 1]) || GOVINDA_NAMES[n - 1],
      dikshitar: (n, fallback) => {
        if (useDev && DEV.DIKSHITAR_DEVANAGARI?.[n - 1]) return DEV.DIKSHITAR_DEVANAGARI[n - 1]
        return fallback ?? DIKSHITAR_NAMES[n - 1]
      },
      chakra: (i) => (useDev && DEV.CHAKRA_DEVANAGARI?.[i]) || CHAKRAS[i].name,
      talaFamily: (name) => (useDev && DEV.TALA_FAMILIES_DEVANAGARI?.[name]) || name,
      jathi: (name) => (useDev && DEV.JATHI_DEVANAGARI?.[name]) || name,
      nadai: (name) => (useDev && DEV.NADAI_DEVANAGARI?.[name]) || name,
      anga: (type) => {
        const en = { U: 'Anudrutam', O: 'Drutam', I: 'Laghu' }[type]
        return (useDev && DEV.ANGA_DEVANAGARI?.[en]) || en
      },
      swara: (s) => {
        if (useDev && DEV.SWARA_DEVANAGARI?.[s]) return DEV.SWARA_DEVANAGARI[s]
        return SWARA_LABEL[s] ?? s
      },
      composer: (name) => (useDev && DEV.COMPOSERS_DEVANAGARI?.[name]) || name,
      town: (name) => (useDev && DEV.TOWNS_DEVANAGARI?.[name]) || name,
      temple: (name) => (useDev && DEV.TEMPLES_DEVANAGARI?.[name]) || name,
      term: (key) => (useDev && DEV.TERMS_DEVANAGARI?.[key]) || key,
    }
  }, [lang])
}

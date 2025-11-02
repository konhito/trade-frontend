'use client'

import React from 'react'

// Simple i18n stub - internationalization removed for Edge compatibility
export function useI18n() {
  return (key: string, params?: any) => {
    // Return the key as-is since we don't have translations
    return key
  }
}

export function useCurrentLocale() {
  return 'en'
}

export function useChangeLocale() {
  return () => {}
}

export function I18nProviderClient({ children }: { children: React.ReactNode }) {
  return React.createElement(React.Fragment, null, children)
}

// Server-side stub
export function getCurrentLocale() {
  return 'en'
}

export function getI18n() {
  return (key: string, params?: any) => key
}

export function getScopedI18n() {
  return (key: string, params?: any) => key
}

export function getStaticParams() {
  return [{ locale: 'en' }]
}

// Stub i18n implementation - removed next-international for Edge compatibility
export const useI18n = () => {
  return (key: string, params?: any) => key
}

export const useScopedI18n = () => {
  return (key: string, params?: any) => key
}

export const useCurrentLocale = () => 'en'

export const useChangeLocale = () => () => {}

export const I18nProviderClient = ({ children }: { children: React.ReactNode }) => children

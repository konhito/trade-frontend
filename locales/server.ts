// Stub i18n server implementation - removed next-international for Edge compatibility
export const getI18n = () => {
  return (key: string, params?: any) => key
}

export const getScopedI18n = () => {
  return (key: string, params?: any) => key
}

export const getStaticParams = () => [{ locale: 'en' }, { locale: 'fr' }]

export const getCurrentLocale = () => 'en'

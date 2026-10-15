import { Trans, useTranslation } from 'react-i18next'

export function Login() {
  const { t } = useTranslation('auth')
  return (
    <form>
      <h1>{t('login.title')}</h1>
      <button>{t('login.submit', { user: 'x' })}</button>
      <button>{t('common:save')}</button>
      <Trans i18nKey="common:cancel" />
    </form>
  )
}

export function Cart({ count }: { count: number }) {
  const { t } = useTranslation()
  return <p>{t('common:item', { count })}</p>
}

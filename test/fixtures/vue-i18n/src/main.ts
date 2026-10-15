import { createI18n } from 'vue-i18n'

export const i18n = createI18n({ legacy: false })
// x18n-disable-next-line
i18n.global.t('ignored.key')

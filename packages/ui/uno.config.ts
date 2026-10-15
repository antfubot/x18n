import { presetAnthonyDesign } from '@antfu/design/unocss'
import { defineConfig, presetIcons, presetWind4 } from 'unocss'

export default defineConfig({
  presets: [
    presetAnthonyDesign({ primary: '#2f7bb8' }),
    presetWind4(),
    presetIcons({ scale: 1.1 }),
  ],
  preflights: [{
    getCSS: () => [
      'html,body,#__nuxt{height:100%;margin:0}',
      'html.dark{color-scheme:dark}',
      // VS Code high contrast themes: black surface, solid borders.
      'html.high-contrast #__nuxt>div{background:#000;color:#fff}',
      'html.high-contrast *{border-color:#fffa!important}',
    ].join(''),
  }],
  shortcuts: {
    'z-grid-head': 'z-[20]',
    'input-base': 'rounded border border-base bg-transparent px2 py1 outline-none focus:border-active',
  },
})

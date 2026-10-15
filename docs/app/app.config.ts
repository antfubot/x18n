export default defineAppConfig({
  header: {
    title: 'x18n',
    links: [
      {
        'icon': 'i-simple-icons-github',
        'to': 'https://github.com/antfu/x18n',
        'target': '_blank',
        'aria-label': 'x18n on GitHub',
      },
    ],
  },

  github: {
    owner: 'antfu',
    name: 'x18n',
    branch: 'main',
    contentDir: 'docs/content',
  },
})

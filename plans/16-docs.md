# 16 - Docs site

The site lives at `https://x18n.antfu.dev` (`site.url` and `llms.domain`).

`docs/` is a Nuxt app that extends the `comark-docs` layer, the same setup as devframe's docs (`devframes/devframe` `docs/`):

- `nuxt.config.ts` with `extends: [process.env.COMARK_DOCS_LAYER || 'comark-docs']`, `site`, `llms` (generates `llms.txt` and `llms-full.txt` for agents).
- `app/app.config.ts` with header nav, GitHub link, sidebar groups.
- Content in `docs/content/` with numbered folders.
- `comark-docs` comes from GitHub through the `docs` catalog. It pins snapshot URLs, so `pnpm-workspace.yaml` sets `blockExoticSubdeps: false`, as devframe does.

## Content plan

```
docs/content/
  index.md                 landing
  1.guide/                 what x18n is, getting started, config, concepts (project, resource, key, usage), monorepos
  2.surfaces/              cli and `x18n check`, vscode, ui (dev, static), ci; other editors in 1.x
  3.agents/                workflows, translate prompts, mcp, skill
  4.presets/               one page per preset: detection, defaults, supported syntax
  5.plugins/               writing plugins: yaml, ts, each capability, explain/doctor, publishing
  6.references/            config reference (generated from schema), cli reference (generated from cac), json contracts, lsp protocol, glossary
  7.errors/                one page per X18N code
  8.migration/             from i18n-ally
```

Generated pages (config, CLI, contracts, error codes) are built from the code by a script, so they cannot drift.

## Hosted parts

- `/play` (1.x): the in-browser workspace ([09-ui.md](./09-ui.md)), the `@x18n/ui` SPA built in `local` mode and copied into the docs output.
- `/schema/config.json`, `/schema/plugin.json`, `/schema/reviews.json`, the `$schema` targets used in examples.
- `/demo`: a static report (`x18n build`) of a fixture project.

## Scaffold

The scaffold in M0 adds the Nuxt app with the layer and a landing page only. Content arrives with each milestone.

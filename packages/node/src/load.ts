import type { Builtins, Project, ScanResult, SourceFile, UserConfig } from '@x18n/core'
import type { NodeHost } from './host'
import { dirname, relative, resolve } from 'node:path'
import { createBuiltins } from '@x18n/builtins'
import { createProject, resolveConfig, X18nError } from '@x18n/core'
import { glob } from 'tinyglobby'
import { createPluginLoader, findConfigFile, findConfigUpward, loadConfigFile, manifestRootsOf } from './config'
import { createNodeHost, findGitRoot } from './host'

export interface LoadOptions {
  /** Where to look for a config file (upward). Default: the process cwd. */
  readonly cwd: string
  /** Explicit config file. */
  readonly configFile?: string | undefined
  /** Only this project of a monorepo. */
  readonly project?: string | undefined
  /** Disable the persistent cache. */
  readonly cache?: boolean | undefined
  readonly builtins?: Builtins | undefined
  readonly logger?: NodeHost['logger']
  /** Scans many files at once, for example on worker threads. */
  readonly scanFiles?: ((files: readonly SourceFile[]) => Promise<readonly ScanResult[]>) | undefined
}

export interface LoadedProject {
  readonly name: string
  /** Absolute project root. */
  readonly root: string
  readonly configFile: string | undefined
  readonly host: NodeHost
  readonly project: Project
}

export interface Workspace {
  /** Absolute root of the workspace (the directory of the root config, or the cwd). */
  readonly root: string
  readonly configFile: string | undefined
  readonly projects: readonly LoadedProject[]
}

interface ProjectSpec {
  readonly root: string
  readonly config: UserConfig
  readonly parent: UserConfig | undefined
  readonly configFile: string | undefined
}

async function projectSpecs(rootConfigFile: string | undefined, cwd: string): Promise<{ root: string, specs: ProjectSpec[] }> {
  const configDir = rootConfigFile ? dirname(rootConfigFile) : resolve(cwd)
  const rootConfig = rootConfigFile ? await loadConfigFile(rootConfigFile) : {}
  const root = resolve(configDir, rootConfig.root ?? '.')
  if (!rootConfig.projects?.length)
    return { root, specs: [{ root, config: rootConfig, parent: undefined, configFile: rootConfigFile }] }
  const { projects, ...parent } = rootConfig
  const dirs = await glob([...projects], { cwd: root, onlyDirectories: true, ignore: ['**/node_modules/**'] })
  const specs: ProjectSpec[] = []
  for (const dir of dirs.sort()) {
    const projectRoot = resolve(root, dir)
    const file = findConfigFile(projectRoot)
    const config = file ? await loadConfigFile(file) : {}
    specs.push({ root: resolve(projectRoot, config.root ?? '.'), config, parent, configFile: file })
  }
  return { root, specs }
}

/** Finds the config, resolves every project and waits until each is indexed. */
export async function loadWorkspace(options: LoadOptions): Promise<Workspace> {
  const configFile = options.configFile ? resolve(options.cwd, options.configFile) : findConfigUpward(options.cwd)
  const { root, specs } = await projectSpecs(configFile, options.cwd)
  const builtins = options.builtins ?? createBuiltins()
  const gitRoot = findGitRoot(root)
  const loaded: LoadedProject[] = []
  for (const spec of specs) {
    const name = spec.config.name ?? (spec.root === root ? relative(dirname(root), root) : relative(root, spec.root)).replace(/\\/g, '/')
    if (options.project !== undefined && options.project !== name)
      continue
    const host = createNodeHost(spec.root, { cacheDir: options.cache === false ? false : undefined, logger: options.logger })
    const setup = await resolveConfig({
      host,
      config: spec.config,
      parent: spec.parent,
      builtins,
      name,
      runtime: 'node',
      loadPlugin: createPluginLoader(spec.configFile ? dirname(spec.configFile) : spec.root),
      manifestRoots: manifestRootsOf(spec.root, gitRoot),
    })
    const project = createProject({ host, setup, scanFiles: options.scanFiles })
    await project.ready
    await host.flush()
    loaded.push({ name, root: spec.root, configFile: spec.configFile, host, project })
  }
  if (options.project !== undefined && loaded.length === 0)
    throw new X18nError('X18N0003', options.project)
  return { root, configFile, projects: loaded }
}

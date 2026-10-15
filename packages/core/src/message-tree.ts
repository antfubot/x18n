import type { MessageLeaf, MessageTree } from './types'

function isMessageLeaf(value: unknown): value is MessageLeaf {
  return value === null || typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean'
}

/** Checks parsed data (for example from `JSON.parse`) before it enters the project. */
export function isMessageTree(value: unknown): value is MessageTree {
  if (typeof value !== 'object' || value === null || Array.isArray(value))
    return false
  return Object.values(value).every(child => isMessageLeaf(child) || isMessageTree(child))
}

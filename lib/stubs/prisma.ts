/**
 * Stub for @prisma/client - not used, backend handles database
 */
export const PrismaClient = class {
  constructor() {
    console.warn('[Stub] PrismaClient is not available - using backend API instead')
  }
}

export type Trade = any
export type Mood = any
export type Post = any
export type User = any
export type Vote = any
export type PostType = string
export type PostStatus = string
export type VoteType = string


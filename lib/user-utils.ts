/**
 * Utility functions for user data handling
 */

/**
 * Formats avatar URL for display
 * Handles both data URLs and raw base64 strings
 * Also handles user objects with avatar or user_metadata.avatar_url
 */
export function formatAvatarUrl(
  avatar: string | null | undefined | { avatar?: string | null; user_metadata?: { avatar_url?: string | null } }
): string | undefined {
  // Handle user object format (legacy Supabase style)
  if (avatar && typeof avatar === 'object' && 'avatar' in avatar) {
    avatar = avatar.avatar
  }
  if (avatar && typeof avatar === 'object' && 'user_metadata' in avatar && avatar.user_metadata?.avatar_url) {
    avatar = avatar.user_metadata.avatar_url
  }
  
  // Handle string/null/undefined
  if (!avatar || typeof avatar !== 'string') return undefined
  
  // If already a data URL, return as is
  if (avatar.startsWith('data:image')) {
    return avatar
  }
  
  // If it's base64 without prefix, add the data URL prefix
  // Assume JPEG by default, but we could detect MIME type if needed
  return `data:image/jpeg;base64,${avatar}`
}

/**
 * Gets user initials from name or email
 * Handles both our auth system user structure and legacy Supabase structure
 */
export function getUserInitials(user: { 
  firstName?: string | null
  lastName?: string | null
  email?: string
  name?: string | null
  user_metadata?: { first_name?: string; last_name?: string }
} | null | undefined): string {
  if (!user) return 'U'
  
  // Try firstName/lastName first (our auth system)
  const firstName = user.firstName || user.user_metadata?.first_name
  const lastName = user.lastName || user.user_metadata?.last_name
  
  if (firstName && lastName) {
    return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase()
  }
  if (firstName) {
    return firstName.charAt(0).toUpperCase()
  }
  if (user.name) {
    return user.name.charAt(0).toUpperCase()
  }
  if (user.email) {
    return user.email.charAt(0).toUpperCase()
  }
  return 'U'
}

/**
 * Gets user display name
 * Handles both our auth system user structure and legacy Supabase structure
 */
export function getUserDisplayName(user: { 
  firstName?: string | null
  lastName?: string | null
  email?: string
  name?: string | null
  user_metadata?: { first_name?: string; last_name?: string; full_name?: string }
} | null | undefined): string {
  if (!user) return 'User'
  
  // Try firstName/lastName first (our auth system)
  const firstName = user.firstName || user.user_metadata?.first_name
  const lastName = user.lastName || user.user_metadata?.last_name
  
  if (firstName || lastName) {
    return [firstName, lastName].filter(Boolean).join(' ')
  }
  if (user.name || user.user_metadata?.full_name) {
    return user.name || user.user_metadata?.full_name || 'User'
  }
  if (user.email) {
    return user.email
  }
  return 'User'
}


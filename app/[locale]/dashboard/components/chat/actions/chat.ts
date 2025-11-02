'use server'
import { UIMessage } from "ai"
import { addDays, format } from "date-fns"
import { Mood } from "@/lib/types"
import { revalidateTag } from "next/cache"
import { getUserId } from "@/lib/server-auth"

export async function saveChat(messages: UIMessage[]): Promise<Mood | null> {
  console.log('Saving chat', messages)
  const userId = await getUserId()
  
  // Check if user exists before proceeding
  if (!userId) {
    console.error('No user ID found')
    return null
  }

  // TODO: Verify user exists in backend database

  const today = new Date()
  const todayUTC = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate(), 12))

  // Extract only text content from messages, handling both direct content and parts
  const textOnlyMessages = messages.map(msg => {
    if (msg.parts) {
      // If message has parts, only keep text parts
      const textParts = msg.parts
        .filter((part: any) => part.type === 'text')
        .map((part: any) => part.text)
        .join('')
      return {
        ...msg,
        content: textParts,
        parts: undefined // Remove parts since we've consolidated them into content
      }
    }
    // If no parts, just use the content directly
    return msg
  })

  // TODO: Save mood/conversation to backend database
  revalidateTag(`user-data-${userId}`)
  
  // For now, return a placeholder mood
  return {
    id: `temp-${Date.now()}`,
    userId,
    day: todayUTC.toISOString(),
    mood: "NEUTRAL",
    conversation: JSON.stringify(textOnlyMessages),
  } as Mood
}

export async function loadChat(): Promise<UIMessage[]> {
  console.log('Loading chat')
  const userId = await getUserId()
  
  // Check if user exists before proceeding
  if (!userId) {
    console.error('No user ID found')
    return []
  }

  // TODO: Fetch conversation from backend database
  const today = new Date()
  const todayUTC = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate(), 12))

  revalidateTag(`user-data-${userId}`)
  
  // For now, return empty array (conversation will be loaded from backend when implemented)
  return []
} 
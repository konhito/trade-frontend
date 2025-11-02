'use server'

// TODO: Implement backend API for mood and journal

interface Mood {
  id: string
  userId: string
  day: Date
  mood: 'bad' | 'okay' | 'great'
  emotionValue: number
  hasTradingExperience: boolean | null
  selectedNews: string[]
  journalContent: string | null
  conversation: any
  createdAt: Date
  updatedAt: Date
}

export async function saveMood(mood: 'bad' | 'okay' | 'great'): Promise<Mood> {
  console.log('TODO: Save mood via backend API', mood)
  
  // Return stub data
  const today = new Date()
  return {
    id: `mood-${Date.now()}`,
    userId: 'stub-user',
    day: today,
    mood,
    emotionValue: mood === 'bad' ? 1 : mood === 'okay' ? 5 : 9,
    hasTradingExperience: null,
    selectedNews: [],
    journalContent: null,
    conversation: null,
    createdAt: today,
    updatedAt: today,
  }
}

export async function saveJournal(comment: string, dateKey: string): Promise<Mood> {
  console.log('TODO: Save journal via backend API', { comment, dateKey })
  
  // Return stub data
  const day = new Date(dateKey)
  return {
    id: `mood-${Date.now()}`,
    userId: 'stub-user',
    day,
    mood: 'okay',
    emotionValue: 5,
    hasTradingExperience: null,
    selectedNews: [],
    journalContent: comment,
    conversation: null,
    createdAt: day,
    updatedAt: new Date(),
  }
}

export async function getMoodForDay(dateKey: string): Promise<Mood | null> {
  console.log('TODO: Get mood for day via backend API', dateKey)
  
  // Return null (no mood found)
  return null
}

export async function getMoodHistory(fromDate: Date, toDate?: Date): Promise<Mood[]> {
  console.log('TODO: Get mood history via backend API', { fromDate, toDate })
  
  // Return empty array (no mood history)
  return []
}

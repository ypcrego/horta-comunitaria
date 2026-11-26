export type ForumCategory = 'Comunicados' | 'Mutirões' | 'Dúvidas' | 'Plantio e manejo'

export interface ForumReply {
  id: number
  topicId: number
  author: string
  message: string
  createdAt: string
}

export interface ForumTopic {
  id: number
  title: string
  category: ForumCategory
  message: string
  author: string
  createdAt: string
  replies: ForumReply[]
}

export interface ForumState {
  topics: ForumTopic[]
}

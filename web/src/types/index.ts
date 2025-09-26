export interface SummaryTile {
  id: string
  title: string
  summary: string
  steps: string[]
  materials: string[]
  tags: string[]
  originalTranscript: string
  createdAt: string
}

export interface Recording {
  id: string
  blob: Blob
  duration: number
  createdAt: string
  transcription?: string
  summary?: SummaryTile
}

export type UserRole = 'senior' | 'youth'

export interface User {
  id: string
  email: string
  created_at: string
  display_name?: string
  role?: UserRole
  active_pair_id?: string
}

export interface AuthState {
  user: User | null
  loading: boolean
  isAuthenticated: boolean
}

export interface Pair {
  id: string
  senior_id: string
  youth_id: string
  relationship: string
  created_at: string
}

export interface PairWithPartner {
  pair_id: string
  partner_id: string
  partner_name: string
  my_role: UserRole
  relationship: string
  created_at: string
}

export interface PairInvite {
  id: string
  code: string
  inviter_id: string
  inviter_role: UserRole
  relationship_note?: string
  used_by?: string
  used_at?: string
  created_at: string
  expires_at: string
}
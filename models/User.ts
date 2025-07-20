export interface User {
  id: string
  email: string
  profile?: {
    id: string
    first_name: string | null
    last_name: string | null
    avatar_url: string | null
  }
}
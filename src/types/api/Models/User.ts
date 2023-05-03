export interface User {
  uid: number
  email: string
  username: string
  name: string
  picture?: string

  linked_google: boolean
  linked_github: boolean

  updated_at: string
  created_at: string
}

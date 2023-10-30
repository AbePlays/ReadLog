// Generated by Xata Codegen 0.23.2. Please do not edit.
import type { BaseClientOptions, SchemaInference, XataRecord } from '@xata.io/client'
import { buildClient } from '@xata.io/client'

const tables = [
  {
    name: 'users',
    columns: [
      { name: 'fullname', type: 'string' },
      { name: 'password_hash', type: 'string' },
      { name: 'email', type: 'email', unique: true },
      { name: 'registration_date', type: 'datetime', notNull: true, defaultValue: 'now' }
    ]
  },
  {
    name: 'user_books',
    columns: [
      { name: 'user_id', type: 'string' },
      { name: 'book_id', type: 'string' },
      { name: 'read_status', type: 'string' },
      { name: 'name', type: 'string' },
      { name: 'image_url', type: 'string' },
      { name: 'reading_history', type: 'json', notNull: true, defaultValue: '[]' }
    ]
  }
] as const

export type SchemaTables = typeof tables
export type InferredTypes = SchemaInference<SchemaTables>

export type Users = InferredTypes['users']
export type UsersRecord = Users & XataRecord

export type UserBooks = InferredTypes['user_books']
export type UserBooksRecord = UserBooks & XataRecord

export type DatabaseSchema = {
  users: UsersRecord
  user_books: UserBooksRecord
}

const DatabaseClient = buildClient()

const defaultOptions = {
  databaseURL: 'https://Abe-s-workspace-v85lfu.eu-central-1.xata.sh/db/read-log'
}

export class XataClient extends DatabaseClient<DatabaseSchema> {
  constructor(options?: BaseClientOptions) {
    super({ ...defaultOptions, ...options }, tables)
  }
}

let instance: XataClient | undefined = undefined

export const getXataClient = (key: string, dbUrl: string) => {
  if (instance) return instance

  instance = new XataClient({ apiKey: key, databaseURL: dbUrl })
  return instance
}
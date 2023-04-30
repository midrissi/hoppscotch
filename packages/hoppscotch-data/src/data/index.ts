import { HoppRESTHeader } from "../rest/index"
import { Environment } from "../environment"

export const DataSchemaVersion = "1"

export type ItemMeta = {
  dataClass: string
  count: number
  top: number
}

export type DataEvent = {
  script: {
    exec: string[]
  }
}

export type ItemField = {
  name: string
  api: string
  options: any
}

export type HoppDataItem = {
  id?: string
  name: string
  description: string
  meta: ItemMeta
  events: {
    [key: string]: DataEvent
  }
  fields: ItemField[]
}

export type DataMeta = {
  locale: string
  endpoint: string
  headers: HoppRESTHeader[];
}

export type HoppData = {
  id?: string
  v: typeof DataSchemaVersion
  name: string
  description: string
  meta: DataMeta
  events: {
    [key: string]: DataEvent
  }
  variables: Environment['variables']
  items: HoppDataItem[]
}

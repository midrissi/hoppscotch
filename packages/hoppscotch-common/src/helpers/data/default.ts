import { HoppData, HoppDataItem } from "@hoppscotch/data"
import { uniqueId } from "lodash-es"

export const getDefaultCollection = (): HoppData => ({
  v: "1",
  name: "Untitled",
  description: "",
  events: {},
  items: [],
  meta: {
    locale: "en",
    endpoint: "https://localhost:7443",
    headers: [],
  },
  variables: [],
  id: uniqueId(),
})

export const getDefaultItem = (): HoppDataItem => ({
  name: "Untitled",
  description: "",
  events: {},
  meta: {
    count: 0,
    dataClass: "",
    top: 0,
  },
  id: uniqueId(),
  fields: [],
})

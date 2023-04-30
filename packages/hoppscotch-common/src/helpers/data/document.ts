import { HoppData, HoppDataItem } from "@hoppscotch/data"

/**
 * Defines a live 'document' (something that is open and being edited) in the app
 */
export type HoppDataDocument<T extends "collection" | "item" = "collection"> = {
  type: T
  /**
   * The request as it is in the document
   */
  request: T extends "collection" ? HoppData : HoppDataItem

  /**
   * Whether the request has any unsaved changes
   * (atleast as far as we can say)
   */
  isDirty: boolean
}

import { v4 as uuidV4 } from "uuid"
import { reactive, watch, computed, ref, shallowReadonly } from "vue"
import { HoppDataDocument } from "./document"
import { refWithControl } from "@vueuse/core"
import { getDefaultCollection } from "./default"

export type HoppDataTab = {
  id: string
  document: HoppDataDocument
}

export type PersistableDataTabState = {
  lastActiveTabID: string
  orderedDocs: Array<{
    tabID: string
    doc: HoppDataDocument
  }>
}

export const currentTabID = refWithControl("test", {
  onBeforeChange(newTabID) {
    if (!newTabID || !tabMap.has(newTabID)) {
      console.warn(
        `Tried to set current tab id to an invalid value. (value: ${newTabID})`
      )

      // Don't allow change
      return false
    }
  },
})

const tabMap = reactive(
  new Map<string, HoppDataTab>([
    [
      "test",
      {
        id: "test",
        document: {
          type: "collection",
          request: getDefaultCollection(),
          isDirty: false,
        },
      },
    ],
  ])
)
const tabOrdering = ref<string[]>(["test"])

watch(
  tabOrdering,
  (newOrdering) => {
    if (!currentTabID.value || !newOrdering.includes(currentTabID.value)) {
      currentTabID.value = newOrdering[newOrdering.length - 1] // newOrdering should always be non-empty
    }
  },
  { deep: true }
)

export const persistableTabState = computed<PersistableDataTabState>(() => ({
  lastActiveTabID: currentTabID.value,
  orderedDocs: tabOrdering.value.map((tabID) => {
    const tab = tabMap.get(tabID)! // tab ordering is guaranteed to have value for this key
    return {
      tabID: tab.id,
      doc: tab.document,
    }
  }),
}))

export const currentActiveTab = computed(() => tabMap.get(currentTabID.value)!) // Guaranteed to not be undefined

// TODO: Mark this unknown and do validations
export function loadTabsFromPersistedState(data: PersistableDataTabState) {
  if (data) {
    tabMap.clear()
    tabOrdering.value = []

    for (const doc of data.orderedDocs) {
      tabMap.set(doc.tabID, {
        id: doc.tabID,
        document: doc.doc,
      })

      tabOrdering.value.push(doc.tabID)
    }

    currentTabID.value = data.lastActiveTabID
  }
}

/**
 * Returns all the active Tab IDs in order
 */
export function getActiveTabs() {
  return shallowReadonly(
    computed(() => tabOrdering.value.map((x) => tabMap.get(x)!))
  )
}

export function getTabRef(tabID: string) {
  return computed({
    get() {
      const result = tabMap.get(tabID)

      if (result === undefined) throw new Error(`Invalid tab id: ${tabID}`)

      return result
    },
    set(value) {
      return tabMap.set(tabID, value)
    },
  })
}

function generateNewTabID() {
  while (true) {
    const id = uuidV4()

    if (!tabMap.has(id)) return id
  }
}

export function updateTab(tabUpdate: HoppDataTab) {
  if (!tabMap.has(tabUpdate.id)) {
    console.warn(
      `Cannot update tab as tab with that tab id does not exist (id: ${tabUpdate.id})`
    )
  }

  tabMap.set(tabUpdate.id, tabUpdate)
}

export function createNewTab(document: HoppDataDocument, switchToIt = true) {
  const id = generateNewTabID()

  const tab: HoppDataTab = { id, document }

  tabMap.set(id, tab)
  tabOrdering.value.push(id)

  if (switchToIt) {
    currentTabID.value = id
  }

  return tab
}

export function updateTabOrdering(fromIndex: number, toIndex: number) {
  tabOrdering.value.splice(
    toIndex,
    0,
    tabOrdering.value.splice(fromIndex, 1)[0]
  )
}

export function closeTab(tabID: string) {
  if (!tabMap.has(tabID)) {
    console.warn(`Tried to close a tab which does not exist (tab id: ${tabID})`)
    return
  }

  if (tabOrdering.value.length === 1) {
    console.warn(
      `Tried to close the only tab open, which is not allowed. (tab id: ${tabID})`
    )
    return
  }

  tabOrdering.value.splice(tabOrdering.value.indexOf(tabID), 1)

  tabMap.delete(tabID)
}

export function getTabsRefTo(func: (tab: HoppDataTab) => boolean) {
  return Array.from(tabMap.values())
    .filter(func)
    .map((tab) => getTabRef(tab.id))
}

/* eslint-disable no-restricted-syntax */
import { HoppData } from "@hoppscotch/data"
import DispatchingStore, { defineDispatchers } from "../DispatchingStore"
import { cloneDeep } from "lodash-es"
import { pluck } from "rxjs"

export type HoppDataCollections = HoppData[]

const defaultDataCollectionState: {
  state: HoppDataCollections
} = {
  state: [
    {
      v: "1",
      name: "Example",
      description: "",
      id: "",
      events: {},
      items: [],
      variables: [],
      meta: {
        locale: "en",
        endpoint: "https://localhost:7443",
        headers: [],
      },
    },
  ],
}

type DataCollectionStoreType = typeof defaultDataCollectionState

const dataCollectionDispatchers = defineDispatchers({
  setCollections(
    _: DataCollectionStoreType,
    { entries }: { entries: HoppDataCollections }
  ) {
    return {
      state: entries,
    }
  },
  appendCollections(
    { state }: DataCollectionStoreType,
    { entries }: { entries: HoppDataCollections }
  ) {
    return {
      state: [...state, ...entries],
    }
  },
  addCollection(
    { state }: DataCollectionStoreType,
    { collection }: { collection: HoppData }
  ) {
    return {
      state: [...state, collection],
    }
  },
  removeCollection(
    { state }: DataCollectionStoreType,
    { collectionIndex }: { collectionIndex: number }
  ) {
    return {
      state: state.filter((_: any, i: number) => i !== collectionIndex),
    }
  },
  editCollection(
    { state }: DataCollectionStoreType,
    {
      collectionIndex,
      partialCollection,
    }: {
      collectionIndex: number
      partialCollection: Partial<HoppData>
    }
  ) {
    return {
      state: state.map((col, index) =>
        index === collectionIndex
          ? { ...col, ...cloneDeep(partialCollection) }
          : col
      ),
    }
  },
})

export const dataCollectionStore = new DispatchingStore(
  defaultDataCollectionState,
  dataCollectionDispatchers
)

export const dataCollections$ = dataCollectionStore.subject$.pipe(
  pluck("state")
)

export function setCollections(entries: HoppDataCollections) {
  dataCollectionStore.dispatch({
    dispatcher: "setCollections",
    payload: {
      entries,
    },
  })
}

export function appendCollections(entries: HoppDataCollections) {
  dataCollectionStore.dispatch({
    dispatcher: "appendCollections",
    payload: {
      entries,
    },
  })
}

export function addCollection(collection: HoppData) {
  dataCollectionStore.dispatch({
    dispatcher: "addCollection",
    payload: {
      collection,
    },
  })
}

export function removeCollection(collectionIndex: number) {
  dataCollectionStore.dispatch({
    dispatcher: "removeCollection",
    payload: {
      collectionIndex,
    },
  })
}

export function editRESTCollection(
  collectionIndex: number,
  partialCollection: Partial<HoppData>
) {
  dataCollectionStore.dispatch({
    dispatcher: "editCollection",
    payload: {
      collectionIndex,
      partialCollection: partialCollection,
    },
  })
}

export function getCollection(collectionIndex: number) {
  return dataCollectionStore.value.state[collectionIndex]
}

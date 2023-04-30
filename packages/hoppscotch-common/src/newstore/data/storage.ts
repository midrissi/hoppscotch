/* eslint-disable no-restricted-syntax */

import { dataCollectionStore, setCollections } from "."

function setupCollectionsPersistence() {
  const dataCollectionData = JSON.parse(
    window.localStorage.getItem("collectionsData") || "[]"
  )
  setCollections(dataCollectionData)

  dataCollectionStore.subject$.subscribe(({ state }) => {
    window.localStorage.setItem("collectionsData", JSON.stringify(state))
  })
}

export function setupLocalPersistence() {
  setupCollectionsPersistence()
}

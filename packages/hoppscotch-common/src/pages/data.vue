<template>
  <div>
    <AppPaneLayout layout-id="http">
      <template #sidebar>
        <DataSidebar />
      </template>
      <template #primary>
        <p class="flex items-center w-full h-full justify-center">
          Please select a collection or an item
        </p>
      </template>
    </AppPaneLayout>
    <HoppSmartConfirmModal
      :show="confirmingCloseForTabID !== null"
      :confirm="t('modal.close_unsaved_tab')"
      :title="t('confirm.save_unsaved_tab')"
      @hide-modal="onCloseConfirmSaveTab"
      @resolve="onResolveConfirmSaveTab"
    />
    <CollectionsSaveRequest
      :show="savingRequest"
      :mode="'rest'"
      @hide-modal="onSaveModalClose"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onBeforeUnmount, watch } from "vue"
import { safelyExtractRESTRequest } from "@hoppscotch/data"
import { translateExtURLParams } from "~/helpers/RESTExtURLParams"
import { useRoute } from "vue-router"
import { useI18n } from "@composables/i18n"
import {
  closeTab,
  currentActiveTab,
  loadTabsFromPersistedState,
  persistableTabState,
} from "~/helpers/rest/tab"
import { getDefaultRESTRequest } from "~/helpers/rest/default"
import { invokeAction } from "~/helpers/actions"
import { onLoggedIn } from "~/composables/auth"
import { platform } from "~/platform"
import {
  audit,
  BehaviorSubject,
  combineLatest,
  EMPTY,
  from,
  map,
  Subscription,
} from "rxjs"
import { useToast } from "~/composables/toast"
import { PersistableRESTTabState } from "~/helpers/rest/tab"
import { watchDebounced } from "@vueuse/core"

const savingRequest = ref(false)
const confirmingCloseForTabID = ref<string | null>(null)

const t = useI18n()
const toast = useToast()

const confirmSync = ref(false)
const tabStateForSync = ref<PersistableRESTTabState | null>(null)

function bindRequestToURLParams() {
  const route = useRoute()
  // Get URL parameters and set that as the request
  onMounted(() => {
    const query = route.query
    // If query params are empty, or contains code or error param (these are from Oauth Redirect)
    // We skip URL params parsing
    if (Object.keys(query).length === 0 || query.code || query.error) return
    currentActiveTab.value.document.request = safelyExtractRESTRequest(
      translateExtURLParams(query),
      getDefaultRESTRequest()
    )
  })
}

/**
 * This function is closed when the confirm tab is closed by some means (even saving triggers close)
 */
const onCloseConfirmSaveTab = () => {
  if (!savingRequest.value && confirmingCloseForTabID.value) {
    closeTab(confirmingCloseForTabID.value)
    confirmingCloseForTabID.value = null
  }
}

/**
 * Called when the user confirms they want to save the tab
 */
const onResolveConfirmSaveTab = () => {
  if (currentActiveTab.value.document.saveContext) {
    invokeAction("request.save")

    if (confirmingCloseForTabID.value) {
      closeTab(confirmingCloseForTabID.value)
      confirmingCloseForTabID.value = null
    }
  } else {
    savingRequest.value = true
  }
}

/**
 * Called when the Save Request modal is done and is closed
 */
const onSaveModalClose = () => {
  savingRequest.value = false
  if (confirmingCloseForTabID.value) {
    closeTab(confirmingCloseForTabID.value)
    confirmingCloseForTabID.value = null
  }
}

watch(confirmSync, (newValue) => {
  if (newValue) {
    toast.show(t("confirm.sync"), {
      duration: 0,
      action: [
        {
          text: `${t("action.yes")}`,
          onClick: (_, toastObject) => {
            syncTabState()
            toastObject.goAway(0)
          },
        },
        {
          text: `${t("action.no")}`,
          onClick: (_, toastObject) => {
            toastObject.goAway(0)
          },
        },
      ],
    })
  }
})

const syncTabState = () => {
  if (tabStateForSync.value) loadTabsFromPersistedState(tabStateForSync.value)
}

/**
 * Performs sync of the REST Tab session with Firestore.
 *
 * @returns A subscription to the sync observable stream.
 * Unsubscribe to stop syncing.
 */
function startTabStateSync(): Subscription {
  const currentUser$ = platform.auth.getCurrentUserStream()
  const tabState$ = new BehaviorSubject<PersistableRESTTabState | null>(null)

  watchDebounced(
    persistableTabState,
    (state) => {
      tabState$.next(state)
    },
    { debounce: 500, deep: true }
  )

  const sub = combineLatest([currentUser$, tabState$])
    .pipe(
      map(([user, tabState]) =>
        user && tabState
          ? from(platform.sync.tabState.writeCurrentTabState(user, tabState))
          : EMPTY
      ),
      audit((x) => x)
    )
    .subscribe(() => {
      // NOTE: This subscription should be kept
    })

  return sub
}

function setupTabStateSync() {
  const route = useRoute()

  // Subscription to request sync
  let sub: Subscription | null = null

  // Load request on login resolve and start sync
  onLoggedIn(async () => {
    if (
      Object.keys(route.query).length === 0 &&
      !(route.query.code || route.query.error)
    ) {
      const tabStateFromSync =
        await platform.sync.tabState.loadTabStateFromSync()

      if (tabStateFromSync) {
        tabStateForSync.value = tabStateFromSync
        confirmSync.value = true
      }
    }

    sub = startTabStateSync()
  })

  // Stop subscription to stop syncing
  onBeforeUnmount(() => {
    sub?.unsubscribe()
  })
}

setupTabStateSync()
bindRequestToURLParams()
</script>

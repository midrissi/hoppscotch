<template>
  <HoppSmartTabs
    v-model="selectedNavigationTab"
    styles="sticky overflow-x-auto flex-shrink-0 bg-primary z-10 top-0"
    vertical
    render-inactive-tabs
  >
    <HoppSmartTab
      :id="'collections'"
      :icon="IconFolder"
      :label="`${t('tab.collections')}`"
    >
      <CollectionsData />
    </HoppSmartTab>
    <HoppSmartTab
      :id="'env'"
      :icon="IconLayers"
      :label="`${t('tab.environments')}`"
    >
      <Environments />
    </HoppSmartTab>
  </HoppSmartTabs>
</template>

<script setup lang="ts">
import IconFolder from "~icons/lucide/folder"
import IconLayers from "~icons/lucide/layers"
import { ref } from "vue"
import { useI18n } from "@composables/i18n"

type NavigationTabs = "history" | "collections" | "env"

const selectedNavigationTab = ref<NavigationTabs>("collections")

const t = useI18n()
</script>

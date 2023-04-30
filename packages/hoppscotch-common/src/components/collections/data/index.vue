<template>
  <div :class="{ 'rounded border border-divider': saveRequest }">
    <div
      class="sticky z-10 flex flex-col flex-shrink-0 overflow-x-auto rounded-t bg-primary"
      :style="
        saveRequest ? 'top: calc(-1 * var(--line-height-body))' : 'top: 0'
      "
    >
      <input
        v-model="filterText"
        type="search"
        autocomplete="off"
        :placeholder="t('action.search')"
        class="py-2 pl-4 pr-2 bg-transparent"
      />
      <div
        class="flex justify-between flex-1 flex-shrink-0 border-y bg-primary border-dividerLight"
      >
        <HoppButtonSecondary
          :icon="IconPlus"
          :label="t('action.new')"
          class="!rounded-none"
        />
        <div class="flex">
          <HoppButtonSecondary
            v-tippy="{ theme: 'tooltip' }"
            to="https://docs.hoppscotch.io/documentation/features/collections"
            blank
            :title="t('app.wiki')"
            :icon="IconHelpCircle"
          />
          <HoppButtonSecondary
            v-if="!saveRequest"
            v-tippy="{ theme: 'tooltip' }"
            :title="t('modal.import_export')"
            :icon="IconArchive"
          />
        </div>
      </div>
    </div>
    <div
      class="flex flex-col items-center justify-center p-4 text-secondaryLight"
    >
      <img
        :src="`/images/states/${colorMode.value}/pack.svg`"
        loading="lazy"
        class="inline-flex flex-col object-contain object-center w-16 h-16 my-4"
        :alt="t('empty.collections')"
      />
      <span class="pb-4 text-center">
        {{ t("empty.collections") }}
      </span>
      <HoppButtonSecondary :label="t('add.new')" filled outline />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue"
import { graphqlCollections$ } from "~/newstore/collections"

import { useI18n } from "@composables/i18n"
import { useReadonlyStream } from "@composables/stream"
import { useColorMode } from "@composables/theming"
import IconArchive from "~icons/lucide/archive"
import IconHelpCircle from "~icons/lucide/help-circle"
import IconPlus from "~icons/lucide/plus"

export default defineComponent({
  props: {
    saveRequest: { type: Boolean, default: false },
    picked: { type: Object, default: null },
  },
  emits: ["select", "use-collection"],
  setup() {
    const collections = useReadonlyStream(graphqlCollections$, [], "deep")
    const colorMode = useColorMode()
    const t = useI18n()

    return {
      collections,
      colorMode,
      t,
      IconPlus,
      IconHelpCircle,
      IconArchive,
    }
  },
  data() {
    return {
      filterText: "",
    }
  },
  computed: {},
  methods: {},
})
</script>

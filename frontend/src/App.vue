<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

import AppHeader from './components/common/AppHeader.vue'
import AppFooter from './components/common/AppFooter.vue'

const route = useRoute()

const isDashboard = computed(
  () => route.meta.layout === 'dashboard'
)
import { watchEffect } from 'vue'

watchEffect(() => {
  console.log('path:', route.path)
  console.log('meta:', JSON.stringify(route.meta))
  console.log('layout:', route.meta.layout)
})

</script>

<template>
  <template v-if="isDashboard">
    <RouterView />
</template>

  <template v-else>
    <AppHeader />
    <RouterView />
    <AppFooter />
  </template>

</template>
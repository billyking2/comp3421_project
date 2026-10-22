<script setup lang="ts">
import AppHeader from './components/common/AppHeader.vue'
import AppFooter from './components/common/AppFooter.vue'
import Test from './components/common/test.vue'


</script>

<template>
  <Test />
  <AppHeader />
  <RouterView />
  <AppFooter />
</template>

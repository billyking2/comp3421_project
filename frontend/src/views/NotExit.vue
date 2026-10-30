

<template>
  <AppHeader />
  <div class="box">
  <p> 404... page not found</p>
  <p> you mayback to home page</p>
  </div>
  <AppFooter />
</template>

<script setup lang="ts">
import AppHeader from '../components/common/AppHeader.vue'
import AppFooter from '../components/common/AppFooter.vue'
</script>

<style scoped>
.box{
    margin-top: 50px;

}
</style>
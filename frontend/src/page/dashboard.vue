<template>
 <div class="dashboard-shell">
   
    <Sidebar @update:collapsed="handleSidebar"/>
    <main class="main" :class ="{wide:collapsed}">

    </main>
 </div>

</template>

<script setup lang="ts">
import {ref} from 'vue';
import Sidebar from '../components/dashboard/sidebar.vue';

const collapsed = ref(false)

const handleSidebar = (value: boolean) => {
  collapsed.value = value
}

</script>

<style scoped>

</style>
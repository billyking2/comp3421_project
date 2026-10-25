<template>
     <aside class="sidebar" :class="{ collapsed , 'mobile-open':mobileOpen }">
    <div class="brand">
        <div class="logo"></div>
        <div v-if="!collapsed" class="description"></div>
    </div>
    <nav>
        <button v-for="item in menus" :key="item.key" :class="{active:active === item.key}">
            <el-icon><component :is="item.icon"></component></el-icon>
            <span v-if="!collapsed" >{{ item.label }}</span>
        </button>
    </nav>    
    <button class="collapse-btn" @click="handlecollapsed">
        <el-icon><DArrowLeft v-if="!collapsed"/><DArrowRight v-else/></el-icon>
    </button>
    </aside>
</template>
<script setup lang="ts">
import { DArrowLeft } from '@element-plus/icons-vue';
import { ref,onMounted,computed } from 'vue';

const active = ref("home")
const collapsed = ref(false)
const mobileOpen = ref(false)

const menus = [
    {key:"home",label:"Home", icon:"House"},
    {key:"sales",label:"Sales", icon:"Money"},
     {key:"inventory",label:"Inventory", icon:"Box"},
      {key:"order",label:"Order", icon:"List"},
       {key:"member",label:"Member", icon:"User"},
       
]

const emit = defineEmits<{
  'update:collapsed': [boolean]
}>()


const handlecollapsed = () => {
    collapsed.value = !collapsed
    emit('update:collapsed', collapsed.value);
};
</script>

<style>
</style>
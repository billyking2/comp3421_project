<script setup>
defineProps({ 
    label: String, 
    value: [String, Number], 
    unit: String, 
    trend: String, 
    icon: String, 
    tone: { 
        type: String, 
        default: 'green' 
    } 
})
</script>

<template>
  <div class="metric-card" :class="`tone-${tone}`">
    <div class="metric-top">
      <span class="metric-icon"><el-icon><component :is="icon" /></el-icon></span>
      <span v-if="trend" class="metric-trend">{{ trend }} to yesterday </span>
    </div>
    <div class="metric-value">{{ value }} <small>{{ unit }}</small></div>
    <div class="metric-label">{{ label }}</div>
  </div>
</template>

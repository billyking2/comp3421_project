<script setup>
import * as echarts from 'echarts'
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'

const props = defineProps({ 
    option: { type: Object, required: true }, 
    height: { type: String, default: '300px' } 
})

const el = ref()
let chart
let observer

onMounted(() => {
  chart = echarts.init(el.value)
  chart.setOption(props.option)
  observer = new ResizeObserver(() => chart?.resize())
  observer.observe(el.value)
})

watch(() => props.option, value => chart?.setOption(value, true), { deep: true })
onBeforeUnmount(() => { observer?.disconnect(); chart?.dispose() })

</script>

<template>
    <div ref="el" class="chart" :style="{ height }"></div>
</template>

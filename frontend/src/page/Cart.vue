<template>
    <div>
        this is cart page
    </div>
</template>

<script setup lang="ts">
import { useUserStore } from '../types/useUserStore'

const userId = useUserStore().userId

</script>
<style scoped>
</style>
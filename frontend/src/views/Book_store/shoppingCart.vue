<template>
  <div>this is cart page</div>
</template>

<script setup lang="ts">
import { useUserStore } from "../../store/useUserStore";

const userId = useUserStore().userId;

if (userId === null) {
  console.log("User is not logged in");
} else {
  console.log("User ID:", userId);
}
</script>
<style scoped></style>

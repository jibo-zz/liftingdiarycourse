<script setup lang="ts">
definePageMeta({
  middleware: ['guest']
})
</script>

<template>
  <div class="min-h-screen flex flex-col items-center justify-center gap-6">
    <h1 class="text-4xl font-bold">Lifting Diary</h1>
    <p class="text-gray-500 text-lg">Track your workouts and progress.</p>
    <UButton size="lg" to="/dashboard">Go to Dashboard</UButton>
  </div>
</template>

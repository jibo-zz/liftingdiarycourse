<template>
  <div class="min-h-screen bg-gray-950 text-white">
    <div class="max-w-xl mx-auto px-6 py-10">
      <!-- Header -->
      <div class="mb-8">
        <UButton
          icon="i-lucide-arrow-left"
          variant="ghost"
          color="neutral"
          to="/dashboard"
          class="mb-4"
        />
        <h1 class="text-3xl font-bold tracking-tight">Log Workout</h1>
        <p class="text-gray-400 mt-1">Record a new workout session</p>
      </div>

      <UCard>
        <UForm :state="form" :schema="schema" class="space-y-6" @submit="handleSubmit">
          <UFormField label="Workout Name" name="name">
            <UInput
              v-model="form.name"
              placeholder="e.g. Leg Day, Push Day"
              class="w-full"
            />
          </UFormField>

          <UFormField label="Date" name="date">
            <UInput
              v-model="form.date"
              type="date"
              class="w-full"
            />
          </UFormField>

          <UFormField label="Start Time" name="startTime">
            <UInput
              v-model="form.startTime"
              type="time"
              class="w-full"
            />
          </UFormField>

          <UAlert
            v-if="error"
            color="error"
            variant="soft"
            icon="i-lucide-circle-alert"
            :description="error"
          />

          <div class="flex justify-end gap-3 pt-2">
            <UButton
              label="Cancel"
              variant="ghost"
              color="neutral"
              to="/dashboard"
            />
            <UButton
              type="submit"
              label="Log Workout"
              color="primary"
              icon="i-lucide-plus"
              :loading="loading"
            />
          </div>
        </UForm>
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { z } from 'zod'
import { format } from 'date-fns'

definePageMeta({
  middleware: ['auth'],
})

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  date: z.iso.date('Invalid date'),
  startTime: z.string().min(1, 'Start time is required'),
})

const today = format(new Date(), 'yyyy-MM-dd')
const nowTime = format(new Date(), 'HH:mm')

const form = reactive({
  name: '',
  date: today,
  startTime: nowTime,
})

const loading = ref(false)
const error = ref<string | null>(null)

async function handleSubmit() {
  loading.value = true
  error.value = null
  try {
    const startedAt = new Date(`${form.date}T${form.startTime}`).toISOString()
    await $fetch('/api/workouts', {
      method: 'POST',
      body: { name: form.name, startedAt },
    })
    await navigateTo('/dashboard')
  }
  catch (e: unknown) {
    error.value = (e as { data?: { message?: string } })?.data?.message ?? 'Something went wrong. Please try again.'
  }
  finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white">
    <div class="max-w-5xl mx-auto px-6 py-10">
      <!-- Header -->
      <div class="mb-10">
        <h1 class="text-3xl font-bold tracking-tight">Workout Dashboard</h1>
        <p class="text-gray-500 dark:text-gray-400 mt-1">Track your lifting progress</p>
      </div>

      <div>
        <!-- Workouts Section -->
        <div>
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-3">
              <h2 class="text-lg font-semibold">Workouts on {{ formattedDate }}</h2>
              <UPopover :open="isOpen" @update:open="isOpen = $event">
                <UButton icon="i-lucide-calendar" color="neutral" variant="ghost" size="sm" />
                <template #content>
                  <div class="p-2">
                    <UCalendar v-model="selectedDate" color="primary" size="md" />
                  </div>
                </template>
              </UPopover>
            </div>
            <div class="flex items-center gap-3">
              <UBadge :label="`${workoutsForDate.length} logged`" color="primary" variant="soft" />
              <UButton icon="i-lucide-plus" label="Log New Workout" color="primary" :to="`/dashboard/workout/new?date=${dateKey}`" />
            </div>
          </div>

          <!-- Loading State -->
          <UCard v-if="status === 'pending'">
            <div class="flex items-center justify-center py-16">
              <UIcon name="i-lucide-loader-circle" class="w-8 h-8 text-gray-500 animate-spin" />
            </div>
          </UCard>

          <!-- Empty State -->
          <UCard v-else-if="workoutsForDate.length === 0">
            <div class="flex flex-col items-center justify-center py-16 text-center">
              <UIcon name="i-lucide-dumbbell" class="w-12 h-12 text-gray-600 mb-4" />
              <p class="text-gray-500 dark:text-gray-400 font-medium">No workouts logged</p>
              <p class="text-gray-400 dark:text-gray-600 text-sm mt-1">Nothing recorded for this day yet.</p>
            </div>
          </UCard>

          <!-- Workout Cards -->
          <div v-else class="space-y-4">
            <NuxtLink v-for="workout in workoutsForDate" :key="workout.id" :to="`/dashboard/workout/${workout.id}?date=${dateKey}`" class="block">
            <UCard class="hover:ring-2 hover:ring-primary-500 transition cursor-pointer">
              <div class="flex items-start justify-between">
                <div class="flex items-start gap-4">
                  <div class="bg-primary-500/10 rounded-xl p-3 mt-0.5">
                    <UIcon name="i-lucide-dumbbell" class="w-5 h-5 text-primary-400" />
                  </div>
                  <div>
                    <p class="font-semibold text-base">{{ workout.name }}</p>
                    <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{{ formatDuration(workout.startedAt, workout.completedAt) }} · {{ workout.exerciseCount }} exercises</p>
                  </div>
                </div>
              </div>

              <USeparator class="my-4" />

              <div class="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p class="text-xs text-gray-500 dark:text-gray-500 uppercase tracking-wider">Sets</p>
                  <p class="text-lg font-bold mt-1 text-gray-900 dark:text-white">{{ workout.setCount }}</p>
                </div>
                <div>
                  <p class="text-xs text-gray-500 dark:text-gray-500 uppercase tracking-wider">Reps</p>
                  <p class="text-lg font-bold mt-1 text-gray-900 dark:text-white">{{ workout.totalReps }}</p>
                </div>
                <div>
                  <p class="text-xs text-gray-500 dark:text-gray-500 uppercase tracking-wider">Volume</p>
                  <p class="text-lg font-bold mt-1 text-gray-900 dark:text-white">{{ formatVolume(workout.totalVolume) }}</p>
                </div>
              </div>
            </UCard>
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { format } from 'date-fns'

definePageMeta({
  middleware: ['auth'],
})
import { today, getLocalTimeZone, CalendarDate } from '@internationalized/date'

const route = useRoute()
const queryDate = route.query.date as string | undefined

function parseQueryDate(dateStr: string) {
  const [year, month, day] = dateStr.split('-').map(Number)
  return new CalendarDate(year, month, day)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const selectedDate = ref<any>(queryDate ? parseQueryDate(queryDate) : today(getLocalTimeZone()))
const isOpen = ref(false)

watch(selectedDate, () => {
  isOpen.value = false
})

const formattedDate = computed(() => {
  const d = selectedDate.value
  return format(new Date(d.year, d.month - 1, d.day), "do MMM yyyy")
})

const dateKey = computed(() => {
  const d = selectedDate.value
  return `${d.year}-${String(d.month).padStart(2, '0')}-${String(d.day).padStart(2, '0')}`
})

const { data: workoutsData, status } = await useAsyncData(
  () => `workouts-${dateKey.value}`,
  () => $fetch('/api/workouts', { query: { date: dateKey.value } }),
  { server: false },
)

const workoutsForDate = computed(() => workoutsData.value ?? [])

function formatDuration(startedAt: string | Date, completedAt: string | Date | null): string {
  if (!completedAt) return 'In progress'
  const minutes = Math.round((new Date(completedAt).getTime() - new Date(startedAt).getTime()) / 60000)
  return `${minutes} min`
}

function formatVolume(volume: number): string {
  return `${Number(volume).toLocaleString()} kg`
}
</script>

<template>
  <div class="min-h-screen bg-gray-950 text-white">
    <div class="max-w-5xl mx-auto px-6 py-10">
      <!-- Header -->
      <div class="mb-10">
        <h1 class="text-3xl font-bold tracking-tight">Workout Dashboard</h1>
        <p class="text-gray-400 mt-1">Track your lifting progress</p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-8 items-start">
        <!-- Calendar -->
        <UCard class="w-fit">
          <p class="text-xs text-gray-500 uppercase tracking-wider mb-4">Select a date</p>
          <UCalendar v-model="selectedDate" color="primary" size="md" />
          <p class="text-center text-sm font-medium text-gray-300 mt-4">{{ formattedDate }}</p>
        </UCard>

        <!-- Workouts Section -->
        <div>
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-semibold">Workouts on {{ formattedDate }}</h2>
            <UBadge :label="`${workouts.length} logged`" color="primary" variant="soft" />
          </div>

          <!-- Empty State -->
          <UCard v-if="workouts.length === 0">
            <div class="flex flex-col items-center justify-center py-16 text-center">
              <UIcon name="i-lucide-dumbbell" class="w-12 h-12 text-gray-600 mb-4" />
              <p class="text-gray-400 font-medium">No workouts logged</p>
              <p class="text-gray-600 text-sm mt-1">Nothing recorded for this day yet.</p>
              <UButton class="mt-6" icon="i-lucide-plus" label="Log Workout" color="primary" />
            </div>
          </UCard>

          <!-- Workout Cards -->
          <div v-else class="space-y-4">
            <UCard v-for="workout in workouts" :key="workout.id">
              <div class="flex items-start justify-between">
                <div class="flex items-start gap-4">
                  <div class="bg-primary-500/10 rounded-xl p-3 mt-0.5">
                    <UIcon name="i-lucide-dumbbell" class="w-5 h-5 text-primary-400" />
                  </div>
                  <div>
                    <p class="font-semibold text-base">{{ workout.name }}</p>
                    <p class="text-sm text-gray-400 mt-0.5">{{ workout.duration }} · {{ workout.exercises }} exercises</p>
                  </div>
                </div>
                <UBadge :label="workout.category" color="neutral" variant="soft" size="sm" />
              </div>

              <USeparator class="my-4" />

              <div class="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p class="text-xs text-gray-500 uppercase tracking-wider">Sets</p>
                  <p class="text-lg font-bold mt-1">{{ workout.sets }}</p>
                </div>
                <div>
                  <p class="text-xs text-gray-500 uppercase tracking-wider">Reps</p>
                  <p class="text-lg font-bold mt-1">{{ workout.reps }}</p>
                </div>
                <div>
                  <p class="text-xs text-gray-500 uppercase tracking-wider">Volume</p>
                  <p class="text-lg font-bold mt-1">{{ workout.volume }}</p>
                </div>
              </div>
            </UCard>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { format } from 'date-fns'
import { today, getLocalTimeZone, CalendarDate } from '@internationalized/date'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const selectedDate = ref<any>(today(getLocalTimeZone()))

const formattedDate = computed(() => {
  const d = selectedDate.value
  return format(new Date(d.year, d.month - 1, d.day), "do MMM yyyy")
})

// Placeholder workouts — replace with real data fetching later
const workouts = ref([
  {
    id: 1,
    name: 'Bench Press',
    category: 'Chest',
    duration: '45 min',
    exercises: 3,
    sets: 12,
    reps: 144,
    volume: '8,640 kg',
  },
  {
    id: 2,
    name: 'Squat',
    category: 'Legs',
    duration: '50 min',
    exercises: 4,
    sets: 16,
    reps: 160,
    volume: '12,000 kg',
  },
])
</script>

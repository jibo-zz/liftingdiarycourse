<template>
  <div class="min-h-screen bg-gray-950 text-white">
    <div class="max-w-xl mx-auto px-6 py-10">
      <!-- Header -->
      <div class="mb-8">
        <UButton
          icon="i-lucide-arrow-left"
          variant="ghost"
          color="neutral"
          :to="backLink"
          class="mb-4"
        />
        <h1 class="text-3xl font-bold tracking-tight">Edit Workout</h1>
        <p class="text-gray-400 mt-1">Update your workout details</p>
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
              :to="backLink"
            />
            <UButton
              type="submit"
              label="Save Changes"
              color="primary"
              icon="i-lucide-save"
              :loading="loading"
            />
          </div>
        </UForm>
      </UCard>

      <!-- Exercises Section -->
      <div class="mt-10">
        <h2 class="text-xl font-semibold mb-4">Exercises</h2>

        <!-- Search / Add Exercise -->
        <UCard class="mb-6">
          <UInput
            v-model="exerciseSearch"
            placeholder="Search exercises..."
            icon="i-lucide-search"
            :loading="searchLoading"
            class="w-full"
          />

          <div v-if="searchResults.length" class="mt-2 space-y-1">
            <UButton
              v-for="ex in searchResults"
              :key="ex.id"
              :label="ex.name"
              variant="ghost"
              color="neutral"
              block
              class="justify-start"
              @click="handleAddExercise(ex.id)"
            />
          </div>

          <div v-if="exerciseSearch.trim() && !searchResults.length && !searchLoading" class="mt-2">
            <UButton
              :label="`Create &quot;${exerciseSearch}&quot; and add`"
              variant="soft"
              color="primary"
              icon="i-lucide-plus"
              @click="handleCreateAndAddExercise"
            />
          </div>
        </UCard>

        <!-- Workout Exercise Cards -->
        <div v-if="workoutExercises?.length" class="space-y-4">
          <UCard v-for="we in workoutExercises" :key="we.id">
            <div class="flex items-center justify-between mb-4">
              <h3 class="font-semibold text-lg">{{ we.exercise.name }}</h3>
              <UButton
                icon="i-lucide-trash-2"
                variant="ghost"
                color="error"
                size="sm"
                @click="handleRemoveExercise(we.id)"
              />
            </div>

            <div v-if="we.sets.length" class="mb-4">
              <div class="grid grid-cols-4 text-xs text-gray-400 uppercase mb-2 px-1">
                <span>Set</span>
                <span>Reps</span>
                <span>Weight (kg)</span>
                <span />
              </div>
              <div
                v-for="set in we.sets"
                :key="set.id"
                class="grid grid-cols-4 items-center text-sm py-2 border-b border-gray-800 px-1"
              >
                <UBadge :label="String(set.setNumber)" variant="soft" color="neutral" class="w-fit" />
                <span>{{ set.reps ?? '—' }}</span>
                <span>{{ set.weight ?? '—' }}</span>
                <div class="flex justify-end">
                  <UButton
                    icon="i-lucide-x"
                    variant="ghost"
                    color="error"
                    size="xs"
                    @click="handleDeleteSet(we.id, set.id)"
                  />
                </div>
              </div>
            </div>

            <p v-else class="text-gray-500 text-sm mb-4">No sets logged yet.</p>

            <div class="flex gap-2 items-end flex-wrap">
              <UFormField label="Reps">
                <UInput
                  v-model="getSetForm(we.id).reps"
                  type="number"
                  placeholder="10"
                  class="w-24"
                />
              </UFormField>
              <UFormField label="Weight (kg)">
                <UInput
                  v-model="getSetForm(we.id).weight"
                  type="number"
                  placeholder="60"
                  step="0.5"
                  class="w-28"
                />
              </UFormField>
              <UButton
                label="Add Set"
                icon="i-lucide-plus"
                color="primary"
                class="mb-0.5"
                @click="handleAddSet(we.id)"
              />
            </div>
          </UCard>
        </div>

        <p v-else class="text-gray-500 text-sm mt-2">No exercises added yet. Search above to add one.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { z } from 'zod'
import { format } from 'date-fns'

definePageMeta({
  middleware: ['auth'],
})

const route = useRoute()
const workoutId = route.params.workoutId as string
const queryDate = route.query.date as string | undefined
const backLink = queryDate ? `/dashboard?date=${queryDate}` : '/dashboard'

const { data: workout, status } = await useAsyncData(`workout-${workoutId}`, () =>
  $fetch(`/api/workouts/${workoutId}`),
  { server: false }
)

watch(status, (s) => {
  if (s === 'success' && !workout.value) navigateTo('/dashboard')
  if (s === 'error') navigateTo('/dashboard')
})

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  date: z.iso.date('Invalid date'),
  startTime: z.string().min(1, 'Start time is required'),
})

const form = reactive({
  name: '',
  date: '',
  startTime: '',
})

watch(workout, (w) => {
  if (!w) return
  const startedAt = new Date(w.startedAt)
  form.name = w.name ?? ''
  form.date = format(startedAt, 'yyyy-MM-dd')
  form.startTime = format(startedAt, 'HH:mm')
}, { immediate: true })

const loading = ref(false)
const error = ref<string | null>(null)

async function handleSubmit() {
  loading.value = true
  error.value = null
  try {
    const startedAtIso = new Date(`${form.date}T${form.startTime}`).toISOString()
    await $fetch(`/api/workouts/${workoutId}`, {
      method: 'PATCH',
      body: { name: form.name, startedAt: startedAtIso },
    })
    await navigateTo(backLink)
  }
  catch (e: unknown) {
    error.value = (e as { data?: { message?: string } })?.data?.message ?? 'Something went wrong. Please try again.'
  }
  finally {
    loading.value = false
  }
}

// Exercises & Sets
const { data: workoutExercises, refresh: refreshExercises } = await useAsyncData(
  `workout-exercises-${workoutId}`,
  () => $fetch(`/api/workouts/${workoutId}/exercises`),
  { server: false }
)

const exerciseSearch = ref('')
const searchResults = ref<Array<{ id: number; name: string }>>([])
const searchLoading = ref(false)

let searchTimer: ReturnType<typeof setTimeout>
watch(exerciseSearch, (q) => {
  clearTimeout(searchTimer)
  if (!q.trim()) {
    searchResults.value = []
    return
  }
  searchTimer = setTimeout(async () => {
    searchLoading.value = true
    searchResults.value = await $fetch('/api/exercises/search', { query: { q } })
    searchLoading.value = false
  }, 300)
})

async function handleAddExercise(exerciseId: number) {
  await $fetch(`/api/workouts/${workoutId}/exercises`, {
    method: 'POST',
    body: { exerciseId },
  })
  exerciseSearch.value = ''
  searchResults.value = []
  await refreshExercises()
}

async function handleCreateAndAddExercise() {
  const name = exerciseSearch.value.trim()
  if (!name) return
  const created = await $fetch('/api/exercises', { method: 'POST', body: { name } })
  await handleAddExercise(created[0].id)
}

async function handleRemoveExercise(workoutExerciseId: number) {
  await $fetch(`/api/workouts/${workoutId}/exercises/${workoutExerciseId}`, { method: 'DELETE' })
  await refreshExercises()
}

const setForms = reactive<Record<number, { reps: string; weight: string }>>({})
function getSetForm(weId: number) {
  if (!setForms[weId]) setForms[weId] = { reps: '', weight: '' }
  return setForms[weId]
}

async function handleAddSet(workoutExerciseId: number) {
  const form = setForms[workoutExerciseId]
  if (!form?.reps && !form?.weight) return
  await $fetch(`/api/workouts/${workoutId}/exercises/${workoutExerciseId}/sets`, {
    method: 'POST',
    body: {
      reps: form.reps ? Number(form.reps) : undefined,
      weight: form.weight ? String(Number(form.weight).toFixed(2)) : undefined,
    },
  })
  setForms[workoutExerciseId] = { reps: '', weight: '' }
  await refreshExercises()
}

async function handleDeleteSet(workoutExerciseId: number, setId: number) {
  await $fetch(`/api/workouts/${workoutId}/exercises/${workoutExerciseId}/sets/${setId}`, { method: 'DELETE' })
  await refreshExercises()
}
</script>

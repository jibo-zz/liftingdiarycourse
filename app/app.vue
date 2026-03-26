<script setup lang="ts">
// Components are automatically imported
</script>

<template>
  <UApp>
    <header class="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
      <span class="text-lg font-bold tracking-tight text-gray-900 dark:text-white">Lifting Diary</span>
      <div class="flex items-center gap-3">
        <UColorModeSelect size="sm" />
        <Show when="signed-out">
          <div class="flex gap-2">
            <SignInButton mode="modal">
              <UButton label="Sign in" color="neutral" variant="outline" size="sm" />
            </SignInButton>
            <SignUpButton mode="modal">
              <UButton label="Sign up" color="primary" size="sm" />
            </SignUpButton>
          </div>
        </Show>
        <Show when="signed-in">
          <UserButton />
        </Show>
      </div>
    </header>

    <main>
      <NuxtPage />
    </main>
  </UApp>
</template>

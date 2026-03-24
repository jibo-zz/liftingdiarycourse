<script setup lang="ts">
// Components are automatically imported
</script>

<template>
  <UApp>
    <header class="flex justify-end p-4">
      <Show when="signed-out">
        <div class="flex gap-2">
          <SignInButton mode="modal">
            <button
              class="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors">
              Sign in
            </button>
          </SignInButton>
          <SignUpButton mode="modal">
            <button
              class="px-4 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800 transition-colors">
              Sign up
            </button>
          </SignUpButton>
        </div>
      </Show>
      <Show when="signed-in">
        <UserButton />
      </Show>
    </header>

    <main>
      <NuxtPage />
    </main>
  </UApp>
</template>

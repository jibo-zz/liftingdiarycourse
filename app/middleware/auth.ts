export default defineNuxtRouteMiddleware((to) => {
  const { userId } = useAuth()

  if (!userId.value) {
    const signInUrl = useClerk().value?.buildSignInUrl({
      redirectUrl: to.fullPath,
    })

    if (signInUrl) {
      return navigateTo(signInUrl, { external: true })
    }

    return navigateTo('/')
  }
})

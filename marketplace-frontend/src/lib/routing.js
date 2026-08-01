// Decides where to send a user based on their onboarding/role state — shared
// by Login and OTPVerification so both entry points agree on what "done"
// looks like instead of drifting out of sync.
export function routeForUser(user) {
  if (!user) return '/role-confirmation'
  if (user.role === 'admin') return '/admin'
  if (user.role === 'vendor') {
    if (!user.vendorVerificationStatus || user.vendorVerificationStatus === 'rejected') {
      return '/onboarding/vendor'
    }
    return '/vendor/dashboard'
  }
  if (user.role === 'customer') {
    if (user.onboardingStage === 'personalizing') return '/onboarding/quiz'
    return '/customer/dashboard'
  }
  if (user.onboardingStage === 'role_selection' || !user.role) return '/role-confirmation'
  return '/customer/dashboard'
}

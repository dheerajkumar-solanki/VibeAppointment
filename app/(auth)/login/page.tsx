export default function LoginPage() {
  return (
    <div className="mx-auto max-w-md space-y-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="space-y-2 text-center">
        <h1 className="text-xl font-semibold text-slate-900">
          Sign in to VibeAppointment
        </h1>
        <p className="text-sm text-slate-600">
          Use your Google account to book appointments and leave real feedback.
        </p>
      </div>
      <form
        action="/api/auth/login"
        method="post"
        className="space-y-3"
      >
        <button
          type="submit"
          className="flex w-full items-center justify-center gap-2 rounded-md bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-600"
        >
          <span>Continue with Google</span>
        </button>
      </form>
      <p className="text-xs text-slate-500">
        We never share your personal data with doctors without your consent. Your
        account is protected with Supabase Auth and Google OAuth.
      </p>
    </div>
  );
}


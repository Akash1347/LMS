import { Spinner } from "@/components/ui/spinner"
import {
  useChangePasswordHook,
  useGetUserDataHook,
  useSendVerificationOtpHook,
  useVerifyOtpHook,
} from "@/hooks/user.hook"
import { useState } from "react"
import { KeyRound, ShieldCheck } from "lucide-react"

const Settings = () => {
  const [passwordData, setPasswordData] = useState({ oldPassword: "", newPassword: "" })
  const [otp, setOtp] = useState("")
  const { data: userData } = useGetUserDataHook()

  const { mutate: changePassword, isPending: changingPassword } = useChangePasswordHook()
  const { mutate: sendVerificationOtp, isPending: sendingOtp } = useSendVerificationOtpHook()
  const { mutate: verifyOtp, isPending: verifyingOtp } = useVerifyOtpHook()

  const isVerified = Boolean(userData?.userData?.account_verified)

  const handlePasswordSubmit = (e) => {
    e.preventDefault()
    changePassword(passwordData, {
      onSuccess: () => setPasswordData({ oldPassword: "", newPassword: "" }),
    })
  }

  const handleVerifySubmit = (e) => {
    e.preventDefault()
    verifyOtp(
      { otp },
      {
        onSuccess: () => setOtp(""),
      }
    )
  }

  return (
    <div className="mx-auto min-h-[calc(100vh-120px)] w-full max-w-4xl px-4 py-8">
      <h1 className="text-3xl font-bold text-zinc-900">Settings</h1>
      <p className="mt-1 text-sm text-zinc-500">Manage your account security and verification.</p>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-zinc-900">Change Password</h2>
          <p className="mt-1 text-xs text-zinc-500">Update your account password securely.</p>

          <form className="mt-5 space-y-4" onSubmit={handlePasswordSubmit}>
            <div>
              <label className="text-sm font-medium text-zinc-700">Old Password</label>
              <div className="relative mt-1">
                <KeyRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                <input
                  type="password"
                  required
                  value={passwordData.oldPassword}
                  onChange={(e) =>
                    setPasswordData((prev) => ({ ...prev, oldPassword: e.target.value }))
                  }
                  className="w-full rounded-xl border border-zinc-200 py-3 pl-10 pr-3 text-sm focus:border-indigo-500 focus:outline-none"
                  placeholder="Enter old password"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-zinc-700">New Password</label>
              <div className="relative mt-1">
                <KeyRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                <input
                  type="password"
                  required
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData((prev) => ({ ...prev, newPassword: e.target.value }))
                  }
                  className="w-full rounded-xl border border-zinc-200 py-3 pl-10 pr-3 text-sm focus:border-indigo-500 focus:outline-none"
                  placeholder="Enter new password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={changingPassword}
              className="w-full rounded-xl bg-zinc-900 py-3 text-sm font-semibold text-white hover:bg-zinc-800 disabled:opacity-70"
            >
              {changingPassword ? <Spinner /> : "Update Password"}
            </button>
          </form>
        </section>

        <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-zinc-900">Account Verification</h2>
          <p className="mt-1 text-xs text-zinc-500">Verify your account using OTP sent to your email.</p>

          {isVerified ? (
            <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
              Your account is already verified.
            </div>
          ) : (
            <>
              <button
                type="button"
                onClick={() => sendVerificationOtp()}
                disabled={sendingOtp}
                className="mt-5 w-full rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-70"
              >
                {sendingOtp ? <Spinner /> : "Send Verification OTP"}
              </button>

              <form className="mt-4 space-y-4" onSubmit={handleVerifySubmit}>
                <div>
                  <label className="text-sm font-medium text-zinc-700">Verification OTP</label>
                  <div className="relative mt-1">
                    <ShieldCheck className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                    <input
                      type="text"
                      required
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="w-full rounded-xl border border-zinc-200 py-3 pl-10 pr-3 text-sm focus:border-indigo-500 focus:outline-none"
                      placeholder="Enter verification OTP"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={verifyingOtp}
                  className="w-full rounded-xl bg-zinc-900 py-3 text-sm font-semibold text-white hover:bg-zinc-800 disabled:opacity-70"
                >
                  {verifyingOtp ? <Spinner /> : "Verify Account"}
                </button>
              </form>
            </>
          )}
        </section>
      </div>
    </div>
  )
}

export default Settings
import { Spinner } from "@/components/ui/spinner"
import { useForgotPasswordHook, useResetPasswordHook } from "@/hooks/user.hook"
import { useState } from "react"
import { Link } from "react-router-dom"
import { KeyRound, Mail, ShieldCheck } from "lucide-react"

const ForgotPassword = () => {
  const [step, setStep] = useState(1)
  const [email, setEmail] = useState("")
  const [resetData, setResetData] = useState({ otp: "", newPassword: "" })

  const { mutate: sendOtp, isPending: sendingOtp } = useForgotPasswordHook()
  const { mutate: resetPassword, isPending: resetting } = useResetPasswordHook()

  const handleSendOtp = (e) => {
    e.preventDefault()
    sendOtp(
      { email },
      {
        onSuccess: () => setStep(2),
      }
    )
  }

  const handleResetPassword = (e) => {
    e.preventDefault()
    resetPassword({
      email,
      otp: resetData.otp,
      newPassword: resetData.newPassword,
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md rounded-2xl border border-zinc-100 bg-white p-8 shadow-xl">
        <h1 className="text-2xl font-bold text-zinc-900">Forgot Password</h1>
        <p className="mt-1 text-sm text-zinc-500">
          {step === 1
            ? "Enter your email and we’ll send an OTP."
            : "Enter OTP and set your new password."}
        </p>

        {step === 1 ? (
          <form className="mt-6 space-y-4" onSubmit={handleSendOtp}>
            <label className="text-sm font-medium text-zinc-700">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-zinc-200 py-3 pl-10 pr-3 text-sm focus:border-indigo-500 focus:outline-none"
                placeholder="Enter your email"
              />
            </div>

            <button
              type="submit"
              disabled={sendingOtp}
              className="w-full rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-70"
            >
              {sendingOtp ? <Spinner /> : "Send OTP"}
            </button>
          </form>
        ) : (
          <form className="mt-6 space-y-4" onSubmit={handleResetPassword}>
            <div>
              <label className="text-sm font-medium text-zinc-700">Email</label>
              <input
                type="email"
                disabled
                value={email}
                className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-100 p-3 text-sm"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-zinc-700">OTP</label>
              <div className="relative mt-1">
                <ShieldCheck className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  required
                  value={resetData.otp}
                  onChange={(e) => setResetData((prev) => ({ ...prev, otp: e.target.value }))}
                  className="w-full rounded-xl border border-zinc-200 py-3 pl-10 pr-3 text-sm focus:border-indigo-500 focus:outline-none"
                  placeholder="Enter OTP"
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
                  value={resetData.newPassword}
                  onChange={(e) => setResetData((prev) => ({ ...prev, newPassword: e.target.value }))}
                  className="w-full rounded-xl border border-zinc-200 py-3 pl-10 pr-3 text-sm focus:border-indigo-500 focus:outline-none"
                  placeholder="Enter new password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={resetting}
              className="w-full rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-70"
            >
              {resetting ? <Spinner /> : "Reset Password"}
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-zinc-600">
          Back to{" "}
          <Link to="/login" className="font-semibold text-indigo-600 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  )
}

export default ForgotPassword
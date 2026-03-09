import { Spinner } from "@/components/ui/spinner";
import { useLoginHook } from "@/hooks/user.hook";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, BookOpen, BarChart, Users } from "lucide-react";

export default function LogIn() {
  const [showPassword, setShowPassword] = useState(false);
  const initialFormData = {
    email: "",
    password: ""
  };
  const [formData, setFormData] = useState(initialFormData);
  const { mutate, isPending } = useLoginHook();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    mutate(formData, {
      onSuccess: () => {
        setFormData(initialFormData);
        setShowPassword(false);
      }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 bg-white/80 backdrop-blur-sm shadow-2xl rounded-3xl overflow-hidden max-w-5xl w-full border border-white/20">

        {/* LEFT SIDE - Enhanced with gradient and icons */}
        <div className="bg-gradient-to-br from-indigo-600 to-purple-600 text-white flex flex-col justify-center p-10 relative">
          {/* Subtle pattern overlay */}
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }}></div>

          <div className="relative z-10">
            <h1 className="text-4xl font-extrabold mb-4 tracking-tight">Welcome Back</h1>
            <p className="text-lg opacity-90 leading-relaxed">
              Continue learning and track your progress in LearnHub.
            </p>

            <div className="mt-8 space-y-3 text-sm font-medium">
              <p className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Resume your courses
              </p>
              <p className="flex items-center gap-2">
                <BarChart className="w-5 h-5" />
                Track learning progress
              </p>
              <p className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Connect with instructors
              </p>
            </div>

            {/* Decorative element */}
            <div className="mt-10 flex gap-2">
              <div className="w-10 h-10 rounded-full bg-white/30 border-2 border-white flex items-center justify-center text-white font-bold">📘</div>
              <div className="w-10 h-10 rounded-full bg-white/30 border-2 border-white flex items-center justify-center text-white font-bold">📊</div>
              <div className="w-10 h-10 rounded-full bg-white/30 border-2 border-white flex items-center justify-center text-white font-bold">👥</div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE FORM - Enhanced with icons and modern inputs */}
        <div className="p-10 bg-white">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Login to Your Account</h2>
          <p className="text-gray-500 mb-6">Welcome back! Please enter your details.</p>

          <form className="space-y-5" onSubmit={handleSubmit}>

            {/* Email with icon */}
            <div>
              <label className="text-sm font-medium text-gray-700 flex items-center gap-1 mb-1">
                <Mail className="w-4 h-4 text-indigo-600" />
                Email Address
              </label>
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition shadow-sm"
              />
            </div>

            {/* Password with icon and toggle */}
            <div>
              <label className="text-sm font-medium text-gray-700 flex items-center gap-1 mb-1">
                <Lock className="w-4 h-4 text-indigo-600" />
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition shadow-sm pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-indigo-600 hover:text-indigo-800 transition"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-semibold"
            >
              {isPending ? <Spinner /> : "Login"}
            </button>

            {/* Register redirect */}
            <p className="text-sm text-center text-gray-600">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="text-indigo-600 font-medium hover:text-indigo-800 hover:underline transition"
              >
                Register
              </Link>
            </p>
          </form>

          {/* Optional small print */}
          <div className="mt-6 text-center text-xs text-gray-400">
            Secure login • Protected by encryption
          </div>
        </div>
      </div>
    </div>
  );
}
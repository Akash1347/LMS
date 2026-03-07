import { Spinner } from "@/components/ui/spinner";
import { useLoginHook } from "@/hooks/user.hook";
import { useState } from "react";
import { Link } from "react-router-dom";

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
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">

      <div className="grid grid-cols-1 md:grid-cols-2 bg-white shadow-xl rounded-2xl overflow-hidden max-w-5xl w-full">

        {/* LEFT SIDE */}
        <div className="bg-indigo-600 text-white flex flex-col justify-center p-10">

          <h1 className="text-4xl font-bold mb-4">
            Welcome Back
          </h1>

          <p className="text-lg opacity-90">
            Continue learning and track your progress in LearnHub.
          </p>

          <div className="mt-8 space-y-3 text-sm opacity-90">
            <p>✔ Resume your courses</p>
            <p>✔ Track learning progress</p>
            <p>✔ Connect with instructors</p>
          </div>

        </div>

        {/* RIGHT SIDE FORM */}
        <div className="p-10">

          <h2 className="text-2xl font-semibold text-gray-800 mb-6">
            Login to Your Account
          </h2>

          <form className="space-y-4" onSubmit={handleSubmit}>

            {/* Email */}
            <div>
              <label className="text-sm font-medium text-gray-600">
                Email Address
              </label>

              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full mt-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Password */}
            <div>
              <label className="text-sm font-medium text-gray-600">
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
                  className="w-full mt-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-4 text-sm text-gray-500"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>

              </div>
            </div>

            {/* Button */}
            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition flex items-center justify-center disabled:opacity-60"
            >
              {isPending ? <Spinner /> : "Login"}
            </button>

            {/* Register redirect */}
            <p className="text-sm text-center text-gray-600">
              Don't have an account?
              <span className="text-indigo-600 ml-1 cursor-pointer hover:underline">
                <Link
                  to= "/register"

                > Register</Link>
              </span>
            </p>

          </form>

        </div>
      </div>

    </div>
  );
}
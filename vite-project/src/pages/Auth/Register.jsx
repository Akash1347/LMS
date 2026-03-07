import { Spinner } from "@/components/ui/spinner";
import { useRegisterHook } from "@/hooks/user.hook";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "react-router-dom";

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const initialFormData = {
    username: "",
    email: "",
    role: "Student",
    password: "",
  }
  const [formData, setFormData] = useState(initialFormData);
  const { mutate, isPending } = useRegisterHook()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  const handleSubmit = (e) => {
    e.preventDefault()
    console.log(formData)
    // mutate(formData, {
    //   onSuccess: () => {
    //     setFormData(initialFormData)
    //     setShowPassword(false)
    //   }
    // })
    mutate(formData)
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="grid grid-cols-1 md:grid-cols-2 bg-white shadow-xl rounded-2xl overflow-hidden max-w-5xl w-full">

        {/* LEFT SIDE */}
        <div className="bg-indigo-600 text-white flex flex-col justify-center p-10">
          <h1 className="text-4xl font-bold mb-4">Welcome to LearnHub</h1>
          <p className="text-lg opacity-90">
            Build skills with structured courses, track your progress,
            and learn from expert instructors.
          </p>

          <div className="mt-8 space-y-3 text-sm opacity-90">
            <p>✔ Access structured courses</p>
            <p>✔ Track learning progress</p>
            <p>✔ Join a learning community</p>
          </div>
        </div>

        {/* RIGHT SIDE FORM */}
        <div className="p-10">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">
            Create Account
          </h2>

          <form className="space-y-4" onSubmit={handleSubmit}>

            {/* Name */}
            <div>
              <label className="text-sm font-medium text-gray-600">
                Full Name
              </label>
              <input
                type="text"
                placeholder="Enter your name"
                name="username"
                className="w-full mt-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="text-sm font-medium text-gray-600">
                Email Address
              </label>
              <input
                type="email"
                placeholder="Enter your email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full mt-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            {/* Role */}
            <div>
              <label className="text-sm font-medium text-gray-600">
                Register As
              </label>
              <select className="w-full mt-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                name="role"
                value={formData.role}
                onChange={handleChange}>
                <option value="Student">Student</option>
                <option value="Instructor">Instructor</option>
              </select>
            </div>

            {/* Password */}
            <div>
              <label className="text-sm font-medium text-gray-600">
                Password
              </label>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Create password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full mt-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />

                <button
                  type="button"
                  className="absolute right-3 top-4 text-sm text-gray-500"
                  onClick={() => setShowPassword(!showPassword)}

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
              {isPending ? <Spinner /> : "Create Account"}
            </button>

            {/* Login redirect */}
            <p className="text-sm text-center text-gray-600">
              <Link
                to= "/login"
                className="text-indigo-600 ml-1 cursor-pointer hover:underline"
              >Already have an account?</Link>
              <span className="text-indigo-600 ml-1 cursor-pointer hover:underline">
                 
              </span>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
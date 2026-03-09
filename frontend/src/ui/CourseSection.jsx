import React from "react"
import { useGetCoursesHook } from "@/hooks/course.hook"
import { Spinner } from "@/components/ui/spinner"
import { useNavigate } from "react-router-dom"

const formatPrice = (price, currency = "INR") => {
  if (price === null || price === undefined) return "Free"
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(Number(price))
}

const CourseSection = () => {
  const navigate = useNavigate()
  const { data, isLoading, isError, error, refetch, isFetching } = useGetCoursesHook()
  console.log(data)
  const courses = data?.data?.data || []

  return (
    <section className="min-h-screen bg-slate-50 px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Explore Courses</h1>
            <p className="text-sm text-slate-600">Discover all available courses and start learning today.</p>
          </div>

          <button
            onClick={refetch}
            className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            {isFetching ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {isLoading ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center gap-2 text-slate-600">
            <Spinner className="size-6" />
            <p>Loading courses...</p>
          </div>
        ) : isError ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-700">
            <p className="font-semibold">Could not load courses</p>
            <p className="mt-1 text-sm">{error?.response?.data?.message || error?.message || "Please try again."}</p>
          </div>
        ) : courses.length === 0 ? (
          <div className="rounded-lg border border-slate-200 bg-white p-10 text-center text-slate-600">
            No courses available right now.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <article
                key={course.id}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
<div className="mb-3 flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <h2 className="line-clamp-2 text-lg font-semibold text-slate-900">{course.title}</h2>
                    <span className="rounded-md bg-indigo-50 px-2 py-1 text-xs font-semibold text-indigo-700">
                      {course.level || "N/A"}
                    </span>
                  </div>
                </div>

                {/* Course Image */}
                <div className="mb-4">
                  {course.thumbnail_url ? (
                    <img
                      src={course.thumbnail_url}
                      alt={course.title || 'Course thumbnail'}
                      className="w-full h-48 object-cover rounded-lg mb-4"
                    />
                  ) : (
                    <div className="w-full h-48 bg-slate-100 rounded-lg flex items-center justify-center">
                      <div className="text-slate-400 text-sm">No image available</div>
                    </div>
                  )}
                </div>

<p className="mb-4 line-clamp-3 text-sm text-slate-600">
                  {course.description || "No description added for this course yet."}
                </p>

                {/* Categories */}
                {course.category && course.category.length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-slate-700 mb-1">Categories:</h3>
                    <div className="flex flex-wrap gap-2">
                      {course.category.map((cat, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-800"
                        >
                          {cat}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mb-4 space-y-1 text-sm text-slate-700">
                  <p><span className="font-medium">Category:</span> {course.category || "General"}</p>
                  <p><span className="font-medium">Language:</span> {course.language || "English"}</p>
                  <p><span className="font-medium">Price:</span> {formatPrice(course.price, course.currency || "INR")}</p>
                </div>

                <div className="mt-auto">
                  <button
                    onClick={() => navigate(`/course/${course.id}`)}
                    className="w-full rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
                  >
                    View Details
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export default CourseSection
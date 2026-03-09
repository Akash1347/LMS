import {
    createCourseApi,
    createLessonApi,
    createModuleApi,
    deleteCourseApi,
    deleteLessonApi,
    deleteModuleApi,
    getCoursesApi,
    updateCourseApi,
    updateModuleApi,
    getBulkCourseApi,
} from "@/Api/course.api"
import { getCoursesOfInstructor, getUserCourse } from "@/Api/user.api"
import { useMutation, useQuery } from "@tanstack/react-query"
import { toast } from "sonner"

const getErrorMessage = (err) => {
    return err?.response?.data?.message || err?.message || "Something went wrong"
}

const getSuccessMessage = (res, fallback) => {
    return res?.data?.message || fallback
}

export const useCreateCourseHook = () => {
    return useMutation({
        mutationFn: createCourseApi,
        onSuccess: (res) => {
            toast.success(getSuccessMessage(res, "Course created successfully"))
        },
        onError: (err) => {
            toast.error(getErrorMessage(err))
        },
    })
}

export const useCreateModuleHook = () => {
    return useMutation({
        mutationFn: ({ courseId, payload }) => createModuleApi(courseId, payload),
        onSuccess: (res) => {
            toast.success(getSuccessMessage(res, "Module created successfully"))
        },
        onError: (err) => {
            toast.error(getErrorMessage(err))
        },
    })
}

export const useCreateLessonHook = () => {
    return useMutation({
        mutationFn: ({ moduleId, payload }) => createLessonApi(moduleId, payload),
        onSuccess: (res) => {
            toast.success(getSuccessMessage(res, "Lesson created successfully"))
        },
        onError: (err) => {
            toast.error(getErrorMessage(err))
        },
    })
}

export const useUpdateCourseHook = () => {
    return useMutation({
        mutationFn: ({ courseId, payload }) => updateCourseApi(courseId, payload),
        onSuccess: (res) => {
            toast.success(getSuccessMessage(res, "Course updated successfully"))
        },
        onError: (err) => {
            toast.error(getErrorMessage(err))
        },
    })
}

export const useUpdateModuleHook = () => {
    return useMutation({
        mutationFn: ({ moduleId, payload }) => updateModuleApi(moduleId, payload),
        onSuccess: (res) => {
            toast.success(getSuccessMessage(res, "Module updated successfully"))
        },
        onError: (err) => {
            toast.error(getErrorMessage(err))
        },
    })
}

export const useDeleteCourseHook = () => {
    return useMutation({
        mutationFn: (courseId) => deleteCourseApi(courseId),
        onSuccess: (res) => {
            toast.success(getSuccessMessage(res, "Course deleted successfully"))
        },
        onError: (err) => {
            toast.error(getErrorMessage(err))
        },
    })
}

export const useDeleteModuleHook = () => {
    return useMutation({
        mutationFn: (moduleId) => deleteModuleApi(moduleId),
        onSuccess: (res) => {
            toast.success(getSuccessMessage(res, "Module deleted successfully"))
        },
        onError: (err) => {
            toast.error(getErrorMessage(err))
        },
    })
}

export const useDeleteLessonHook = () => {
    return useMutation({
        mutationFn: ({ lessonId, payload }) => deleteLessonApi(lessonId, payload),
        onSuccess: (res) => {
            toast.success(getSuccessMessage(res, "Lesson deleted successfully"))
        },
        onError: (err) => {
            toast.error(getErrorMessage(err))
        },
    })
}

export const useGetCoursesHook = () => {
    return useQuery({
        queryFn: getCoursesApi,
        queryKey: ['getCourses']
    })
}

export const useGetUserCourseHook = (enabled = true) => {
    return useQuery({
        queryFn: getUserCourse,
        queryKey: ['getUserCourse'],
        enabled,
    })
}

export const useGetCourseOfInstructorHook = (enabled = true) => {
    return useQuery({
        queryFn: getCoursesOfInstructor,
        queryKey: ['getCourseOfInstructor'],
        enabled,
    })
}

export const useGetBulkCourseByIdsHook = (courseIds = [], enabled = true) => {
    return useQuery({
        queryFn: () => getBulkCourseApi(courseIds),
        queryKey: ['getBulkCourseByIds', courseIds],
        enabled: enabled && Array.isArray(courseIds) && courseIds.length > 0,
    })
}

export const useGetCourseDetailsHook = (courseId, enabled = true) => {
    return useQuery({
        queryFn: () => getCourseDetailsApi(courseId),
        queryKey: ['getCourseDetails', courseId],
        enabled: enabled && courseId,
    })
}

export const getCourseDetailsApi = async (courseId) => {
    const res = await axios.get(`${COURSE_BASE_URL}/${courseId}`, getAuthConfig())
    return res.data
}

import { baseApi, cacheApiResponse } from "./baseApi";
import { Task, TaskStatus } from "@/types/task";

interface TasksResponse {
  items: Task[];
  total: number;
}

interface TaskFilters {
  status?: TaskStatus;
  assigneeId?: string;
  teamId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

interface CreateTaskRequest {
  title: string;
  description?: string;
  dueDate: string;
  assigneeId?: string;
  teamId?: string;
  priority?: "low" | "medium" | "high";
}

interface UpdateTaskRequest {
  id: string;
  title?: string;
  description?: string;
  dueDate?: string;
  assigneeId?: string;
  teamId?: string;
  status?: TaskStatus;
  priority?: "low" | "medium" | "high";
}

export const taskApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getTasks: builder.query<TasksResponse, TaskFilters | void>({
      query: (filters = {}) => {
        // Преобразуем фильтры в строку запроса
        const params = new URLSearchParams();
        if (filters) {
          Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined) {
              params.append(key, String(value));
            }
          });
        }

        return `/tasks/tasks?${params.toString()}`;
      },
      // Кэшируем ответ
      async onQueryStarted(filters, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          const queryString = new URLSearchParams(
            filters as Record<string, string>
          ).toString();
          cacheApiResponse(`/tasks?${queryString}`, data);
        } catch (error) {
          console.error("Failed to fetch tasks:", error);
        }
      },
      providesTags: (result) =>
        result && result.items
          ? [
              ...result.items.map(({ id }) => ({ type: "Task" as const, id })),
              { type: "Task", id: "LIST" },
            ]
          : [{ type: "Task", id: "LIST" }],
    }),

    getTaskById: builder.query<Task, string>({
      query: (id) => `/tasks/tasks/${id}`,
      // Кэшируем ответ
      async onQueryStarted(id, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          cacheApiResponse(`/tasks/${id}`, data);
        } catch (error) {
          console.error(`Failed to fetch task ${id}:`, error);
        }
      },
      providesTags: (result, error, id) => [{ type: "Task", id }],
    }),

    createTask: builder.mutation<Task, CreateTaskRequest>({
      query: (taskData) => ({
        url: "/tasks/tasks",
        method: "POST",
        body: {
          ...taskData,
          team_id: taskData.teamId,
          assignee_id: taskData.assigneeId,
        },
      }),
      invalidatesTags: [{ type: "Task", id: "LIST" }],
    }),

    updateTask: builder.mutation<Task, UpdateTaskRequest>({
      query: ({ id, ...taskData }) => ({
        url: `/tasks/tasks/${id}`,
        method: "PATCH",
        body: taskData,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Task", id },
        { type: "Task", id: "LIST" },
      ],
    }),

    deleteTask: builder.mutation<void, string>({
      query: (id) => ({
        url: `/tasks/tasks/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Task", id },
        { type: "Task", id: "LIST" },
      ],
    }),
    uploadTaskPhoto: builder.mutation<
      { photoUrl: string },
      { taskId: string; photoData: string }
    >({
      query: ({ taskId, photoData }) => {
        // Создаем FormData для отправки файла
        const formData = new FormData();

        // Конвертируем base64 в Blob
        const byteString = atob(photoData.split(",")[1]);
        const mimeString = photoData.split(",")[0].split(":")[1].split(";")[0];
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);

        for (let i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i);
        }

        const blob = new Blob([ab], { type: mimeString });
        formData.append("photo", blob, "photo.jpg");

        return {
          url: `/tasks/${taskId}/photos`,
          method: "POST",
          body: formData,
          formData: true,
        };
      },
      invalidatesTags: (result, error, { taskId }) => [
        { type: "Task", id: taskId },
      ],
    }),
    addQrCodeToTask: builder.mutation<Task, { taskId: string; qrData: string }>(
      {
        query: ({ taskId, qrData }) => ({
          url: `/tasks/${taskId}/qrcode`,
          method: "POST",
          body: { qrData },
        }),
        invalidatesTags: (result, error, { taskId }) => [
          { type: "Task", id: taskId },
        ],
      }
    ),
  }),
});

export const {
  useGetTasksQuery,
  useGetTaskByIdQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
  useUploadTaskPhotoMutation,
  useAddQrCodeToTaskMutation,
} = taskApi;

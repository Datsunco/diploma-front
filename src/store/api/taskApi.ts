import { baseApi, cacheApiResponse } from "./baseApi";
import { Task, TaskStatus } from "@/types/task";

interface TasksResponse {
  tasks: Task[];
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
        result && result.tasks
          ? [
              ...result.tasks.map(({ id }) => ({ type: "Task" as const, id })),
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
        body: taskData,
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
  }),
});

export const {
  useGetTasksQuery,
  useGetTaskByIdQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
} = taskApi;

// import { createApi } from '@reduxjs/toolkit/query/react';
// import { baseQueryWithReauth } from './baseQuery';
// import {
//   Task,
//   TasksResponse,
//   CreateTaskRequest,
//   UpdateTaskRequest,
//   TaskFilter,
//   TaskSort
// } from '../types/task';

// export const taskApi = createApi({
//   reducerPath: 'taskApi',
//   baseQuery: baseQueryWithReauth,
//   tagTypes: ['Task'],
//   endpoints: (builder) => ({
//     getTasks: builder.query<TasksResponse, {
//       page?: number;
//       limit?: number;
//       filter?: TaskFilter;
//       sort?: TaskSort;
//     }>({
//       query: ({ page = 1, limit = 10, filter, sort }) => {
//         let url = `/tasks?page=${page}&limit=${limit}`;

//         if (filter) {
//           if (filter.status?.length) url += `&status=${filter.status.join(',')}`;
//           if (filter.priority?.length) url += `&priority=${filter.priority.join(',')}`;
//           if (filter.assigneeId) url += `&assigneeId=${filter.assigneeId}`;
//           if (filter.teamId) url += `&teamId=${filter.teamId}`;
//           if (filter.search) url += `&search=${encodeURIComponent(filter.search)}`;
//           if (filter.tags?.length) url += `&tags=${filter.tags.join(',')}`;
//           if (filter.startDate) url += `&startDate=${filter.startDate}`;
//           if (filter.endDate) url += `&endDate=${filter.endDate}`;
//         }

//         if (sort) {
//           url += `&sortBy=${sort.field}&sortDirection=${sort.direction}`;
//         }

//         return url;
//       },
//       providesTags: (result) =>
//         result
//           ? [
//               ...result.tasks.map(({ id }) => ({ type: 'Task' as const, id })),
//               { type: 'Task', id: 'LIST' }
//             ]
//           : [{ type: 'Task', id: 'LIST' }]
//     }),

//     getTaskById: builder.query<Task, string>({
//       query: (id) => `/tasks/${id}`,
//       providesTags: (_, __, id) => [{ type: 'Task', id }]
//     }),

//     createTask: builder.mutation<Task, CreateTaskRequest>({
//       query: (task) => ({
//         url: '/tasks',
//         method: 'POST',
//         body: task
//       }),
//       invalidatesTags: [{ type: 'Task', id: 'LIST' }]
//     }),

//     updateTask: builder.mutation<Task, UpdateTaskRequest>({
//       query: ({ id, ...task }) => ({
//         url: `/tasks/${id}`,
//         method: 'PATCH',
//         body: task
//       }),
//       invalidatesTags: (_, __, { id }) => [
//         { type: 'Task', id },
//         { type: 'Task', id: 'LIST' }
//       ]
//     }),

//     deleteTask: builder.mutation<void, string>({
//       query: (id) => ({
//         url: `/tasks/${id}`,
//         method: 'DELETE'
//       }),
//       invalidatesTags: [{ type: 'Task', id: 'LIST' }]
//     }),

//     addComment: builder.mutation<Comment, { taskId: string, content: string }>({
//       query: ({ taskId, content }) => ({
//         url: `/tasks/${taskId}/comments`,
//         method: 'POST',
//         body: { content }
//       }),
//       invalidatesTags: (_, __, { taskId }) => [{ type: 'Task', id: taskId }]
//     }),

//     uploadAttachment: builder.mutation<Attachment, { taskId: string, file: File }>({
//       query: ({ taskId, file }) => {
//         const formData = new FormData();
//         formData.append('file', file);

//         return {
//           url: `/tasks/${taskId}/attachments`,
//           method: 'POST',
//           body: formData,
//           formData: true
//         };
//       },
//       invalidatesTags: (_, __, { taskId }) => [{ type: 'Task', id: taskId }]
//     })
//   })
// });

// export const {
//   useGetTasksQuery,
//   useGetTaskByIdQuery,
//   useCreateTaskMutation,
//   useUpdateTaskMutation,
//   useDeleteTaskMutation,
//   useAddCommentMutation,
//   useUploadAttachmentMutation
// } = taskApi;

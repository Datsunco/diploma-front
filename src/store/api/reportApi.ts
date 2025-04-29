import { baseApi, cacheApiResponse } from "./baseApi";
import { Report } from "@/types/report";

interface ReportsResponse {
  reports: Report[];
  total: number;
}

interface ReportFilters {
  startDate?: string;
  endDate?: string;
  teamId?: string;
  userId?: string;
  page?: number;
  limit?: number;
}

interface CreateReportRequest {
  title: string;
  description: string;
  date: string;
  teamId?: string;
  taskIds?: string[];
  attachments?: File[];
}

export const reportApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getReports: builder.query<ReportsResponse, ReportFilters | void>({
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

        return `/reports?${params.toString()}`;
      },
      // Кэшируем ответ
      async onQueryStarted(filters, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          const queryString = new URLSearchParams(
            filters as Record<string, string>
          ).toString();
          cacheApiResponse(`/reports?${queryString}`, data);
        } catch (error) {
          console.error("Failed to fetch reports:", error);
        }
      },
      providesTags: (result) =>
        result
          ? [
              ...result.reports.map(({ id }) => ({
                type: "Report" as const,
                id,
              })),
              { type: "Report", id: "LIST" },
            ]
          : [{ type: "Report", id: "LIST" }],
    }),

    getReportById: builder.query<Report, string>({
      query: (id) => `/reports/${id}`,
      // Кэшируем ответ
      async onQueryStarted(id, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          cacheApiResponse(`/reports/${id}`, data);
        } catch (error) {
          console.error(`Failed to fetch report ${id}:`, error);
        }
      },
      providesTags: (result, error, id) => [{ type: "Report", id }],
    }),

    createReport: builder.mutation<Report, CreateReportRequest>({
      query: (reportData) => {
        // Создаем FormData для отправки файлов
        const formData = new FormData();

        // Добавляем текстовые поля
        Object.entries(reportData).forEach(([key, value]) => {
          if (key !== "attachments" && value !== undefined) {
            formData.append(
              key,
              typeof value === "string" ? value : JSON.stringify(value)
            );
          }
        });

        // Добавляем файлы, если они есть
        if (reportData.attachments) {
          reportData.attachments.forEach((file) => {
            formData.append("attachments", file);
          });
        }

        return {
          url: "/reports",
          method: "POST",
          body: formData,
          // Не устанавливаем Content-Type, браузер сделает это автоматически
          formData: true,
        };
      },
      invalidatesTags: [{ type: "Report", id: "LIST" }],
    }),

    exportReportToCsv: builder.query<Blob, ReportFilters | void>({
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

        return {
          url: `/reports/export/csv?${params.toString()}`,
          responseHandler: (response) => response.blob(),
        };
      },
    }),
  }),
});

export const {
  useGetReportsQuery,
  useGetReportByIdQuery,
  useCreateReportMutation,
  useLazyExportReportToCsvQuery,
} = reportApi;

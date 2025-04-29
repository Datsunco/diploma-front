import { baseApi, cacheApiResponse } from "./baseApi";
import { Team } from "@/types/team";

// interface TeamsResponse {
//   teams: Team[];
//   total: number;
// }

type TeamsResponse = Team[];

interface TeamFilters {
  name?: string;
  page?: number;
  limit?: number;
}

interface CreateTeamRequest {
  name: string;
  description?: string;
  memberIds?: string[];
  leaderId?: string;
}

interface UpdateTeamRequest {
  id: string;
  name?: string;
  description?: string;
  memberIds?: string[];
  leaderId?: string;
}

export const teamApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getTeams: builder.query<TeamsResponse, TeamFilters | void>({
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

        return `/teams/teams?${params.toString()}`;
      },
      // Кэшируем ответ
      async onQueryStarted(filters, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          const queryString = new URLSearchParams(
            filters as Record<string, string>
          ).toString();
          cacheApiResponse(`/teams?${queryString}`, data);
        } catch (error) {
          console.error("Failed to fetch teams:", error);
        }
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Team" as const, id })),
              { type: "Team", id: "LIST" },
            ]
          : [{ type: "Team", id: "LIST" }],
    }),

    getTeamById: builder.query<Team, string>({
      query: (id) => `/teams/teams/${id}`,
      // Кэшируем ответ
      async onQueryStarted(id, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          cacheApiResponse(`/teams/${id}`, data);
        } catch (error) {
          console.error(`Failed to fetch team ${id}:`, error);
        }
      },
      providesTags: (result, error, id) => [{ type: "Team", id }],
    }),

    createTeam: builder.mutation<Team, CreateTeamRequest>({
      query: (teamData) => ({
        url: "/teams/teams",
        method: "POST",
        body: teamData,
      }),
      invalidatesTags: [{ type: "Team", id: "LIST" }],
    }),

    updateTeam: builder.mutation<Team, UpdateTeamRequest>({
      query: ({ id, ...teamData }) => ({
        url: `/teams/${id}`,
        method: "PATCH",
        body: teamData,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Team", id },
        { type: "Team", id: "LIST" },
      ],
    }),

    deleteTeam: builder.mutation<void, string>({
      query: (id) => ({
        url: `/teams/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Team", id },
        { type: "Team", id: "LIST" },
      ],
    }),

    addMemberToTeam: builder.mutation<Team, { teamId: string; userId: string }>(
      {
        query: ({ teamId, userId }) => ({
          url: `/teams/${teamId}/members`,
          method: "POST",
          body: { userId },
        }),
        invalidatesTags: (result, error, { teamId }) => [
          { type: "Team", id: teamId },
        ],
      }
    ),

    removeMemberFromTeam: builder.mutation<
      Team,
      { teamId: string; userId: string }
    >({
      query: ({ teamId, userId }) => ({
        url: `/teams/${teamId}/members/${userId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { teamId }) => [
        { type: "Team", id: teamId },
      ],
    }),
  }),
});

export const {
  useGetTeamsQuery,
  useGetTeamByIdQuery,
  useCreateTeamMutation,
  useUpdateTeamMutation,
  useDeleteTeamMutation,
  useAddMemberToTeamMutation,
  useRemoveMemberFromTeamMutation,
} = teamApi;

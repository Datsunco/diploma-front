import { baseApi, cacheApiResponse } from "./baseApi";
import { User } from "@/types/user";
import { setCredentials, logout } from "../slices/authSlice";

interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role?: string;
}

interface AuthResponse {
  user: User;
  token: string;
  refresh_token: string;
}

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<AuthResponse, LoginRequest>({
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        body: credentials,
      }),
      // После успешного входа сохраняем данные в Redux store
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          console.log("Начало обработки ответа login");
          const result = await queryFulfilled;
          console.log("Полный ответ от сервера:", result);
          const { data } = result;
          console.log("Данные ответа:", data);

          if (!data.refresh_token) {
            console.error("refreshToken отсутствует в ответе:", data);
          }
          dispatch(
            setCredentials({
              user: data.user,
              token: data.token,
              refreshToken: data.refresh_token,
            })
          );

          // Сохраняем refreshToken в localStorage для сохранения сессии
          localStorage.setItem("refreshToken", data.refresh_token);
        } catch (error) {
          // Обработка ошибок при входе
          console.error("Login failed:", error);
        }
      },
    }),

    register: builder.mutation<AuthResponse, RegisterRequest>({
      query: (userData) => ({
        url: "/auth/register",
        method: "POST",
        body: userData,
      }),
      // После успешной регистрации сохраняем данные в Redux store
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(
            setCredentials({
              user: data.user,
              token: data.token,
              refreshToken: data.refresh_token,
            })
          );

          // Сохраняем refreshToken в localStorage для сохранения сессии
          localStorage.setItem("refreshToken", data.refresh_token);
        } catch (error) {
          // Обработка ошибок при регистрации
          console.error("Registration failed:", error);
        }
      },
    }),

    getCurrentUser: builder.query<User, void>({
      query: () => "/auth/me",
      // Кэшируем данные пользователя
      async onQueryStarted(_, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          cacheApiResponse("/auth/me", data);
        } catch (error) {
          console.error("Failed to fetch current user:", error);
        }
      },
      providesTags: ["User"],
    }),

    refreshToken: builder.mutation<
      { access_token: string; token_type: string },
      string
    >({
      query: (refreshToken) => ({
        url: "/auth/refresh",
        method: "POST",
        body: { refresh_token: refreshToken },
      }),
      // После успешного обновления токена обновляем данные в Redux store
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          console.log("peeenis");
          const { data } = await queryFulfilled;
          console.log("chlen", data);
          dispatch(
            setCredentials({
              token: data.access_token,
            })
          );

          // Обновляем refreshToken в localStorage
          // localStorage.setItem("refreshToken", data.refresh_token);
        } catch (error) {
          // Если не удалось обновить токен, выходим из системы
          console.error("Token refresh failed:", error);
          dispatch(logout());
          localStorage.removeItem("refreshToken");
        }
      },
    }),

    logout: builder.mutation<void, void>({
      query: () => ({
        url: "/auth/logout",
        method: "POST",
      }),
      // После выхода очищаем данные в Redux store
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(logout());
          localStorage.removeItem("refreshToken");
        } catch (error) {
          console.error("Logout failed:", error);
          // Даже если запрос не удался, все равно выходим локально
          dispatch(logout());
          localStorage.removeItem("refreshToken");
        }
      },
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useGetCurrentUserQuery,
  useRefreshTokenMutation,
  useLogoutMutation,
} = authApi;

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { RootState } from "../index";

import { savePendingAction } from '@/lib/db';

// Определяем базовый URL для API
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000/api";

// Создаем базовый API с RTK Query
export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.REACT_APP_API_URL || "/api",
    prepareHeaders: (headers, { getState }) => {
      // Получаем токен из состояния
      const token = (getState() as RootState).auth.token;

      // Если есть токен, добавляем его в заголовки
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }

      return headers;
    },
    // Обработка офлайн-режима
    async fetchFn(input, init) {
      try {
        // Пытаемся выполнить запрос
        const response = await fetch(input, init);
        return response;
      } catch (error) {
        // Если ошибка связана с сетью (офлайн)
        if (!navigator.onLine) {
          console.log("Offline mode detected, saving request for later");

          // Сохраняем запрос для последующей синхронизации
          const url = typeof input === "string" ? input : input.url;
          const method = init?.method || "GET";
          const headers = init?.headers
            ? Object.fromEntries(new Headers(init.headers).entries())
            : {};
          const body = init?.body ? init.body.toString() : "";

          // Если это мутация (не GET запрос), сохраняем для синхронизации
          if (method !== "GET") {
            await savePendingAction({
              url,
              method,
              headers,
              body,
            });
          }

          // Для GET запросов возвращаем кэшированные данные, если они есть
          if (method === "GET") {
            const cachedResponse = await caches.match(new Request(url, init));
            if (cachedResponse) {
              return cachedResponse;
            }
          }
        }

        // Пробрасываем ошибку дальше
        throw error;
      }
    },
  }),
  tagTypes: ["User", "Task", "Team", "Report", "Notification"],
  endpoints: () => ({}),
});

// Функция для кэширования ответов
export const cacheApiResponse = (url: string, data: any, ttl = 3600000) => {
  // ttl - 1 час по умолчанию
  const cacheItem = {
    data,
    expiry: Date.now() + ttl,
  };
  localStorage.setItem(`cache:${url}`, JSON.stringify(cacheItem));
};

import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { baseApi } from "./api/baseApi";
import authReducer from "./slices/authSlice";
import networkReducer from "./slices/networkSlice";

export const store = configureStore({
  reducer: {
    [baseApi.reducerPath]: baseApi.reducer,
    auth: authReducer,
    network: networkReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Игнорируем несериализуемые значения в определенных действиях
        ignoredActions: ["network/addPendingAction"],
      },
    }).concat(baseApi.middleware),
  devTools: process.env.NODE_ENV !== "production",
});

// Необходимо для refetchOnFocus/refetchOnReconnect
setupListeners(store.dispatch);

// Слушаем изменения статуса сети
window.addEventListener("online", () => {
  store.dispatch({ type: "network/setOnlineStatus", payload: true });
});

window.addEventListener("offline", () => {
  store.dispatch({ type: "network/setOnlineStatus", payload: false });
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

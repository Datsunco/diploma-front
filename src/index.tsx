import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { store } from "./store";
import App from "./App";
import "./styles/globals.css";

import * as serviceWorkerRegistration from "./serviceWorkerRegistration";

interface ServiceWorkerRegistration {
  readonly waiting: ServiceWorker | null;
  readonly installing: ServiceWorker | null;
  readonly active: ServiceWorker | null;
  update(): Promise<void>;
  unregister(): Promise<boolean>;
}

// Регистрация Service Worker для PWA
// if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
//   window.addEventListener('load', () => {
//     navigator.serviceWorker.register('/service-worker.js').then(registration => {
//       console.log('SW registered: ', registration);
//     }).catch(registrationError => {
//       console.log('SW registration failed: ', registrationError);
//     });
//   });
// }

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);

// Регистрация сервис-воркера для PWA функционала
serviceWorkerRegistration.register({
  onUpdate: (registration: ServiceWorkerRegistration) => {
    // Показать уведомление о доступном обновлении
    const updateAvailable = window.confirm(
      "New version of the app is available. Reload to update?"
    );

    if (updateAvailable) {
      if (registration && registration.waiting) {
        // Отправляем сообщение сервис-воркеру для пропуска ожидания
        registration.waiting.postMessage({ type: "SKIP_WAITING" });
      }
      window.location.reload();
    }
  },
});

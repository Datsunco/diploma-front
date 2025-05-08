import React, { useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";
import {
  useSubscribeToPushMutation,
  useUnsubscribeFromPushMutation,
} from "@/store/api/notificationApi";

const PushNotificationManager: React.FC = () => {
  const [permission, setPermission] = useState<
    NotificationPermission | "default"
  >("default");
  const [subscription, setSubscription] = useState<PushSubscription | null>(
    null
  );
  const { toast } = useToast();

  const [subscribeToPush, { isLoading: isSubscribing }] =
    useSubscribeToPushMutation();
  const [unsubscribeFromPush, { isLoading: isUnsubscribing }] =
    useUnsubscribeFromPushMutation();

  // Проверяем поддержку уведомлений и текущее разрешение
  useEffect(() => {
    const checkPermission = async () => {
      if (!("Notification" in window)) {
        console.log("This browser does not support notifications");
        return;
      }

      setPermission(Notification.permission);

      if (Notification.permission === "granted") {
        await checkSubscription();
      }
    };

    checkPermission();
  }, []);

  // Проверяем текущую подписку
  const checkSubscription = async () => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      console.log("Push notifications are not supported");
      return;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      const existingSubscription =
        await registration.pushManager.getSubscription();
      setSubscription(existingSubscription);
    } catch (error) {
      console.error("Error checking push subscription:", error);
    }
  };

  // Запрашиваем разрешение на уведомления
  const requestPermission = async () => {
    if (!("Notification" in window)) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "This browser does not support notifications",
      });
      return;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);

      if (result === "granted") {
        toast({
          title: "Success",
          description: "Notification permission granted!",
        });

        // После получения разрешения, подписываемся на push-уведомления
        await subscribe();
      } else {
        toast({
          variant: "destructive",
          title: "Permission Denied",
          description: "You need to allow notifications to receive updates",
        });
      }
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to request notification permission",
      });
    }
  };

  // Подписываемся на push-уведомления
  const subscribe = async () => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Push notifications are not supported in this browser",
      });
      return;
    }

    try {
      const registration = await navigator.serviceWorker.ready;

      // Создаем новую подписку
      const subscriptionOptions = {
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          "YOUR_VAPID_PUBLIC_KEY" // Замените на ваш VAPID публичный ключ
        ),
      };

      const newSubscription = await registration.pushManager.subscribe(
        subscriptionOptions
      );
      setSubscription(newSubscription);

      // Отправляем подписку на сервер
      await subscribeToPush({
        subscription: JSON.stringify(newSubscription),
      }).unwrap();

      toast({
        title: "Success",
        description: "Successfully subscribed to push notifications",
      });
    } catch (error) {
      console.error("Error subscribing to push notifications:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to subscribe to push notifications",
      });
    }
  };

  // Отписываемся от push-уведомлений
  const unsubscribe = async () => {
    if (!subscription) return;

    try {
      await subscription.unsubscribe();
      setSubscription(null);

      // Уведомляем сервер об отписке
      await unsubscribeFromPush({
        endpoint: subscription.endpoint,
      }).unwrap();

      toast({
        title: "Success",
        description: "Successfully unsubscribed from push notifications",
      });
    } catch (error) {
      console.error("Error unsubscribing from push notifications:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to unsubscribe from push notifications",
      });
    }
  };

  // Вспомогательная функция для конвертации base64 в Uint8Array
  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, "+")
      .replace(/_/g, "/");
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }

    return outputArray;
  };

  // Если браузер не поддерживает уведомления, не отображаем компонент
  if (!("Notification" in window)) {
    return null;
  }

  return (
    <div className="flex items-center space-x-2">
      {permission === "default" && (
        <Button
          onClick={requestPermission}
          disabled={isSubscribing}
          variant="outline"
          size="sm"
        >
          <Bell className="h-4 w-4 mr-2" />
          Enable Notifications
        </Button>
      )}

      {permission === "granted" && !subscription && (
        <Button
          onClick={subscribe}
          disabled={isSubscribing}
          variant="outline"
          size="sm"
        >
          <Bell className="h-4 w-4 mr-2" />
          Subscribe to Notifications
        </Button>
      )}

      {permission === "granted" && subscription && (
        <Button
          onClick={unsubscribe}
          disabled={isUnsubscribing}
          variant="outline"
          size="sm"
        >
          <Bell className="h-4 w-4 mr-2" />
          Unsubscribe from Notifications
        </Button>
      )}
    </div>
  );
};

export default PushNotificationManager;

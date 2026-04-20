import { useEffect, useState } from "react";

let countListeners: Array<(count: number) => void> = [];
let notificationListeners: Array<(message: string | null) => void> = [];
let lastNotification: string | null = null;
const EMERGENCY_STORAGE_KEY = "presence_emergency_event";

type EmergencyPayload = {
  count: number;
  message: string;
  triggeredAt: string;
};

function readStoredEmergencyPayload(): EmergencyPayload | null {
  const raw = localStorage.getItem(EMERGENCY_STORAGE_KEY);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as EmergencyPayload;
  } catch {
    return null;
  }
}

function getCurrentNotification(): string | null {
  return readStoredEmergencyPayload()?.message ?? lastNotification;
}

function notifyCountListeners(count: number) {
  countListeners.forEach((cb) => {
    try {
      cb(count);
    } catch (error) {
      console.error("Emergency listener error", error);
    }
  });
}

function notifyNotificationListeners(message: string | null) {
  notificationListeners.forEach((cb) => {
    try {
      cb(message);
    } catch (error) {
      console.error("Emergency notification listener error", error);
    }
  });
}

function applyEmergencyPayload(payload: EmergencyPayload) {
  lastNotification = payload.message;
  notifyCountListeners(payload.count);
  notifyNotificationListeners(payload.message);
}

export function triggerEmergency(count: number) {
  console.log("Emergency triggered:", count);
  const payload: EmergencyPayload = {
    count,
    message: `Emergency alert: ${count} people need assistance.`,
    triggeredAt: new Date().toISOString()
  };

  applyEmergencyPayload(payload);
  localStorage.setItem(EMERGENCY_STORAGE_KEY, JSON.stringify(payload));
}

export function subscribeEmergency(cb: (count: number) => void) {
  countListeners.push(cb);
  console.log("Emergency subscriber added");

  const currentPayload = readStoredEmergencyPayload();
  if (currentPayload) {
    cb(currentPayload.count);
  }

  function handleStorage(event: StorageEvent) {
    if (event.key !== EMERGENCY_STORAGE_KEY || !event.newValue) {
      return;
    }

    try {
      const payload = JSON.parse(event.newValue) as EmergencyPayload;
      applyEmergencyPayload(payload);
    } catch (error) {
      console.error("Emergency storage listener error", error);
    }
  }

  window.addEventListener("storage", handleStorage);

  return () => {
    countListeners = countListeners.filter((listener) => listener !== cb);
    window.removeEventListener("storage", handleStorage);
  };
}

export function clearEmergencyNotification() {
  lastNotification = null;
  localStorage.removeItem(EMERGENCY_STORAGE_KEY);
  notifyNotificationListeners(lastNotification);
}

export function useEmergencyMode() {
  const [emergencyState, setEmergencyState] = useState({
    lastNotification: getCurrentNotification()
  });

  useEffect(() => {
    const listener = (message: string | null) => {
      setEmergencyState({ lastNotification: message });
    };

    function handleStorage(event: StorageEvent) {
      if (event.key !== EMERGENCY_STORAGE_KEY) {
        return;
      }

      setEmergencyState({
        lastNotification: getCurrentNotification()
      });
    }

    notificationListeners.push(listener);
    window.addEventListener("storage", handleStorage);

    return () => {
      notificationListeners = notificationListeners.filter(
        (existing) => existing !== listener
      );
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  return {
    emergencyState,
    clearNotification: clearEmergencyNotification
  };
}

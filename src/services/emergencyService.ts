let listeners: ((count: number) => void)[] = [];

export function triggerEmergency(count: number) {
  console.log("🚨 Emergency triggered:", count);

  listeners.forEach((cb) => {
    try {
      cb(count);
    } catch (e) {
      console.error("Emergency listener error", e);
    }
  });
}

export function subscribeEmergency(cb: (count: number) => void) {
  listeners.push(cb);

  console.log("👂 Emergency subscriber added");

  return () => {
    listeners = listeners.filter((l) => l !== cb);
  };
}
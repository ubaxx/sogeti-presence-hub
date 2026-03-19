const KEY = "lastCheckInDate";

export function shouldShowDailyPopup(): boolean {
  const today = new Date().toDateString();
  const saved = localStorage.getItem(KEY);

  return saved !== today;
}

export function markCheckedIn(): void {
  const today = new Date().toDateString();
  localStorage.setItem(KEY, today);
}

/**
 * DEBUG: reset popup (använd när du testar)
 */
export function resetCheckIn(): void {
  localStorage.removeItem(KEY);
}
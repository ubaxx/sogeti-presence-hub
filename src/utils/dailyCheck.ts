const CHECKIN_KEY = "presence_last_checkin_date";

function getTodayKey(): string {
  return new Date().toISOString().split("T")[0];
}

export function shouldShowDailyPopup(): boolean {
  return localStorage.getItem(CHECKIN_KEY) !== getTodayKey();
}

export function markCheckedIn(): void {
  localStorage.setItem(CHECKIN_KEY, getTodayKey());
}
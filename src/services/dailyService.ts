export function getTodayDate(): string {
  return new Date().toISOString().split("T")[0];
}

export function shouldShowDailyPopup(): boolean {
  const today = getTodayDate();
  const last = localStorage.getItem("lastCheckInDate");

  return last !== today;
}

export function markCheckedInToday() {
  localStorage.setItem("lastCheckInDate", getTodayDate());
}
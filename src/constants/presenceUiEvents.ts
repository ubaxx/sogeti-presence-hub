export const OPEN_CHECKIN_EVENT = "presence:open-checkin";
export const CHECKIN_UPDATED_EVENT = "presence:checkin-updated";
export const SCHEDULE_CHAT_REMINDER_EVENT = "presence:schedule-chat-reminder";

export function dispatchOpenCheckin(): void {
  window.dispatchEvent(new Event(OPEN_CHECKIN_EVENT));
}

export function dispatchCheckinUpdated(): void {
  window.dispatchEvent(new Event(CHECKIN_UPDATED_EVENT));
}

export function dispatchScheduleChatReminder(): void {
  window.dispatchEvent(new Event(SCHEDULE_CHAT_REMINDER_EVENT));
}

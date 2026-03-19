import type { User } from "../types/User";

export type RealtimeEvent =
  | { type: "presenceUpdated"; payload: User }
  | { type: "activity"; payload: { message: string; time: string } };

type Listener = (event: RealtimeEvent) => void;

const listeners = new Set<Listener>();

export function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function publish(event: RealtimeEvent): void {
  for (const l of listeners) l(event);
}
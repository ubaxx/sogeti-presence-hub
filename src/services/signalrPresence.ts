import {
  HubConnection,
  HubConnectionBuilder,
  HubConnectionState,
  LogLevel
} from "@microsoft/signalr";
import type { User } from "../data/mockUsers";

const API_BASE_URL =
  import.meta.env.VITE_PRESENCE_API_URL ?? "http://localhost:5000";

let connection: HubConnection | null = null;
let startPromise: Promise<HubConnection> | null = null;

type PresenceUpdatedPayload = {
  id: string;
  name: string;
  initials: string;
  status: User["status"];
  role?: User["role"];
};

function getConnection(): HubConnection {
  if (connection) {
    return connection;
  }

  connection = new HubConnectionBuilder()
    .withUrl(`${API_BASE_URL}/hubs/presence`)
    .withAutomaticReconnect()
    .configureLogging(LogLevel.Warning)
    .build();

  return connection;
}

export async function startPresenceHubConnection(): Promise<HubConnection> {
  const hubConnection = getConnection();

  if (hubConnection.state === HubConnectionState.Connected) {
    return hubConnection;
  }

  if (!startPromise) {
    startPromise = hubConnection
      .start()
      .then(() => hubConnection)
      .finally(() => {
        startPromise = null;
      });
  }

  return startPromise;
}

export async function subscribeToPresenceUpdated(
  onPresenceUpdated: (user: PresenceUpdatedPayload) => void
): Promise<() => void> {
  const hubConnection = await startPresenceHubConnection();
  hubConnection.on("PresenceUpdated", onPresenceUpdated);

  return () => {
    hubConnection.off("PresenceUpdated", onPresenceUpdated);
  };
}

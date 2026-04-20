import { Chat24Regular, Dismiss24Regular } from "@fluentui/react-icons";

type ChatPreview = {
  id: string;
  sender: string;
  preview: string;
  time: string;
  unread?: boolean;
};

const mockChats: ChatPreview[] = [
  {
    id: "reminder",
    sender: "Presence Assistant",
    preview:
      "You have not checked in today. Confirm where you are working when you have a moment.",
    time: "Now",
    unread: true
  },
  {
    id: "team-lead",
    sender: "Team Lead",
    preview: "Please keep your presence updated before the morning sync.",
    time: "09:04"
  },
  {
    id: "office-coordinator",
    sender: "Office Coordinator",
    preview:
      "Desk availability looks good today if you plan to come in later.",
    time: "Yesterday"
  },
  {
    id: "project-team",
    sender: "Project Team",
    preview: "We are aligning client visits for the rest of the week.",
    time: "Yesterday"
  }
];

type Props = {
  open: boolean;
  needsCheckin: boolean;
  onClose: () => void;
  onOpenCheckin: () => void;
};

export default function TeamsChatPanel({
  open,
  needsCheckin,
  onClose,
  onOpenCheckin
}: Props) {
  if (!open) {
    return null;
  }

  return (
    <div className="teams-chat-panel">
      <div className="teams-chat-panel-header">
        <div className="teams-chat-panel-title-wrap">
          <div className="teams-chat-panel-title">Chats</div>
          <div className="teams-chat-panel-subtitle">
            Team conversations and reminders
          </div>
        </div>

        <button
          type="button"
          className="teams-chat-close"
          onClick={onClose}
          aria-label="Close chat panel"
        >
          <Dismiss24Regular />
        </button>
      </div>

      {needsCheckin && (
        <div className="teams-chat-reminder-card">
          <div className="teams-chat-reminder-icon">
            <Chat24Regular />
          </div>
          <div className="teams-chat-reminder-content">
            <div className="teams-chat-reminder-title">
              Have you forgotten to check in?
            </div>
            <div className="teams-chat-reminder-text">
              Update your workplace status so the team sees the latest plan for
              today.
            </div>
            <button
              type="button"
              className="teams-chat-reminder-button"
              onClick={onOpenCheckin}
            >
              Open check-in
            </button>
          </div>
        </div>
      )}

      <div className="teams-chat-list">
        {mockChats.map((chat) => (
          <button
            key={chat.id}
            type="button"
            className={`teams-chat-item ${chat.unread ? "unread" : ""}`}
          >
            <div className="teams-chat-avatar">
              {chat.sender
                .split(" ")
                .map((part) => part[0])
                .join("")
                .slice(0, 2)}
            </div>
            <div className="teams-chat-body">
              <div className="teams-chat-meta">
                <span className="teams-chat-sender">{chat.sender}</span>
                <span className="teams-chat-time">{chat.time}</span>
              </div>
              <div className="teams-chat-preview">{chat.preview}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

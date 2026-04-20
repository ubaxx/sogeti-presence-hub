import { useEffect, useState, type ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import {
  PresenceAvailable24Regular,
  Chat24Regular,
  Dismiss16Regular,
  People24Regular,
  Calendar24Regular,
  Call24Regular,
  Shield24Regular
} from "@fluentui/react-icons";

import TeamsTopBar from "../components/TeamsTopBar";
import TeamsChatPanel from "../components/TeamsChatPanel";
import IdleStatusPrompt from "../components/IdleStatusPrompt";
import DailyCheckinPopup from "../features/presence/components/DailyCheckinPopup";
import {
  CHECKIN_UPDATED_EVENT,
  SCHEDULE_CHAT_REMINDER_EVENT,
  dispatchOpenCheckin
} from "../constants/presenceUiEvents";
import { useEmergencyMode } from "../features/emergency/emergencyService";
import "../styles/teams.css";

type Props = {
  children: ReactNode;
};

export default function TeamsFrame({ children }: Props) {
  const navigate = useNavigate();
  const location = useLocation();
  const [chatOpen, setChatOpen] = useState(false);
  const [needsCheckin, setNeedsCheckin] = useState(false);
  const [showChatNudge, setShowChatNudge] = useState(false);
  const [chatUnreadCount, setChatUnreadCount] = useState(0);
  const [dismissedEmergencyNudge, setDismissedEmergencyNudge] = useState(false);
  const { emergencyState } = useEmergencyMode();
  const onPresencePage =
    location.pathname === "/" || location.pathname === "/presence";
  const showEmergencyNudge =
    Boolean(emergencyState.lastNotification) &&
    !onPresencePage &&
    !dismissedEmergencyNudge;

  useEffect(() => {
    if (emergencyState.lastNotification) {
      setDismissedEmergencyNudge(false);
    }
  }, [emergencyState.lastNotification]);

  useEffect(() => {
    function syncCheckinState() {
      const today = new Date().toDateString();
      const lastCheck = localStorage.getItem("lastCheckin");
      setNeedsCheckin(lastCheck !== today);
    }

    syncCheckinState();
    window.addEventListener(CHECKIN_UPDATED_EVENT, syncCheckinState);

    return () => {
      window.removeEventListener(CHECKIN_UPDATED_EVENT, syncCheckinState);
    };
  }, []);

  useEffect(() => {
    if (needsCheckin) {
      setShowChatNudge(true);
      setChatUnreadCount(1);
      return;
    }

    setShowChatNudge(false);
    setChatUnreadCount(0);
  }, [needsCheckin]);

  useEffect(() => {
    let reminderTimeout: number | null = null;

    function clearReminderTimeout() {
      if (reminderTimeout !== null) {
        window.clearTimeout(reminderTimeout);
        reminderTimeout = null;
      }
    }

    function handleScheduleChatReminder() {
      clearReminderTimeout();
      setChatOpen(false);
      setShowChatNudge(false);
      setChatUnreadCount(0);

      reminderTimeout = window.setTimeout(() => {
        setShowChatNudge(true);
        setChatUnreadCount(1);
      }, 15 * 1000);
    }

    window.addEventListener(
      SCHEDULE_CHAT_REMINDER_EVENT,
      handleScheduleChatReminder
    );

    return () => {
      clearReminderTimeout();
      window.removeEventListener(
        SCHEDULE_CHAT_REMINDER_EVENT,
        handleScheduleChatReminder
      );
    };
  }, []);

  function handleOpenCheckin() {
    dispatchOpenCheckin();
    setChatOpen(false);
    setShowChatNudge(false);
    setChatUnreadCount(0);
  }

  return (
    <div className="teams-root">
      <div className="teams-rail">
        <div className="teams-rail-logo">
          <div className="teams-brand-lockup">
            <img
              className="teams-brand-logo"
              src="/Sogeti-Logo.wine.svg"
              alt="Sogeti logo"
            />
            <div className="teams-companion-mark" aria-hidden="true">
              <div className="teams-companion-back" />
              <div className="teams-companion-front">T</div>
              <div className="teams-companion-dot" />
            </div>
          </div>

          <div className="teams-rail-brand">
            <div className="teams-rail-brand-title">Presence Hub</div>
            <div className="teams-rail-brand-subtitle">
              Sogeti workplace app
            </div>
          </div>
        </div>

        <div className="teams-rail-icons">
          <div
            className={`rail-icon ${location.pathname === "/" || location.pathname === "/presence" ? "active" : ""}`}
            onClick={() => {
              navigate("/presence");
              setDismissedEmergencyNudge(true);
            }}
          >
            <PresenceAvailable24Regular />
            {Boolean(emergencyState.lastNotification) && !onPresencePage && (
              <span className="rail-icon-badge rail-icon-badge-emergency" />
            )}
          </div>

          <div
            className={`rail-icon ${location.pathname === "/admin" ? "active" : ""}`}
            onClick={() => navigate("/admin")}
          >
            <Shield24Regular />
          </div>

          <div
            className={`rail-icon ${chatOpen ? "active" : ""}`}
            onClick={() => {
              setChatOpen((open) => !open);
              setShowChatNudge(false);
              setChatUnreadCount(0);
            }}
          >
            <Chat24Regular />
            {chatUnreadCount > 0 && (
              <span className="rail-icon-badge">{chatUnreadCount}</span>
            )}
          </div>

          <div className="rail-icon">
            <People24Regular />
          </div>

          <div className="rail-icon">
            <Calendar24Regular />
          </div>

          <div className="rail-icon">
            <Call24Regular />
          </div>
        </div>
      </div>

      <div className="teams-main">
        <TeamsTopBar />
        <IdleStatusPrompt />
        <DailyCheckinPopup />

        {showChatNudge && !chatOpen && (
          <div className="teams-chat-nudge" role="status" aria-live="polite">
            <button
              type="button"
              className="teams-chat-nudge-close"
              aria-label="Dismiss reminder"
              onClick={() => setShowChatNudge(false)}
            >
              <Dismiss16Regular />
            </button>

            <button
              type="button"
              className="teams-chat-nudge-main"
              onClick={() => {
                setChatOpen(true);
                setShowChatNudge(false);
                setChatUnreadCount(0);
              }}
            >
              <div className="teams-chat-nudge-avatar">PA</div>
              <div className="teams-chat-nudge-body">
                <div className="teams-chat-nudge-topline">
                  <div className="teams-chat-nudge-title">
                    Presence Assistant
                  </div>
                  <div className="teams-chat-nudge-pill">1 new</div>
                </div>
                <div className="teams-chat-nudge-text">
                  Have you forgotten to check in today?
                </div>
                <div className="teams-chat-nudge-subtext">
                  Open chat to review the reminder and update your status.
                </div>
              </div>
            </button>
          </div>
        )}

        {showEmergencyNudge && (
          <div className="teams-emergency-nudge" role="alert" aria-live="assertive">
            <button
              type="button"
              className="teams-chat-nudge-close"
              aria-label="Dismiss emergency reminder"
              onClick={() => setDismissedEmergencyNudge(true)}
            >
              <Dismiss16Regular />
            </button>

            <button
              type="button"
              className="teams-chat-nudge-main"
              onClick={() => {
                navigate("/presence");
                setDismissedEmergencyNudge(true);
              }}
            >
              <div className="teams-emergency-nudge-avatar">EA</div>
              <div className="teams-chat-nudge-body">
                <div className="teams-chat-nudge-topline">
                  <div className="teams-chat-nudge-title">
                    Building Alert
                  </div>
                  <div className="teams-emergency-nudge-pill">Emergency</div>
                </div>
                <div className="teams-chat-nudge-text">
                  An emergency alert is active for the building.
                </div>
                <div className="teams-chat-nudge-subtext">
                  Open Presence Overview to review the evacuation notice.
                </div>
              </div>
            </button>
          </div>
        )}

        <TeamsChatPanel
          open={chatOpen}
          needsCheckin={needsCheckin}
          onClose={() => setChatOpen(false)}
          onOpenCheckin={handleOpenCheckin}
        />

        <div className="teams-content">{children}</div>
      </div>
    </div>
  );
}

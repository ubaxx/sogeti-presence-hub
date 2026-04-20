import { useEffect, useRef, useState } from "react";
import { usePresence } from "../features/presence/usePresence";
import { getCurrentUser } from "../features/auth/authService";

export default function IdleStatusPrompt() {
  const { users, updateStatus } = usePresence();
  const [visible, setVisible] = useState(false);
  const leftPageRef = useRef(false);

  const currentUser = getCurrentUser();
  const me = users.find((user) => user.id === currentUser.id);

  useEffect(() => {
    function handlePageLeave() {
      leftPageRef.current = true;
    }

    function handlePageReturn() {
      if (me?.status === "offline") {
        setVisible(false);
        leftPageRef.current = false;
        return;
      }

      if (leftPageRef.current) {
        setVisible(true);
      }

      leftPageRef.current = false;
    }

    function handleVisibilityChange() {
      if (document.hidden) {
        handlePageLeave();
        return;
      }

      handlePageReturn();
    }

    window.addEventListener("blur", handlePageLeave);
    window.addEventListener("focus", handlePageReturn);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("blur", handlePageLeave);
      window.removeEventListener("focus", handlePageReturn);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [me?.status]);

  function handleStayLoggedIn() {
    setVisible(false);
    leftPageRef.current = false;
  }

  function handleSetOffline() {
    updateStatus("offline");
    setVisible(false);
    leftPageRef.current = false;
  }

  if (!visible) {
    return null;
  }

  return (
    <div className="teams-idle-overlay">
      <div className="teams-idle-card">
        <h2 className="teams-idle-title">Are you still active?</h2>
        <p className="teams-idle-text">
          We have not seen any activity for a while. If you are stepping away,
          you can switch your presence to Offline.
        </p>
        <div className="teams-idle-actions">
          <button
            type="button"
            className="teams-idle-button secondary"
            onClick={handleStayLoggedIn}
          >
            Stay logged in
          </button>
          <button
            type="button"
            className="teams-idle-button primary"
            onClick={handleSetOffline}
          >
            Set Offline
          </button>
        </div>
      </div>
    </div>
  );
}

import { useMemo, useState } from "react";
import { login } from "../services/authService";
import { mockUsers } from "../data/mockUsers";

type Props = {
  onClose?: () => void;
};

export default function LoginModal({ onClose }: Props) {
  const [selectedUserId, setSelectedUserId] = useState(mockUsers[0]?.id ?? "");

  const options = useMemo(() => mockUsers, []);

  function handleLogin(): void {
    if (!selectedUserId) {
      return;
    }

    login(selectedUserId);

    if (onClose) {
      onClose();
    }

    window.location.reload();
  }

  return (
    <div className="presence-modal">
      <div className="presence-modal-card">
        <div className="presence-modal-header">
          <div className="presence-modal-icon">🔐</div>

          <div>
            <div className="presence-modal-title">Sign in</div>
            <div className="presence-modal-subtitle">
              Choose a demo user to continue
            </div>
          </div>
        </div>

        <div className="presence-modal-options">
          <label className="admin-filter-field">
            <span>User</span>
            <select
              className="admin-select"
              aria-label="Select demo user"
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
            >
              {options.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.role})
                </option>
              ))}
            </select>
          </label>

          <button className="admin-btn" onClick={handleLogin}>
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
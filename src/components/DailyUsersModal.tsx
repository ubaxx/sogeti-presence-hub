import type { User } from "../data/mockUsers";

type Props = {
  status: string;
  users: User[];
  onClose: () => void;
};

export default function DailyUsersModal({ status, users, onClose }: Props) {
  return (
    <div className="modal-overlay">
      <div className="modal-card">

        <div className="modal-header">
          <h3>{status.toUpperCase()}</h3>
          <button onClick={onClose}>✖</button>
        </div>

        {users.map(u => (
          <div key={u.id} className="modal-user">
            <div className="avatar">{u.initials}</div>
            <span>{u.name}</span>
          </div>
        ))}

      </div>
    </div>
  );
}
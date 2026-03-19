import type { User } from "../data/mockUsers";

export default function OfficeList({ users }: { users: User[] }) {

  const officeUsers = users.filter(u => u.status === "office");

  return (
    <div className="office-card">
      <h2>People in the office ({officeUsers.length})</h2>

      <div className="office-grid">
        {officeUsers.map(user => (
          <div key={user.id} className="office-user">
            <div className="avatar">{user.initials}</div>
            <div>{user.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
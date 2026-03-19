import type { User } from "../types/User";
import PresenceCard from "./PresenceCard";

type Props = {
  users: User[];
};

export default function PresenceList({ users }: Props) {

  return (

    <div className="presence-grid">

      {users.map(user => (

        <PresenceCard
          key={user.id}
          user={user}
        />

      ))}

    </div>

  );

}
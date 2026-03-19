import type { User } from "../types/User";

type Props = {
  user: User;
};

export default function PresenceCard({ user }: Props) {

  return (

    <div className="presence-row">

      <div className="presence-avatar">

        {user.initials}

        <span
          className={`presence-status ${user.status}`}
        />

      </div>

      <div className="presence-user">

        <div className="presence-name">
          {user.name}
        </div>

        <div className="presence-role">
          {user.status}
        </div>

      </div>

    </div>

  );

}
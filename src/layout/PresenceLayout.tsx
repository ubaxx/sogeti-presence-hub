import type { ReactNode } from "react";
import ActivityFeed from "../components/ActivityFeed";

type Props = {
  children: ReactNode;
};

export default function PresenceLayout({ children }: Props) {

  return (

    <div className="presence-layout">

      <div className="presence-main">
        {children}
      </div>

      <div className="presence-sidebar">
        <ActivityFeed />
      </div>

    </div>

  );

}
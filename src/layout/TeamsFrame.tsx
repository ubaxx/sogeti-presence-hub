import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";

import {
  PresenceAvailable24Regular,
  Chat24Regular,
  People24Regular,
  Calendar24Regular,
  Call24Regular,
  Shield24Regular
} from "@fluentui/react-icons";

import TeamsTopBar from "../components/TeamsTopBar";
import "../styles/teams.css";

type Props = {
  children: ReactNode;
};

export default function TeamsFrame({ children }: Props) {

  const navigate = useNavigate();

  return (

    <div className="teams-root">

      <div className="teams-rail">

        <div className="teams-rail-logo">
          T
        </div>

        <div className="teams-rail-icons">

          <div
            className="rail-icon"
            onClick={() => navigate("/presence")}
          >
            <PresenceAvailable24Regular />
          </div>

          <div
            className="rail-icon"
            onClick={() => navigate("/admin")}
          >
            <Shield24Regular />
          </div>

          <div className="rail-icon">
            <Chat24Regular />
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

        <div className="teams-content">
          {children}
        </div>

      </div>

    </div>

  );

}
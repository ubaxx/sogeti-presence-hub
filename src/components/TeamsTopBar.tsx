import "../styles/teams.css";
import {
  Search24Regular,
  Settings24Regular
} from "@fluentui/react-icons";

import ThemeToggle from "./ThemeToggle";
import { getCurrentUser } from "../services/authService";

export default function TeamsTopBar() {

  const user = getCurrentUser();

  return (
    <div className="teams-header">

      <div className="teams-header-left">
        <div className="teams-app-name">Teams</div>
      </div>

      <div className="teams-search-wrapper">
        <Search24Regular className="teams-search-icon" />
        <input
          className="teams-search-input"
          placeholder="Search"
        />
      </div>

      <div className="teams-header-right">

        {/* 🔥 FIXAD POSITION */}
        <div className="darkmode-wrapper">
          <span className="darkmode-label">Dark mode</span>
          <ThemeToggle />
        </div>

        <Settings24Regular className="teams-header-icon" />

        <div className="teams-user-avatar">
          {user.initials}
        </div>

      </div>

    </div>
  );
}
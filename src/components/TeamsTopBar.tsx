import "../styles/teams.css";
import {
  Search24Regular,
  Settings24Regular
} from "@fluentui/react-icons";

import ThemeToggle from "./ThemeToggle";
import { getCurrentUser } from "../features/auth/authService";
import { getAvatarProfile } from "../services/avatarProfiles";

export default function TeamsTopBar() {

  const user = getCurrentUser();
  const avatarProfile = getAvatarProfile(user);

  return (
    <div className="teams-header">

      <div className="teams-header-left">
        <div className="teams-header-lockup">
          <img
            className="teams-header-logo"
            src="/Sogeti-Logo.wine.svg"
            alt="Sogeti logo"
          />
          <div className="teams-companion-mark header" aria-hidden="true">
            <div className="teams-companion-back" />
            <div className="teams-companion-front">T</div>
            <div className="teams-companion-dot" />
          </div>
        </div>
        <div className="teams-app-identity">
          <div className="teams-app-kicker">Built for Microsoft Teams</div>
          <div className="teams-app-name">Presence Hub</div>
        </div>
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
          <ThemeToggle />
        </div>

        <Settings24Regular className="teams-header-icon" />

        <div
          className="teams-user-avatar teams-user-avatar-photo"
          style={{
            backgroundImage: `url("${avatarProfile.imageUrl}")`,
            backgroundColor: "#ffffff"
          }}
          aria-label={`${user.name} profile avatar`}
          title={user.name}
        >
          <span className="teams-user-avatar-fallback">{user.initials}</span>
        </div>

      </div>

    </div>
  );
}

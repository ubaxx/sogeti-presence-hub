export type PresenceViewPreferences = {
  showSummaryCards: boolean;
  showOtherStatuses: boolean;
  showTeamSnapshot: boolean;
  showActivityFeed: boolean;
};

const STORAGE_KEY = "presence_view_preferences";

const DEFAULT_PREFERENCES: PresenceViewPreferences = {
  showSummaryCards: true,
  showOtherStatuses: true,
  showTeamSnapshot: false,
  showActivityFeed: true
};

export function loadPresenceViewPreferences(): PresenceViewPreferences {
  const raw = localStorage.getItem(STORAGE_KEY);

  if (!raw) {
    return DEFAULT_PREFERENCES;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<PresenceViewPreferences>;

    return {
      ...DEFAULT_PREFERENCES,
      ...parsed
    };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export function savePresenceViewPreferences(
  preferences: PresenceViewPreferences
): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
}


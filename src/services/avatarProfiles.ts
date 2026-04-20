type AvatarSeed = {
  backgroundStart: string;
  backgroundEnd: string;
  skin: string;
  hair: string;
  shirt: string;
};

const avatarSeeds: AvatarSeed[] = [
  {
    backgroundStart: "#7b83eb",
    backgroundEnd: "#0078d4",
    skin: "#f3c7a6",
    hair: "#45322e",
    shirt: "#f3f6fb"
  },
  {
    backgroundStart: "#1f8f6a",
    backgroundEnd: "#57b894",
    skin: "#d8a07d",
    hair: "#201a19",
    shirt: "#f8fafc"
  },
  {
    backgroundStart: "#d97706",
    backgroundEnd: "#f59e0b",
    skin: "#efc2a2",
    hair: "#5b463d",
    shirt: "#fef3c7"
  },
  {
    backgroundStart: "#7c3aed",
    backgroundEnd: "#a855f7",
    skin: "#9b6b4a",
    hair: "#161616",
    shirt: "#ede9fe"
  },
  {
    backgroundStart: "#0f766e",
    backgroundEnd: "#14b8a6",
    skin: "#c98962",
    hair: "#2a211d",
    shirt: "#ccfbf1"
  },
  {
    backgroundStart: "#3151b7",
    backgroundEnd: "#60a5fa",
    skin: "#f2c7ac",
    hair: "#3d2d29",
    shirt: "#dbeafe"
  }
];

function hashValue(input: string): number {
  let hash = 0;

  for (let index = 0; index < input.length; index += 1) {
    hash = (hash * 31 + input.charCodeAt(index)) >>> 0;
  }

  return hash;
}

function buildAvatarSvg(seed: AvatarSeed, initials: string): string {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 72 72" role="img" aria-label="${initials}">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${seed.backgroundStart}" />
          <stop offset="100%" stop-color="${seed.backgroundEnd}" />
        </linearGradient>
      </defs>
      <rect width="72" height="72" rx="36" fill="url(#bg)" />
      <circle cx="36" cy="28" r="14" fill="${seed.skin}" />
      <path d="M22 58c2-10 10-15 14-15s12 5 14 15" fill="${seed.shirt}" />
      <path d="M21 28c0-11 8-18 15-18 9 0 15 7 15 17 0 2 0 4-1 5-2-5-5-7-8-8-4 5-10 8-21 8 0-1 0-3 0-4Z" fill="${seed.hair}" />
    </svg>
  `.trim();

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export function getAvatarProfile(user: {
  id: string;
  name: string;
  initials: string;
}) {
  const hash = hashValue(`${user.id}-${user.name}`);
  const seed = avatarSeeds[hash % avatarSeeds.length];

  return {
    imageUrl: buildAvatarSvg(seed, user.initials),
    accent: `linear-gradient(135deg, ${seed.backgroundStart} 0%, ${seed.backgroundEnd} 100%)`
  };
}

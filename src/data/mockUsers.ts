export type UserStatus = "office" | "remote" | "client" | "offline";

export interface User {
  id: string;
  name: string;
  initials: string;
  status: UserStatus;
  role: "user" | "admin";
}

const firstNames = [
  "Anna",
  "Erik",
  "Sara",
  "Johan",
  "Fatima",
  "Ali",
  "Emma",
  "Lucas",
  "Maja",
  "Oskar",
  "Lina",
  "Noah",
  "Elin",
  "Hugo",
  "Nora",
  "David",
  "Amira",
  "Elias",
  "Julia",
  "Khalid"
];

const lastNames = [
  "Andersson",
  "Johansson",
  "Karlsson",
  "Nilsson",
  "Larsson",
  "Olsson",
  "Persson",
  "Svensson",
  "Gustafsson",
  "Berg"
];

function getInitialStatus(index: number): UserStatus {
  const pattern: UserStatus[] = [
    "office",
    "office",
    "remote",
    "office",
    "client",
    "remote",
    "office",
    "offline"
  ];

  return pattern[index % pattern.length];
}

function createUser(id: number): User {
  const first = firstNames[(id - 2) % firstNames.length];
  const last = lastNames[(id - 2) % lastNames.length];

  return {
    id: id.toString(),
    name: `${first} ${last}`,
    initials: `${first[0]}${last[0]}`,
    status: getInitialStatus(id),
    role: "user"
  };
}

export const mockUsers: User[] = [
  {
    id: "1",
    name: "Ubah Abdullahi",
    initials: "UA",
    status: "offline",
    role: "admin"
  },
  ...Array.from({ length: 29 }, (_, i) => createUser(i + 2))
];
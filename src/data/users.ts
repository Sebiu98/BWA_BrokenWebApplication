//Ruoli disponibili per i mock.
export type UserRole = "user" | "admin";

//Utente mock semplice.
export type MockUser = {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  avatar: string;
  memberSince: string;
};

//Lista utenti mock (user e admin).
export const mockUsers: MockUser[] = [
  {
    id: "u-1",
    name: "Marco Riva",
    email: "user@bwa.local",
    password: "user1234",
    role: "user",
    avatar: "/users/user-1.png",
    memberSince: "Jan 2025",
  },
  {
    id: "u-2",
    name: "Sara Conti",
    email: "admin@bwa.local",
    password: "admin1234",
    role: "admin",
    avatar: "/users/user-2.png",
    memberSince: "Dec 2024",
  },
];

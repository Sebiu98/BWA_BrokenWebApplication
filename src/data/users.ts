//Ruoli disponibili per i mock.
export type UserRole = "user" | "admin";

//Utente mock semplice.
export type MockUser = {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
};

//Lista utenti mock (user e admin).
export const mockUsers: MockUser[] = [
  {
    id: "u-1",
    name: "Marco Riva",
    email: "user@bwa.local",
    password: "user1234",
    role: "user",
  },
  {
    id: "u-2",
    name: "Sara Conti",
    email: "admin@bwa.local",
    password: "admin1234",
    role: "admin",
  },
];

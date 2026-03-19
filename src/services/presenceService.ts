import {
  collection,
  doc,
  setDoc,
  onSnapshot
} from "firebase/firestore";

import type {
  QuerySnapshot,
  DocumentData
} from "firebase/firestore";

import { db } from "./firebase";

import type { User, UserStatus } from "../types/User";

const presenceCollection =
  collection(db, "presence");

export const subscribePresence = (
  callback: (users: User[]) => void
) => {

  return onSnapshot(
    presenceCollection,
    (snapshot: QuerySnapshot<DocumentData>) => {

      const users: User[] =
        snapshot.docs.map(doc => ({

          id: doc.id,
          ...(doc.data() as Omit<User, "id">)

        }));

      callback(users);

    }
  );

};

export const updatePresence = async (
  userId: string,
  status: UserStatus
) => {

  await setDoc(
    doc(db, "presence", userId),
    {
      status,
      updated: Date.now()
    },
    { merge: true }
  );

};

export function resetPresenceIfMorning() {

  const now = new Date();

  if (now.getHours() === 6) {

    const lastReset =
      localStorage.getItem("presenceReset");

    const today = now.toDateString();

    if (lastReset !== today) {

      localStorage.setItem(
        "presenceReset",
        today
      );

      return true;

    }

  }

  return false;

}
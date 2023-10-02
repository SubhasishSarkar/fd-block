import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  writeBatch,
  runTransaction,
  arrayUnion,
  deleteDoc,
} from "firebase/firestore";

import app from "../firebase.config";
import { Constants, Collections, DocNames } from "./constants";
import { updateBlockDirOnMemberChange } from "./blockDir";

/*
 * * * * * * * * * * * * *
 * User object structure *
 * * * * * * * * * * * * *
 *     id: user_id (string),
 *     phone_number (tel-number),
 *     email (string),
 *     name (string),
 *     is_member (boolean),
 *     membership_status (boolean),
 *     address: {
 *         house_num: string
 *         street_name: string,
 *         city_name: string,
 *         pin_code: number,
 *         state: string,
 *         country: string
 *     },
 *     bookings: [],
 *     created_on: <Timestamp>
 */

class User {
  static LOCAL_STORAGE_USER_ITEM = "user_data";
  static KEY_ID = "id";
  static KEY_NAME = "name";
  static KEY_EMAIL = "email";
  static KEY_ADDRESS = "address";
  static KEY_PHONE_NUM = "phone_number";
  static KEY_IS_MEMBER = "is_member";
  static KEY_IS_PERMANENT_MEMBER = "is_permanent_member";

  static IsLocalStorageUpdated = (user_id) => {
    const local_data = localStorage.getItem(this.LOCAL_STORAGE_USER_ITEM);
    if (local_data?.phone_number === user_id) return true;
    return false;
  };

  static GetUserObj = (user_data) => {
    if (!user_data) return null;

    const user = {
      name: user_data.name,
      phone_number: user_data.phone_number,
      address: user_data.address,
      is_member: user_data.is_member,
      is_permanent_member: user_data.is_permanent_member,
      membership_status: user_data.membership_status,
      created_on: user_data.created_on,
      isAdmin: user_data.isAdmin,
      plot: user_data.plot,
    };

    return user;
  };

  static RestoreFromLocalStorage = () => {
    const local_data = localStorage.getItem(this.LOCAL_STORAGE_USER_ITEM);
    if (local_data) return this.GetUserObj(JSON.parse(local_data));
    return null;
  };

  static UpdateLocalStorage = (user_data) => {
    this.ClearLocalStorage();
    const local_data = this.GetUserObj(user_data);
    if (local_data)
      localStorage.setItem(
        this.LOCAL_STORAGE_USER_ITEM,
        JSON.stringify(local_data)
      );
  };

  static ClearLocalStorage = () => {
    localStorage.removeItem(this.LOCAL_STORAGE_USER_ITEM);
  };

  static GetDataFromFirestore = async (user_id) => {
    if (!user_id) return null;

    const db = getFirestore(app);
    try {
      const user_ref = doc(db, Collections.USERS, user_id);
      const user_doc = await getDoc(user_ref);
      if (user_doc.exists()) {
        const d = user_doc.data();
        return this.GetUserObj(d);
      }
    } catch (err) {
      console.error(err);
    }

    return null;
  };

  static FindExistingUserOrCreateNew = async (user_phone_number) => {
    if (!user_phone_number) return {};

    const db = getFirestore(app);
    const users_collection = collection(db, Collections.USERS);
    const q = query(
      users_collection,
      where("phone_number", "==", user_phone_number)
    );
    const snapshots = await getDocs(q);
    if (snapshots.empty) {
      console.debug("Creating new user");
      // Create a standard user document
      const new_user = {
        name: "",
        phone_number: user_phone_number,
        address: "",
        is_member: false,
        is_permanent_member: false,
        membership_status: false,
        created_on: new Date(),
        bookings: [],
        isAdmin: false,
      };

      const db = getFirestore(app);
      const users_collection = doc(db, Collections.USERS, user_phone_number);
      try {
        await setDoc(users_collection, new_user);
        return new_user;
      } catch (err) {
        // TODO: Issue an alert
        console.error(err);
      }

      return {};
    }

    // This person's entry might have been inserted into the users collection by an administrator,
    // in the form of a general document (document's ID does not match with the user's ID). In such
    // a case, we have to set the user's document ID to the user ID.
    let user_doc_id = null;
    let user_doc_data = null;
    snapshots.forEach((doc) => {
      console.warn("Querying data");
      if (doc.id === user_phone_number) {
        console.error("ASSERT");
        return {};
      }

      // It will be ensured that the document's ID in the "users" collection will always be
      // a Firebase generated user ID. In other cases (pre-filled docs, etc), we will fetch
      // the existing doc's data, create a new doc with the doc ID set to the user ID, and
      // remove the existing doc.
      user_doc_id = doc.phone_number;
      user_doc_data = doc.data();
    });

    // This will be a one time operation for preloaded user info ; this needs to be an atomic operation
    if (user_doc_id !== null) {
      try {
        const batch = writeBatch(db);
        const old_user_doc = doc(db, Collections.USERS, user_doc_id);
        const new_user_doc = doc(db, Collections.USERS, user_phone_number);
        user_doc_data["phone_number"] = user_phone_number;
        batch.set(new_user_doc, user_doc_data);
        batch.delete(old_user_doc);
        await batch.commit();
        return this.GetUserObj(user_doc_data);
      } catch (err) {
        console.error("Could not update existing user doc");
        console.error(err);
      }
    }

    return {};
  };

  static FindExistingUser = async (user_phone_number) => {
    if (!user_phone_number) return {};

    const db = getFirestore(app);
    const users_collection = collection(db, Collections.USERS);
    const q = query(
      users_collection,
      where("phone_number", "==", user_phone_number)
    );
    const snapshots = await getDocs(q);
    if (snapshots.empty) {
      return false;
    } else {
      return true;
    }
  };
  static Update = async (user_id, user_obj, verify_member_status = false) => {
    const db = getFirestore(app);
    const user_ref = doc(db, Collections.USERS, user_obj.phone_number);
    try {
      await runTransaction(db, async (transaction) => {
        const user_doc = await transaction.get(user_ref);
        if (!user_doc.exists()) {
          throw "User does not exist";
        }

        // const user_data = user_doc.data();
        if (
          verify_member_status &&
          user_obj[User.KEY_IS_MEMBER] &&
          user_doc[User.KEY_IS_MEMBER] === false &&
          user_doc[User.KEY_IS_MEMBER] === true
        ) {
          user_obj[User.KEY_IS_MEMBER] = false; // The user will be marked as a member once an admin has verified
          const residency_requests_ref = doc(
            db,
            Collections.SYSTEM,
            DocNames.RESIDENCY_REQUESTS
          );
          await transaction.update(residency_requests_ref, {
            [Constants.DATA]: arrayUnion(user_ref),
          });
        }

        await transaction.update(user_ref, user_obj);
      });
    } catch (err) {
      console.error("Could not update user data");
      console.error(err);
    }
  };

  //phone number change
  static CreateUser = async (oldPhno, user) => {
    try {
      const newPhno = user.phone_number;
      const db = getFirestore(app);
      const old_users_collection = doc(db, Collections.USERS, oldPhno);
      const oldDoc = await getDoc(old_users_collection);
      const oldData = oldDoc.data();
      const new_users_collection = doc(db, Collections.USERS, newPhno);
      await setDoc(new_users_collection, { ...oldData, ...user });
      await deleteDoc(old_users_collection);
    } catch (err) {
      console.error("Failed to create new user", err);
    }
  };

  static CreateNewUser = async (user) => {
    try {
      const user_phone_number = user.phone_number;
      const db = getFirestore(app);
      const users_collection = collection(db, Collections.USERS);
      const q = query(
        users_collection,
        where("phone_number", "==", user_phone_number)
      );
      const snapshots = await getDocs(q);
      if (snapshots.empty) {
        const new_users_collection = doc(
          db,
          Collections.USERS,
          user_phone_number
        );
        await setDoc(new_users_collection, {
          ...user,
          membership_status: false,
          created_on: new Date(),
          bookings: [],
          isAdmin: false,
        });
        await updateBlockDirOnMemberChange(user);
        return user;
      } else {
        throw "Phone number already taken";
      }
    } catch (e) {
      console.error(e);
    }
  };
}

export default User;

// Front end
import React, { createContext, useState, useEffect } from "react";

// Firebase
import { getAuth } from "firebase/auth";

// Internal
import app from "../firebase.config";
import User from "../helpers/User";

export const StdContext = createContext();

export const StdContextProvider = ({ children }) => {
  const [isFetching, setIsFetching] = useState(true);
  const [user_signing_in, SetUserSigningIn] = useState(false); // Possible states: [true, false] (used as a semaphore of sorts)

  // 'user_id' and 'user_phone_number' have the following possible states:
  // 1. null (default)
  // 2. "" (no user logged in)
  // 3. <some ID/phone-number> (user is logged in)
  const [user_id, SetUserId] = useState(null);
  const [user_phone_number, SetUserPhoneNumber] = useState(null);
  const [user_data, SetUserData] = useState(null);

  const InvalidateUser = () => {
    SetUserPhoneNumber("");
    SetUserId("");
    SetUserData(null);
    User.ClearLocalStorage();
  };

  // Cache the user's phone number and other data into StdContext
  const auth = getAuth(app);
  useEffect(() => {
    let unsubscribe;
    const GetUserState = async () => {
      unsubscribe = auth.onAuthStateChanged(async (user) => {
        if (user_signing_in) return; // To prevent race condition

        if (!user) {
          InvalidateUser();
          setIsFetching(false);
          return;
        }
        SetUserPhoneNumber(user.phoneNumber);
        SetUserId(user.uid);
        setIsFetching(false);
        return;
      });
    };
    GetUserState();
    return unsubscribe;
  }, []);

  const UpdateUserData = async (force = false) => {
    if (!force) {
      // Try to get cached data and bail out

      if (user_data?.user_id) {
        setIsFetching(false);
        return;
      }
      if (!user_data && User.IsLocalStorageUpdated(user_id)) {
        const local_data = User.RestoreFromLocalStorage();
        if (local_data) {
          SetUserData(local_data);
          return;
        }
      }
    }

    const fetched_data = await User.GetDataFromFirestore(user_id);
    if (fetched_data) {
      SetUserData(fetched_data);
      SetUserPhoneNumber(fetched_data.phone_number);
      User.UpdateLocalStorage(fetched_data);
    } else {
      const data = await User.FindExistingUserOrCreateNew(
        user_id,
        user_phone_number
      );
      SetUserData(data);
      User.UpdateLocalStorage(data);
    }
  };

  useEffect(() => {
    UpdateUserData();
  }, [user_id, user_phone_number]);

  useEffect(() => {
    if (user_id) {
      setIsFetching(false);
    }
  }, [user_id]);

  const IsSignedIn = () => {
    return user_id != null && user_id.length > 0;
  };

  const HandleGetUserData = async () => {
    if (!IsSignedIn()) return null;
    await UpdateUserData();
    return user_data;
  };

  const HandleSignOut = () => {
    InvalidateUser();
    try {
      auth.signOut();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <StdContext.Provider
      value={{
        user_signing_in,
        SetUserSigningIn: SetUserSigningIn,
        user_id,
        user_phone_number,
        UpdateUserData: UpdateUserData,
        GetUserData: HandleGetUserData,
        NoData: () => user_id === null,
        SignedIn: IsSignedIn,
        SignOut: HandleSignOut,
        isFetching,
        user_data,
      }}
    >
      {children}
    </StdContext.Provider>
  );
};

export default StdContextProvider;

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
   apiKey: "AIzaSyDNFOufpxVnxXMLFZbe0xvuaADaaMK9whM",
  authDomain: "fdblock-dev.firebaseapp.com",
  projectId: "fdblock-dev",
  storageBucket: "fdblock-dev.appspot.com",
  messagingSenderId: "175690632496",
  appId: "1:175690632496:web:6c556793a4a83b4223ccf5",
  measurementId: "G-Z65Q4PH3H7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export default app
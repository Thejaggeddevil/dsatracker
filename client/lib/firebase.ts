import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAxeeDFdWXBWab26eQ8oXi-Ir0RDDv3-ng",
  authDomain: "dsatracker-b97a3.firebaseapp.com",
  projectId: "dsatracker-b97a3",
  storageBucket: "dsatracker-b97a3.firebasestorage.app",
  messagingSenderId: "250743846345",
  appId: "1:250743846345:web:c45b6d3da1d83e5e26e418",
  measurementId: "G-GPV3QB5MV4"
};

console.log("ENV CHECK", JSON.stringify(firebaseConfig, null, 2));

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getFunctions, connectFunctionsEmulator } from "firebase/functions";
import { getPerformance } from "firebase/performance";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";

const firebaseConfig = {
  apiKey: "AIzaSyDVgenCKGb1dsWQx8obhgJGGzt8XoGWtaU",
  authDomain: "happy-camper-candy.firebaseapp.com",
  projectId: "happy-camper-candy",
  storageBucket: "happy-camper-candy.appspot.com",
  messagingSenderId: "1040176877182",
  appId: "1:1040176877182:web:c87a940cf97dbc8ff3922f",
  measurementId: "G-KVGF5YMQ34",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
const functions = getFunctions(app);
const performance = getPerformance(app);
const appCheck = initializeAppCheck(app, {
  provider: new ReCaptchaV3Provider("6LdEzU0hAAAAAE2Ndgmm7XSwZ-CywB4FTrGjSHPL"),
  isTokenAutoRefreshEnabled: true,
});

connectFunctionsEmulator(functions, "localhost", 5001);

export { app, analytics, auth, db, functions, performance, appCheck };

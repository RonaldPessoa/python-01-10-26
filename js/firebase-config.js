import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyD1bftfd8A7HBv0dI88W-eCigBv2NtjOks",
  authDomain: "geekzone-7383e.firebaseapp.com",
  projectId: "geekzone-7383e",
  storageBucket: "geekzone-7383e.firebasestorage.app",
  messagingSenderId: "396653648018",
  appId: "1:396653648018:web:12ec051bfc3b3275adee4b"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

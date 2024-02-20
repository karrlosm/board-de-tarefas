
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDDOqdwTN8Yq7UTIv1OgC7PtNBD8KJL1Ls",
  authDomain: "board-de-tarefas.firebaseapp.com",
  projectId: "board-de-tarefas",
  storageBucket: "board-de-tarefas.appspot.com",
  messagingSenderId: "484407488302",
  appId: "1:484407488302:web:10b43939cee33f3a39d4bf"

};

const firebaseApp = initializeApp(firebaseConfig);

const db = getFirestore(firebaseApp)

export { db }
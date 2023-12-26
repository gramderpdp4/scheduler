import { initializeApp } from 'firebase/app'

const firebaseConfig = {
    apiKey: "AIzaSyCrfLhGKnKqJ57uK34meNLlI2ck-wkSG5A",
    authDomain: "play-7ccf8.firebaseapp.com",
    databaseURL: "https://play-7ccf8-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "play-7ccf8",
    storageBucket: "play-7ccf8.appspot.com",
    messagingSenderId: "107803405570",
    appId: "1:107803405570:web:d9fdd33e7e50969eba261b"
}

const app = initializeApp(firebaseConfig);

export default app
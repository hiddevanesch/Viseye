import Vue from "vue";
import App from "./App.vue";
import router from './router';
import store from './store';
import firebase from 'firebase';
import "firebase/firestore";
import "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBgDQ4YNTxPICT0IV6cKqg-qStmsG0qgiY",
  authDomain: "viseye-57f4e.firebaseapp.com",
  databaseURL: "https://viseye-57f4e.firebaseio.com",
  projectId: "viseye-57f4e",
  storageBucket: "viseye-57f4e.appspot.com",
  messagingSenderId: "780525324899",
  appId: "1:780525324899:web:577a5386e8dbe3377ac656",
  measurementId: "G-5PRR2E8R3P"
};

firebase.initializeApp(firebaseConfig);

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount("#app");


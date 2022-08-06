<template>
  <v-app>
    <v-app-bar color="secondary">
      <v-toolbar-title> Happy Camper freeze dried snacks </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn @click="logout()" v-if="loggedIn">logout</v-btn>
    </v-app-bar>
    <v-main>
      <router-view v-if="loggedIn" />
      <v-container class="d-flex justify-center align-center" v-else>
        <div id="firebaseui-auth-container"></div>
      </v-container>
    </v-main>
  </v-app>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { auth } from "@/firebase";
import { GoogleAuthProvider } from "@firebase/auth";
import * as firebaseui from "firebaseui";

export default defineComponent({
  name: "App",
  data() {
    return {
      loggedIn: false,
      user: {},
    };
  },
  methods: {
    showAuthMenu() {
      let ui = firebaseui.auth.AuthUI.getInstance();
      if (!ui) {
        ui = new firebaseui.auth.AuthUI(auth);
      }
      const uiConfig = {
        signinFlow: "popup",
        signInSuccessUrl: "/",
        signInOptions: [
          {
            provider: GoogleAuthProvider.PROVIDER_ID,
            clientID:
              "1040176877182-1gbs6vbh1d053l873f3hocsn3kiskd9f.apps.googleusercontent.com",
          },
        ],
        credentialHelper: firebaseui.auth.CredentialHelper.GOOGLE_YOLO,
      };
      ui.start("#firebaseui-auth-container", uiConfig);
    },
    logout() {
      auth.signOut();
    },
  },
  mounted() {
    auth.onAuthStateChanged((user) => {
      if (user) {
        this.loggedIn = true;
      } else {
        this.loggedIn = false;
        this.showAuthMenu();
      }
    });
  },
});
</script>

<template>
  <v-container class="d-flex justify-center align-center">
    <v-card color="dark-grey" width="300">
      <v-card-title class="text-center">
        <h1>Login</h1>
      </v-card-title>
      <div id="firebaseui-auth-container"></div>
      <div id="loader">Loading...</div>
    </v-card>
  </v-container>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { auth } from "@/firebase";
import { GoogleAuthProvider } from "@firebase/auth";
import * as firebaseui from "firebaseui";

export default defineComponent({
  name: "login",
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
        callbacks: {
          uiShown: function () {
            document.getElementById("loader")!.style.display = "none";
          },
        },
        signinFlow: "popup",
        signInSuccessUrl: "/orders",
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
  },
  mounted() {
    auth.onAuthStateChanged((user) => {
      if (!user) {
        this.showAuthMenu();
      }
    });
  },
});
</script>

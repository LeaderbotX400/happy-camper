<template>
  <v-menu rounded v-if="loggedIn">
    <template v-slot:activator="{ props }">
      <v-btn icon v-bind="props">
        <v-avatar>
          <v-img :src="(user?.photoURL as string)" alt="Avatar" />
        </v-avatar>
      </v-btn>
    </template>
    <v-card>
      <v-card-text>
        <div class="mx-auto text-center">
          <v-avatar size="large">
            <v-img :src="(user?.photoURL as string)" alt="Avatar" />
          </v-avatar>
          <h3>{{ user.displayName }}</h3>
          <p class="text-caption mt-1">{{ user.email }}</p>
          <div v-if="admin">
            <v-divider class="my-3" />
            <v-btn rounded variant="text" @click="$router.push('/admin')">
              admin menu
            </v-btn>
          </div>
          <v-divider class="my-3" />
          <v-btn rounded variant="text" @click="logout()"> logout </v-btn>
        </div>
      </v-card-text>
    </v-card>
  </v-menu>
</template>

<script lang="ts">
import { auth } from "@/firebase";
import type { User } from "@firebase/auth";
import { defineComponent } from "vue";

export default defineComponent({
  name: "UserMenu",
  data() {
    return {
      user: {} as User,
      loggedIn: false,
      admin: false,
    };
  },
  methods: {
    logout() {
      auth.signOut();
    },
  },
  mounted() {
    auth.onAuthStateChanged((user) => {
      if (user) {
        user.getIdTokenResult().then((idTokenResult) => {
          if (idTokenResult.claims.admin) {
            this.admin = true;
          }
        });
        this.user = user;
        this.loggedIn = true;
      } else {
        this.user = {} as User;
        this.loggedIn = false;
      }
    });
  },
});
</script>

<template>
  <v-container>
    <v-row>
      <v-col width="100px">
        <v-menu>
          <template v-slot:activator="{ props }">
            <v-text-field
              v-model="search"
              label="Search"
              v-bind="props"
              append-inner-icon="mdi-magnify"
            />
          </template>
          <v-list>
            <v-list-item v-for="(user, index) in searchForUser" :key="index">
              <v-list-item-title @click="goTo(user)">
                {{ user.data.displayName }}
              </v-list-item-title>
              <v-divider />
            </v-list-item>
          </v-list>
        </v-menu>
      </v-col>
    </v-row>
    <v-row>
      <v-col v-for="(user, index) in users" :key="index">
        <User :user="user" :dev="dev" :id="user.data.displayName" />
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { defineComponent, defineAsyncComponent } from "vue";
import { auth, db } from "@/firebase";
import { onSnapshot, collection } from "@firebase/firestore";
import type { UserPlus } from "@/types";

let unsubscribe: () => void;

export default defineComponent({
  name: "UsersAdmin",
  components: {
    User: defineAsyncComponent(
      () => import("@/components/admin/components/User.vue")
    ),
  },
  data() {
    return {
      users: [] as UserPlus[],
      dev: false as boolean,
      search: "",
    };
  },
  computed: {
    searchForUser() {
      return this.users.filter((user: UserPlus) => {
        return user.data.displayName
          .toLowerCase()
          .includes(this.search.toLowerCase()) as boolean;
      }) as UserPlus[];
    },
  },
  methods: {
    goTo(user: UserPlus) {
      // scoll to user
      const el = document.getElementById(user.data.displayName);
      el?.scrollIntoView({ behavior: "smooth" });
    },
  },
  beforeUnmount() {
    unsubscribe();
  },
  mounted() {
    auth.currentUser?.getIdTokenResult().then((idTokenResult) => {
      if (idTokenResult.claims.dev) {
        this.dev = true;
      }
    });
    unsubscribe = onSnapshot(collection(db, "users"), (querySnapshot) => {
      this.users = querySnapshot.docs.map((doc) => {
        return doc.data() as UserPlus;
      });
    });
  },
});
</script>

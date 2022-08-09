<template>
  <v-container>
    <v-row>
      <v-col v-for="user in users" :key="user">
        <User :user="user" :dev="dev" />
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { defineComponent, defineAsyncComponent } from "vue";
import { auth, db } from "@/firebase";
import { onSnapshot, collection } from "@firebase/firestore";

export default defineComponent({
  name: "Users",
  components: {
    User: defineAsyncComponent(
      () => import("@/components/admin/components/User.vue")
    ),
  },
  data() {
    return {
      users: [] as any,
      dev: false as boolean,
    };
  },
  mounted() {
    auth.currentUser?.getIdTokenResult().then((idTokenResult) => {
      if (idTokenResult.claims.dev) {
        this.dev = true;
      }
    });
    onSnapshot(collection(db, "users"), (querySnapshot) => {
      this.users = [];
      querySnapshot.forEach((doc) => {
        this.users.push(doc.data());
      });
    });
  },
});
</script>

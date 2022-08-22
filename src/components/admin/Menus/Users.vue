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

let unsubscribe: () => void;

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
  beforeDestroy() {
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
        return doc.data();
      });
    });
  },
});
</script>

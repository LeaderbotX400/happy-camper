<template>
  <v-container align="center">
    <PreOrder :dev="dev" />
    <v-container>
      <v-row>
        <v-col v-for="(order, index) in orders" :key="index">
          <Order :order="order" :index="index" :dev="dev" />
        </v-col>
      </v-row>
    </v-container>
  </v-container>
</template>

<script lang="ts">
import { defineComponent, defineAsyncComponent } from "vue";
import { auth, db } from "@/firebase";
import { onSnapshot, where, collection, query } from "@firebase/firestore";

let unsubscribe: () => void;

export default defineComponent({
  name: "OrdersView",
  components: {
    PreOrder: defineAsyncComponent(
      () => import("@/components/public/PreOrder.vue")
    ),
    Order: defineAsyncComponent(() => import("@/components/public/Order.vue")),
  },
  data() {
    return {
      orders: [],
      loggedIn: false,
      dev: false,
    };
  },
  beforeUnmount() {
    unsubscribe();
  },
  mounted() {
    auth.onAuthStateChanged((user) => {
      if (user) {
        user?.getIdTokenResult().then((idTokenResult) => {
          this.dev = idTokenResult.claims.dev ? true : false;
        });
        try {
          const q = query(
            collection(db, "orders"),
            where("email", "==", auth.currentUser?.email)
          );
          unsubscribe = onSnapshot(q, (querySnapshot) => {
            this.orders = [];
            querySnapshot.forEach((doc) => {
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-expect-error
              this.orders.push(doc.data());
            });
          });
        } catch (error) {
          console.log(error);
        }
      } else {
        unsubscribe();
        this.$router.push("/login");
      }
    });
  },
});
</script>

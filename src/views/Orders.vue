<template>
  <v-container>
    <PreOrder />
    <v-container>
      <v-row>
        <v-col v-for="(order, index) in orders" :key="index">
          <Order :order="order" :index="index" :admin="admin" />
        </v-col>
      </v-row>
    </v-container>
  </v-container>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { auth, db } from "@/firebase";
import PreOrder from "@/components/PreOrder.vue";
import { onSnapshot, where, collection, query } from "@firebase/firestore";
import Order from "@/components/Order.vue";

export default defineComponent({
  name: "Home",
  components: {
    PreOrder,
    Order,
  },
  data() {
    return {
      orders: <any>{},
      loggedIn: false,
      admin: false as any,
    };
  },
  mounted() {
    auth.onAuthStateChanged((user) => {
      if (user) {
        user?.getIdTokenResult().then((idTokenResult) => {
          this.admin = idTokenResult.claims.admin;
        });
        try {
          const q = query(
            collection(db, "orders"),
            where("user.uid", "==", user.uid)
          );
          onSnapshot(q, (querySnapshot) => {
            querySnapshot.forEach((doc) => {
              console.log(doc.data());
              this.orders[doc.id] = doc.data();
            });
          });
        } catch {
          console.log("error");
        }
      } else {
        this.$router.push("/login");
      }
    });
  },
});
</script>

<template>
  <v-container>
    <v-card>
      <v-alert v-if="error.dialog">
        <v-alert-title color="error">
          {{ error.message }}
        </v-alert-title>
      </v-alert>
      <v-card-title>
        <h2>Orders</h2>
      </v-card-title>
      <v-tabs v-model="tab">
        <v-tab value="pending">
          <v-icon>mdi-view-dashboard</v-icon>
          <span>Pending</span>
        </v-tab>
        <v-tab value="completed">
          <v-icon>mdi-view-dashboard</v-icon>
          <span>Completed</span>
        </v-tab>
      </v-tabs>
    </v-card>
    <v-spacer />
    <v-window v-model="tab">
      <v-window-item value="pending">
        <v-container fluid>
          <v-row>
            <v-col>
              <Pending @error="handles" />
            </v-col>
          </v-row>
        </v-container>
      </v-window-item>
      <v-window-item value="completed">
        <v-container fluid>
          <v-row>
            <v-col>
              <Completed @error="handles" />
            </v-col>
          </v-row>
        </v-container>
      </v-window-item>
    </v-window>
  </v-container>
</template>

<script lang="ts">
import { defineComponent, defineAsyncComponent } from "vue";
import { auth } from "@/firebase";

export default defineComponent({
  name: "OrdersAdmin",
  components: {
    Pending: defineAsyncComponent(
      () => import("@/components/admin/components/orders/Pending.vue")
    ),
    Completed: defineAsyncComponent(
      () => import("@/components/admin/components/orders/Completed.vue")
    ),
  },
  data() {
    return {
      tab: "pending",
      error: {
        dialog: false,
        message: "",
      },
    };
  },
  methods: {
    handles(message: string) {
      this.error.dialog = true;
      this.error.message = message;
    },
  },
  mounted() {
    auth.onAuthStateChanged((user) => {
      if (!user) {
        this.$router.push("/");
      }
    });
  },
});
</script>

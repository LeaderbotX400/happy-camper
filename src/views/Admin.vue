<template>
  <v-navigation-drawer permanent width="190">
    <v-container>
      <v-tabs direction="vertical" v-model="tab">
        <v-btn color="error" @click="$router.push('/')">
          <v-icon>mdi-home</v-icon>
          <span>Home</span>
        </v-btn>
        <v-tab value="orders">
          <v-icon>mdi-clipboard-multiple</v-icon>
          <span>Orders</span>
        </v-tab>
        <v-tab value="products">
          <v-icon>mdi-package</v-icon>
          <span>Products</span>
        </v-tab>
        <v-tab value="users">
          <v-icon>mdi-account-multiple</v-icon>
          <span>Users</span>
        </v-tab>
      </v-tabs>
    </v-container>
  </v-navigation-drawer>
  <v-window v-model="tab">
    <v-window-item value="orders">
      <v-container fluid>
        <v-row>
          <v-col>
            <Orders />
          </v-col>
        </v-row>
      </v-container>
    </v-window-item>
    <v-window-item value="products">
      <v-container fluid>
        <v-row>
          <v-col>
            <items />
          </v-col>
        </v-row>
      </v-container>
    </v-window-item>
    <v-window-item value="users">
      <v-container fluid>
        <v-row>
          <v-col>
            <Users />
          </v-col>
        </v-row>
      </v-container>
    </v-window-item>
  </v-window>
</template>

<script lang="ts">
import { defineComponent, defineAsyncComponent } from "vue";

export default defineComponent({
  name: "AdminView",
  data() {
    return {
      items: [],
      tab: "orders",
    };
  },
  components: {
    Orders: defineAsyncComponent(
      () => import("@/components/admin/Menus/Orders.vue")
    ),
    Items: defineAsyncComponent(
      () => import("@/components/admin/Menus/Items.vue")
    ),
    Users: defineAsyncComponent(
      () => import("@/components/admin/Menus/Users.vue")
    ),
  },
});
</script>

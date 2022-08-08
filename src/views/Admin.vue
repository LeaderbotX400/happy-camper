<template>
  <v-navigation-drawer permanent width="190">
    <v-container grid-list-xs>
      <v-row>
        <v-col>
          <router-link
            :to="`/orders`"
            style="text-decoration: none; color: inherit"
          >
            <v-btn color="error" width="140">
              <v-icon>mdi-home</v-icon> Home
            </v-btn>
          </router-link>
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          <v-btn
            :color="active == 'orders' ? 'success' : 'info'"
            @click="active = 'orders'"
            width="140"
          >
            <v-icon>mdi-clipboard-multiple-outline</v-icon>
            Orders
          </v-btn>
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          <v-btn
            :color="active == 'items' ? 'success' : 'info'"
            @click="active = 'items'"
            width="140"
          >
            <v-icon class="mr-2">mdi-food</v-icon>
            Items
          </v-btn>
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          <v-btn
            :color="active == 'users' ? 'success' : 'info'"
            @click="active = 'users'"
            width="140"
          >
            <v-icon class="mr-2">mdi-shield-account</v-icon>
            Users
          </v-btn>
        </v-col>
      </v-row>
    </v-container>
  </v-navigation-drawer>
  <Orders v-if="active == 'orders'" />
  <Items v-if="active == 'items'" />
  <Users v-if="active == 'users'" />
</template>

<script lang="ts">
import { defineComponent, defineAsyncComponent } from "vue";

export default defineComponent({
  name: "Admin",
  data() {
    return {
      items: [],
      active: "orders",
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

<template>
  <v-app>
    <v-app-bar color="secondary">
      <v-toolbar-title> Happy Camper freeze dried snacks </v-toolbar-title>
      <v-spacer></v-spacer>
      <UserMenu />
    </v-app-bar>
    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import UserMenu from "@/components/UserMenu.vue";

export default defineComponent({
  name: "App",
  components: {
    UserMenu,
  },
});
</script>

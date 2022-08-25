<template>
  <v-app>
    <v-app-bar color="secondary">
      <v-toolbar-title> Happy Camper freeze dried snacks </v-toolbar-title>
      <v-spacer />
      <UserMenu />
    </v-app-bar>
    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<script lang="ts">
import { defineComponent, defineAsyncComponent } from "vue";
export default defineComponent({
  name: "App",
  components: {
    UserMenu: defineAsyncComponent(() => import("@/components/UserMenu.vue")),
  },
});
</script>

<style>
* {
  text-decoration: none;
}
</style>

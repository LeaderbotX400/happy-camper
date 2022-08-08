<template>
  <v-container align="center" justify="center">
    <v-card width="200" height="200">
      <v-card-text>Please wait...</v-card-text>
      <v-progress-circular indeterminate />
    </v-card>
  </v-container>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { auth } from "@/firebase";

export default defineComponent({
  name: "Loading",
  mounted() {
    auth.onAuthStateChanged((user) => {
      if (user) {
        this.$router.push("/orders");
      } else {
        this.$router.push("/login");
      }
    });
  },
});
</script>

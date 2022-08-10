<template>
  <v-dialog>
    <template v-slot:activator="{ props }">
      <v-btn v-bind="props" :loading="loading.button">
        <v-icon>mdi-check-circle</v-icon>
        Complete Order
      </v-btn>
    </template>
    <v-card :disabled="loading.dialog" :loading="loading.dialog">
      <v-alert v-if="error.dialog">
        <v-alert-title color="error">
          {{ error.message }}
        </v-alert-title>
      </v-alert>
      <v-card-title>Are you sure?</v-card-title>
      <v-card-text>
        <p>This will mark the order as complete and remove it from the list.</p>
        <p>This action cannot be undone.</p>
      </v-card-text>
      <v-card-actions>
        <v-btn
          color="primary"
          text
          @click="completeOrder()"
          :loading="loading.dialog"
        >
          OK
        </v-btn>
        <v-btn color="red" text @click="cancel()"> Cancel </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { functions } from "@/firebase";
import { httpsCallable } from "@firebase/functions";

export default defineComponent({
  name: "CompleteOrder",
  props: {
    index: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      dialog: false,
      error: {
        dialog: false,
        message: "",
      },
      loading: {
        dialog: false,
        button: false,
      },
    };
  },
  methods: {
    cancel() {
      this.dialog = false;
      this.loading = {
        dialog: false,
        button: false,
      };
      this.error = {
        dialog: false,
        message: "",
      };
    },
    async completeOrder() {
      this.loading.dialog = true;
      try {
        const completeOrder = httpsCallable(functions, "orders-complete");
        await completeOrder({
          id: this.index,
        });
      } catch (error) {
        this.error = {
          dialog: true,
          message: error as string,
        };
      } finally {
        this.loading.dialog = false;
      }
    },
  },
});
</script>

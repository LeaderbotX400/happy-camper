<template>
  <div class="text-center">
    <v-dialog
      v-model="deleteItemMenu"
      fullscreen
      width="300px"
      height="120px"
      :overlay="true"
      transition="dialog-transition"
    >
      <template v-slot:activator="{ props }">
        <v-btn color="error" v-bind="props">
          <v-icon>mdi-delete</v-icon> Delete
        </v-btn>
      </template>

      <v-card :disabled="loading" :loading="loading">
        <v-card-title> Delete {{ item?.name }}? </v-card-title>
        <v-card-subtitle> This action cannot be undone. </v-card-subtitle>
        <v-card-actions>
          <v-btn color="success" @click="deleteItem()" :loading="loading">
            Yes
          </v-btn>
          <v-btn color="error" @click="deleteItemMenu = false"> No </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { functions } from "@/firebase";
import { httpsCallable } from "@firebase/functions";

export default defineComponent({
  name: "DeleteItem",
  props: {
    item: Object,
  },
  data() {
    return {
      deleteItemMenu: false,
      loading: false,
    };
  },
  methods: {
    async deleteItem() {
      this.loading = true;
      try {
        const deleteItem = httpsCallable(functions, "items-deleteItem");
        await deleteItem({ item: this.item });
        this.deleteItemMenu = false;
      } catch (error) {
        console.log(error);
      }
      this.loading = false;
    },
  },
});
</script>

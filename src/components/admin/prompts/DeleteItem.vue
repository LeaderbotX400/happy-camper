<template>
  <div class="text-center">
    <v-dialog
      v-model="deleteItemMenu"
      fullscreen
      width="300px"
      height="220px"
      :overlay="true"
      transition="dialog-transition"
    >
      <template v-slot:activator="{ props }">
        <v-btn color="error" v-bind="props">
          <v-icon>mdi-delete</v-icon> Delete
        </v-btn>
      </template>
      <v-card :disabled="loading" :loadind="loading">
        <v-card-title>
          Are you sure you want to delete this Item?
        </v-card-title>
        <v-card-text> Note: This action can not be undone </v-card-text>
        <v-card-actions>
          <v-btn color="success" @click="deleteItem()"> Yes </v-btn>
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
    item: String,
  },
  data() {
    return {
      deleteItemMenu: false,
      loading: false,
    };
  },
  methods: {
    async deleteItem() {
      try {
        this.deleteItemMenu = false;
        const deleteItem = httpsCallable(functions, "deleteItem");
        await deleteItem({ item: this.item });
      } catch (error) {
        console.log(error);
      }
      this.loading = false;
    },
  },
});
</script>

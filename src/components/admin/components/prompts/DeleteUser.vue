<template>
  <v-dialog>
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        class="ma-2"
        :color="user.roles.dev ? 'grey' : 'red'"
        :disabled="user.roles.dev"
        prepend-icon="mdi-delete-circle"
      >
        Delete User
      </v-btn>
    </template>
    <v-card :disabled="loading" :loading="loading">
      <v-alert v-if="error.dialog">
        <v-alert-title color="error">
          {{ error.message }}
        </v-alert-title>
      </v-alert>
      <v-card-title>Are you sure?</v-card-title>
      <v-card-text>
        This will delete the user and all of their data. This action cannot be
        undone.
      </v-card-text>
      <v-card-actions>
        <v-btn
          color="primary"
          text
          @click="deleteUser(user.data.email)"
          :loading="loading"
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
  name: "DeleteUser",
  props: {
    user: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      loading: false,
      dialog: false,
      error: {
        dialog: false,
        message: "",
      },
    };
  },
  methods: {
    cancel() {
      this.loading = false;
      this.dialog = false;
      this.error = {
        dialog: false,
        message: "",
      };
    },
    async deleteUser(email: string) {
      this.loading = true;
      try {
        const deleteUser = httpsCallable(functions, "deleteUser");
        await deleteUser({ email });
      } catch (error) {
        this.error = {
          dialog: true,
          message: error as string,
        };
      }
      this.loading = false;
    },
  },
});
</script>

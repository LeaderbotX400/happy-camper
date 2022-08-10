<template>
  <v-dialog
    v-model="dialog"
    fullscreen
    max-width="500px"
    max-height="340px"
    :overlay="true"
    persistent
    transition="dialog-transition"
  >
    <template v-slot:activator="{ props }">
      <v-switch
        color="primary"
        label="Administrator"
        v-bind="props"
        :model-value="user.roles?.admin"
        :disabled="user.roles?.dev"
        :loading="loading.switch"
        @click="(dialog = true), (loading.switch = true)"
        :messages="
          user.roles.dev
            ? 'user is a developer and cannot be edited'
            : 'make user an administrator'
        "
      />
    </template>
    <v-card :loading="loading.dialog">
      <v-card-title>Are you sure?</v-card-title>
      <v-card-text>
        When a user is an administrator they can:
        <v-list>
          <v-list-item v-for="(item, index) in list" :key="item">
            <v-list-item-title>{{ index + 1 + ". " + item }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-card-text>
      <v-card-actions>
        <v-btn color="red" text @click="cancel()"> Cancel </v-btn>
        <v-btn
          color="primary"
          text
          @click="toggleAdmin(user.data.email)"
          :loading="loading.dialog"
        >
          OK
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { functions } from "@/firebase";
import { httpsCallable } from "@firebase/functions";

interface User {
  roles: {
    admin: boolean;
    dev: boolean;
  };
  data: {
    email: string;
  };
}

export default defineComponent({
  name: "TogglePerms",
  props: {
    user: {
      type: Object as () => User,
      required: true,
    },
  },
  data() {
    return {
      loading: {
        switch: false,
        dialog: false,
      },
      error: {
        status: false as boolean,
        message: "" as string,
      },
      dialog: false as boolean,
      list: [
        "can edit any user",
        "can edit any item",
        "can mark any order as completed",
      ],
    };
  },
  methods: {
    async toggleAdmin(email: string) {
      this.loading.dialog = true;
      try {
        const toggleRole = httpsCallable(functions, "toggleAdmin");
        await toggleRole({
          email: email,
          admin: !this.user.roles.admin,
        });
      } catch (err) {
        this.$emit("error", err);
      }
      this.dialog = false;
      this.loading.dialog = false;
    },
    cancel() {
      this.dialog = false;
      this.loading.switch = false;
    },
  },
});
</script>

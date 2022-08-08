<template>
  <v-card>
    <v-alert v-if="error.status">
      <v-alert-title>
        <v-icon> mdi-warning </v-icon>
        {{ error.message }}
      </v-alert-title>
    </v-alert>
    <v-card-title>
      <v-avatar size="40">
        <v-img :src="user.metadata.photoURL" />
      </v-avatar>
      {{ user.metadata.email }}
      <v-menu :close-on-content-click="false">
        <template v-slot:activator="{ props }">
          <v-btn icon v-bind="props" variant="plain">
            <v-icon>mdi-dots-vertical</v-icon>
          </v-btn>
        </template>
        <v-card width="150">
          <v-card-subtitle class="text-center">
            <v-icon>mdi-hard-hat</v-icon> Dev options
          </v-card-subtitle>

          <v-switch
            class="ml-4"
            color="primary"
            label="Raw Data"
            messages="Show raw data"
            v-model="rawData"
          />
        </v-card>
      </v-menu>
    </v-card-title>
    <v-card-text>
      <v-divider class="my-2" />
      <h3>Stats:</h3>
      <v-list>
        <v-list-item>
          <v-list-item-title>Total Orders:</v-list-item-title>
          <v-list-item-subtitle>
            {{ user.stats?.totalOrders || 0 }}
          </v-list-item-subtitle>
        </v-list-item>
        <v-list-item>
          <v-list-item-title>Total Spent:</v-list-item-title>
          <v-list-item-subtitle>
            ${{ user.stats?.totalSpent || 0 }}
          </v-list-item-subtitle>
        </v-list-item>
      </v-list>
      <v-divider class="my-2" />
      <h3>Roles:</h3>
      <v-col>
        <ToggleAdmin :user="user" @error="errorHandler" />
      </v-col>
      <v-divider />
    </v-card-text>
    <v-expand-transition>
      <v-code class="ma-2" v-if="rawData">
        <h3>Raw Data:</h3>
        <pre>{{ user }}</pre>
      </v-code>
    </v-expand-transition>
  </v-card>
</template>

<script lang="ts">
import { defineComponent, defineAsyncComponent } from "vue";
import ToggleAdmin from "@/components/admin/components/prompts/ToggleAdmin.vue";

interface User {
  metadata: {
    email: string;
    photoURL: string;
  };
  stats: {
    totalOrders: number;
    totalSpent: number;
  };
  roles: {
    admin: boolean;
    developer: boolean;
  };
}

export default defineComponent({
  name: "Users",
  props: {
    user: {
      type: Object as () => User,
      required: true,
    },
  },
  components: {
    ToggleAdmin,
  },
  data() {
    return {
      loading: false,
      error: {
        status: false as boolean,
        message: "" as string,
      },
      rawData: false,
    };
  },
  methods: {
    errorHandler(err: any) {
      this.error.status = true;
      this.error.message = err;
    },
  },
});
</script>

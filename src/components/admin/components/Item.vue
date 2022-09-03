<!-- eslint-disable vue/no-mutating-props -->
<template>
  <v-card max-width="300" :disabled="loading" :loading="loading">
    <div class="text-center">
      <v-alert v-if="error.status">
        <v-icon color="red">mdi-alert</v-icon>
        {{ error.message }}
      </v-alert>
      <v-card-title>
        {{ item.name }}
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

      <v-card-subtitle>
        Total Sold: {{ item.stats.totalSold }}
      </v-card-subtitle>
      <v-card-text>
        <v-row>
          <v-col cols="6">
            <v-text-field
              v-model="item.price"
              label="price"
              type="number"
              min="1"
              max="100"
              :value="item.price"
              density="comfortable"
            />
          </v-col>
          <v-col cols="6">
            <v-text-field
              v-model="item.stock"
              label="Stock"
              type="number"
              :value="item.stock"
              density="comfortable"
            />
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <v-switch
              :color="item.available ? 'green' : 'red'"
              :label="
                item.stock == 0
                  ? 'Out Of Stock'
                  : item.available
                  ? 'Available'
                  : 'Unavailable'
              "
              :disabled="item.stock <= 0"
              message="Change availability"
              v-model="item.available"
            />
          </v-col>
        </v-row>
      </v-card-text>
      <v-card-actions>
        <v-btn color="primary" @click="updateItem()" :loading="loading">
          Update
        </v-btn>
        <DeleteItem :item="item"></DeleteItem>
      </v-card-actions>
    </div>
    <v-expand-transition>
      <v-code v-if="rawData" class="ma-2">
        <h3>Raw Data:</h3>
        <pre>{{ item }}</pre>
      </v-code>
    </v-expand-transition>
  </v-card>
</template>

<script lang="ts">
import { defineComponent, defineAsyncComponent } from "vue";
import { functions } from "@/firebase";
import { httpsCallable } from "@firebase/functions";
import type { Item } from "@/types";

export default defineComponent({
  name: "ItemComponent",
  data() {
    return {
      rawData: false,
      loading: false,
      error: {
        status: false as boolean,
        message: "" as string,
      },
    };
  },
  props: {
    item: {
      type: Object,
      required: true,
    },
    index: {
      type: Number,
      required: true,
    },
    items: {
      type: Array,
      required: true,
    },
  },
  components: {
    DeleteItem: defineAsyncComponent(
      () => import("@/components/admin/components/prompts/DeleteItem.vue")
    ),
  },
  methods: {
    async updateItem() {
      this.loading = true;
      try {
        const newItems: Item[] = [];
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        this.items.forEach((item: Item) => {
          const input = {
            name: item.name,
            price: Number(item.price),
            stock: Number(item.stock),
            available: item.available,
          } as Item;
          newItems.push(input);
        });
        const updateItem = httpsCallable(functions, "updateItem");
        await updateItem({
          items: newItems,
        });
      } catch (error) {
        this.error.status = true as boolean;
        this.error.message = error as string;
      }
      this.loading = false;
    },
  },
});
</script>

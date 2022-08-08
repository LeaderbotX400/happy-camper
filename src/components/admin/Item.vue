<template>
  <v-card max-width="300">
    <div class="text-center">
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
        </v-row>
      </v-card-text>
      <v-card-actions>
        <v-btn color="primary" @click="updateItem()"> Update </v-btn>
        <DeleteItem :item="item"></DeleteItem>
      </v-card-actions>
    </div>
    <v-code v-if="rawData" class="ma-2">
      <h3>Raw Data:</h3>
      <pre>{{ item }}</pre>
    </v-code>
  </v-card>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { db } from "@/firebase";
import { doc, updateDoc } from "@firebase/firestore";
import DeleteItem from "./prompts/DeleteItem.vue";

export default defineComponent({
  name: "Item",
  data() {
    return {
      rawData: false,
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
    DeleteItem,
  },
  methods: {
    async updateItem() {
      console.log(this.items);
      try {
        await updateDoc(doc(db, "data/items"), {
          items: this.items,
        });
      } catch (error) {
        console.log(error);
      }
    },
  },
});
</script>

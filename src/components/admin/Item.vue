<template>
  <v-card max-width="300">
    <v-card-title>
      {{ item.name }}
    </v-card-title>
    <v-card-subtitle> ${{ item.price }} </v-card-subtitle>
    <v-card-text>
      <v-row>
        <v-col cols="5">
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
        <v-col>
          <v-switch
            :color="item.available ? 'green' : 'red'"
            :label="item.available ? 'Available' : 'Unavailable'"
            message="Change availability"
            v-model="item.available"
          />
        </v-col>
      </v-row>
    </v-card-text>
    <v-card-actions>
      <v-btn color="primary" @click="updateItem(index)"> Update </v-btn>
      <DeleteItem :item="item"></DeleteItem>
    </v-card-actions>
  </v-card>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { db } from "@/firebase";
import { doc, updateDoc } from "@firebase/firestore";

export default defineComponent({
  name: "Item",
  props: {
    item: {
      type: Object,
      required: true,
    },
    index: {
      type: Number,
      required: true,
    },
  },
});
</script>

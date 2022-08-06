<template>
  <v-container fluid>
    <v-form :disabled="loading">
      <v-card color="secondary">
        <v-card-title>Pre-Order</v-card-title>
        <v-text-field
          v-model="data.email"
          label="Email"
          class="mx-2"
          placeholder="jondoe@example.com"
          required
        ></v-text-field>
        <v-container
          v-for="(item, index) in items"
          :key="index"
          class="mx-auto"
        >
          <v-row>
            <v-checkbox
              v-model="data.selection[item.name].selected"
              :label="`${item.name} ($${item.price})`"
              :disabled="item.available"
            ></v-checkbox>
            {{ item.available ? "Not Available" : "Available" }}
          </v-row>
          <v-row>
            <v-text-field
              v-if="data.selection[item.name].selected"
              label="Quantity"
              density="compact"
              placeholder="1"
              v-model="data.selection[item.name].quantity"
            ></v-text-field>
          </v-row>
        </v-container>
        <v-card-actions>
          <v-btn color="primary" @click="submit">Submit</v-btn>
        </v-card-actions>
      </v-card>
    </v-form>
  </v-container>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { db, functions } from "@/firebase";
import { doc, onSnapshot } from "@firebase/firestore";
import { httpsCallable } from "@firebase/functions";

interface Item {
  name: string;
  price: number;
  available: boolean;
}

interface Data {
  email: string;
  selection: {
    [key: string]: {
      selected: boolean;
      quantity: number;
    };
  };
}

interface Order {
  name: string;
  quantity: number;
}

export default defineComponent({
  name: "Home",
  data() {
    return {
      loading: false,
      items: <Item[]>[],
      data: <Data>{
        email: "",
        selection: {},
      },
    };
  },
  methods: {
    async submit() {
      this.loading = true;
      const selectedItems = Object.keys(this.data.selection).filter(
        (key) => this.data.selection[key].selected
      );
      let temp: Order[] = [];
      for (const item of selectedItems) {
        if (this.data.selection[item].quantity > 0) {
          temp.push({
            name: item,
            quantity: this.data.selection[item].quantity,
          });
        }
      }
      const submitOrder = httpsCallable(functions, "submitOrder");
      try {
        await submitOrder({
          email: this.data.email,
          items: temp,
        });
        this.data = {
          email: "",
          selection: {},
        };
      } catch (error) {
        console.log(error);
      }
    },
  },
  mounted() {},
});
</script>

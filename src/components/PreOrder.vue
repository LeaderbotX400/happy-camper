<template>
  <v-container class="text-center">
    <v-btn color="primary">
      New Pre-Order
      <v-dialog :fullscreen="mobile" v-model="dialog" activator="parent">
        <v-card :disabled="loading" :loading="loading" class="width-75">
          <v-card-title>
            <span class="headline">New Pre-Order</span>
          </v-card-title>
          <v-container fluid>
            <v-form>
              <v-container
                v-for="(item, index) in selection"
                :key="index"
                class="d-flex align-space-between"
              >
                <v-card-text>
                  <v-row v-if="anonymous">
                    <v-text-field v-model="email" label="Email" />
                  </v-row>
                  <v-row>
                    <v-checkbox
                      :label="item.name + ' - $' + item.price"
                      v-model="selection[item.name].selected"
                    />
                  </v-row>
                  <v-row>
                    <v-text-field
                      v-if="selection[item.name].selected"
                      v-model="selection[item.name].quantity"
                      label="Quantity"
                      type="number"
                      min="1"
                      max="100"
                      density="comfortable"
                    />
                  </v-row>
                </v-card-text>
              </v-container>
            </v-form>
            <v-row>
              <v-card-title>total: ${{ total }} </v-card-title>
            </v-row>
          </v-container>
          <v-card-actions>
            <v-btn :loading="loading" color="primary" @click="submit()">
              Submit
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-btn>
  </v-container>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { db, functions } from "@/firebase";
import { httpsCallable } from "@firebase/functions";
import { doc, onSnapshot } from "@firebase/firestore";
import { useDisplay } from "vuetify";

interface Item {
  name: string;
  price: number;
  available: boolean;
}

interface Selection {
  [key: string]: {
    name: string;
    selected: boolean;
    quantity: any;
    price: number;
    available: boolean;
  };
}

export default defineComponent({
  name: "Home",
  setup() {
    const { mobile } = useDisplay();

    return { mobile };
  },
  props: {
    anonymous: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      loading: false as boolean,
      dialog: false as boolean,
      selection: <Selection>{},
      email: "" as string,
    };
  },
  computed: {
    total() {
      let total = 0;
      for (const item in this.selection) {
        if (
          this.selection[item].selected &&
          this.selection[item].quantity > 0
        ) {
          let price = this.selection[item].price;
          if (price) {
            total += price * this.selection[item].quantity;
          }
        }
      }
      return total;
    },
  },
  methods: {
    async submit() {
      this.loading = true;
      let items = [];
      for (const item in this.selection) {
        if (
          this.selection[item].selected &&
          this.selection[item].quantity > 0 &&
          this.selection[item].available
        ) {
          items.push({
            name: item,
            quantity: this.selection[item].quantity,
          });
        }
      }
      try {
        const callable = httpsCallable(functions, "submitOrder");
        const result = await callable({
          items: items,
          total: this.total,
        });
        console.log(result);
      } catch (error) {
        console.log(error);
      }
      this.loading = false;
      this.dialog = false;
    },
  },
  mounted() {
    onSnapshot(doc(db, "data/items"), (snapshot: any) => {
      snapshot.data().items.forEach((item: any) => {
        if (!this.selection[item.name]) {
          this.selection[item.name] = {
            name: item.name,
            selected: false,
            quantity: null,
            price: item.price,
            available: item.available,
          };
        }
      });
    });
  },
});
</script>

<template>
  <v-container class="text-center">
    <v-btn color="primary">
      New Pre-Order
      <v-dialog
        :fullscreen="mobile"
        v-model="dialog"
        activator="parent"
        max-width="600"
      >
        <v-card :disabled="loading" :loading="loading">
          <v-card-title>
            <span class="headline">New Pre-Order</span>
          </v-card-title>
          <v-container fluid>
            <div class="float-right" v-if="admin">
              <v-menu :close-on-content-click="false">
                <template v-slot:activator="{ props }">
                  <v-btn icon v-bind="props" variant="plain">
                    <v-icon>mdi-dots-vertical</v-icon>
                  </v-btn>
                </template>
                <v-card max-width="150">
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
            </div>
            <v-form>
              <v-card-text>
                <v-container v-for="(item, index) in selection" :key="index">
                  <v-row>
                    <v-checkbox
                      v-model="selection[item.name].selected"
                      :disabled="!item.available"
                    >
                      <template v-slot:label>
                        {{
                          `${item.name} - $${item.price} - ${
                            item.available ? "Available" : "Unavailable"
                          }`
                        }}
                      </template>
                    </v-checkbox>
                  </v-row>
                  <v-row>
                    <v-text-field
                      v-if="selection[item.name].selected"
                      v-model="selection[item.name].quantity"
                      validation-value="4"
                      :rules="rules.quantity"
                      :label="`Quantity (max: ${item.stock})`"
                      :error-messages="
                        item.quantity > item.stock
                          ? `Not enough stock, max: ${item.stock}`
                          : ''
                      "
                      type="number"
                      min="1"
                      max="100"
                      density="comfortable"
                      variant="outlined"
                    />
                  </v-row>
                </v-container>
              </v-card-text>
            </v-form>
            <v-row>
              <v-card-title>total: ${{ total }} </v-card-title>
            </v-row>
          </v-container>
          <v-code class="ma-2" v-if="rawData">
            <h3>Raw data:</h3>
            <pre>Items: {{ selection }}</pre>
            <pre>Stock check: {{ checkStock }}</pre>
          </v-code>
          <v-card-actions>
            <v-btn
              :loading="loading"
              color="primary"
              @click="submit()"
              :disabled="checkStock?.error"
            >
              Submit
            </v-btn>
            <v-btn color="red" @click="cancel()">Cancel</v-btn>
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
  stock: number;
  available: boolean;
}

interface Selection {
  [key: string]: {
    name: string;
    selected: boolean;
    quantity: any;
    price: number;
    stock: number;
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
    admin: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      loading: false as boolean,
      dialog: false as boolean,
      selection: <Selection>{},
      rules: {
        required: [(v: any) => !!v || "This field is required"],
        quantity: [
          (v: any) => !!v || "This field is required",
          (v: any) => v > 0 || "Quantity must be greater than 0",
        ],
      },
      error: false as boolean,
      rawData: false as boolean,
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
    checkStock() {
      for (const item in this.selection) {
        if (
          this.selection[item].selected &&
          this.selection[item].quantity > this.selection[item].stock
        ) {
          return {
            error: true,
            errorMsg: `Not enough ${this.selection[item].name} to fulfill order: only ${this.selection[item].stock} units in stock`,
          };
        } else {
          return {
            error: false,
            errorMsg: "",
          };
        }
      }
    },
  },
  methods: {
    async submit() {
      this.loading = true;
      let items = [];
      for (const item in this.selection) {
        if (this.total == 0) {
          this.cancel();
          return;
        }
        if (
          this.total > 0 && // if total is 0, don't submit
          this.selection[item].selected && // if item is selected
          this.selection[item].quantity > 0 && // quantity must be greater than 0
          this.selection[item].available // check if item is available
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
      } catch (error) {
        console.log(error);
      }
      this.cancel();
    },
    cancel() {
      for (const item in this.selection) {
        this.selection[item].selected = false;
        this.selection[item].quantity = 0;
      }
      this.loading = false;
      this.dialog = false;
    },
  },
  mounted() {
    onSnapshot(doc(db, "data/items"), (snapshot: any) => {
      if (snapshot.data().items.length > 0) {
        this.selection = {};
        snapshot.data().items.forEach((item: any) => {
          if (!this.selection[item.name]) {
            this.selection[item.name] = {
              name: item.name,
              selected: false as boolean,
              quantity: null as number | null,
              price: Number(item.price) as number,
              stock: Number(item.stock) as number,
              available: item.available as boolean,
            };
          }
        });
      }
    });
  },
});
</script>

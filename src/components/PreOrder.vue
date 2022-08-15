<template>
  <v-container>
    <v-btn color="primary">
      New Pre-Order
      <v-dialog :fullscreen="mobile" v-model="dialog" activator="parent">
        <v-card :disabled="loading" :loading="loading">
          <v-alert v-if="error.status">
            <v-alert-title color="error">
              <v-icon color="red">mdi-alert</v-icon>
              {{ error.message }}
            </v-alert-title>
          </v-alert>
          <v-card-title>
            <span class="headline">New Pre-Order</span>
          </v-card-title>
          <v-container fluid>
            <div class="float-right" v-if="dev">
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
                <v-container v-for="(item, index) in items" :key="index">
                  <v-row>
                    <v-checkbox
                      v-model="items[item.name].selected"
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
                      v-if="items[item.name].selected"
                      v-model="items[item.name].quantity"
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
                      variant="underlined"
                    />
                  </v-row>
                </v-container>
              </v-card-text>
            </v-form>
            <v-row>
              <v-col cols="6">
                <v-card-title>total: ${{ total }} </v-card-title>
              </v-col>
            </v-row>
          </v-container>
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
          <v-expand-transition>
            <v-code class="ma-2" v-if="rawData">
              <h3>Raw data:</h3>
              <pre>Items: {{ items }}</pre>
              <pre>Stock check: {{ checkStock }}</pre>
            </v-code>
          </v-expand-transition>
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

interface Item {
  name: string;
  price: number;
  stock: number;
  available: boolean;
}

export default defineComponent({
  name: "Pre-Order",
  setup() {
    const { mobile } = useDisplay();
    return { mobile };
  },
  props: {
    dev: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      dialog: false,
      loading: false,
      error: {
        status: false,
        message: "",
      },
      items: {} as Selection,
      rules: {
        required: [(v: any) => !!v || "This field is required"],
        quantity: [
          (v: any) => !!v || "This field is required",
          (v: any) => v > 0 || "Quantity must be greater than 0",
        ],
      },
      rawData: false,
    };
  },
  computed: {
    total() {
      let total = 0;
      for (const item in this.items) {
        if (this.items[item].selected && this.items[item].quantity > 0) {
          let price = this.items[item].price;
          if (price) {
            total += price * this.items[item].quantity;
          }
        }
      }
      return total;
    },
    checkStock() {
      for (const item in this.items) {
        if (
          this.items[item].selected &&
          this.items[item].quantity > this.items[item].stock
        ) {
          return {
            error: true,
            errorMsg: `Not enough ${this.items[item].name} to fulfill order: only ${this.items[item].stock} units in stock`,
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
      for (const item in this.items) {
        if (this.total == 0) {
          this.cancel();
          return;
        }
        if (
          this.items[item].selected &&
          this.items[item].quantity > 0 &&
          this.items[item].available
        ) {
          items.push({
            name: this.items[item].name,
            quantity: this.items[item].quantity,
          });
        }
      }

      try {
        const submitOrder = httpsCallable(functions, "orders-submit");
        await submitOrder({
          items,
          total: this.total,
        });
        this.cancel();
      } catch (error) {
        this.error.status = true as boolean;
        this.error.message = error as string;
      }
      this.loading = false;
    },
    cancel() {
      for (const item in this.items) {
        this.items[item].selected = false;
        this.items[item].quantity = 0;
      }
      this.loading = false;
      this.dialog = false;
      this.error = {
        status: false,
        message: "",
      };
    },
  },
  mounted() {
    onSnapshot(doc(db, "data/items"), (snapshot) => {
      this.items = {};
      snapshot.data()?.items.forEach((item: Item) => {
        if (!this.items[item.name]) {
          this.items[item.name] = {
            name: item.name,
            selected: false as boolean,
            quantity: null as number | null,
            price: Number(item.price) as number,
            stock: Number(item.stock) as number,
            available: item.available as boolean,
          };
        }
      });
    });
  },
});
</script>

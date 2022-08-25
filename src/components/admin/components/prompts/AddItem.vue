<template>
  <v-dialog
    v-model="inputMenu"
    fullscreen
    :overlay="true"
    max-width="500"
    :max-height="error.dialog ? 500 : 350"
    persistent
    transition="dialog-transition"
  >
    <template v-slot:activator="{ props }">
      <v-btn color="primary" v-bind="props"> Add Item </v-btn>
    </template>
    <v-card color="white" :disabled="loading" :loading="loading" fullscreen>
      <v-alert v-if="error.dialog" color="error" max-height="100">
        {{ error.message }}
      </v-alert>

      <v-card-title primary-title> Add New Item </v-card-title>
      <v-form ref="newItem" lazy-validation>
        <v-container align="center">
          <v-row>
            <v-col>
              <v-text-field
                class="mx-5 input"
                v-model="input.name"
                label="Item Name"
                :rules="rules.name"
                placeholder="Item Name"
                type="name"
                required
                shaped
              />
            </v-col>
            <v-col>
              <v-text-field
                class="mx-5 input"
                v-model="input.price"
                prefix="$"
                label="Price"
                :rules="rules.price"
                placeholder="2.00"
                type="number"
                required
                shaped
              />
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <v-text-field
                class="mx-5 input"
                v-model="input.stock"
                label="Stock"
                :rules="rules.stock"
                placeholder="100"
                type="number"
                required
                shaped
              />
            </v-col>
            <v-col>
              <v-switch
                v-model="input.available"
                default="true"
                :label="input.available ? 'Available' : 'Unavailable'"
                color="primary"
              />
            </v-col>
          </v-row>
        </v-container>
        <v-card-actions>
          <v-btn color="success" @click="addItem(input)" :loading="loading">
            Confirm
          </v-btn>
          <v-btn color="error" @click="cancel()"> cancel </v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { functions } from "@/firebase";
import { httpsCallable } from "@firebase/functions";

interface Input {
  name: string;
  price: number;
  stock: number;
  available: boolean;
}

interface Error {
  message: string;
  dialog: boolean;
}
export default defineComponent({
  data() {
    return {
      input: {
        name: "",
        price: 0,
        stock: 0,
        available: true,
      } as Input,
      loading: false,
      rules: {
        name: [(v: any) => !!v || "Name is required"],
        price: [(v: any) => !!v || "Price is required"],
        stock: [(v: any) => !!v || "Stock amount is required"],
      },
      inputMenu: false,
      error: {
        dialog: false,
        message: "",
      } as Error,
    };
  },
  methods: {
    cancel() {
      this.input = {
        name: "",
        price: 0,
        stock: 0,
        available: true,
      } as Input;
      this.error = {
        dialog: false,
        message: "",
      } as Error;
      this.inputMenu = false;
    },
    async addItem(input: Input) {
      // @ts-ignore
      let checkValid = await this.$refs.newItem.validate();
      if (checkValid.valid) {
        this.loading = true as boolean;
        try {
          await httpsCallable(functions, "items-addItem")(input);
          this.cancel();
        } catch (error) {
          console.log(error);
          this.error = {
            dialog: true as boolean,
            message: error as string,
          };
        }
        this.loading = false;
      }
    },
  },
});
</script>

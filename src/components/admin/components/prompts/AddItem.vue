<template>
  <v-dialog
    v-model="inputMenu"
    fullscreen
    max-width="500px"
    max-height="340px"
    :overlay="true"
    persistent
    transition="dialog-transition"
  >
    <template v-slot:activator="{ props }">
      <v-btn color="primary" v-bind="props"> Add Item </v-btn>
    </template>
    <v-card color="white" :disabled="loading" :loading="loading">
      <v-alert v-if="error != null" color="error">
        {{ error }}
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
                label="Item is Available"
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

export default defineComponent({
  data() {
    return {
      input: <Input>{
        name: "",
        price: 0,
        stock: 0,
        available: false,
      },
      loading: false,
      props: false,
      rules: {
        name: [(v: any) => !!v || "Name is required"],
        price: [(v: any) => !!v || "Price is required"],
        stock: [(v: any) => !!v || "Stock amount is required"],
      },
      inputMenu: false,
      error: null as any,
    };
  },
  methods: {
    cancel() {
      this.inputMenu = false;
      this.input = {
        name: "",
        price: 0,
        stock: 0,
        available: false,
      };
    },
    async addItem(input: Input) {
      // @ts-ignore
      let checkValid = await this.$refs.newItem.validate();
      if (checkValid.valid) {
        this.loading = true;
        try {
          await httpsCallable(functions, "addItem")(input);
          this.cancel();
        } catch (error) {
          this.error = error;
        }
        this.loading = false;
      }
    },
  },
});
</script>

<template>
  <v-dialog
    v-model="inputMenu"
    fullscreen
    max-width="500px"
    max-height="340px"
    :overlay="true"
    transition="dialog-transition"
  >
    <template v-slot:activator="{ props }">
      <v-btn color="primary" v-bind="props"> Add Item </v-btn>
    </template>
    <v-card color="white" :disabled="loading">
      <v-card-title primary-title> Add New Item </v-card-title>
      <v-form ref="newItem" lazy-validation @submit.prevent>
        <v-container align="center">
          <v-row>
            <v-text-field
              class="mx-5 input"
              v-model="input.name"
              label="Item Name"
              :rules="nameRules"
              placeholder="Item Name"
              type="name"
              required
              shaped
            />
            <v-text-field
              class="mx-5 input"
              v-model="input.price"
              label="Price"
              :rules="priceRules"
              placeholder="2.00"
              type="name"
              required
              shaped
            />
          </v-row>
          <v-row align="center">
            <v-col>
              <v-switch
                v-model="input.available"
                label="Item is Available"
                color="primary"
              />
            </v-col>
          </v-row>
        </v-container>
        <v-card-actions>
          <v-btn color="success" @click="addItem(input)"> Confirm </v-btn>
          <v-btn color="error" @click="cancel()"> cancel </v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
    <v-btn loading>test</v-btn>
  </v-dialog>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { functions } from "@/firebase";
import { httpsCallable } from "@firebase/functions";

interface Input {
  name: string;
  price: number;
  available: boolean;
}

export default defineComponent({
  data() {
    return {
      input: <Input>{
        name: "",
        price: 0,
        available: false,
      },
      loading: false,
      props: false,
      nameRules: [(v: any) => !!v || "Name is required"],
      priceRules: [(v: any) => !!v || "Price is required"],
      inputMenu: false,
    };
  },
  methods: {
    cancel() {
      this.inputMenu = false;
      this.input = {
        name: "",
        price: 0,
        available: false,
      };
    },
    async addItem(input: Input) {
      let checkValid = await this.$refs.newItem.validate();
      if (checkValid.valid) {
        this.loading = true;
        try {
          await httpsCallable(functions, "addItem")(input);
          this.inputMenu = false;
          this.input = {
            name: "",
            price: 0,
            available: false,
          };
        } catch (error) {
          console.log(error);
        }
        this.loading = false;
      }
    },
  },
});
</script>

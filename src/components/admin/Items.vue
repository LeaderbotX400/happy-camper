<template>
  <v-container grid-list-xs align="center">
    <v-row>
      <v-col>
        <AddItem :items="items"></AddItem>
      </v-col>
    </v-row>
    <v-row>
      <v-col v-for="item in items" :key="item">
        <v-menu>
          <template v-slot:activator="{ props }">
            <v-btn color="info" v-bind="props">
              {{ item }}
            </v-btn>
          </template>
          <v-list>
            <v-list-item>
              <DeleteItem :item="item" :items="items"></DeleteItem>
            </v-list-item>
          </v-list>
        </v-menu>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { db } from "@/firebase";
import { doc, onSnapshot } from "@firebase/firestore";
import AddItem from "./prompts/AddItem.vue";

export default defineComponent({
  name: "Item Menu",
  components: {
    AddItem,
  },
  data() {
    return {
      items: [],
    };
  },
  mounted() {
    onSnapshot(doc(db, "data/items"), (doc) => {
      this.items = doc.data()?.items;
    });
  },
});
</script>

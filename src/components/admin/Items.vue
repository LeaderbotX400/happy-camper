<template>
  <v-container grid-list-xs align="center">
    <v-row>
      <v-col>
        <AddItem :items="items"></AddItem>
      </v-col>
    </v-row>
    <v-row>
      <v-col v-for="(item, index) in items" :key="index">
        <Item :item="item" :index="index" />
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { db } from "@/firebase";
import { doc, onSnapshot, updateDoc } from "@firebase/firestore";
import AddItem from "./prompts/AddItem.vue";
import DeleteItem from "./prompts/DeleteItem.vue";
import Item from "./Item.vue";

export default defineComponent({
  name: "Item Menu",
  components: {
    AddItem,
    DeleteItem,
    Item,
  },
  data() {
    return {
      items: [] as any,
    };
  },
  mounted() {
    onSnapshot(doc(db, "data/items"), (doc) => {
      this.items = doc.data()?.items;
    });
  },
});
</script>

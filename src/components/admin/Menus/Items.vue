<template>
  <v-container grid-list-xs>
    <v-row>
      <v-col align="center">
        <AddItem :items="items"></AddItem>
      </v-col>
    </v-row>
    <v-row>
      <v-col v-for="(item, index) in items" :key="index">
        <Item :item="item" :index="index" :items="items" />
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { defineComponent, defineAsyncComponent } from "vue";
import { db } from "@/firebase";
import { doc, onSnapshot } from "@firebase/firestore";
import type { Item } from "@/types";

let unsubscribe: () => void;

export default defineComponent({
  name: "ItemMenu",
  components: {
    AddItem: defineAsyncComponent(
      () => import("@/components/admin/components/prompts/AddItem.vue")
    ),
    Item: defineAsyncComponent(
      () => import("@/components/admin/components/Item.vue")
    ),
  },
  data() {
    return {
      items: [] as Item[],
    };
  },
  beforeUnmount() {
    unsubscribe();
  },
  mounted() {
    unsubscribe = onSnapshot(doc(db, "data/items"), (doc) => {
      this.items = doc.data()?.items;
    });
  },
});
</script>

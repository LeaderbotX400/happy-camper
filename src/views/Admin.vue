<template>
  <v-navigation-drawer> </v-navigation-drawer>
  <v-main>
    <AddItem />
  </v-main>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { db } from "@/firebase";
import { doc, onSnapshot } from "@firebase/firestore";
import AddItem from "@/components/AddItem.vue";

export default defineComponent({
  name: "Admin",
  data() {
    return {
      items: [],
    };
  },
  components: {
    AddItem,
  },
  async created() {
    // onSnapshot(doc(db, "data/items"), (snapshot) => {});
  },
});
</script>

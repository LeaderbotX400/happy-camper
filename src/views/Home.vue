<template>
  <PreOrder />
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { auth } from "@/firebase";
import PreOrder from "@/components/PreOrder.vue";

export default defineComponent({
  name: "Home",
  components: {
    PreOrder,
  },
  data() {
    return {};
  },
  mounted() {},
});
</script>

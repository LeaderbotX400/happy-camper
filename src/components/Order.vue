<template>
  <v-card max-width="500">
    <v-card-title>
      {{ date(order.created) }}
      <div class="float-right" v-if="admin">
        <v-menu :close-on-content-click="false">
          <template v-slot:activator="{ props }">
            <v-btn icon v-bind="props" variant="plain">
              <v-icon>mdi-dots-vertical</v-icon>
            </v-btn>
          </template>
          <v-card width="150">
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
    </v-card-title>
    <v-card-text>
      <v-container>
        <v-row align="center" justify="space-between">
          <v-col>
            <h4>Status:</h4>
            {{ order.completed ? "Completed" : "Pending" }}
            <v-icon color="green" v-if="order.completed" width="32" height="32">
              mdi-check-circle
            </v-icon>
            <v-progress-circular
              indeterminate
              color="yellow"
              size="small"
              v-else
            />
          </v-col>
          <v-col>
            <v-table>
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Quantity</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in order.items" :key="index">
                  <td>{{ item.name }}</td>
                  <td>{{ item.quantity }}</td>
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <td>
                    <h4>Total:</h4>
                  </td>
                  <td>${{ order.total }}</td>
                </tr>
              </tfoot>
            </v-table>
          </v-col>
        </v-row>
      </v-container>
    </v-card-text>
    <v-expand-transition>
      <v-code class="ma-2" v-if="rawData">
        <h3>Raw data:</h3>
        <pre>{{ order }}</pre>
      </v-code>
    </v-expand-transition>
  </v-card>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "Order",
  props: {
    order: {
      type: Object,
      required: true,
    },
    index: {
      type: Number,
      required: true,
    },
    admin: {
      type: Boolean,
      required: true,
    },
  },
  data() {
    return {
      rawData: false as boolean,
    };
  },
  methods: {
    date(date: any) {
      return date.toDate().toLocaleString();
    },
  },
});
</script>

<template>
  <v-expansion-panels>
    <v-expansion-panel v-for="(order, index) in orders" :key="index">
      <v-expansion-panel-title>
        <v-row>
          <v-col>Email: {{ order.email }}</v-col>
          <v-col>Items: {{ order.items.length }}</v-col>
          <v-col>Total: ${{ order.total }}</v-col>
          <v-col>
            <div v-if="order.completed">
              {{ order.completed ? "Completed" : "Pending" }}
              <v-icon color="green"> mdi-check-circle </v-icon>
            </div>
            <div v-else>
              <v-icon color="amber">mdi-alert-circle</v-icon>
              This should not be here please contact the developer to fix this
              bug.
            </div>
          </v-col>
        </v-row>
      </v-expansion-panel-title>
      <v-expansion-panel-text>
        <v-container>
          <v-row>
            <v-col>
              <v-list>
                Order:
                <v-list-item v-for="(item, index) in order.items" :key="index">
                  <v-list-item-title>{{ item.name }}</v-list-item-title>
                  <v-list-item-subtitle>{{
                    item.quantity
                  }}</v-list-item-subtitle>
                </v-list-item>
              </v-list>
            </v-col>
            <v-col>
              Completion date:
              <br />
              {{ date(order.completionDate) }}
            </v-col>
            <div class="float">
              <v-menu :close-on-content-click="false" v-if="dev">
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
                    v-model="rawData[index]"
                  />
                </v-card>
              </v-menu>
            </div>
          </v-row>
          <v-row v-if="!order.completed">
            <v-col>
              <CompleteOrder :index="(index as any)" />
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <v-expand-transition>
                <v-code class="ma-2" v-if="rawData[index]">
                  <h3>Raw data:</h3>
                  <pre>{{ order }}</pre>
                </v-code>
              </v-expand-transition>
            </v-col>
          </v-row>
        </v-container>
      </v-expansion-panel-text>
    </v-expansion-panel>
  </v-expansion-panels>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { auth, db } from "@/firebase";
import {
  onSnapshot,
  collection,
  query,
  where,
  Timestamp,
} from "@firebase/firestore";

let unsubscribe: () => void;

interface Order {
  email: string;
  items: any[];
  total: number;
  completed: boolean;
  completionDate: Timestamp | null | undefined;
}

interface Orders {
  [key: string]: Order;
}

interface RawData {
  [key: string]: boolean;
}

export default defineComponent({
  name: "PendingOrders",
  data() {
    return {
      orders: {} as Orders,
      dev: false as boolean,
      rawData: {} as RawData,
    };
  },
  methods: {
    date(date: Timestamp | null | undefined) {
      if (date) {
        return date.toDate().toLocaleString();
      }
      return "";
    },
  },
  beforeDestroy() {
    unsubscribe();
  },
  mounted() {
    auth.onAuthStateChanged((user) => {
      if (user) {
        user?.getIdTokenResult().then((idTokenResult) => {
          if (idTokenResult.claims?.dev) {
            this.dev = true;
          }
        });
        try {
          const q = query(
            collection(db, "orders"),
            where("completed", "==", true)
          );
          unsubscribe = onSnapshot(q, (snapshot) => {
            this.orders = {};
            snapshot.forEach((doc) => {
              this.orders[doc.id] = doc.data() as Order;
              this.rawData[doc.id] = false;
            });
          });
        } catch (error) {
          this.$emit("handles", error);
        }
      } else {
        unsubscribe();
      }
    });
  },
});
</script>

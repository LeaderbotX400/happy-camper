<template>
  <v-container>
    <v-card>
      <v-card-title>
        <h2>Orders</h2>
      </v-card-title>
      <v-card-text v-if="orders.length <= 0"> No orders yet. </v-card-text>
    </v-card>
    <v-expansion-panels>
      <v-expansion-panel v-for="(order, index) in orders" :key="index">
        <v-expansion-panel-title>
          <v-row>
            <v-col>Email: {{ order.email }}</v-col>
            <v-col>Items: {{ order.items.length }}</v-col>
            <v-col>Total: ${{ order.total }}</v-col>
            <v-col :color="order.completed ? 'green' : 'yellow'">
              {{ order.completed ? "Completed" : "Pending" }}
              <v-icon v-if="order.completed" color="green"
                >mdi-check-circle</v-icon
              >
              <v-progress-circular
                v-else
                :size="20"
                :width="5"
                color="yellow"
                indeterminate
              ></v-progress-circular>
            </v-col>
          </v-row>
        </v-expansion-panel-title>
        <v-expansion-panel-text>
          <v-container>
            <v-row>
              <v-col>
                <v-list>
                  Order:
                  <v-list-item
                    v-for="(item, index) in order.items"
                    :key="index"
                  >
                    <v-list-item-title>{{ item.name }}</v-list-item-title>
                    <v-list-item-subtitle>{{
                      item.quantity
                    }}</v-list-item-subtitle>
                  </v-list-item>
                </v-list>
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
                <CompleteOrder
                  :index="(index as any)"
                  @complete="completeOrder"
                />
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
  </v-container>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { auth, db } from "@/firebase";
import { doc, onSnapshot, collection, updateDoc } from "@firebase/firestore";
import CompleteOrder from "@/components/admin/components/prompts/CompleteOrder.vue";

export default defineComponent({
  name: "Home",
  components: {
    CompleteOrder,
  },
  data() {
    return {
      orders: <any>{},
      loggedIn: false,
      dev: false as any,
      rawData: {} as any,
    };
  },
  methods: {
    async completeOrder(docId: any) {
      await updateDoc(doc(db, "orders", docId), {
        completed: true,
      });
    },
  },
  mounted() {
    auth.onAuthStateChanged((user) => {
      if (user) {
        user?.getIdTokenResult().then((idTokenResult) => {
          if (idTokenResult.claims?.dev) {
            this.dev = true;
          }
          if (!idTokenResult.claims.admin) {
            this.$router.push("/");
          }
        });
        try {
          onSnapshot(collection(db, "orders"), (querySnapshot) => {
            this.orders = {};
            querySnapshot.forEach((doc) => {
              this.orders[doc.id] = doc.data();
              this.rawData[doc.id] = false;
            });
          });
        } catch {
          console.log("error");
        }
      } else {
        this.$router.push("/");
      }
    });
  },
});
</script>

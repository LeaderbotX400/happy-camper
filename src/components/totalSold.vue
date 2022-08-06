<template>
  <Bar :chart-data="chartData" />
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { Bar } from "vue-chartjs";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
} from "chart.js";

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
);

interface Item {
  name: string;
  sold: number;
}
interface ChartData {
  labels: string[];
  datasets: [
    {
      label: string;
      data: number[];
      backgroundColor: string[];
    }
  ];
}

export default defineComponent({
  name: "TotalSold",
  components: { Bar },
  props: {
    inputData: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      input: [],
      chartData: <ChartData>{
        labels: [],
        datasets: [
          {
            label: "Total Sold",
            data: [],
            backgroundColor: [],
          },
        ],
      },
    };
  },
  mounted() {
    this.input = this.inputData;
    // this.inputData.forEach((item: any) => {
    //   this.chartData.labels.push(item.name);
    //   this.chartData.datasets[0].data.push(item.sold);
    //   this.chartData.datasets[0].backgroundColor.push("#4caf50");
    // });
  },
});
</script>

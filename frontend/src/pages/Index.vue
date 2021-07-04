<template>
  <q-page class="flex flex-center">
    <EmbeddingChart :chart-data="datacollection"></EmbeddingChart>
    <button @click="fillData()">Randomize</button>
  </q-page>
</template>

<script>
import EmbeddingChart from "components/EmbeddingChart.js";

export default {
  name: "PageIndex",
  components: {
    EmbeddingChart
  },
  data() {
    return {
      datacollection: {
        labels: [],
        datasets: [
          {
            label: "Fuck you!",
            data: [
              {
                x: this.getRandomInt(),
                y: this.getRandomInt(),
                r: this.getRandomInt()
              },
              {
                x: this.getRandomInt(),
                y: this.getRandomInt(),
                r: this.getRandomInt()
              }
            ]
          }
        ]
      }
    };
  },
  mounted() {},
  methods: {
    fillData() {
      this.datacollection.datasets[0].data[0] = {
        x: this.getRandomInt(),
        y: this.getRandomInt(),
        r: this.getRandomInt()
      };
      this.datacollection = {
        ...this.datacollection
      };
    },
    getRandomInt() {
      return Math.floor(Math.random() * (50 - 5 + 1)) + 5;
    }
  }
};
</script>

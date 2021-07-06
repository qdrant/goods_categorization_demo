<template>
  <q-page class="flex flex-center">
    <div class="row">
      <div class="col">
        <EmbeddingChart
          :width="1200"
          :height="640"
          v-if="graphLoaded"
          :chart-data="datacollection"
        ></EmbeddingChart>
        <button @click="fillData()">Randomize</button>
      </div>
    </div>
  </q-page>
</template>

<script>
import EmbeddingChart from "components/EmbeddingChart.js";
import axios from "axios";

export default {
  name: "PageIndex",
  components: {
    EmbeddingChart
  },
  data() {
    return {
      graphLoaded: false,
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
  async mounted() {
    this.loadInitialData();
  },
  methods: {
    async loadInitialData() {
      this.graphLoaded = false;
      try {
        const categories = await axios.get("/api/graph");

        this.datacollection.datasets[0].data = categories.data.map(category => {
          return {
            x: category.vec[0],
            y: category.vec[1],
            r: 1
          };
        });

        this.datacollection = {
          ...this.datacollection
        };

        this.graphLoaded = true;
      } catch (e) {
        console.error(e);
      }
    },
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

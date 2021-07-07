<template>
  <q-page class="flex flex-center">
    <div class="q-pa-md q-col-gutter-sm items-stretch">
      <div class="row justify-evenly">
        <div class="col-12 text-grey">
          <q-expansion-item icon="info" label="More info">
            <br />
            <p>
              This demo uses product samples from real-life e-commerce
              categorization. <br />
              Each product name is encoded using a
              <b>neural text encoder model</b> and indexed into the Qdrant
              vector similarity search engine.<br />
              Once you submit a new product name, it will be encoded using the
              same neural network and compare against stored references. <br />
            </p>
            <p>
              The colored dots you see under the input box are category vectors
              used in this demo. <br />
              The vectors have been reduced to 2D using
              <a
                class="my-link"
                href="https://umap-learn.readthedocs.io/"
                target="_blank"
                >Umap</a
              >
              so that they could be rendered.<br />
              Adding new categories to the system is equivalent to adding a new
              vector to the collection of examples. <br />
              It means that the list of categories can be expanded and refined
              <b>without retraining</b>.
            </p>
          </q-expansion-item>
        </div>
      </div>

      <div class="row justify-evenly">
        <div class="col-12">
          <q-input
            outlined
            :loading="loadingState"
            v-model="query"
            placeholder="Categorize product"
            color="black"
            :input-style="{ fontSize: '16pt' }"
            v-on:keyup.enter="categorize"
          >
            <template v-slot:append>
              <div>
                <q-avatar style="width: auto;">
                  <img src="~assets/logo.png" alt="Powered by Qdrant" />
                </q-avatar>
              </div>
            </template>
          </q-input>
        </div>
      </div>

      <!--- EXAMPLES --->
      <div class="row justify-evenly">
        <div class="col-12">
          Try this:
          <q-chip
            v-for="example in examples"
            v-bind:key="example"
            clickable
            @click="useSample(example)"
            color="secondary"
            text-color="black"
            outline
            icon="input"
          >
            {{ example }}
          </q-chip>
        </div>
      </div>

      <!--- RESULTS --->
      <div class="row justify-evenly q-mt-sm" v-if="results.length">
        <div class="col-12">
          Top categories:
          <q-chip
            v-for="result in results"
            v-bind:key="result.top_category + result.category"
            :color="category_to_color[result.top_category]"
            text-color="white"
            icon="category"
            :disable="result.score < 0.5"
          >
            {{ result.top_category }} / {{ result.category }} (
            {{ Math.floor(result.score * 100) / 100 }} )
          </q-chip>
        </div>
      </div>

      <div class="row">
        <div class="col-10">
          <EmbeddingChart
            :width="1200"
            :height="640"
            v-if="graphLoaded"
            :chart-data="datacollection"
          ></EmbeddingChart>
        </div>
      </div>
    </div>

    <q-footer class="bg-white text-grey q-ml-md">
      <ul>
        <li>
          Data source:
          <a
            href="https://yandex.com/support/partnermarket/elements/categories.html"
            >market.yandex.com</a
          >
        </li>
        <li>
          Embedding model: SentenceTransformer
          <code>paraphrase-multilingual-MiniLM-L12-v2</code>
          <a href="https://github.com/UKPLab/sentence-transformers">
            <q-icon name="open_in_new"></q-icon
          ></a>
        </li>
      </ul>
    </q-footer>
  </q-page>
</template>

<script>
import EmbeddingChart from "components/EmbeddingChart.js";
import axios from "axios";
import _ from "lodash";

export default {
  name: "PageIndex",
  components: {
    EmbeddingChart
  },
  data() {
    return {
      query: "",
      examples: ["Smart-TV", "Bread and butter", "Vacuum cleaner"],
      loadingState: false,
      results: [],
      palette: [
        "#db5f57",
        "#db9057",
        "#dbc257",
        "#c3db57",
        "#91db57",
        "#5fdb57",
        "#57db80",
        "#57dbb2",
        "#57d3db",
        "#57a2db",
        "#5770db",
        "#6f57db",
        "#a157db",
        "#d357db",
        "#db57b2",
        "#db5780"
      ],
      category_to_color: {},
      graphLoaded: false,
      graph: {},
      datacollection: {
        labels: [],
        datasets: [
          {
            backgroundColor: "#ff000022",
            borderColor: "#ff000088",
            border: 1,
            label: "Query",
            data: []
          },
          {
            backgroundColor: "#00000022",
            borderColor: "#00000088",
            border: 2,
            label: "Result",
            data: []
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
        const graph = await axios.get("/api/graph");
        this.graph = graph.data;

        const grouped_categories = _.groupBy(
          graph.data,
          row => row.top_category
        );

        var categories_datasets = _.map(
          grouped_categories,
          (categories, top_category) => ({
            label: top_category,
            data: categories.map(category => ({
              x: category.vec[0],
              y: category.vec[1],
              r: 3,
              category: category.category
            }))
          })
        );

        categories_datasets.forEach((ds, idx) => {
          ds.backgroundColor = this.palette[idx % this.palette.length];
          this.category_to_color[ds.label] = ds.backgroundColor.replace(
            "#",
            ""
          );
        });

        this.datacollection.datasets.push(...categories_datasets);

        this.datacollection = {
          ...this.datacollection
        };

        this.graphLoaded = true;
      } catch (e) {
        console.error(e);
      }
    },

    highlightCategory(top_category, category) {

      const highlightCategory = _.find(
        this.graph,
        (record) =>
          record.top_category === top_category && record.category === category
      );
      if (highlightCategory) {
        this.datacollection.datasets[1].data.push({
          x: highlightCategory.vec[0],
          y: highlightCategory.vec[1],
          r: 10,
          category: "Close result"
        });
        this.datacollection = { ...this.datacollection };
      }
    },
    addPoint(x, y, label) {
      this.datacollection.datasets[0].data[0] = {
        x: x,
        y: y,
        r: 15,
        category: label
      };
      this.datacollection = { ...this.datacollection };
    },
    async categorize() {
      this.datacollection.datasets[1].data = [];

      if (this.query === "") {
        return;
      }
      try {
        this.loadingState = true;
        const embedding_resp = axios.get("/api/embed", {
          params: { q: this.query }
        });
        const categories_resp = axios.get("/api/categorize", {
          params: { q: this.query }
        });

        const vec = (await embedding_resp).data.result.embedding;
        this.addPoint(vec[0], vec[1], this.query);

        this.results = (await categories_resp).data.result.categories;

        this.results.forEach(category => this.highlightCategory(category.top_category, category.category))

        this.loadingState = false;
      } catch (err) {
        console.error(err);
        this.loadingState = false;
      }
    },
    async useSample(example_query) {
      this.query = example_query;
      this.categorize();
    }
  }
};
</script>

<style scoped>
.bg-db5f57 {
  background: #db5f57;
}
.bg-db9057 {
  background: #db9057;
}
.bg-dbc257 {
  background: #dbc257;
}
.bg-c3db57 {
  background: #c3db57;
}
.bg-91db57 {
  background: #91db57;
}
.bg-5fdb57 {
  background: #5fdb57;
}
.bg-57db80 {
  background: #57db80;
}
.bg-57dbb2 {
  background: #57dbb2;
}
.bg-57d3db {
  background: #57d3db;
}
.bg-57a2db {
  background: #57a2db;
}
.bg-5770db {
  background: #5770db;
}
.bg-6f57db {
  background: #6f57db;
}
.bg-a157db {
  background: #a157db;
}
.bg-d357db {
  background: #d357db;
}
.bg-db57b2 {
  background: #db57b2;
}
.bg-db5780 {
  background: #db5780;
}

.text-grey a:link {
  color: #182b3a;
  text-decoration: none;
}

.text-grey a:visited {
  color: black;
  text-decoration: none;
}

.text-grey a:hover {
  text-decoration: underline;
}

.text-grey a:active {
  text-decoration: underline;
}
</style>

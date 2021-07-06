import { Bubble, mixins } from "vue-chartjs";
import Chart from "chart.js";

console.log("Chart.defaults.global", Chart.defaults.global);

export default {
  extends: Bubble,
  mixins: [mixins.reactiveProp],
  data: () => ({
    options: {
      responsive: false,
      maintainAspectRatio: false,
      title: {
        display: false,
        text: "I hate you"
      },
      legend: {
        display: false
      },
      scales: {
        yAxes: [
          {
            ticks: {
              display: false
            },
            gridLines: {
              display: false
            },
            scaleLabel: {
              display: false,
            }
          }
        ],
        xAxes: [
          {
            ticks: {
              display: false
            },
            gridLines: {
              display: false
            }
          }
        ]
      }
      // plugins: {
      //   legend: {
      //     position: "top"
      //   },
      //   title: {
      //     display: true,
      //     text: "Chart.js Bubble Chart"
      //   }
      // }
    }
  }),

  mounted() {
    // this.chartData is created in the mixin.
    // If you want to pass options please create a local options object
    console.log("options", this.options);

    this.renderChart(this.chartData, this.options);

    console.log("Chart", this.$data._chart);
  }
};

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
        text: ""
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
              display: false
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
      },
      elements: {
        point: {
          borderWidth: 0
        }
      },
      tooltips: {
        callbacks: {
          label: function(tooltipItem, data) {
            const dataset = data.datasets[tooltipItem.datasetIndex];
            const label = dataset.data[tooltipItem.index].category || "";
            return label;
          }
        }
      }
    }
  }),

  mounted() {
    // this.chartData is created in the mixin.
    // If you want to pass options please create a local options object
    this.renderChart(this.chartData, this.options);
  }
};

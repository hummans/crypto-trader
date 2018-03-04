import * as Chart from 'chart.js';
import * as moment from 'moment';
import { ChartDatum } from './interfaces';

export function showChart(chartData: ChartDatum[]): void {

    const ctx = (document.getElementById('canvas') as HTMLCanvasElement).getContext('2d');
    const orange = 'rgb(255, 159, 64)';
    const blue = 'rgb(54, 162, 235)';
    const green = 'rgb(75, 192, 192)';
    const red = 'rgb(255, 99, 132)';

    // noinspection ObjectAllocationIgnored
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: chartData.map(datum => moment.unix(datum.timestamp).format('l')),
            // labels: chartData.map(datum => datum.timestamp.toString()),
            datasets: [{
                //     label: 'Price',
                //     data: chartData.map(datum => datum.close),
                //     borderColor: 'rgb(153, 102, 255)',
                //     backgroundColor: 'rgba(0, 0, 0, 0)',
                //     fill: false,
                //     pointRadius: 0,
                //     cubicInterpolationMode: 'monotone'
                // }, {
                //     label: 'Volume',
                //     data: chartData.map(datum => datum.volume),
                //     borderColor: '#ccc',
                //     backgroundColor: new Color('#ccc').alpha(.2).rgbString(),
                //     fill: true,
                //     pointRadius: 0,
                //     cubicInterpolationMode: 'monotone'
                // }, {
                label: 'EMA-SHORT',
                data: chartData.map(datum => datum.movingAverageShort),
                borderColor: orange,
                backgroundColor: 'rgba(0, 0, 0, 0)',
                fill: false,
                pointRadius: 0,
                lineTension: 0
            }, {
                label: 'EMA-LONG',
                data: chartData.map(datum => datum.movingAverageLong),
                borderColor: blue,
                backgroundColor: 'rgba(0, 0, 0, 0)',
                fill: false,
                pointRadius: 0,
                lineTension: 0
            }, {
                label: 'Own',
                data: chartData.map(datum => datum.own ? datum.close : NaN),
                borderColor: green,
                backgroundColor: new Color(green).alpha(.5).rgbString(),
                fill: 'start',
                pointRadius: 0,
                lineTension: 0
            }, {
                label: 'Wait',
                data: chartData.map(datum => datum.own ? NaN : datum.close),
                borderColor: red,
                backgroundColor: new Color(red).alpha(.5).rgbString(),
                fill: 'start',
                pointRadius: 0,
                lineTension: 0
            }, {
                label: 'Profit',
                data: chartData.map(datum => datum.profit),
                borderColor: '#000',
                backgroundColor: new Color('#000').alpha(.8).rgbString(),
                fill: 'start',
                pointRadius: 0,
                lineTension: 0
            }]
        },
        options: {
            responsive: true,
            tooltips: {
                mode: 'index',
                intersect: false
            },
            scales: {
                xAxes: [{
                    display: true,
                    scaleLabel: {
                        display: true
                    }
                }],
                yAxes: [{
                    display: true,
                    scaleLabel: {
                        display: true,
                        labelString: 'Value'
                    }
                }]
            }
        }
    });
}

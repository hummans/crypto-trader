import * as fs from 'fs';
import fetch from 'node-fetch';
import { addSeconds, isBefore, subDays } from 'date-fns';

type Candle = [
    /** Time */
    number,
    /** Low */
    number,
    /** High */
    number,
    /** Open */
    number,
    /** Close */
    number,
    /** Volume */
    number
    ];

type Granularity = 60 | 300 | 900 | 3600 | 21600 | 86400;

const maxRows = 350;
const granularity: Granularity = 60;
const daySpan = maxRows / ((24 * 60 * 60) / granularity);
const startDate = new Date(2018, 1, 24);

const limit = new Date(2018, 0, 1);
// const limit = new Date(2018, 1, 24);

fetchData(startDate);

function fetchData(start: Date): void {
    if (isBefore(start, limit)) {
        return;
    }

    const end = subDays(start, daySpan);

    const url = `https://api.gdax.com/products/BTC-USD/candles?granularity=${granularity}&end=${start.toISOString()}&start=${end.toISOString()}`;
    console.log(url);

    fetch(url)
        .then(response => response.json())
        .then(json => json
            .map((row: Candle) => [row[0], row[3], row[5]].join(','))
            .join('\n'))
        .then(rows => {
            fs.appendFileSync('btc-usd-data.csv', rows);
            // fs.writeFileSync('C:/Users/Sebastian/Documents/MATLAB/data.csv', rows);
        })
        .then(() => {
            setTimeout(() => {
                fetchData(addSeconds(end, 1));
            }, 1000)
        });
}

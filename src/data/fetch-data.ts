import * as fs from 'fs';
import fetch from 'node-fetch';
import { addSeconds, format, isBefore, subDays } from 'date-fns';

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
const startDate = new Date();

const limit = new Date(2017, 11, 18);

const cryptoCurrency = 'ETH';
const realCurrency = 'EUR';

const filename = `${__dirname}/../assets/${cryptoCurrency}-${realCurrency}-${granularity}-${format(limit, 'YYYY-MM-DD')}-${format(startDate, 'YYYY-MM-DD')}.csv`;

fetchData(startDate);

function fetchData(start: Date): void {
    if (isBefore(start, limit)) {
        return;
    }

    const end = subDays(start, daySpan);

    const url = `https://api.gdax.com/products/${cryptoCurrency}-${realCurrency}/candles?granularity=${granularity}&end=${start.toISOString()}&start=${end.toISOString()}`;
    console.log(url);

    fetch(url)
        .then(response => response.json())
        .then(json => json
            .map((row: Candle) => row.join(','))
            .join('\n'))
        .then(rows => {
            fs.appendFileSync(filename, rows);
        })
        .then(() => {
            setTimeout(() => {
                fetchData(addSeconds(end, 1));
            }, 1000)
        });
}

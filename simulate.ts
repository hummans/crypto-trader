import * as fs from 'fs';

type TicketValue = { time: number, price: number };



const data = 'eth-eur-data.csv';
// const data = 'btc-usd-data.csv';
const prices: TicketValue[] = fs.readFileSync(data)
    .toString('utf8')
    .split('\n')
    .reverse()
    .map(row => row.split(','))
    .map(row => ({ time: +row[0], price: +row[1] }));

// for (let i = 5; i < 60; i++) {
//     runWindowSizes(i);
// }

runWindowSizes(12);

function runWindowSizes(windowSize: number) {
    const averages: number[] = [];
    let currentAverage = 0;

    for (let i = 0; i < prices.length; i++) {
        const currentAverageValue = prices[i].price / windowSize;
        const dropOutAverageValue = i - windowSize < 0 ? 0 : prices[i - windowSize].price / windowSize;
        currentAverage = currentAverage + currentAverageValue - dropOutAverageValue;

        if (i >= windowSize) {
            averages.push(currentAverage);
        }
    }

    console.log();
    console.log(`Window size: ${windowSize}`);

    // for (let lookback = 5; lookback <= 15; lookback += 1) {
    //     run(averages, lookback, .002)
    // }
    run(averages, 6, .002)
}

function run(averages: number[], lookback: number, threshold: number) {
    let euros = 100;
    let eth = 0;
    let mode = Mode.NotInPossession;

    for (let i = 0; i < averages.length; i += lookback) {

        const window = averages.slice(i + 1, i + lookback);

        if (window.length <= 0) {
            continue;
        }

        const delta = window[window.length - 1] - window[0];
        const normalizedDelta = delta / window[window.length - 1];

        if (mode === Mode.NotInPossession && normalizedDelta > threshold) {
            // buy
            const buyPrice = window[window.length - 1] * (1 / .98);
            eth = euros / buyPrice;
            // console.log(`         buying  ${eth.toFixed(5)} ETH for ${prices[i + lookback].price}`);
            // console.log(`${i}\t${buyPrice}`);
            euros = 0;
            mode = Mode.InPossession;
        } else if (mode === Mode.InPossession && normalizedDelta < -threshold) {
            // sell
            const sellPrice = window[window.length - 1] * 1.02;
            euros = eth * sellPrice;
            // console.log(`€${euros.toFixed(2)}, selling ${eth.toFixed(5)} ETH for ${prices[i + lookback].price}`);
            // console.log(`${euros.toFixed(2)}\t${sellPrice}`);
            eth = 0;
            mode = Mode.NotInPossession;
        }
    }

    const profit = euros > 0 ? euros : eth * prices[prices.length - 1].price;
    // console.log(`Lookback: ${lookback}, Buy Threshold: ${buyThreshold}, Sell Threshold: ${sellThreshold}`);
    console.log(`${lookback}\t${profit.toFixed(2)}`);
    // console.log(`Euros: ${profit.toFixed(2)}`);
}

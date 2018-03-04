import * as GTT from 'gdax-trading-toolkit';
import { GDAXFeed } from "gdax-trading-toolkit/build/src/exchanges";
import { LiveBookConfig, LiveOrderbook, SkippedMessageEvent, TradeMessage } from "gdax-trading-toolkit/build/src/core";
import { Ticker } from "gdax-trading-toolkit/build/src/exchanges/PublicExchangeAPI";
import fetch from 'node-fetch';

enum Mode {
    InPossession,
    NotInPossession
}

const cryptoCurrency = 'BTC';
const quoteCurrency = 'USD';
const product = `${cryptoCurrency}-${quoteCurrency}`;
const logger = GTT.utils.ConsoleLoggerFactory({ level: 'debug' });

/**
 * Size of values in a window used to determine the moving average.
 * @type {number}
 */
const windowSize = 30;
const granularity = 60;

/**
 * Number of averages used to determine if the slope steepness exceeds a threshold.
 * @type {number}
 */
const lookback = 4;

/**
 * A relative (percent) threshold regarding the total market price that has to be exceed to either trigger a BUY or
 * SELL order.
 * @type {number}
 */
const threshold = .002;

let euros = 100;
let eth = 0;
let mode = Mode.NotInPossession;

const url = `https://api.gdax.com/products/${product}/candles?granularity=${granularity}`;
logger.log('info', `Requesting ${url}`);

fetch(url)
    .then(response => response.json())
    .then(json => json.map((row: number[]) => row[3]))
    .then(data => data.slice(0, windowSize * 2))
    .then(data => data.reverse())
    .then(data => {
        const averages: number[] = [];
        let currentAverage = 0;

        for (let i = 0; i < data.length; i++) {
            const currentAverageValue = data[i] / windowSize;
            const dropOutAverageValue = i - windowSize < 0 ? 0 : data[i - windowSize] / windowSize;
            currentAverage = currentAverage + currentAverageValue - dropOutAverageValue;

            if (i >= windowSize) {
                averages.push(currentAverage);
            }
        }

        connect(data, averages);
    });

function connect(data: number[], averages: number[]) {

    GTT.Factories.GDAX.FeedFactory(logger, [product]).then((feed: GDAXFeed) => {
        // Configure the live book object
        const config: LiveBookConfig = {
            product: product,
            logger: logger
        };
        const book = new LiveOrderbook(config);
        book.on('LiveOrderbook.snapshot', () => {
            logger.log('info', 'Snapshot received by LiveOrderbook Demo');
            setInterval(() => {

                const price = book.ticker.price.toNumber();
                const currentAverageValue = price / windowSize;
                const dropOutAverageValue = data[0] / windowSize;
                data.shift();
                data.push(price);

                averages.shift();
                averages.push(averages[averages.length - 1] + currentAverageValue - dropOutAverageValue);

                if (determineAction(averages, lookback, threshold, book.ticker.price.toNumber())) {
                    printProfit(book.ticker.price.toNumber());
                }
            }, granularity * 1000);
        });
        book.on('LiveOrderbook.ticker', (ticker: Ticker) => {
            // console.log(printTicker(ticker));
        });
        book.on('LiveOrderbook.trade', (trade: TradeMessage) => {
            // tradeVolume += +(trade.size);
        });
        book.on('LiveOrderbook.skippedMessage', (details: SkippedMessageEvent) => {
            // On GDAX, this event should never be emitted, but we put it here for completeness
            console.log('SKIPPED MESSAGE', details);
            console.log('Reconnecting to feed');
            feed.reconnect(0);
        });
        book.on('end', () => {
            console.log('Orderbook closed');
        });
        book.on('error', (err) => {
            console.log('Livebook errored: ', err);
            feed.pipe(book);
        });
        feed.pipe(book);
    });
}

function determineAction(averages: number[], lookback: number, threshold: number, price: number): boolean {
    const window = averages.slice(averages.length - lookback - 1, averages.length);

    if (window.length <= 0) {
        return false;
    }

    const closingPrice = window[window.length - 1];
    const delta = closingPrice - window[0];
    const normalizedDelta = delta / closingPrice;
    logger.log('info', `Delta: ${normalizedDelta.toFixed(5)}, Actual Price: ${price}, Opening SMA price: ${window[0].toFixed(3)}, Closing SMA price: ${closingPrice.toFixed(3)}`);

    if (mode === Mode.NotInPossession && normalizedDelta > threshold) {
        // buy
        const buyPrice = price * 1.02;
        eth = euros / buyPrice;
        logger.log('info', `buying  ${eth.toFixed(5)} ${cryptoCurrency} for ${buyPrice}`);
        euros = 0;
        mode = Mode.InPossession;

        return true;
    } else if (mode === Mode.InPossession && normalizedDelta < -threshold) {
        // sell
        const sellPrice = price * 0.98;
        euros = eth * sellPrice;
        logger.log('info', `${quoteCurrency} ${euros.toFixed(2)}, selling ${eth.toFixed(5)} ${cryptoCurrency} for ${sellPrice}`);
        eth = 0;
        mode = Mode.NotInPossession;

        return true;
    }

    return false;
}

function printProfit(price: number) {
    const profit = euros > 0 ? euros : eth * price;
    logger.log('info', `${quoteCurrency}: ${profit.toFixed(2)}`);
}

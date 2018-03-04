import { computeDatums } from './app/processing/ema';
import { computeOrders } from './app/processing/decide';
import { computeProfits } from './app/processing/profit';
import { showChart } from './app/chart';
import { ChartDatum, PriceDatum, RunOptions } from './app/interfaces';

// compareConfigurations(createConfigurations());
runSingle();

function runSingle() {
    compareConfigurations([{
        skip: 1,
        showChart: true,
        ema: {
            short: 4,
            long: 42
        },
        decide: {
            movingAverage: true,
            grade: false,
            adx: false,
            williams: false,
            rsi: false,

            buyLookback: 5,
            buyThreshold: 10,
            sellLookback: 25,
            sellThreshold: -12,
            buySlopeMapper: mapToMovingAverageLong,
            sellSlopeMapper: mapToPrice,
        }
    }]);
}

function mapToPrice(datum: ChartDatum) {
    return datum.close;
}

function mapToMovingAverageLong(datum: ChartDatum) {
    return datum.movingAverageLong;
}

function mapToMovingAverageShort(datum: ChartDatum) {
    return datum.movingAverageShort;
}

function compareConfigurations(options: RunOptions[]): void {

    console.clear();
    console.log(`Running ${options.length} configurations`);

    getData().then(data => {

        const profits = options.map((option, index) => {
            const progress = Math.round((index / options.length) * 100);
            if (progress % 10 === 0) {
                console.log(`Progress: ${progress}%`);
            }

            return ({
                options: option,
                profit: runConfiguration(option, data)
            });
        });

        console.clear();
        const marketGain = (data[data.length - 1].close / data[0].close) * 100;
        const gainString = (data[data.length - 1].close > data[0].close ? marketGain : -marketGain).toFixed(2);
        console.log(`Market Gain: ${gainString}%`);

        profits
            .sort((a, b) => b.profit - a.profit)
            .slice(0, 20)
            .forEach(run => console.log(
                `${run.profit.toFixed(2)}%`,
                JSON.stringify(run.options),
                run.options
            ));
    });
}

function createConfigurations(): RunOptions[] {
    const skips = [1];
    const emaShorts = [4, 8, 12, 16, 20, 24, 28, 32, 36];
    const emaLongs = [20, 24, 28, 32, 36, 40, 44, 48, 52, 56, 60, 64, 68, 72, 76, 80];
    // const buyLookbacks = [1, 5, 8, 10, 15, 20, 25, 30];
    // const buyThresholds = [5, 10, 15, 20, 30, 40];
    // const sellLookbacks = [25, 50, 60];
    // const sellThresholds = [-5, -12, -15, -20, -30, -50];
    const buyLookbacks = [0];
    const buyThresholds = [0];
    const sellLookbacks = [0];
    const sellThresholds = [0];
    const mappers = [
        mapToMovingAverageShort,
        mapToMovingAverageLong,
        mapToPrice,
    ];

    return skips.flatMap(skip => emaShorts
        .flatMap(emaShort => emaLongs
            .flatMap(emaLong => buyLookbacks
                .flatMap(buyLookback => buyThresholds
                    .flatMap(buyThreshold => sellLookbacks
                        .flatMap(sellLookback => sellThresholds
                            .flatMap(sellThrehold => mappers
                                .flatMap(buyMapper => mappers
                                    .flatMap(sellMapper => ({
                                        skip: skip,
                                        showChart: false,
                                        ema: {
                                            short: emaShort,
                                            long: emaLong
                                        },
                                        decide: {
                                            movingAverage: true,
                                            grade: false,
                                            adx: false,
                                            williams: false,
                                            rsi: false,

                                            buyLookback: buyLookback,
                                            buyThreshold: buyThreshold,
                                            buySlopeMapper: buyMapper,

                                            sellLookback: sellLookback,
                                            sellThreshold: sellThrehold,
                                            sellSlopeMapper: sellMapper,
                                        }
                                    }))))))))));
}

function runConfiguration(options: RunOptions, data: PriceDatum[]): number {
    const priceData = data.reduce((arr, current, index) => {
        if (index % options.skip === 0) {
            arr.push(current);
        } else {
            arr[arr.length - 1].volume += current.volume;
        }

        return arr;
    }, []);

    const profit = compute(priceData, options);

    return profit;
}

async function getData(): Promise<PriceDatum[]> {
    const response = await fetch('/assets/ETH-USD-60-2017-12-18-2018-03-04.csv');
    const text = await response.text();

    return text.split('\n')
        .reverse()
        .map((row: string) => row.split(','))
        .slice(1500, 2800)
        .map((cells: string[]): PriceDatum => ({
            timestamp: parseInt(cells[0], 10),
            low: parseInt(cells[1], 10),
            high: parseInt(cells[2], 10),
            open: parseInt(cells[3], 10),
            close: parseInt(cells[4], 10),
            volume: parseInt(cells[5], 10)
        }));
}

function compute(priceData: PriceDatum[], options: RunOptions): number {
    const chartData = computeDatums(priceData, options.ema);

    computeOrders(chartData, options.decide);
    const profit = computeProfits(chartData);

    if (options.showChart) {
        showChart(chartData);
    }

    return profit;
}


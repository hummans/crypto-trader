import { ChartDatum, EmaOptions, PriceDatum } from '../interfaces';

const emaValues = 50;

export function computeDatums(values: PriceDatum[], options: EmaOptions): ChartDatum[] {
    const datums: ChartDatum[] = [];

    for (let i = 0; i < values.length - 1; i++) {
        // const progress = Math.round((i / values.length) * 100);
        // if (progress % 10 === 0) {
        //     console.log(`${progress}%`);
        // }

        const prices = values.slice(Math.max(i - emaValues, 0), i + 1).map(v => v.close);

        datums.push({
            timestamp: values[i].timestamp,
            close: values[i].close,
            volume: values[i].volume,
            movingAverageShort: getMovingAverages(prices, options.short),
            movingAverageLong: getMovingAverages(prices, options.long),
            own: false,
            profit: NaN
        })
    }

    return datums.slice(emaValues + 1, datums.length);
}

function getMovingAverages(prices: number[], lookback: number): number {
    return ema(prices, 2 / (lookback + 1));
}

function ema(values: number[], multiplier: number): number {
    if (values.length === 0) {
        return null;
    }

    const valuesPreviousDay = values.slice(0, values.length - 2);
    const emaPreviousDay = valuesPreviousDay.length <= 1 ? values[0] : ema(valuesPreviousDay, multiplier);

    return (values[values.length - 1] - emaPreviousDay) * multiplier + emaPreviousDay;
}

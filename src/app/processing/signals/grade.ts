import { ChartDatum, DecideOptions, Signal } from '../../interfaces';

export function gradeSignal(values: ChartDatum[], options: DecideOptions): Signal {

    if (values.length < Math.max(options.sellLookback, options.buyLookback)) {
        return Signal.WAIT;
    }

    const index = values.length - 1;

    const buyData: number[] = values
        .slice(index - options.buyLookback, index)
        .map(options.buySlopeMapper);

    const buyGrade = calculateGrade(buyData, options.buyLookback);

    if (buyGrade > options.buyThreshold) {
        return Signal.BUY;
    }

    const sellData: number[] = values
        .slice(index - options.sellLookback, index)
        .map(options.sellSlopeMapper);

    const sellGrade = calculateGrade(sellData, options.sellLookback);

    if (sellGrade > options.sellThreshold) {
        return Signal.SELL
    }

    return Signal.WAIT;
}

function calculateGrade(lookbackPrices: number[], lookback: number): number {
    const indexSum = lookbackPrices
        .map((_, index) => index)
        .reduce((a, b) => a + (b + 1), 0);
    const priceSum = lookbackPrices
        .reduce((a, b) => a + b, 0);
    const xySum = lookbackPrices
        .reduce((a, b, i) => a + (b * (i + 1)), 0);
    const indexSquaredSum = lookbackPrices
        .map((_, index) => index)
        .reduce((a, b) => a + Math.pow(b + 1, 2), 0);

    const slope = ((lookbackPrices.length * xySum) - (indexSum * priceSum)) /
        ((lookbackPrices.length * indexSquaredSum) - Math.pow(indexSum, 2));

    const grade = ((slope / lookback) * 100);

    return grade;
}

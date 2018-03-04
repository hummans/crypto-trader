import { ChartDatum } from '../interfaces';

const takerFee = .003;
const badTradePercentage = .005;

export function computeProfits(chartData: ChartDatum[]): number {
    if (chartData.length === 0) {
        return 0;
    }

    const startingCapital = chartData[0].close;

    let owning = false;
    let money = startingCapital;
    let coins = 0;

    chartData.forEach(datum => {
        if (datum.own !== owning) {
            const fee = datum.close * takerFee;
            if (datum.own) {
                coins = money / ((datum.close + fee) * (1 + badTradePercentage));
                money = 0;
            } else {
                money = ((datum.close * (1 - badTradePercentage)) * coins) - fee;
                coins = 0;
            }

            owning = datum.own;
        }

        datum.profit = datum.own ? coins * datum.close : money;
        datum.profit = Math.max(0, datum.profit);
    });

    if (chartData[chartData.length - 1].profit <= 0) {
        return 0;
    }

    const profit = 100 - (100 * (chartData[chartData.length - 1].profit / startingCapital));

    return chartData[chartData.length - 1].profit < startingCapital ? -profit : profit;
}

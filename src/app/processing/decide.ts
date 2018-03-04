import { adxSignal } from './signals/adx';
import { movingAverageSignal } from './signals/moving-average';
import { rsiSignal } from './signals/rsi';
import { williamsSignal } from './signals/williams';
import { gradeSignal } from './signals/grade';
import { ChartDatum, DecideOptions, Signal } from '../interfaces';

export function computeOrders(chartData: ChartDatum[], options: DecideOptions) {

    chartData.forEach((datum, index) => {
        datum.own = datum.movingAverageShort > datum.movingAverageLong;

        const values = chartData.slice(0, index + 1);
        const signals: Signal[] = [];

        if (options.adx) {
            signals.push(adxSignal(values));
        }
        if (options.movingAverage) {
            signals.push(movingAverageSignal(values));
        }
        if (options.rsi) {
            signals.push(rsiSignal(values));
        }
        if (options.williams) {
            signals.push(williamsSignal(values));
        }
        if (options.grade) {
            signals.push(gradeSignal(values, options));
        }

        if (signals.every(s => s === Signal.BUY)) {
            datum.own = true;
            return;
        }

        if (signals.every(s => s === Signal.SELL)) {
            datum.own = false;
            return;
        }

        datum.own = index > 0 ? chartData[index - 1].own : false;
    });
}


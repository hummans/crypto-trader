import { ChartDatum, Signal } from '../../interfaces';

export function movingAverageSignal(values: ChartDatum[]): Signal {
    const datum = values[values.length - 1];

    return datum.movingAverageShort > datum.movingAverageLong ? Signal.BUY : Signal.SELL;
}

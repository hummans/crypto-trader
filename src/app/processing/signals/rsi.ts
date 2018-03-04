import { ChartDatum, Signal } from '../../interfaces';

export function rsiSignal(values: ChartDatum[]): Signal {
    return Signal.WAIT;
}

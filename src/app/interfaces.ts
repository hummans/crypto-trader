export interface PriceDatum {
    timestamp: number;
    low: number;
    high: number;
    open: number;
    close: number;
    volume: number;
}

export interface ChartDatum {
    timestamp: number;
    close: number;
    volume: number;
    movingAverageShort: number;
    movingAverageLong: number;
    own: boolean;
    profit: number;
}

export interface RunOptions {
    skip: number;
    ema: EmaOptions;
    decide: DecideOptions;
    showChart: boolean;
}

export interface EmaOptions {
    short: number;
    long: number;
}

export interface DecideOptions {
    movingAverage: boolean;
    rsi: boolean;
    williams: boolean;
    adx: boolean;
    grade: boolean;

    buyLookback: number;
    buyThreshold: number;
    buySlopeMapper: ((datum: ChartDatum) => number);

    sellLookback: number;
    sellThreshold: number;
    sellSlopeMapper: ((datum: ChartDatum) => number);
}

export enum Signal {
    BUY,
    SELL,
    WAIT
}

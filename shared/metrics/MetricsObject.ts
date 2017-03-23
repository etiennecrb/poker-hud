interface MetricsObject {
    count: number,
    vpip: number,
    pfr: number,
    af: number,
    cbet: number,
    cbet_opp: number,
    cbet_fold: number,
    cbet_fold_opp: number,
    flop: {
        opp: number,
        raise: number,
        call: number,
        check: number,
        fold: number
    },
    turn: {
        opp: number,
        raise: number,
        call: number,
        check: number,
        fold: number
    },
    river: {
        opp: number,
        raise: number,
        call: number,
        check: number,
        fold: number
    }
}
export default MetricsObject;

export const roundTo = (num, digitsConv) => {
    let negative = false;
    let n = num;
    let digits = digitsConv;
    if (digits === undefined) {
        digits = 0;
    }
    if (n < 0) {
        negative = true;
        n *= -1;
    }
    const multiplicator = Math.pow(10, digits);

    n = parseFloat((n * multiplicator).toFixed(11));
    n = (Math.round(n) / multiplicator).toFixed(2);
    
    if (negative) {    
        n = +(n * -1).toFixed(2);
    } else {
        n = +n;
    }

    return n;
};


class IntegerPolynomial extends Int32Array {
    constructor(...coefficients) {
        super(coefficients);
    }

    getDegree() {
        return this.length - 1;
    }

    equals(p) {
        return this.every((e, i) => e === p[i]);
    }

    evaluate(x) {
        return Array.from(this)
            .map((e, i) => e * (x ** (this.getDegree() - i)))
            .reduce((a, b) => a + b);
    }

    isCoefficientReducible() {
        function _gcd(a, b) {
            if (b === 0)
                return a;
            return _gcd(b, a % b);
        }

        // Due to specific behaviour of TypedArray.prototype.map
        return Array.from(this).map(Math.abs).reduce((a, b) => _gcd(a, b)) > 1;
    }

    hasLinearRationalFactor() {
        if (this.getDegree() === 2)
            return Number.isInteger(Math.sqrt(this[1] ** 2 - 4 * this[0] * this[2]));
        if (this.getDegree() === 1)
            return true;
        /* naive */ function getDivisors(n) {
            let tmp = Array.from(Array(n + 1).keys())
                .slice(1)
                .filter(e => n % e === 0);
            return tmp.concat(tmp.map(e => -e))
        }

        if (this[this.length - 1] === 0)
            return true;

        for (let i of getDivisors(Math.abs(this[0])))
            for (let j of getDivisors(Math.abs(this[this.length - 1])))
                if (new IntegerPolynomial(...Array.from(this).map((e, ii) => e * (i ** ii))).evaluate(j) === 0)
                    return true;
        return false;
    }

    toIdentifiableString() {
        return this.join('|');
    }

    toLaTeXString() {
        const DEGREE = this.getDegree();
        return Array.from(this).map((e, i) => '' + e + "x^" + (DEGREE - i))
            .filter(e => e[0] !== '0')
            .join(" + ")
            .slice(0, -3)
            .replace(/\+ -/g, "- ")
            .replace(/\b1x/g, "x")
            .replace(/\^1\b/, '');
    }

    static multiply(...polynomials) {
        if (polynomials.some(e => !(e instanceof IntegerPolynomial)))
            throw new TypeError("Can only multiply polynomials!");
        return polynomials.reduce((p, q) => {
            let result = new IntegerPolynomial(...Array(p.getDegree() + q.getDegree() + 1).fill(0));

            for (let i = 0; i < p.length; i++)
                for (let j = 0; j < q.length; j++)
                    result[i + j] += p[i] * q[j];

            return result;
        });
    }
}

module.exports = IntegerPolynomial;
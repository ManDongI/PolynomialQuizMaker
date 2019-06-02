const IntegerPolynomial = require("./IntegerPolynomial.js");
const fs = require("fs");
const latex = require("node-latex");

let leadingCoefficientGenerator = (function* () {
    while(true)
        yield Math.floor(Math.random() * 5) + 1;
})();

let coefficientGenerator = (function* () {
    while(true)
        yield Math.floor(Math.random() * 11) - 5;
})();

function* irreducibleMonicPolynomialGenerator(degree) {
    const FIXED = Array.from(Array(degree));

    while(true) {
        let current = new IntegerPolynomial(1, ...FIXED
            .map(() => coefficientGenerator.next().value));
        if (current.hasLinearRationalFactor() || current.isCoefficientReducible())
            continue;
        yield current;
    }
}

function* irreduciblePolynomialGenerator(degree) {
    const FIXED = Array.from(Array(degree));

    while(true) {
        let current = new IntegerPolynomial(leadingCoefficientGenerator.next().value, ...FIXED
            .map(() => coefficientGenerator.next().value));
        if (current.hasLinearRationalFactor() || current.isCoefficientReducible())
            continue;
        yield current;
    }
}

let irreducibleMonicQuadraticGenerator = irreducibleMonicPolynomialGenerator(2);
let irreducibleQuadraticGenerator = irreduciblePolynomialGenerator(2);
let irreducibleMonicCubicGenerator = irreducibleMonicPolynomialGenerator(3);
let irreducibleCubicGenerator = irreduciblePolynomialGenerator(3);

let monicHardQuarticGenerator = (function* () {
    let buffer = [];

    while(true) {
        let factor1 = irreducibleMonicQuadraticGenerator.next().value,
            factor2 = irreducibleMonicQuadraticGenerator.next().value;
        let current = IntegerPolynomial.multiply(factor1, factor2);
        if (buffer.includes(current.toIdentifiableString()))
            continue;
        buffer.push(current.toIdentifiableString());
        yield { result: current, factor: [factor1, factor2] };;
    }
})();

let generalHardQuarticGenerator = (function* () {
    let buffer = [];

    while(true) {
        let factor1 = irreducibleQuadraticGenerator.next().value,
            factor2 = irreducibleQuadraticGenerator.next().value;
        let current = IntegerPolynomial.multiply(factor1, factor2);
        if (current[0] === 1 || buffer.includes(current.toIdentifiableString()))
            continue;
        buffer.push(current.toIdentifiableString());
        yield { result: current, factor: [factor1, factor2] };
    }
})();

let monicHardQuinticGenerator = (function* () {
    let buffer = [];

    while(true) {
        let factor1 = irreducibleMonicQuadraticGenerator.next().value,
            factor2 = irreducibleMonicCubicGenerator.next().value;
        let current = IntegerPolynomial.multiply(factor1, factor2);
        if (buffer.includes(current.toIdentifiableString()))
            continue;
        buffer.push(current.toIdentifiableString());
        yield { result: current, factor: [factor1, factor2] };
    }
})();

let generalHardQuinticGenerator = (function* () {
    let buffer = [];

    while(true) {
        let factor1 = irreducibleQuadraticGenerator.next().value,
            factor2 = irreducibleCubicGenerator.next().value;
        let current = IntegerPolynomial.multiply(factor1, factor2);
        if (current[0] === 1 || buffer.includes(current.toIdentifiableString()))
            continue;
        buffer.push(current.toIdentifiableString());
        yield { result: current, factor: [factor1, factor2] };
    }
})();

let out = fs.createWriteStream("./quiz" + Date.now().toLocaleString() + ".pdf");

function createQuizTex() {
    let monicQuarticLaTeXStrings = [], generalQuarticLaTeXStrings = [],
        monicQuinticLaTeXStrings = [], generalQuinticLaTeXStrings = [],
        monicQuarticSolLaTeXStrings = [], generalQuarticSolLaTeXStrings = [],
        monicQuinticSolLaTeXStrings = [], generalQuinticSolLaTeXStrings = [];

    for (let i = 0; i < 60; i++) {
        let monicQuartic = [ monicHardQuarticGenerator.next().value,
            monicHardQuarticGenerator.next().value,
            monicHardQuarticGenerator.next().value ];
        let generalQuartic = [ generalHardQuarticGenerator.next().value,
            generalHardQuarticGenerator.next().value,
            generalHardQuarticGenerator.next().value ];
        let monicQuintic = [ monicHardQuinticGenerator.next().value,
            monicHardQuinticGenerator.next().value,
            monicHardQuinticGenerator.next().value ];
        let generalQuintic = [ generalHardQuinticGenerator.next().value,
            generalHardQuinticGenerator.next().value,
            generalHardQuinticGenerator.next().value ];
        monicQuarticLaTeXStrings.push(monicQuartic.map(e => e.result.toLaTeXString()).join("&&"));
        generalQuarticLaTeXStrings.push(generalQuartic.map(e => e.result.toLaTeXString()).join("&&"));
        monicQuinticLaTeXStrings.push(monicQuintic.map(e => e.result.toLaTeXString()).join("&&"));
        generalQuinticLaTeXStrings.push(generalQuintic.map(e => e.result.toLaTeXString()).join("&&"));
        monicQuarticSolLaTeXStrings.push(monicQuartic.map(e => e.factor.map(f => '('
            + f.toLaTeXString()
            + ')').join('')).join("&&"));
        generalQuarticSolLaTeXStrings.push(generalQuartic.map(e => e.factor.map(f => '('
            + f.toLaTeXString()
            + ')').join('')).join("&&"));
        monicQuinticSolLaTeXStrings.push(monicQuintic.map(e => e.factor.map(f => '('
            + f.toLaTeXString()
            + ')').join('')).join("&&"));
        generalQuinticSolLaTeXStrings.push(generalQuintic.map(e => e.factor.map(f => '('
            + f.toLaTeXString()
            + ')').join('')).join("&&"));

    }

    let body = `\\documentclass{book}
\\usepackage[utf8]{inputenc}
\\usepackage[margin=0.25in]{geometry}
\\usepackage{kotex}
\\usepackage{amsfonts}
\\usepackage{amsmath}
\\usepackage{mathtools}
\\usepackage{amsthm}
\\usepackage{amssymb}
\\usepackage{bm}
\\usepackage{pgfplots}
\\usepackage{titlesec}
\\pgfplotsset{compat=1.15}

\\renewcommand{\\partname}{}
\\renewcommand{\\chaptername}{}
\\renewcommand{\\contentsname}{목차}
\\let\\cleardoublepage=\\clearpage
\\allowdisplaybreaks
\\titleformat{\\chapter}[display]
  {\\Huge\\bfseries}
  {}
  {0pt}
  {\\thechapter.\\ }
\\pagestyle{empty}

\\title{고난도 인수분해 720제}
\\author{}
\\date{}

\\begin{document}

\\maketitle

\\part{문제}

\\chapter{사차식의 인수분해}

\\section{일계수 사차식}
\\begin{flalign*}
${monicQuarticLaTeXStrings.join("\\\\\n")}
\\end{flalign*}
\\section{일계수가 아닌 사차식}
\\begin{flalign*}
${generalQuarticLaTeXStrings.join("\\\\\n")}
\\end{flalign*}
\\chapter{오차식의 인수분해}
\\section{일계수 오차식}
\\begin{flalign*}
${monicQuinticLaTeXStrings.join("\\\\\n")}
\\end{flalign*}
\\section{일계수가 아닌 오차식}
\\begin{flalign*}
${generalQuinticLaTeXStrings.join("\\\\\n")}
\\end{flalign*}

\\part{정답}

\\chapter{사차식의 인수분해}

\\section{일계수 사차식}
\\begin{flalign*}
${monicQuarticSolLaTeXStrings.join("\\\\\n")}
\\end{flalign*}
\\section{일계수가 아닌 사차식}
\\begin{flalign*}
${generalQuarticSolLaTeXStrings.join("\\\\\n")}
\\end{flalign*}
\\chapter{오차식의 인수분해}
\\section{일계수 오차식}
\\begin{flalign*}
${monicQuinticSolLaTeXStrings.join("\\\\\n")}
\\end{flalign*}
\\section{일계수가 아닌 오차식}
\\begin{flalign*}
${generalQuinticSolLaTeXStrings.join("\\\\\n")}
\\end{flalign*}
\\end{document}
`;
    let pdf = latex(body);
    pdf.pipe(out);
}

console.assert(new IntegerPolynomial(45,- 120,+ 57,- 152 , + 18 , - 48
).hasLinearRationalFactor());
createQuizTex();

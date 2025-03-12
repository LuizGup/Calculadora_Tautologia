// Função para inserir símbolos na expressão
function insertSymbol(symbol) {
    const expressionInput = document.getElementById('expression');
    expressionInput.value += symbol;
}

// Função para analisar a expressão
function analyzeExpression() {
    const expression = document.getElementById('expression').value;
    const lexResult = lexicalAnalysis(expression);
    const synResult = syntacticAnalysis(expression);

    if (!lexResult.valid) {
        document.getElementById('result').innerText = `Erro Léxico: ${lexResult.error}`;
    } else if (!synResult.valid) {
        document.getElementById('result').innerText = `Erro Sintático: ${synResult.error}`;
    } else {
        document.getElementById('result').innerText = 'Expressão válida!';
    }
}

// Função para calcular a expressão lógica usando o teorema de Tableaux
function proveTautology() {
    const expression = document.getElementById('expression').value;
    const result = checkTableaux(expression);
    document.getElementById('result').innerText = `Resultado: ${result ? 'Verdadeiro' : 'Falso'}`;
}

// Função para análise léxica
function lexicalAnalysis(expression) {
    const validSymbols = ['~', '^', 'v', '→', '↔', 'A', 'B', 'C', 'D', '(', ')'];
    for (let char of expression) {
        if (!validSymbols.includes(char)) {
            return { valid: false, error: `Símbolo inválido encontrado: ${char}` };
        }
    }
    return { valid: true };
}

// Função para análise sintática
function syntacticAnalysis(expression) {
    // Verificar parênteses balanceados
    let balance = 0;
    for (let char of expression) {
        if (char === '(') balance++;
        if (char === ')') balance--;
        if (balance < 0) return { valid: false, error: 'Parênteses desbalanceados' };
    }
    if (balance !== 0) return { valid: false, error: 'Parênteses desbalanceados' };

    // Verificar estrutura da expressão
    const regex = /^([~(]*[ABCD][)^]*([→↔^v][~(]*[ABCD][)^]*)*)$/;
    if (!regex.test(expression)) return { valid: false, error: 'Estrutura inválida' };

    return { valid: true };
}

// Função para aplicar as regras do teorema de Tableaux
function checkTableaux(expression) {
    // Regras do teorema de Tableaux
    const rules = {
        "~": (a) => !a,
        "^": (a, b) => a && b,
        "v": (a, b) => a || b,
        "→": (a, b) => !a || b,
        "↔": (a, b) => a === b
    };

    // Função recursiva para resolver a expressão
    function solve(exp) {
        if (typeof exp === 'boolean') return exp;
        if (exp.length === 1) return exp[0];

        for (const symbol in rules) {
            const index = exp.indexOf(symbol);
            if (index !== -1) {
                const a = solve(exp.slice(0, index));
                const b = solve(exp.slice(index + 1));
                return rules[symbol](a, b);
            }
        }
        return false;
    }

    const variables = { A: true, B: true, C: true, D: true }; // Valores arbitrários para teste
    const parsedExpression = expression.split('').map(char => variables.hasOwnProperty(char) ? variables[char] : char);
    return solve(parsedExpression);
}
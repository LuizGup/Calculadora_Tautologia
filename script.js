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
// Função para aplicar as regras do teorema de Tableaux
function checkTableaux(expression) {
    // Regras do teorema de Tableaux
    const rules = {
        "~": (a) => !a,         // Negação
        "^": (a, b) => a && b,  // Conjunção (AND)
        "v": (a, b) => a || b,  // Disjunção (OR)
        "→": (a, b) => !a || b, // Implicação (A → B)
        "↔": (a, b) => a === b // Bicondicional (A ↔ B)
    };

    // Função para verificar se uma expressão é atômica (uma variável)
    function isAtomic(exp) {
        return /^[A-Z]$/.test(exp);
    }

    // Função recursiva para resolver a expressão
    function solve(exp) {
        if (isAtomic(exp)) return exp; // Se for uma variável, retorna ela mesma

        // Verifica se a expressão é uma negação (~), como ~A
        if (exp[0] === "~") {
            return rules["~"](solve(exp.slice(1))); // Aplica a negação recursivamente
        }

        // Procura o operador binário na expressão (se houver)
        for (const symbol in rules) {
            const index = exp.indexOf(symbol);
            if (index !== -1) {
                const left = solve(exp.slice(0, index)); // Esquerda do operador
                const right = solve(exp.slice(index + 1)); // Direita do operador
                return rules[symbol](left, right); // Aplica o operador
            }
        }

        return false; // Se não encontrar uma forma válida de resolver
    }

    // Substitui as variáveis na expressão por valores arbitrários para testar
    const variables = { A: true, B: true, C: true, D: true }; // Valores arbitrários para teste
    const parsedExpression = expression.split('').map(char => variables.hasOwnProperty(char) ? variables[char] : char);

    return solve(parsedExpression);
}

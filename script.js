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
    showTruthTable(expression);
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

// Função para gerar a tabela verdade
function generateTruthTable(expression) {
    const variables = Array.from(new Set(expression.match(/[A-Z]/g))); // Extrai as variáveis únicas da expressão
    const table = []; // Tabela verdade

    // Gera todas as combinações de valores para as variáveis
    for (let i = 0; i < (1 << variables.length); i++) {
        const row = {}; // Linha da tabela
        variables.forEach((varName, idx) => {
            row[varName] = Boolean(i & (1 << idx)); // Atribui valores 0 ou 1 para cada variável
        });

        // Substitui as variáveis na expressão pelos seus valores booleanos
        let parsedExpression = expression;
        variables.forEach((varName) => {
            parsedExpression = parsedExpression.replace(new RegExp(varName, 'g'), row[varName] ? '1' : '0');
        });

        // Substitui os operadores lógicos por seus equivalentes em JavaScript
        parsedExpression = parsedExpression.replace(/~+/g, '!');
        parsedExpression = parsedExpression.replace(/\^/g, '&&');
        parsedExpression = parsedExpression.replace(/v/g, '||');
        parsedExpression = parsedExpression.replace(/→/g, '|| !');
        parsedExpression = parsedExpression.replace(/↔/g, '===');

        // Avalia a expressão
        try {
            const result = eval(parsedExpression);
            row.result = result ? 'V' : 'F'; // Adiciona o resultado da expressão (Verdadeiro ou Falso)
            table.push(row);
        } catch (e) {
            console.error("Erro ao avaliar a expressão:", e);
            row.result = 'Erro';
            table.push(row);
        }
    }

    return table;
}

// Função para mostrar a tabela verdade no HTML
function showTruthTable(expression) {
    const table = generateTruthTable(expression);
    const tableContainer = document.getElementById('truthTable');
    tableContainer.innerHTML = ''; // Limpa a tabela existente

    // Cria o cabeçalho da tabela
    const header = document.createElement('tr');
    const variables = Array.from(new Set(expression.match(/[A-Z]/g))); // Extrai as variáveis únicas
    variables.forEach((varName) => {
        const th = document.createElement('th');
        th.innerText = varName;
        header.appendChild(th);
    });
    const thResult = document.createElement('th');
    thResult.innerText = 'Resultado';
    header.appendChild(thResult);
    tableContainer.appendChild(header);

    // Cria as linhas da tabela
    table.forEach((row) => {
        const tr = document.createElement('tr');
        variables.forEach((varName) => {
            const td = document.createElement('td');
            td.innerText = row[varName] ? 'V' : 'F';
            tr.appendChild(td);
        });
        const tdResult = document.createElement('td');
        tdResult.innerText = row.result;
        tr.appendChild(tdResult);
        tableContainer.appendChild(tr);
    });
}

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
    console.log(`Analisando a expressão: ${expression}`);
    expression = expression.replace(/\s+/g, '');
    console.log(`Analisando a expressão modificada: ${expression}`);
    // Regras do teorema de Tableaux
    const rules = {
        "~": (a) => !a,         // Negação
        "^": (a, b) => a && b,  // Conjunção (AND)
        "v": (a, b) => a || b,  // Disjunção (OR)
        "→": (a, b) => !a || b, // Implicação (A → B)
        "↔": (a, b) => a === b  // Bicondicional (A ↔ B)
    };

    // Função para substituir variáveis na expressão
    function replaceVariables(expression, variables) {
        return expression.replace(/[A-Z]/g, (char) => variables[char] ? "true" : "false");
    }

    // Função para resolver a expressão lógica corretamente
    function solve(exp) {
        console.log(`Resolvendo: ${exp}`);

        // Resolver parênteses primeiro
        while (/\(([^()]+)\)/.test(exp)) {
            exp = exp.replace(/\(([^()]+)\)/g, (match, innerExp) => {
                console.log(`Resolvendo parênteses: (${innerExp})`);
                return solve(innerExp);
            });
        }

        // Resolver negações (~)
        while (/\~(true|false)/.test(exp)) {
            exp = exp.replace(/\~(true|false)/g, (match, val) => {
                let negated = val === "true" ? "false" : "true";
                console.log(`Negando ${val} -> ${negated}`);
                let updatedExp = exp.replace(match, negated);
                console.log(`Expressão após negação: ${updatedExp}`);
                return negated;
            });
        }

        // **Correção principal: Aplicar operadores corretamente**
        const operatorRegex = /(true|false)([v^→↔])(true|false)/;

        while (operatorRegex.test(exp)) {
            exp = exp.replace(operatorRegex, (match, left, op, right) => {
                let leftBool = left === "true";
                let rightBool = right === "true";
                let result = rules[op](leftBool, rightBool);
                console.log(`Aplicando ${op} entre ${leftBool} e ${rightBool} -> ${result}`);
                return result.toString();
            });
        }

        return exp === "true";
    }

    // Identifica todas as variáveis na expressão
    const variablesSet = new Set(expression.match(/[A-Z]/g));
    const variablesArray = Array.from(variablesSet);

    // Testa todas as combinações possíveis de valores (true/false) para as variáveis
    for (let i = 0; i < (1 << variablesArray.length); i++) {
        let variables = {};
        variablesArray.forEach((variable, idx) => {
            variables[variable] = Boolean(i & (1 << idx));
        });

        console.log(`Teste de combinação: ${JSON.stringify(variables)}`);

        // Substituir variáveis na expressão
        let parsedExpression = replaceVariables(expression, variables);
        console.log(`Expressão com valores substituídos: ${parsedExpression}`);

        // Resolver a expressão lógica
        const result = solve(parsedExpression);
        console.log(`Resultado da expressão para ${JSON.stringify(variables)}: ${result}`);

        // Se algum resultado for falso, a expressão não é uma tautologia
        if (!result) {
            console.log(`Resultado falso para ${JSON.stringify(variables)}, logo não é uma tautologia.`);
            return false;
        }
    }

    // Se a expressão for verdadeira para todas as combinações, é uma tautologia
    console.log('A expressão é uma tautologia (verdadeira para todas as combinações).');
    return true;
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

function deleteExpression() {
    document.getElementById('expression').value = '';
}

// Apaga apenas o último símbolo da expressão
function deleteSymbol() {
    const expressionInput = document.getElementById('expression');
    expressionInput.value = expressionInput.value.slice(0, -1);
}
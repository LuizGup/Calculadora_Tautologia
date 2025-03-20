// Função para analisar a expressão
function analizarExpressao() {
  const expression = document.getElementById("expression").value;
  const lexResult = analizeLexica(expression);
  const synResult = analizeSintatica(expression);

  if (!lexResult.valid) {
    document.getElementById("result").innerText = `Erro Léxico: ${lexResult.error}`;
  } else if (!synResult.valid) {
    document.getElementById("result").innerText = `Erro Sintático: ${synResult.error}`;
  } else {
    document.getElementById("result").innerText = "Expressão válida!";
  }
}

// Função para calcular a expressão lógica e gerar a tabela verdade
function provarTautologia() {
  const expression = document.getElementById("expression").value;
  const { tabela, ehTautologia } = checarTautologiaETabela(expression);
  mostrarTabelaVerdade(tabela, expression); // Passamos a expressão aqui!
  document.getElementById("result").innerText = `Resultado: ${ehTautologia ? "Verdadeiro" : "Falso"}`;
}

// Função para checar tautologia e gerar a tabela verdade
function checarTautologiaETabela(expression) {
  console.log(`Analisando a expressão: ${expression}`);
  expression = expression.replace(/\s+/g, ""); // Remover espaços

  // Regras de operadores lógicos
  const rules = {
    "~": (a) => !a,
    "^": (a, b) => a && b,
    "v": (a, b) => a || b,
    "→": (a, b) => !a || b,
    "↔": (a, b) => a === b,
  };

  function substituirVariaveis(expression, variables) {
    return expression.replace(/[A-Z]/g, (char) => variables[char] ? "true" : "false");
  }

  function resolver(exp) {
    while (/\(([^()]+)\)/.test(exp)) {
      exp = exp.replace(/\(([^()]+)\)/g, (match, innerExp) => resolver(innerExp));
    }

    while (/\~(true|false)/.test(exp)) {
      exp = exp.replace(/\~(true|false)/g, (match, val) => (val === "true" ? "false" : "true"));
    }

    const operatorRegex = /(true|false)([v^→↔])(true|false)/;
    while (operatorRegex.test(exp)) {
      exp = exp.replace(operatorRegex, (match, left, op, right) => {
        let leftBool = left === "true";
        let rightBool = right === "true";
        return rules[op](leftBool, rightBool).toString();
      });
    }

    return exp === "true";
  }

  const variablesSet = new Set(expression.match(/[A-Z]/g));
  const variablesArray = Array.from(variablesSet);
  const tabela = [];
  let ehTautologia = true;

  for (let i = 0; i < 1 << variablesArray.length; i++) {
    let variables = {};
    variablesArray.forEach((variable, idx) => {
      variables[variable] = Boolean(i & (1 << idx));
    });

    let parsedExpression = substituirVariaveis(expression, variables);
    const result = resolver(parsedExpression);
    tabela.push({ ...variables, resultado: result ? "V" : "F" });

    if (!result) ehTautologia = false;
  }

  return { tabela, ehTautologia };
}

// Função para exibir a tabela verdade no HTML
function mostrarTabelaVerdade(tabela, expressaoOriginal) {
  const tableContainer = document.getElementById("truthTable");
  tableContainer.innerHTML = "";

  if (tabela.length === 0) {
    tableContainer.innerHTML = "<p>Erro ao gerar a tabela verdade.</p>";
    return;
  }

  const header = document.createElement("tr");
  const variables = Object.keys(tabela[0]).filter((key) => key !== "resultado");

  variables.forEach((varName) => {
    const th = document.createElement("th");
    th.innerText = varName;
    header.appendChild(th);
  });

  const thResult = document.createElement("th");
  thResult.innerText = expressaoOriginal; // Agora exibe a expressão original como título da coluna!
  header.appendChild(thResult);
  tableContainer.appendChild(header);

  tabela.forEach((row) => {
    const tr = document.createElement("tr");
    variables.forEach((varName) => {
      const td = document.createElement("td");
      td.innerText = row[varName] ? "V" : "F";
      tr.appendChild(td);
    });
    const tdResult = document.createElement("td");
    tdResult.innerText = row.resultado;
    tr.appendChild(tdResult);
    tableContainer.appendChild(tr);
  });
}

// Função para análise léxica
function analizeLexica(expression) {
  const validSymbols = ["~", "^", "v", "→", "↔", "A", "B", "C", "D", "(", ")"];
  for (let char of expression) {
    if (!validSymbols.includes(char)) {
      return { valid: false, error: `Símbolo inválido encontrado: ${char}` };
    }
  }
  return { valid: true };
}

// Função para análise sintática
function analizeSintatica(expression) {
  let balance = 0;
  for (let char of expression) {
    if (char === "(") balance++;
    if (char === ")") balance--;
    if (balance < 0) return { valid: false, error: "Parênteses desbalanceados" };
  }
  if (balance !== 0) return { valid: false, error: "Parênteses desbalanceados" };

  const regex = /^([~(]*[ABCD][)^]*([→↔^v][~(]*[ABCD][)^]*)*)$/;
  if (!regex.test(expression)) return { valid: false, error: "Estrutura inválida" };

  return { valid: true };
}

// Função para deletar toda a expressão
function deletarExpressao() {
  document.getElementById("expression").value = "";
}

// Função para apagar apenas o último caractere
function deletarTexto() {
  const expressionInput = document.getElementById("expression");
  expressionInput.value = expressionInput.value.slice(0, -1);
}

// Função para inserir símbolos na expressão
function inserirTexto(symbol) {
  const expressionInput = document.getElementById("expression");
  expressionInput.value += symbol;
}

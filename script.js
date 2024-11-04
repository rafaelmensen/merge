// script.js

document.getElementById('process-button').addEventListener('click', processFile);

const baseDataCache = {};

// Carrega automaticamente as bases do servidor
function loadBaseData(baseName) {
  return fetch(`/api/base/${baseName}`)
    .then((response) => response.json())
    .then((data) => {
      baseDataCache[baseName] = data;
      return data;
    })
    .catch((error) => console.error(`Erro ao carregar base ${baseName}:`, error));
}

// Precarregar todas as bases ao abrir a página
['telefone', 'seguro', 'gerente'].forEach((base) => loadBaseData(base));

function processFile() {
  const selectedBase = document.getElementById('base-select').value;
  const fileInput = document.getElementById('file-upload');
  const status = document.getElementById('status');

  if (!fileInput.files.length) {
    status.textContent = "Por favor, selecione o arquivo principal Excel.";
    return;
  }

  const mainFile = fileInput.files[0];
  
  // Ler o arquivo principal e fazer o merge com a base selecionada
  readExcelFile(mainFile, (mainData) => {
    const baseData = baseDataCache[selectedBase];
    if (!baseData) {
      status.textContent = `Erro: a base ${selectedBase} não foi carregada.`;
      return;
    }
    const mergedData = mergeData(mainData, baseData, selectedBase);
    downloadExcel(mergedData, `Merged_${selectedBase}.xlsx`);
    status.textContent = "Arquivo processado com sucesso!";
  });
}

function readExcelFile(file, callback) {
  const reader = new FileReader();
  reader.onload = (e) => {
    const data = new Uint8Array(e.target.result);
    const workbook = XLSX.read(data, { type: "array" });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);
    callback(jsonData);
  };
  reader.readAsArrayBuffer(file);
}

function mergeData(mainData, baseData, baseType) {
  const baseField = baseType;

  return mainData.map((mainRow) => {
    const matchingRow = baseData.find((baseRow) => baseRow.cpf_cnpj === mainRow.cpf_cnpj);
    return matchingRow ? { ...mainRow, [baseField]: matchingRow[baseField] } : mainRow;
  });
}

function downloadExcel(data, fileName) {
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
  XLSX.writeFile(wb, fileName);
}

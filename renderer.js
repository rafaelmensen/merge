const { ipcRenderer } = require('electron');
const XLSX = require('xlsx');

document.getElementById('process-button').addEventListener('click', processFile);

async function loadBaseData(baseName) {
  return await ipcRenderer.invoke('load-base-data', baseName);
}

async function processFile() {
  const selectedBase = document.getElementById('base-select').value;
  const fileInput = document.getElementById('file-upload');
  const status = document.getElementById('status');

  if (!fileInput.files.length) {
    status.textContent = "Por favor, selecione o arquivo principal Excel.";
    return;
  }

  const mainFile = fileInput.files[0];
  const mainData = await readExcelFile(mainFile);
  const baseData = await loadBaseData(selectedBase);

  const mergedData = mergeData(mainData, baseData, selectedBase);
  downloadExcel(mergedData, `Merged_${selectedBase}.xlsx`);
  status.textContent = "Arquivo processado com sucesso!";
}

function readExcelFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      resolve(XLSX.utils.sheet_to_json(worksheet));
    };
    reader.readAsArrayBuffer(file);
  });
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

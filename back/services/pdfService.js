const fs = require("fs");
const { PDFParse } = require("pdf-parse");

async function extractPdfText(filePath) {
  const dataBuffer = fs.readFileSync(filePath);
  const uint8Array = new Uint8Array(dataBuffer);

  const parser = new PDFParse(uint8Array);
  const data = await parser.getText();

  return data.text;
}

module.exports = { extractPdfText };
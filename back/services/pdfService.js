const fs = require("fs");
const { PDFParse } = require("pdf-parse");

async function extractPdfText(filePath) {
  console.log("pdfParse type:", typeof PDFParse);

  const dataBuffer = fs.readFileSync(filePath);
  console.log("Buffer length:", dataBuffer.length);

  const unit8Array = new Uint8Array(dataBuffer)

  const parser = new PDFParse(unit8Array);
  const data = await parser.getText();
  console.log("This is the pdf data")
  console.log(data.text)
  return data.text;
}

module.exports = { extractPdfText };
const express = require("express");
const multer = require("multer")
const pdfService = require("../services/pdfService")
const aiService = require("../services/aiService")
const router = express.Router();

// configure multer
const upload = multer({ dest: "uploads/" });

// GET all courses
router.get("/", (req, res) => {
  res.json([{ id: 1, name: "Intro to Physics", teacher: "Jane Doe" }]);
});

// CREATE new course
router.post("/", (req, res) => {
  const { name, description, teacher } = req.body;
  // Save to DB here
  res.json({ success: true, message: "Course created", data: { name, description, teacher } });
});

router.post("/upload", upload.single("pdf"), async (req, res) => {
  try {
    await pdfResult(req, res);
  } catch (err) {
    console.error("AI error:", err);

    let code;
    try {
      const parsed = JSON.parse(err.message);
      code = parsed.error?.code;
    } catch {
      code = null;
    }

    if (code === 429) {
      res.status(429).json({
        success: false,
        error: "Gemini API quota exceeded. Please wait or upgrade your plan."
      });
    } else {
      res.status(500).json({ success: false, error: err.message });
    }
  }
});

  const pdfResult = async (req, res) => {
    const text = await pdfService.extractPdfText(req.file.path);
      const result = await aiService.generateCourse(text, "coursework", "gemini");
      console.log(result)

      const rawText =
    result?.response?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    console.log(rawText)

      const cleanResult = rawText
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

      console.log(cleanResult)

    const parsed = JSON.parse(cleanResult);

    res.json({ success: true, data: parsed });
  }

module.exports = router;


// ```json
// {
//   "title": "Advanced Analysis of Interim Financial Reporting: Case Study of Deap Capital Management & Trust PLC",
//   "about": "This course provides a deep dive into the preparation and analysis of interim financial statements using the Q1 2025 reports of Deap Capital Management & Trust PLC. Students will explore International Accounting Standard (IAS) 34, evaluate the financial health of companies under restructuring, and understand the regulatory requirements of the Nigerian financial services sector. The course emphasizes debt-to-equity conversion mechanisms, fair value measurements, and risk management disclosures in a distressed financial context.",
//   "week 1": "Foundations of Interim Reporting and Regulatory Compliance. Topics include: Understanding IAS 34 'Interim Financial Reporting' vs. full annual IFRS; The role of Responsibility Statements by the Chairman and CFO; Regulatory framework including the Financial Reporting Council of Nigeria (FRCN). [FLAG: The provided material references the Companies and Allied Matters Act (CAMA) 2004; students should note that this has been largely superseded by CAMA 2020, which introduced modern insolvency and business rescue provisions.]",
//   "week 2": "Analyzing the Statement of Financial Position and Distressed Equity. Topics include: Interpreting negative retained earnings and total equity deficits; Analyzing 'Deposit for Shares' as a transitional equity instrument; Evaluation of 'Available for Sale' (AFS) financial assets and the impact of fair value adjustments on the balance sheet. This week focuses on why the company reports a significant equity deficit (approx. N1.98 billion).",
//   "week 3": "Profitability, Cash Flow, and Operational Efficiency. Topics include: Breaking down fee and commission income vs. investment income; Analyzing administrative expenses and the impact of non-cash adjustments; Evaluating the Statement of Cash Flows with a focus on 'Cash generated from operations' vs. net profit. We will examine why the company shows a small profit for the quarter (N2.4 million) despite massive historical losses.",
//   "week 4": "Debt Restructuring and Financial Notes Analysis. Topics include: Examining the conversion of Managed Funds to Equity (Note 10); Understanding the role of AMCON in taking over margin loans (Note 13.2); Related party transactions and their disclosure requirements. [FLAG: The material mentions the 'Nigerian Stock Exchange'; current methodology dictates referencing it as the 'Nigerian Exchange Group' (NGX) following its demutualization.]",
//   "week 5": "Risk Management and Disclosure Quality. Topics include: Categorizing significant risks: Regulatory, Market, Liquidity, and Operational risk; Evaluating the quality of 'Prior Year Adjustments' (Note 26) and their impact on financial transparency; Analysis of shareholding structures and the influence of the Asset Management Corporation of Nigeria (AMCON).",
//   "methodology_notes": "The course utilizes the Indirect Method for cash flow analysis as seen in the source text and emphasizes the 'Fair Value Hierarchy' (Level 1, 2, and 3) as per IFRS 13. Students are encouraged to use the 'Value Added Statement' to assess the distribution of wealth among stakeholders, a convention common in Nigerian reporting but less emphasized in pure IFRS, providing a localized perspective on corporate social responsibility."
// }
// ```
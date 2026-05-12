export interface SpreadsheetCell {
  value: string | number;
  label: string; // e.g. "A1", "B2"
}

export interface Scenario {
  id: number;
  title: string;
  problem: string;
  data: (string | number)[][]; // Matrix of values
  headers: string[]; // A, B, C...
  rowLabels: string[]; // 1, 2, 3...
  targetCell: string; // e.g. "D10"
  expectedFormula: string[]; // Array of acceptable formulas (e.g. "=SUM(B2:B10)")
  hints: string[];
  explanation: string;
}

export const SCENARIOS: Scenario[] = [
  {
    id: 1,
    title: "Basic Inventory Sum (SUMIF)",
    problem: "Calculate the total inventory for 'Apparel' items. Use SUMIF(B1:B5, \"Apparel\", C1:C5).",
    headers: ["Product", "Category", "Stock"],
    rowLabels: ["1", "2", "3", "4", "5", "6"],
    data: [
      ["T-Shirt", "Apparel", 250],
      ["Jeans", "Apparel", 150],
      ["Laptop", "Electronics", 45],
      ["Hat", "Apparel", 300],
      ["Mouse", "Electronics", 120],
      ["Total Apparel Stock", "", ""],
    ],
    targetCell: "C6",
    expectedFormula: ["=SUMIF(B1:B5,\"Apparel\",C1:C5)"],
    hints: ["Use SUMIF(Range, Criteria, Sum_Range)", "Range is the Category column", "Sum_Range is the Stock column"],
    explanation: "SUMIF adds values in a range that meet a specific category criteria."
  },
  {
    id: 2,
    title: "Regional Sales Analysis (SUMIF)",
    problem: "Find the total sales revenue from the 'West' region specifically.",
    headers: ["Region", "Retailer", "Revenue"],
    rowLabels: ["1", "2", "3", "4", "5", "6"],
    data: [
      ["East", "Store A", 12000],
      ["West", "Store B", 8500],
      ["West", "Store C", 14000],
      ["North", "Store D", 9200],
      ["East", "Store E", 11000],
      ["Total West Rev", "", ""],
    ],
    targetCell: "C6",
    expectedFormula: ["=SUMIF(A1:A5,\"West\",C1:C5)"],
    hints: ["Check the region in column A", "Sum the values in column C"],
    explanation: "SUMIF isolates one region and aggregates its data."
  },
  {
    id: 3,
    title: "Advanced Electronics Profit (SUMIF - HARD)",
    problem: "Calculate the total Profit (D) for all 'Electronics' category (B) items. Warning: Range is larger.",
    headers: ["Product", "Category", "Price", "Profit"],
    rowLabels: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11"],
    data: [
      ["iPhone 15", "Electronics", 35000, 5000],
      ["MacBook Air", "Electronics", 45000, 8000],
      ["Office Chair", "Furniture", 5500, 1200],
      ["Desk Lamp", "Furniture", 1200, 300],
      ["iPad Pro", "Electronics", 32000, 4500],
      ["Standing Desk", "Furniture", 15000, 2500],
      ["Monitors", "Electronics", 8000, 1500],
      ["Keyboard", "Electronics", 2500, 500],
      ["Bookshelf", "Furniture", 4000, 800],
      ["Webcam", "Electronics", 3000, 600],
      ["Electronics Total", "", "", ""],
    ],
    targetCell: "D11",
    expectedFormula: ["=SUMIF(B1:B10,\"Electronics\",D1:D10)"],
    hints: ["SUMIF(B1:B10, \"Electronics\", D1:D10)", "Ensure you include all 10 rows of data."],
    explanation: "Handles multiple criteria points across a larger dataset."
  },
  {
    id: 4,
    title: "Targeted Customer Spend (SUMIF - HARD)",
    problem: "ABC Corp wants to know the total spend by 'VIP' customers. Use SUMIF in column C for 'VIP' status in B.",
    headers: ["Customer", "Status", "Spend"],
    rowLabels: ["1", "2", "3", "4", "5", "6", "7", "8"],
    data: [
      ["Alice", "Standard", 1500],
      ["Bob", "VIP", 12000],
      ["Charlie", "VIP", 8500],
      ["David", "Standard", 2200],
      ["Eve", "VIP", 15000],
      ["Frank", "Standard", 3100],
      ["Grace", "VIP", 9400],
      ["Total VIP Spend", "", ""],
    ],
    targetCell: "C8",
    expectedFormula: ["=SUMIF(B1:B7,\"VIP\",C1:C7)"],
    hints: ["Identify VIPs in column B", "Sum from column C"],
    explanation: "Critical for calculating metrics for specific high-value customer segments."
  },
  {
    id: 5,
    title: "Stock Value Audit (SUMIF - HARD)",
    problem: "Calculate the total inventory value only for items with 'Low Stock' status (D). Value is in C.",
    headers: ["Item", "Unit Price", "Value", "Status"],
    rowLabels: ["1", "2", "3", "4", "5", "6"],
    data: [
      ["CPU", 500, 25000, "In Stock"],
      ["GPU", 800, 1600, "Low Stock"],
      ["RAM", 150, 450, "Low Stock"],
      ["SSD", 200, 30000, "In Stock"],
      ["PSU", 100, 200, "Low Stock"],
      ["Audit Result", "", "", ""],
    ],
    targetCell: "C6",
    expectedFormula: ["=SUMIF(D1:D5,\"Low Stock\",C1:C5)"],
    hints: ["The condition is 'Low Stock' in D1:D5", "Sum column C1:C5"],
    explanation: "Automates reporting on problematic stock levels."
  },
  {
    id: 6,
    title: "Order Approval (IF)",
    problem: "Check if the order quantity in B1 meets the minimum shelf order of 50. If Yes show 'APPROVE', else 'REJECT'.",
    headers: ["Metric", "Quantity", "Decision"],
    rowLabels: ["1"],
    data: [
      ["Order Unit", 65, ""],
    ],
    targetCell: "C1",
    expectedFormula: ["=IF(B1>=50,\"APPROVE\",\"REJECT\")", "=IF(B1>49,\"APPROVE\",\"REJECT\")"],
    hints: ["IF(B1>=50, \"APPROVE\", \"REJECT\")"],
    explanation: "Basic decision logic using comparison operators."
  },
  {
    id: 7,
    title: "Sales Bonus Eligibility (IF)",
    problem: "A salesman gets a 'BONUS' if sales in B1 are over $10,000. Otherwise, show 'NO'.",
    headers: ["Name", "Sales", "Status"],
    rowLabels: ["1"],
    data: [
      ["John Doe", 12500, ""],
    ],
    targetCell: "C1",
    expectedFormula: ["=IF(B1>10000,\"BONUS\",\"NO\")"],
    hints: ["IF(B1 > 10000, \"BONUS\", \"NO\")"],
    explanation: "Commonly used for employee performance and commission checks."
  },
  {
    id: 8,
    title: "Tiered Commission Level (IF - HARD)",
    problem: "If Sales (B1) are above 15,000, the rate is 15%. Otherwise, it is 10%. Calculate the commission amount (Sales * Rate).",
    headers: ["Category", "Amount", "Commission"],
    rowLabels: ["1"],
    data: [
      ["Quarterly", 20000, ""],
    ],
    targetCell: "C1",
    expectedFormula: ["=IF(B1>15000,B1*0.15,B1*0.1)", "=IF(B1>15000,B1*15%,B1*10%)"],
    hints: ["Use IF(B1 > 15000, B1 * 0.15, B1 * 0.1)"],
    explanation: "Business logic involving conditional calculations."
  },
  {
    id: 9,
    title: "Shipping Surcharge (IF - HARD)",
    problem: "If weight (B1) exceeds 25kg, add a $50 fee + base rate (B1*2). Otherwise, only base rate (B1*2).",
    headers: ["Type", "Weight", "Total Cost"],
    rowLabels: ["1"],
    data: [
      ["Heavy Gear", 30, ""],
    ],
    targetCell: "C1",
    expectedFormula: ["=IF(B1>25,(B1*2)+50,B1*2)", "=IF(B1>25,B1*2+50,B1*2)"],
    hints: ["IF(B1 > 25, (B1*2)+50, B1*2)"],
    explanation: "Complex shipping rules often require embedded arithmetic inside IF statements."
  },
  {
    id: 10,
    title: "Project Status Guard (IF - HARD)",
    problem: "If completion days (B1) is less than or equal to 10, mark 'ON TIME'. If between 11-20, mark 'BUFFER'. Otherwise 'LATE'. Tip: Use nested IF for very hard logic.",
    headers: ["Metric", "Days taken", "Label"],
    rowLabels: ["1"],
    data: [
      ["Delivery", 15, ""],
    ],
    targetCell: "C1",
    expectedFormula: ["=IF(B1<=10,\"ON TIME\",IF(B1<=20,\"BUFFER\",\"LATE\"))"],
    hints: ["Use a nested IF approach: IF(B1<=10, \"ON TIME\", IF(B1<=20, \"BUFFER\", \"LATE\"))"],
    explanation: "Multistage classification using nested logic triggers."
  }
];

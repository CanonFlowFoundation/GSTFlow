# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: invoice.spec.ts >> can upload and process a semantic PDF
- Location: e2e/invoice.spec.ts:46:1

# Error details

```
Error: expect(locator).not.toBeEmpty() failed

Locator: locator('textarea')
Expected: not empty
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "not toBeEmpty" with timeout 5000ms
  - waiting for locator('textarea')

```

```yaml
- banner:
  - text: G
  - heading "GSTFlow Semantic Compiler" [level=1]
  - 'button "Language: English"'
  - img
  - text: Working Offline
- main:
  - button "Raw JSON"
  - button "PDF Intake"
  - heading "Confirm Extracted Fields" [level=2]
  - paragraph: Review the AI guesses before sending to the strict validation engine.
  - button "Cancel"
  - text: Invoice No. 0%
  - textbox: INV-UNKNOWN
  - text: Date 0%
  - textbox: YYYY-MM-DD
  - text: Seller GSTIN 0% Confidence
  - textbox: NOT_FOUND
  - text: Buyer GSTIN 0% Confidence
  - textbox: NOT_FOUND
  - paragraph: Once confirmed, this data is piped exactly as-is into the F# semantic compiler. If the compiler rejects it, you will have to fix it manually.
  - button "Confirm & Run Compiler"
- contentinfo:
  - img
  - text: Free forever
  - img
  - text: Works offline
  - img
  - text: "Your data never leaves this device Network log: 0 bytes left this device ⚠️ LEGAL DISCLAIMER: THIS IS NOT TAX ADVICE. GSTFlow takes zero liability for your GSTR-1 filings, penalties, or disputes. You are solely responsible for verifying accuracy before filing with the Government of India portal."
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test('has title and can process valid invoice', async ({ page }) => {
  4  |   await page.goto('/');
  5  | 
  6  |   // Expect a title
  7  |   await expect(page).toHaveTitle(/GSTFlow/i);
  8  | 
  9  |   // Get the textarea
  10 |   const textarea = page.locator('textarea');
  11 |   
  12 |   // A valid invoice
  13 |   const validInvoice = {
  14 |     "InvoiceNumber": "INV-2024-0042",
  15 |     "InvoiceDate": "2024-04-15",
  16 |     "Seller": {
  17 |       "Gstin": "27AABCU9603R1ZM",
  18 |       "StateCode": "27"
  19 |     },
  20 |     "Buyer": {
  21 |       "Gstin": "29GGGGG1314R9Z6",
  22 |       "StateCode": "29"
  23 |     },
  24 |     "Items": [
  25 |       {
  26 |         "Hsn": "998311",
  27 |         "TaxableValue": 85000.0,
  28 |         "GstRate": 18.0,
  29 |         "Tax": {
  30 |           "Igst": 15300.0,
  31 |           "Cgst": 0.0,
  32 |           "Sgst": 0.0
  33 |         }
  34 |       }
  35 |     ]
  36 |   };
  37 | 
  38 |   // Clear and fill the textarea
  39 |   await textarea.fill('');
  40 |   await textarea.fill(JSON.stringify(validInvoice, null, 2));
  41 | 
  42 |   // The output should be successful (Pass)
  43 |   await expect(page.getByText('Pass')).toBeVisible({ timeout: 5000 });
  44 | });
  45 | 
  46 | test('can upload and process a semantic PDF', async ({ page }) => {
  47 |   await page.goto('/');
  48 | 
  49 |   // Expect a title
  50 |   await expect(page).toHaveTitle(/GSTFlow/i);
  51 | 
  52 |   // Upload the GST Invoice PDF
  53 |   const fileInput = page.locator('input[type="file"]');
  54 |   await fileInput.setInputFiles('../sampleinvoices/mock_invoice_pdfs/B2C/INV-GSTI.pdf');
  55 | 
  56 |   // Since it might not have valid GSTINs to process correctly based on dummy data,
  57 |   // we just assert that the file uploader triggered the text extraction
  58 |   // which will update the textarea. We wait for textarea to contain JSON
  59 |   const textarea = page.locator('textarea');
> 60 |   await expect(textarea).not.toBeEmpty();
     |                              ^ Error: expect(locator).not.toBeEmpty() failed
  61 |   
  62 |   // It should parse some invoice structure
  63 |   await expect(textarea).toContainText('InvoiceNumber');
  64 | });
  65 | 
```
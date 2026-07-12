# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: invoice.spec.ts >> has title and can process valid invoice
- Location: e2e/invoice.spec.ts:3:1

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.fill: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('.monaco-editor textarea').first()
    - locator resolved to <textarea tabindex="-1" readonly="true" aria-hidden="true" class="ime-text-area"></textarea>
    - fill("")
  - attempting fill action
    2 × waiting for element to be visible, enabled and editable
      - element is not editable
    - retrying fill action
    - waiting 20ms
    2 × waiting for element to be visible, enabled and editable
      - element is not editable
    - retrying fill action
      - waiting 100ms
    56 × waiting for element to be visible, enabled and editable
       - element is not editable
     - retrying fill action
       - waiting 500ms

```

# Page snapshot

```yaml
- generic [ref=e1]:
  - generic [ref=e3]:
    - navigation [ref=e4]:
      - generic [ref=e5]:
        - generic [ref=e6]: G
        - heading "GSTFlow" [level=1] [ref=e7]
      - generic [ref=e8]:
        - link "Offline Validator" [ref=e9] [cursor=pointer]:
          - /url: "#validator"
        - link "Features" [ref=e10] [cursor=pointer]:
          - /url: "#features"
        - link "Govt Links" [ref=e11] [cursor=pointer]:
          - /url: "#resources"
        - link "Our Vision (CFF)" [ref=e12] [cursor=pointer]:
          - /url: https://canonflowfoundation.github.io
    - generic [ref=e13]:
      - heading "Bulletproof GST Compliance. 100% Offline." [level=2] [ref=e15]:
        - text: Bulletproof GST Compliance.
        - text: 100% Offline.
      - paragraph [ref=e16]: Stop worrying about notices and penalties. Validate your invoices instantly, securely, and without your data ever leaving your device.
      - generic [ref=e17]:
        - link "Try Validator Now" [ref=e18] [cursor=pointer]:
          - /url: "#validator"
        - link "Download Desktop App (Coming Soon)" [ref=e19] [cursor=pointer]:
          - /url: "#pake-download"
          - img [ref=e20]
          - text: Download Desktop App (Coming Soon)
    - generic [ref=e23]:
      - generic [ref=e24]:
        - img [ref=e26]
        - heading "Absolute Privacy" [level=3] [ref=e28]
        - paragraph [ref=e29]: No cloud APIs. No server uploads. Your sensitive financial data is validated purely locally in your browser.
      - generic [ref=e30]:
        - img [ref=e32]
        - heading "Zero Penalties" [level=3] [ref=e34]
        - paragraph [ref=e35]: Instantly catches place of supply errors, mathematical mismatches, and HSN invalidities before you file.
      - generic [ref=e36]:
        - img [ref=e38]
        - heading "Guaranteed Accuracy" [level=3] [ref=e40]
        - paragraph [ref=e41]: Built on a strict, deterministic rules engine that matches the official CGST Act word for word.
    - generic [ref=e43]:
      - generic [ref=e44]:
        - heading "The Offline Validator" [level=2] [ref=e45]
        - paragraph [ref=e46]: Upload an invoice PDF or paste raw JSON. We validate it locally in milliseconds.
      - generic [ref=e47]:
        - generic [ref=e48]:
          - generic [ref=e49]:
            - button "Upload PDF" [ref=e50]
            - button "Raw JSON" [active] [ref=e51]
          - 'button "Language: English" [ref=e52]'
        - generic [ref=e53]:
          - code [ref=e57]:
            - generic [ref=e58]:
              - textbox "Editor content"
              - textbox [ref=e59]
              - generic [ref=e61]:
                - generic [ref=e62]:
                  - generic [ref=e64] [cursor=pointer]: 
                  - generic [ref=e65]: "1"
                - generic [ref=e67]: "2"
                - generic [ref=e69]: "3"
                - generic [ref=e70]:
                  - generic [ref=e71] [cursor=pointer]: 
                  - generic [ref=e72]: "4"
                - generic [ref=e74]: "5"
                - generic [ref=e76]: "6"
                - generic [ref=e78]: "7"
                - generic [ref=e79]:
                  - generic [ref=e80] [cursor=pointer]: 
                  - generic [ref=e81]: "8"
                - generic [ref=e83]: "9"
                - generic [ref=e85]: "10"
                - generic [ref=e87]: "11"
                - generic [ref=e88]:
                  - generic [ref=e89] [cursor=pointer]: 
                  - generic [ref=e90]: "12"
                - generic [ref=e91]:
                  - generic [ref=e92] [cursor=pointer]: 
                  - generic [ref=e93]: "13"
                - generic [ref=e95]: "14"
                - generic [ref=e97]: "15"
                - generic [ref=e99]: "16"
                - generic [ref=e100]:
                  - generic [ref=e101] [cursor=pointer]: 
                  - generic [ref=e102]: "17"
                - generic [ref=e104]: "18"
                - generic [ref=e106]: "19"
                - generic [ref=e108]: "20"
                - generic [ref=e110]: "21"
                - generic [ref=e112]: "22"
                - generic [ref=e114]: "23"
                - generic [ref=e116]: "24"
              - generic [ref=e190]:
                - generic [ref=e192]: "{"
                - generic [ref=e194]: "\"InvoiceNumber\": \"INV-001\","
                - generic [ref=e196]: "\"InvoiceDate\": \"2026-07-08\","
                - generic [ref=e198]: "\"Seller\": {"
                - generic [ref=e200]: "\"Gstin\": \"29ABCDE1234F1Z5\","
                - generic [ref=e202]: "\"StateCode\": \"29\""
                - generic [ref=e204]: "},"
                - generic [ref=e206]: "\"Buyer\": {"
                - generic [ref=e208]: "\"Gstin\": \"33PQRSX9876L1Z2\","
                - generic [ref=e210]: "\"StateCode\": \"33\""
                - generic [ref=e212]: "},"
                - generic [ref=e214]: "\"Items\": ["
                - generic [ref=e216]: "{"
                - generic [ref=e218]: "\"Hsn\": \"847130\","
                - generic [ref=e220]: "\"TaxableValue\": 100000,"
                - generic [ref=e222]: "\"GstRate\": 18,"
                - generic [ref=e224]: "\"Tax\": {"
                - generic [ref=e226]: "\"Igst\": 18000,"
                - generic [ref=e228]: "\"Cgst\": 0,"
                - generic [ref=e230]: "\"Sgst\": 0"
                - generic [ref=e232]: "}"
                - generic [ref=e234]: "}"
                - generic [ref=e236]: "]"
                - generic [ref=e238]: "}"
          - generic [ref=e242]:
            - heading "Parsing Error" [level=2] [ref=e243]
            - generic [ref=e244]: Validation failed
    - generic [ref=e246]:
      - heading "Official Resources" [level=2] [ref=e247]
      - generic [ref=e248]:
        - link "🏛️ GST Portal gst.gov.in" [ref=e249] [cursor=pointer]:
          - /url: https://www.gst.gov.in/
          - generic [ref=e250]: 🏛️
          - generic [ref=e251]:
            - generic [ref=e252]: GST Portal
            - generic [ref=e253]: gst.gov.in
        - link "🧾 e-Invoice Portal einvoice1.gst.gov.in" [ref=e254] [cursor=pointer]:
          - /url: https://einvoice1.gst.gov.in/
          - generic [ref=e255]: 🧾
          - generic [ref=e256]:
            - generic [ref=e257]: e-Invoice Portal
            - generic [ref=e258]: einvoice1.gst.gov.in
        - link "🚚 e-Way Bill ewayanic.gov.in" [ref=e259] [cursor=pointer]:
          - /url: https://ewayanic.gov.in/
          - generic [ref=e260]: 🚚
          - generic [ref=e261]:
            - generic [ref=e262]: e-Way Bill
            - generic [ref=e263]: ewayanic.gov.in
    - link "Send Feedback" [ref=e264] [cursor=pointer]:
      - /url: https://github.com/CanonFlowFoundation/GSTFlow/issues/new?title=Feedback:%20&body=Please%20describe%20your%20feedback%20or%20feature%20request%20here...%0A%0A---%0A**Email/Contact%20(optional):**%20%0A**Environment:**%20GSTFlow%20Web%20Validator
      - img [ref=e265]
      - text: Send Feedback
    - contentinfo [ref=e267]:
      - generic [ref=e268]: GSTFlow
      - generic [ref=e269]:
        - link "Privacy Policy" [ref=e270] [cursor=pointer]:
          - /url: "#"
        - link "Terms of Service" [ref=e271] [cursor=pointer]:
          - /url: "#"
        - link "CanonFlow Foundation" [ref=e272] [cursor=pointer]:
          - /url: https://canonflowfoundation.github.io
      - generic [ref=e273]: "⚠️ LEGAL DISCLAIMER: THIS IS NOT TAX ADVICE. GSTFlow takes zero liability for your filings or disputes. You are solely responsible for verifying accuracy before filing with the Government of India."
      - generic [ref=e274]: © 2026 GSTFlow. Open Sourced under the MIT License.
  - generic [ref=e275]:
    - alert
    - alert
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
  9  |   // Click the Raw JSON button to switch modes
  10 |   await page.getByRole('button', { name: 'Raw JSON' }).click();
  11 | 
  12 |   // Get the textarea
  13 |   const textarea = page.locator('.monaco-editor textarea').first();
  14 |   
  15 |   // A valid invoice
  16 |   const validInvoice = {
  17 |     "InvoiceNumber": "INV-2024-0042",
  18 |     "InvoiceDate": "2024-04-15",
  19 |     "Seller": {
  20 |       "Gstin": "27AABCU9603R1ZM",
  21 |       "StateCode": "27"
  22 |     },
  23 |     "Buyer": {
  24 |       "Gstin": "29GGGGG1314R9Z6",
  25 |       "StateCode": "29"
  26 |     },
  27 |     "Items": [
  28 |       {
  29 |         "Hsn": "998311",
  30 |         "TaxableValue": 85000.0,
  31 |         "GstRate": 18.0,
  32 |         "Tax": {
  33 |           "Igst": 15300.0,
  34 |           "Cgst": 0.0,
  35 |           "Sgst": 0.0
  36 |         }
  37 |       }
  38 |     ]
  39 |   };
  40 | 
  41 |   // Clear and fill the textarea
> 42 |   await textarea.fill('');
     |                  ^ Error: locator.fill: Test timeout of 30000ms exceeded.
  43 |   await textarea.fill(JSON.stringify(validInvoice, null, 2));
  44 | 
  45 |   // The output should be successful
  46 |   await expect(page.getByText('Ready to File')).toBeVisible({ timeout: 5000 });
  47 | });
  48 | 
```
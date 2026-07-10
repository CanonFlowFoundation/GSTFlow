# Target Acquisition List: Edge-Case Invoices

To definitively harden the GSTFlow engine against the chaos of the Indian retail and B2B ecosystem, we need to acquire and test the following diverse documents. These represent the absolute boundaries and edge cases of GST law.

## 1. The "Zero Tax & Exempt" Class
*These test the engine's ability to handle 0% slabs and Non-GST supplies without throwing errors.*
- [ ] **Petrol/Diesel Bill:** Fuel is outside the purview of GST (Non-GST supply). The receipt will have VAT/Cess but no CGST/SGST.
- [ ] **Electricity Bill:** Exempt from GST.
- [ ] **Fresh Produce / Provisions Bill:** Unbranded rice, wheat, or fresh vegetables from a supermarket (0% GST slab).

## 2. The "Negative Value" Class
*These test the engine's ability to handle negative math and refunds.*
- [ ] **Amazon / Flipkart Credit Note:** An invoice generated when you return an item. The Taxable Value and Tax amounts will be negative. The engine must validate negative math correctly.
- [ ] **Volume Discount Debit Note:** A B2B debit note issued for post-sale price adjustments.

## 3. The "Mixed Multi-Slab" Class
*These test the engine's ability to sum complex multi-rate math on a single piece of paper.*
- [ ] **Supermarket / Hypermarket Bill (D-Mart, Reliance Fresh):** A single long receipt containing items at 0%, 5% (spices), 12% (butter), 18% (shampoo), and 28% (aerated drinks).
- [ ] **Restaurant Bill (Swiggy / Zomato / Dine-in):** A restaurant bill containing food (5%) and perhaps a service charge, testing how the engine handles non-ITC eligible 5% slabs.

## 4. The "Special Legal Flow" Class
*These test specific GST clauses and alternative documents.*
- [ ] **Bill of Supply (Composition Scheme):** A receipt from a small neighborhood grocery store (Kirana) operating under the Composition Scheme. They will have a GSTIN but are legally forbidden from charging CGST/SGST. It will say "Bill of Supply" instead of "Tax Invoice".
- [ ] **Transport / Freight Bill (GTA):** A bill from a Goods Transport Agency. This tests the **Reverse Charge Mechanism (RCM)** where the *buyer* pays the tax directly to the government, not the seller.
- [ ] **Hotel / Travel Invoice (MakeMyTrip / Agoda):** Testing Place of Supply rules where the hotel is in a different state than the buyer, but charges CGST/SGST because the POS is the hotel's location.

## 5. The "Interstate B2B" Class
*These test the IGST math and Place of Supply crossing state lines.*
- [ ] **SaaS / Cloud Computing Bill:** An AWS, Google Cloud, or Microsoft India bill. These are often billed from Delhi or Maharashtra to your state, triggering pure IGST.
- [ ] **Large B2B Goods Invoice with E-Way Bill:** A wholesale purchase over ₹50,000. This will test if the engine can validate strict 6-digit or 8-digit HSN codes which are mandatory for large B2B shipments.

---
**Mission:** Gather at least one from each class. Once we have these, we will build JSON fixtures for them and run them through the compiler. When the engine passes this list, it can officially handle 99.9% of the Indian economy.

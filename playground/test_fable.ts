import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { compileInvoice } from './src/fable/Library.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const fixturesDir = path.join(__dirname, '../fixtures');
const fixtures = ['fixture_1_intrastate_b2b.json', 'fixture_2_intrastate_b2c.json', 'fixture_3_falsifier.json'];

let exitCode = 0;

for (const fixture of fixtures) {
    const jsonString = fs.readFileSync(path.join(fixturesDir, fixture), 'utf-8');
    const result = compileInvoice(jsonString);
    
    console.log(`--- Testing ${fixture} ---`);
    if (result.success) {
        console.log(`✅ Validates successfully!`);
    } else {
        console.log(`❌ Validation Failed:`);
        if (result.violations) {
            for (const v of result.violations) {
                console.log(`  [${v.Rule}] ${v.Description}`);
            }
        } else {
            console.log(`  Error: ${result.error}`);
        }
    }
}

// Ensure fixture 3 fails with specific rule
const f3Json = fs.readFileSync(path.join(fixturesDir, 'fixture_3_falsifier.json'), 'utf-8');
const f3Res = compileInvoice(f3Json);
if (f3Res.success || !f3Res.violations.some(v => v.Rule === 'IGST_CGST_LAW')) {
    console.error("CRITICAL: Falsifier did not produce expected IGST_CGST_LAW violation in JS!");
    exitCode = 1;
}

process.exit(exitCode);

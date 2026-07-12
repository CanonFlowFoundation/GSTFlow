const fs = require('fs');
const path = require('path');

const libraryFs = fs.readFileSync(path.join(__dirname, '../GSTFlow.Rules/Library.fs'), 'utf-8');
const appTsx = fs.readFileSync(path.join(__dirname, 'src/App.tsx'), 'utf-8');

const rulesSet = new Set();
const regex = /(?:failRule|warnRule|unknownRule)\s+"([^"]+)"/g;
let match;
while ((match = regex.exec(libraryFs)) !== null) {
  rulesSet.add(match[1]);
}

const translationsMatch = appTsx.match(/const translations:\s*Record<[^>]+>\s*=\s*({[\s\S]*?});/);
if (!translationsMatch) {
  console.error("Could not find translations dictionary in App.tsx");
  process.exit(1);
}

const keys = [];
const keyRegex = /^\s*([A-Z0-9_]+)\s*:/gm;
let kMatch;
while ((kMatch = keyRegex.exec(translationsMatch[1])) !== null) {
  keys.push(kMatch[1]);
}

let missing = false;
for (const rule of rulesSet) {
  if (!keys.includes(rule)) {
    console.error(`RuleId ${rule} is missing from App.tsx translations!`);
    missing = true;
  }
}

// Ensure every key has all 4 properties: en, hi, hint_en, hint_hi
for (const key of keys) {
  const blockRegex = new RegExp(`${key}\\s*:\\s*{([^}]+)}`, 'm');
  const blockMatch = translationsMatch[1].match(blockRegex);
  if (blockMatch) {
    const block = blockMatch[1];
    if (!block.includes('en:')) { console.error(`${key} missing en translation`); missing = true; }
    if (!block.includes('hi:')) { console.error(`${key} missing hi translation`); missing = true; }
    if (!block.includes('hint_en:')) { console.error(`${key} missing hint_en translation`); missing = true; }
    if (!block.includes('hint_hi:')) { console.error(`${key} missing hint_hi translation`); missing = true; }
  }
}

if (missing) {
  process.exit(1);
} else {
  console.log("Translation completeness gate passed: All RuleIds have full translations in EN and HI.");
  process.exit(0);
}

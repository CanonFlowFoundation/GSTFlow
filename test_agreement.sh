#!/bin/bash
set -e

echo "=== Building CLI ==="
dotnet build GSTFlow.Cli

echo "=== Compiling Fable ==="
dotnet tool restore
dotnet fable GSTFlow.Wasm --outDir out

echo "=== Running Agreement Tests ==="
# We have a fixtures dir.
# Let's write a quick Node wrapper to run the compiled Wasm API
cat << 'EOF' > run_fable.js
const fs = require('fs');
const api = require('./out/Library.js');

const fixtures = process.argv.slice(2);
for (const fixture of fixtures) {
    const jsonStr = fs.readFileSync(fixture, 'utf8');
    const res = api.compileInvoice(jsonStr, "sha256:test_script_hash");
    if (!res.success && !res.envelope) {
        console.error("Fable failed entirely on " + fixture + ": " + res.error);
        process.exit(1);
    }
    fs.writeFileSync(fixture + ".fable.json", res.envelope + "\n");
}
EOF

for fixture in $(find fixtures -maxdepth 1 -name "*.json" ! -name "*.cli.json" ! -name "*.fable.json"); do
    echo "Testing $fixture..."
    dotnet run --project GSTFlow.Cli -- --emit-envelope "$fixture" > "$fixture.cli.json" || true
done

node run_fable.js $(find fixtures -maxdepth 1 -name "*.json" ! -name "*.cli.json" ! -name "*.fable.json")
for fixture in $(find fixtures -maxdepth 1 -name "*.json" ! -name "*.cli.json" ! -name "*.fable.json"); do
  HASH=$(cat "$fixture.cli.json" | grep -oP '(?<="SubjectHash":")[^"]+')
  sed -i "s|sha256:test_script_hash|$HASH|g" "$fixture.fable.json"
done

# Diff them
FAILS=0
for fixture in $(find fixtures -maxdepth 1 -name "*.json" ! -name "*.cli.json" ! -name "*.fable.json"); do
    if cmp -s "$fixture.cli.json" "$fixture.fable.json"; then
        echo "✅ Agreement OK: $fixture"
    else
        echo "❌ Agreement FAIL: $fixture"
        diff "$fixture.cli.json" "$fixture.fable.json" || true
        FAILS=$((FAILS+1))
    fi
done

if [ "$FAILS" -gt 0 ]; then
    echo "Agreement test failed for $FAILS fixtures!"
    exit 1
else
    echo "All agreement tests passed!"
fi

      run: |
        echo "Testing Fixture 1 (Valid Interstate B2B)"
        dotnet run --project GSTFlow.Cli/GSTFlow.Cli.fsproj -- --validate fixtures/fixture_1_intrastate_b2b.json

        echo "Testing Fixture 2 (Valid Intrastate B2C)"
        dotnet run --project GSTFlow.Cli/GSTFlow.Cli.fsproj -- --validate fixtures/fixture_2_intrastate_b2c.json

        echo "Testing Fixture 3 (Falsifier - expected to fail with IGST_CGST_LAW)"
        if dotnet run --project GSTFlow.Cli/GSTFlow.Cli.fsproj -- --validate fixtures/fixture_3_falsifier.json > out3.log 2>&1; then
            echo "Expected fixture 3 to fail!"
            exit 1
        fi
        grep "\[IGST_CGST_LAW\]" out3.log || { echo "IGST_CGST_LAW violation not found"; exit 1; }

        echo "Testing Fixture 4 (Bad GSTIN Checksum)"
        if dotnet run --project GSTFlow.Cli/GSTFlow.Cli.fsproj -- --validate fixtures/fixture_4_bad_check_character.json > out4.log 2>&1; then
            echo "Expected fixture 4 to fail!"
            exit 1
        fi
        grep "\[GSTIN_FORMAT\]" out4.log || { echo "GSTIN_FORMAT violation not found"; exit 1; }

        echo "Testing Fixture 5 (Both IGST and CGST - illegal)"
        if dotnet run --project GSTFlow.Cli/GSTFlow.Cli.fsproj -- --validate fixtures/fixture_5_both_taxes.json > out5.log 2>&1; then
            echo "Expected fixture 5 to fail!"
            exit 1
        fi
        grep "\[IGST_CGST_LAW\]" out5.log || { echo "IGST_CGST_LAW violation not found"; exit 1; }

        echo "Testing Fixture 6 (Off Slab)"
        if dotnet run --project GSTFlow.Cli/GSTFlow.Cli.fsproj -- --validate fixtures/fixture_6_off_slab.json > out6.log 2>&1; then
            echo "Expected fixture 6 to fail!"
            exit 1
        fi
        grep "\[RATE_SLAB\]" out6.log || { echo "RATE_SLAB violation not found"; exit 1; }

        echo "Testing Fixture 7 (Sanity rules)"
        if dotnet run --project GSTFlow.Cli/GSTFlow.Cli.fsproj -- --validate fixtures/fixture_7_sanity.json > out7.log 2>&1; then
            echo "Expected fixture 7 to fail!"
            exit 1
        fi
        grep "\[GSTIN_FORMAT\]" out7.log || { echo "GSTIN_FORMAT violation not found"; exit 1; }
        grep "\[INV_SANITY_ITEMS\]" out7.log || { echo "INV_SANITY_ITEMS violation not found"; exit 1; }

        echo "Testing Fixture 8 (Valid RCM)"
        dotnet run --project GSTFlow.Cli/GSTFlow.Cli.fsproj -- --validate fixtures/fixture_8_rcm.json || { echo "Expected fixture 8 to pass!"; exit 1; }

        echo "Testing Fixture 9 (Bad RCM)"
        if dotnet run --project GSTFlow.Cli/GSTFlow.Cli.fsproj -- --validate fixtures/fixture_9_rcm_bad.json > out9.log 2>&1; then
            echo "Expected fixture 9 to fail!"
            exit 1
        fi
        grep "\[RCM_TAX_CHARGED\]" out9.log || { echo "RCM_TAX_CHARGED violation not found"; exit 1; }

        echo "Testing Invoice 1 (Real)"
        dotnet run --project GSTFlow.Cli/GSTFlow.Cli.fsproj -- --validate fixtures/invoice_1_real.json || { echo "Expected invoice 1 to pass!"; exit 1; }

        echo "Testing Invoice 2 (Real)"
        dotnet run --project GSTFlow.Cli/GSTFlow.Cli.fsproj -- --validate fixtures/invoice_2_real.json || { echo "Expected invoice 2 to pass!"; exit 1; }

        echo "Testing Invoice 3 (Real)"
        dotnet run --project GSTFlow.Cli/GSTFlow.Cli.fsproj -- --validate fixtures/invoice_3_real.json || { echo "Expected invoice 3 to pass!"; exit 1; }

        echo "Testing Invoice 4 (Real)"
        dotnet run --project GSTFlow.Cli/GSTFlow.Cli.fsproj -- --validate fixtures/invoice_4_real.json || { echo "Expected invoice 4 to pass!"; exit 1; }

        echo "Testing Invoice 5 (SaaS)"
        dotnet run --project GSTFlow.Cli/GSTFlow.Cli.fsproj -- --validate fixtures/invoice_5_saas.json || { echo "Expected invoice 5 to pass!"; exit 1; }


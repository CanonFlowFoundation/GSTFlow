import 'package:flutter_test/flutter_test.dart';
import 'package:gstflow/invoice_parser.dart';
import 'package:gstflow/fable_dart/Library.dart' as engine;
import 'dart:convert';
import 'package:crypto/crypto.dart';

void main() {
  group('Fable-Dart Mobile Engine Tests', () {
    test('Should successfully parse and validate a correct JSON invoice', () {
      const validJson = '''
      {
        "InvoiceNumber": "INV-100",
        "InvoiceDate": "2026-07-08",
        "Seller": {
          "Gstin": "29ABCDE1234F1ZW",
          "StateCode": "29"
        },
        "Buyer": {
          "Gstin": "29AAGCB7383J1Z4",
          "StateCode": "29"
        },
        "Items": [
          {
            "Hsn": "84713010",
            "TaxableValue": 100000,
            "GstRate": 18,
            "Tax": {
              "Igst": 0,
              "Cgst": 9000,
              "Sgst": 9000
            }
          }
        ]
      }
      ''';

      // 1. Parse JSON
      final rawInvoice = InvoiceParser.parse(validJson);
      
      // 2. Hash
      final hash = sha256.convert(utf8.encode(validJson)).toString();

      // 3. Compile
      final result = engine.compileInvoice(rawInvoice, hash);
      
      // 4. Verify No Fails
      final violations = result.Envelope.Results.where((r) => r.Outcome.tag != 0).toList();
      expect(violations.isEmpty, true, reason: 'A valid invoice should have 0 violations.');
    });

    test('Should catch CGST charged on Inter-State supply', () {
      const invalidJson = '''
      {
        "InvoiceNumber": "INV-101",
        "InvoiceDate": "2026-07-08",
        "Seller": {
          "Gstin": "29ABCDE1234F1ZW",
          "StateCode": "29"
        },
        "Buyer": {
          "Gstin": "33GSPTN0802G1ZN",
          "StateCode": "33"
        },
        "Items": [
          {
            "Hsn": "84713010",
            "TaxableValue": 100000,
            "GstRate": 18,
            "Tax": {
              "Igst": 0,
              "Cgst": 9000,
              "Sgst": 9000
            }
          }
        ]
      }
      ''';

      final rawInvoice = InvoiceParser.parse(invalidJson);
      final hash = sha256.convert(utf8.encode(invalidJson)).toString();
      final result = engine.compileInvoice(rawInvoice, hash);
      
      final violations = result.Envelope.Results.where((r) => r.Outcome.tag != 0).toList();
      expect(violations.isNotEmpty, true);
      expect(violations.any((v) => v.Metadata.RuleId == 'IGST_CGST_LAW'), true);
    });
  });
}

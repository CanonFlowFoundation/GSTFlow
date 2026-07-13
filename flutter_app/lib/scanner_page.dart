import 'package:flutter/material.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import 'package:crypto/crypto.dart';
import 'dart:convert';
import 'invoice_parser.dart';
import 'fable_dart/Library.dart' as engine;
import 'fable_dart/GSTFlow.Core/Library.dart' as core;

class ScannerPage extends StatefulWidget {
  const ScannerPage({Key? key}) : super(key: key);

  @override
  State<ScannerPage> createState() => _ScannerPageState();
}

class _ScannerPageState extends State<ScannerPage> {
  final MobileScannerController _controller = MobileScannerController();
  bool _isScanning = true;

  void _onDetect(BarcodeCapture capture) {
    if (!_isScanning) return;
    
    final List<Barcode> barcodes = capture.barcodes;
    if (barcodes.isNotEmpty) {
      final String? qrData = barcodes.first.rawValue;
      if (qrData != null && qrData.contains('"InvoiceNumber"')) {
        setState(() => _isScanning = false);
        _processInvoice(qrData);
      }
    }
  }

  void _processInvoice(String jsonString) {
    try {
      // 1. Parse JSON into Fable Dart classes
      final rawInvoice = InvoiceParser.parse(jsonString);
      
      // 2. Compute SHA-256 Hash
      final bytes = utf8.encode(jsonString);
      final hash = sha256.convert(bytes).toString();

      // 3. Run the pure F# rules engine offline!
      final result = engine.compileInvoice(rawInvoice, hash);

      // 4. Check for violations
      final violations = result.Envelope.Results.where((r) => r.Outcome.tag == 1).toList(); // tag 1 is Fail

      showDialog(
        context: context,
        barrierDismissible: false,
        builder: (ctx) => AlertDialog(
          title: Text(violations.isEmpty ? '✅ Valid Invoice' : '❌ Validation Failed'),
          content: SingleChildScrollView(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Invoice: ${rawInvoice.InvoiceNumber}'),
                const SizedBox(height: 10),
                if (violations.isEmpty)
                  const Text('No mathematical or structural errors found.', style: TextStyle(color: Colors.green))
                else
                  ...violations.map((v) => Padding(
                    padding: const EdgeInsets.only(bottom: 8.0),
                    child: Text('• [${v.Metadata.RuleId}] ${v.Metadata.MessageKey}', style: const TextStyle(color: Colors.red)),
                  )).toList(),
              ],
            ),
          ),
          actions: [
            TextButton(
              onPressed: () {
                Navigator.of(ctx).pop();
                setState(() => _isScanning = true); // Resume scanning
              },
              child: const Text('Scan Another'),
            ),
          ],
        ),
      );
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Invalid QR Data: $e')),
      );
      setState(() => _isScanning = true);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Mobile Inspector (Offline)'),
        backgroundColor: Colors.indigo,
        foregroundColor: Colors.white,
      ),
      body: Stack(
        children: [
          MobileScanner(
            controller: _controller,
            onDetect: _onDetect,
          ),
          // QR targeting overlay
          Center(
            child: Container(
              width: 250,
              height: 250,
              decoration: BoxDecoration(
                border: Border.all(color: Colors.greenAccent, width: 4),
                borderRadius: BorderRadius.circular(20),
              ),
            ),
          ),
          Positioned(
            bottom: 40,
            left: 0,
            right: 0,
            child: Center(
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                decoration: BoxDecoration(
                  color: Colors.black54,
                  borderRadius: BorderRadius.circular(30),
                ),
                child: const Text(
                  'Point at GST Invoice QR Code',
                  style: TextStyle(color: Colors.white, fontSize: 16),
                ),
              ),
            ),
          )
        ],
      ),
    );
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }
}

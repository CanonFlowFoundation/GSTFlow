import 'package:flutter/material.dart';
import 'fable_dart/GSTFlow.Core/Library.dart' as core;
import 'fable_dart/fable_modules/fable_library/Result.dart' as fable_result;
import 'scanner_page.dart';

void main() {
  runApp(const GSTFlowApp());
}

class GSTFlowApp extends StatelessWidget {
  const GSTFlowApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'GSTFlow',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.indigo),
        useMaterial3: true,
      ),
      home: const VerificationScreen(),
    );
  }
}

class VerificationScreen extends StatefulWidget {
  const VerificationScreen({super.key});

  @override
  State<VerificationScreen> createState() => _VerificationScreenState();
}

class _VerificationScreenState extends State<VerificationScreen> {
  final TextEditingController _gstinController = TextEditingController();
  String _validationResult = '';
  Color _resultColor = Colors.black;

  void _verifyGstin() {
    final gstinStr = _gstinController.text.trim().toUpperCase();
    if (gstinStr.isEmpty) {
      setState(() {
        _validationResult = 'Please enter a GSTIN';
        _resultColor = Colors.orange;
      });
      return;
    }

    try {
      final result = core.GSTINModule_create(gstinStr);
      if (result is fable_result.FSharpResult\$2_Ok) {
        setState(() {
          _validationResult = '✅ Valid GSTIN Format';
          _resultColor = Colors.green;
        });
      } else if (result is fable_result.FSharpResult\$2_Error) {
        final err = result as fable_result.FSharpResult\$2_Error;
        setState(() {
          _validationResult = '❌ Invalid GSTIN: \${err.ErrorValue}';
          _resultColor = Colors.red;
        });
      }
    } catch (e) {
      setState(() {
        _validationResult = '❌ Error validating GSTIN: \$e';
        _resultColor = Colors.red;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: Theme.of(context).colorScheme.inversePrimary,
        title: const Text('GSTFlow Mobile Inspector'),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const Icon(Icons.security, size: 80, color: Colors.indigo),
            const SizedBox(height: 24),
            TextField(
              controller: _gstinController,
              decoration: const InputDecoration(
                border: OutlineInputBorder(),
                labelText: 'Enter GSTIN (e.g. 27AAAAA0000A1Z5)',
              ),
              textCapitalization: TextCapitalization.characters,
            ),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: _verifyGstin,
              style: ElevatedButton.styleFrom(
                padding: const EdgeInsets.symmetric(vertical: 16),
              ),
              child: const Text('Verify GSTIN Format', style: TextStyle(fontSize: 16)),
            ),
            const SizedBox(height: 16),
            ElevatedButton.icon(
              onPressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (context) => const ScannerPage()),
                );
              },
              icon: const Icon(Icons.qr_code_scanner),
              label: const Text('Scan Invoice QR Code', style: TextStyle(fontSize: 16)),
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.indigo,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 16),
              ),
            ),
            const SizedBox(height: 32),
            Text(
              _validationResult,
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: _resultColor,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

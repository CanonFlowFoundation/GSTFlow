import 'package:flutter/material.dart';
import 'dart:io';
import 'fable_dart/GSTFlow.Core/Library.dart' as core;
import 'fable_dart/fable_modules/fable_library/Result.dart' as fable_result;
import 'scanner_page.dart';

class LlmSubprocessManager {
  Process? _llmProcess;

  Future<void> startHiddenLlmServer() async {
    // Path to the bundled llama.cpp executable inside the Flutter assets/bin folder
    String executablePath = 'assets/bin/llama-server.exe';
    String modelPath = 'assets/models/phi-3-mini.gguf';

    try {
      // Spawn the process silently in the background
      _llmProcess = await Process.start(
        executablePath,
        ['-m', modelPath, '--port', '8080', '--threads', '4'],
        mode: ProcessStartMode.detachedWithStdio, // Hides terminal window on Windows
      );
      print("Local AI Server started successfully in the background.");
    } catch (e) {
      print("Failed to start Local AI Server: \$e");
    }
  }

  void killLlmServer() {
    _llmProcess?.kill();
    print("Local AI Server killed.");
  }
}

final llmManager = LlmSubprocessManager();

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  if (!Platform.isAndroid && !Platform.isIOS) {
    if (Platform.isWindows) {
      await llmManager.startHiddenLlmServer();
    }
  }
  
  runApp(const GSTFlowApp());
}

class GSTFlowApp extends StatefulWidget {
  const GSTFlowApp({super.key});

  @override
  State<GSTFlowApp> createState() => _GSTFlowAppState();
}

class _GSTFlowAppState extends State<GSTFlowApp> with WidgetsBindingObserver {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.detached) {
      if (!Platform.isAndroid && !Platform.isIOS) {
        if (Platform.isWindows) {
          llmManager.killLlmServer();
        }
      }
    }
  }

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
      backgroundColor: const Color(0xFF0F172A), // Tailwind slate-900
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: const Text('GSTFlow Inspector', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.white)),
        centerTitle: true,
      ),
      extendBodyBehindAppBar: true,
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [Color(0xFF0F172A), Color(0xFF1E1B4B)], // slate-900 to indigo-950
          ),
        ),
        child: SafeArea(
          child: Center(
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 16.0),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Container(
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      color: Colors.indigoAccent.withOpacity(0.1),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(Icons.shield_outlined, size: 80, color: Colors.indigoAccent),
                  ),
                  const SizedBox(height: 32),
                  const Text(
                    'Mathematical Assurance.',
                    textAlign: TextAlign.center,
                    style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold, color: Colors.white, letterSpacing: -0.5),
                  ),
                  const SizedBox(height: 8),
                  const Text(
                    'Validate GSTIN formats and scan offline invoices instantly.',
                    textAlign: TextAlign.center,
                    style: TextStyle(fontSize: 16, color: Colors.white70),
                  ),
                  const SizedBox(height: 48),
                  
                  // Verification Card
                  Container(
                    padding: const EdgeInsets.all(24),
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.05),
                      borderRadius: BorderRadius.circular(24),
                      border: Border.all(color: Colors.white.withOpacity(0.1)),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        TextField(
                          controller: _gstinController,
                          style: const TextStyle(color: Colors.white, fontSize: 18, letterSpacing: 1.5),
                          decoration: InputDecoration(
                            filled: true,
                            fillColor: Colors.black.withOpacity(0.2),
                            hintText: 'Enter GSTIN (e.g. 29ABCDE1234F1ZW)',
                            hintStyle: TextStyle(color: Colors.white.withOpacity(0.3), letterSpacing: 0),
                            prefixIcon: const Icon(Icons.business, color: Colors.indigoAccent),
                            border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(16),
                              borderSide: BorderSide.none,
                            ),
                          ),
                          textCapitalization: TextCapitalization.characters,
                        ),
                        const SizedBox(height: 16),
                        ElevatedButton(
                          onPressed: _verifyGstin,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.indigoAccent,
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(vertical: 18),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                            elevation: 0,
                          ),
                          child: const Text('Verify Format', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                        ),
                        if (_validationResult.isNotEmpty) ...[
                          const SizedBox(height: 20),
                          Container(
                            padding: const EdgeInsets.all(16),
                            decoration: BoxDecoration(
                              color: _resultColor.withOpacity(0.1),
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(color: _resultColor.withOpacity(0.3)),
                            ),
                            child: Text(
                              _validationResult,
                              textAlign: TextAlign.center,
                              style: TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.w600,
                                color: _resultColor == Colors.green ? Colors.greenAccent : Colors.redAccent,
                              ),
                            ),
                          ),
                        ]
                      ],
                    ),
                  ),
                  
                  const SizedBox(height: 32),
                  
                  // Scanner Button
                  ElevatedButton.icon(
                    onPressed: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(builder: (context) => const ScannerPage()),
                      );
                    },
                    icon: const Icon(Icons.qr_code_scanner, size: 24),
                    label: const Text('Scan Offline Invoice', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600)),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.white,
                      foregroundColor: const Color(0xFF0F172A),
                      padding: const EdgeInsets.symmetric(vertical: 20),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                      elevation: 10,
                      shadowColor: Colors.white.withOpacity(0.2),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}

import 'dart:convert';
import 'fable_dart/GSTFlow.Rules/Library.dart';
import 'fable_dart/GSTFlow.Core/Library.dart' as core;
import 'fable_dart/fable_modules/fable_library/Types.dart' as types;
import 'fable_dart/fable_modules/fable_library/List.dart' as f_list;
import 'fable_dart/fable_modules/fable_library/Decimal.dart' as f_decimal;

class InvoiceParser {
  static types.Some<T>? _opt<T>(T? value) {
    return value == null ? null : types.Some(value);
  }

  static core.TaxAmount _parseTax(Map<String, dynamic> json) {
    return core.TaxAmount(
      f_decimal.Decimal.parse(json['Igst']?.toString() ?? '0'),
      f_decimal.Decimal.parse(json['Cgst']?.toString() ?? '0'),
      f_decimal.Decimal.parse(json['Sgst']?.toString() ?? '0'),
      json['Cess'] != null ? _opt(f_decimal.Decimal.parse(json['Cess'].toString())) : null,
      json['StateCess'] != null ? _opt(f_decimal.Decimal.parse(json['StateCess'].toString())) : null,
    );
  }

  static RawParty _parseParty(Map<String, dynamic> json) {
    return RawParty(
      json['Gstin'] as String,
      json['StateCode'] as String,
      json['IsSez'] != null ? _opt(json['IsSez'] as bool) : null,
    );
  }

  static RawInvoiceItem _parseItem(Map<String, dynamic> json) {
    return RawInvoiceItem(
      json['Hsn'] as String,
      f_decimal.Decimal.parse(json['TaxableValue'].toString()),
      f_decimal.Decimal.parse(json['GstRate'].toString()),
      json['CessRate'] != null ? _opt(f_decimal.Decimal.parse(json['CessRate'].toString())) : null,
      _parseTax(json['Tax'] as Map<String, dynamic>),
    );
  }

  static RawInvoice parse(String jsonString) {
    final Map<String, dynamic> map = jsonDecode(jsonString);

    final List<dynamic> itemsList = map['Items'] as List<dynamic>;
    final dartItems = itemsList.map((e) => _parseItem(e as Map<String, dynamic>)).toList();
    
    // Convert Dart List to FSharpList
    final fList = f_list.ofArray(dartItems);

    return RawInvoice(
      _opt(map['DocumentType'] as String?),
      map['InvoiceNumber'] as String,
      map['InvoiceDate'] as String,
      _opt(map['PlaceOfSupply'] as String?),
      _opt(map['OriginalInvoiceNumber'] as String?),
      _opt(map['OriginalInvoiceDate'] as String?),
      _opt(map['Irn'] as String?),
      _opt(map['ReverseCharge'] as String?),
      _parseParty(map['Seller'] as Map<String, dynamic>),
      map['Buyer'] != null ? _opt(_parseParty(map['Buyer'] as Map<String, dynamic>)) : null,
      fList,
    );
  }
}

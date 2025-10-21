import 'dart:convert';
import 'package:http/http.dart' as http;
import '../main.dart';

class ApiClient {
  ApiClient({http.Client? httpClient}) : _client = httpClient ?? http.Client();

  final http.Client _client;

  String get _baseUrl => FStudyMateApp.backendBaseUrl;

  Uri _uri(String path) => Uri.parse('$_baseUrl$path');

  Future<String?> login({required String username, required String password}) async {
    final response = await _client.post(
      _uri('/api/auth/login'),
      headers: {
        'Content-Type': 'application/json',
      },
      body: jsonEncode({
        'username': username,
        'password': password,
      }),
    );

    if (response.statusCode >= 200 && response.statusCode < 300) {
      try {
        final json = jsonDecode(response.body) as Map<String, dynamic>;
        // Adjust based on your backend response shape
        return (json['token'] ?? json['accessToken']) as String?;
      } catch (_) {
        return null;
      }
    }
    return null;
  }
}








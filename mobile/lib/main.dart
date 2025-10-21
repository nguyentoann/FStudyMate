import 'package:flutter/material.dart';
import 'screens/splash_screen.dart';
import 'screens/login_screen.dart';
import 'screens/home_screen.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const FStudyMateApp());
}

class FStudyMateApp extends StatelessWidget {
  const FStudyMateApp({super.key});

  static const String defaultBaseUrl = 'http://10.0.2.2:8080';
  static const String envBaseUrl = String.fromEnvironment('BACKEND_BASE_URL');

  static String get backendBaseUrl => envBaseUrl.isNotEmpty ? envBaseUrl : defaultBaseUrl;

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'FStudyMate',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.blue),
        useMaterial3: true,
      ),
      routes: {
        SplashScreen.routeName: (_) => const SplashScreen(),
        LoginScreen.routeName: (_) => const LoginScreen(),
        HomeScreen.routeName: (_) => const HomeScreen(),
      },
      initialRoute: SplashScreen.routeName,
    );
  }
}








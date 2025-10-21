# FStudyMate Mobile (Flutter)

This is a minimal Flutter app scaffold for FStudyMate, intended to connect to your existing Spring backend.

## Prerequisites
- Flutter SDK installed (run `flutter --version` to verify)
- Android Studio or Xcode set up for a target platform

## Project Setup
This folder contains a lightweight scaffold. Generate platform folders (Android/iOS/web) first:

```bash
cd mobile
flutter create .
```

## Run the App
Pass the backend base URL via `--dart-define` at run time.

```bash
flutter run \
  --dart-define=BACKEND_BASE_URL=http://10.0.2.2:8080
```

- On Android emulator, Spring Boot at `localhost:8080` is reachable via `http://10.0.2.2:8080`.
- On a physical device, use your machine IP (e.g., `http://192.168.1.50:8080`).

## Configuration
- The app reads the backend base URL from `const String.fromEnvironment('BACKEND_BASE_URL')`.
- Default fallback is `http://10.0.2.2:8080` if not provided.

## Structure
```
mobile/
  lib/
    api/
      api_client.dart
    screens/
      splash_screen.dart
      login_screen.dart
      home_screen.dart
    main.dart
  pubspec.yaml
```

## Notes
- Endpoints are placeholders. Update them in `lib/api/api_client.dart` to match your backend.
- Add authentication/token storage as needed (e.g., using `shared_preferences`).








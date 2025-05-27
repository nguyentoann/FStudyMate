# Vin Multiple Choice Application

This is a modern web application built with Spring Boot for the backend and React for the frontend.

## Project Structure

- `src/main/java` - Java source code for the Spring Boot backend
- `frontend` - React.js frontend application

## Prerequisites

- JDK 21
- Node.js 16+ and npm
- MySQL database

## Database Setup

1. Create a MySQL database named `vinmultiplechoice`
2. The application will create the necessary tables on first run

## Backend Setup (Spring Boot)

1. Configure the database connection in `src/main/resources/application.properties` if needed
2. Run the Spring Boot application:

```bash
# Using Maven
./mvnw spring-boot:run

# Or on Windows
mvnw.cmd spring-boot:run
```

The backend API will be available at http://localhost:8080

## Frontend Setup (React)

1. Navigate to the frontend directory:

```bash
cd frontend
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm start
```

The frontend will be available at http://localhost:3000

## Building for Production

To build both the frontend and backend for production:

1. Build the React frontend:

```bash
cd frontend
npm run build
```

2. Build the Spring Boot application:

```bash
./mvnw clean package
```

This will create a single JAR file that includes both the backend and frontend.

3. Run the application:

```bash
java -jar target/FStudyMate-1.0-SNAPSHOT.jar
```

## Features

- View and select different test subjects (MaMon)
- View and select different test codes (MaDe)
- Take quizzes with randomized questions
- Timed quiz mode
- View test results and correct answers 
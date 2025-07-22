# FStudyMate Development Setup Guidef

This guide provides step-by-step instructions for setting up the FStudyMate development environment on your local machine.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Java Development Kit (JDK) 21**
  - [Download from Oracle](https://www.oracle.com/java/technologies/downloads/#java21)
  - Or install using a package manager:
    ```bash
    # Using Homebrew (macOS)
    brew install openjdk@21

    # Using Chocolatey (Windows)
    choco install openjdk21
    ```

- **Node.js (v16+) and npm**
  - [Download from Node.js website](https://nodejs.org/)
  - Or install using a package manager:
    ```bash
    # Using Homebrew (macOS)
    brew install node

    # Using Chocolatey (Windows)
    choco install nodejs
    ```

- **MySQL Database**
  - [Download MySQL Community Server](https://dev.mysql.com/downloads/mysql/)
  - Or install using a package manager:
    ```bash
    # Using Homebrew (macOS)
    brew install mysql

    # Using Chocolatey (Windows)
    choco install mysql
    ```

- **Git**
  - [Download from Git website](https://git-scm.com/downloads)
  - Or install using a package manager:
    ```bash
    # Using Homebrew (macOS)
    brew install git

    # Using Chocolatey (Windows)
    choco install git
    ```

## Step 1: Clone the Repository

```bash
git clone https://github.com/yourusername/FStudyMate.git
cd FStudyMate
```

## Step 2: Set Up the Database

1. Start MySQL server if it's not already running:
   ```bash
   # macOS
   brew services start mysql

   # Windows
   net start mysql
   ```

2. Create a new database:
   ```bash
   mysql -u root -p
   ```

   Then in the MySQL shell:
   ```sql
   CREATE DATABASE fstudymate;
   CREATE USER 'fstudyuser'@'localhost' IDENTIFIED BY 'password';
   GRANT ALL PRIVILEGES ON fstudymate.* TO 'fstudyuser'@'localhost';
   FLUSH PRIVILEGES;
   EXIT;
   ```

## Step 3: Configure the Backend

1. Navigate to the application properties file:
   ```bash
   cd src/main/resources
   ```

2. Create or modify `application.properties` with the following content:
   ```properties
   # Database Configuration
   spring.datasource.url=jdbc:mysql://localhost:3306/fstudymate?useSSL=false&serverTimezone=UTC
   spring.datasource.username=fstudyuser
   spring.datasource.password=password
   spring.jpa.hibernate.ddl-auto=update
   spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQLDialect

   # Server Configuration
   server.port=8080

   # JWT Configuration
   jwt.secret=yourSecretKey
   jwt.expiration=86400000

   # Email Configuration (if using email services)
   spring.mail.host=smtp.gmail.com
   spring.mail.port=587
   spring.mail.username=your-email@gmail.com
   spring.mail.password=your-app-password
   spring.mail.properties.mail.smtp.auth=true
   spring.mail.properties.mail.smtp.starttls.enable=true
   ```

   > **Note:** Replace placeholders with your actual values. For production, never commit sensitive information to version control.

## Step 4: Build and Run the Backend

1. Return to the project root and build the Spring Boot application:
   ```bash
   # On macOS/Linux
   ./mvnw clean install

   # On Windows
   mvnw.cmd clean install
   ```

2. Run the Spring Boot application:
   ```bash
   # On macOS/Linux
   ./mvnw spring-boot:run

   # On Windows
   mvnw.cmd spring-boot:run
   ```

   The backend will start on http://localhost:8080

## Step 5: Set Up the Frontend

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the frontend directory:
   ```
   REACT_APP_API_URL=http://localhost:8080/api
   ```

4. Start the React development server:
   ```bash
   npm start
   ```

   The frontend will start on https://localhost:3000

## Step 6: Verify Your Setup

1. Open your browser and navigate to http://localhost:3000
2. You should see the FStudyMate landing page
3. Try registering a new account to verify the connection to the backend

## Troubleshooting Common Issues

### Backend Won't Start

- **Java Version Issue**: Ensure you're using JDK 21
  ```bash
  java -version
  ```

- **Port Already in Use**: Change the port in `application.properties` if port 8080 is already in use
  ```properties
  server.port=8081
  ```

- **Database Connection Issues**: Verify MySQL is running and credentials are correct
  ```bash
  mysql -u fstudyuser -p
  ```

### Frontend Won't Start

- **Node Version Issue**: Ensure you're using Node.js v16+
  ```bash
  node -v
  ```

- **Dependency Issues**: Try clearing npm cache and reinstalling
  ```bash
  npm cache clean --force
  rm -rf node_modules
  npm install
  ```

- **API Connection Issues**: Check that the backend is running and the API URL in `.env` is correct

## Running Tests

### Backend Tests

```bash
# Run all tests
./mvnw test

# Run specific test class
./mvnw test -Dtest=UserServiceTest
```

### Frontend Tests

```bash
cd frontend
npm test
```

## Development Workflow

1. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**:
   - Write code
   - Write tests
   - Ensure code passes linting

3. **Commit your changes**:
   ```bash
   git add .
   git commit -m "Description of your changes"
   ```

4. **Push to the remote repository**:
   ```bash
   git push origin feature/your-feature-name
   ```

5. **Create a pull request** for code review

## Using Environment Scripts

For convenience, you can use the provided scripts:

- **run-app.bat** (Windows): Runs both frontend and backend
- **load-env.bat/sh**: Loads environment variables
- **run-with-env.bat**: Runs the application with environment variables

## Additional Resources

- [Project Documentation](README.md)
- [API Documentation](frontend/src/docs/API.md)
- [Component Documentation](frontend/src/docs/COMPONENTS.md)
- [Math Rendering Documentation](frontend/src/docs/MATH_RENDERING.md)

## Getting Help

If you encounter issues not covered in this guide:

1. Check the [Project Issues](https://github.com/yourusername/FStudyMate/issues) page
2. Contact the project maintainers
3. Check the [Project Wiki](https://github.com/yourusername/FStudyMate/wiki) for additional documentation 

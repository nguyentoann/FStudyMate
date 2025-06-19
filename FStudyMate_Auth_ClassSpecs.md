## b. Class Specifications

### ProductsView Class
[Front-end component that displays the products list to administrators]

| No | Method | Description |
|----|--------|-------------|
| 01 | render() | Renders the products view with current data. Takes the products data as input and outputs the HTML representation of the products list. |
| 02 | fillProductsView(productsList) | Updates the view with products data received from the controller. Takes a list of product objects and updates the UI elements to display the product information. |
| 03 | showError(message) | Displays an error message to the user. Takes an error message string and renders it in the UI. Used for unauthorized access messages. |

### ProductController Class
[Handles product management actions and business logic]

| No | Method | Description |
|----|--------|-------------|
| 01 | doGet(request, response) | Handles HTTP GET requests for product listing. Takes HttpServletRequest and HttpServletResponse objects, validates user permissions, retrieves product data, and returns the appropriate view. |
| 02 | doPost(request, response) | Handles HTTP POST requests for product updates. Takes HttpServletRequest and HttpServletResponse objects, validates inputs, performs the requested product update operation, and returns the result. |
| 03 | getRead() | Internal method that checks if the user has read permission for products. No parameters, returns a boolean indicating if read access is granted. |
| 04 | getWrite() | Internal method that checks if the user has write permission for products. No parameters, returns a boolean indicating if write access is granted. |

### RequestFilter Class
[Authentication and authorization filter for all incoming requests]

| No | Method | Description |
|----|--------|-------------|
| 01 | doFilter(request, response, chain) | Entry point for the filter chain. Takes ServletRequest, ServletResponse, and FilterChain objects. Authenticates the user session, verifies permissions, and either allows the request to proceed or redirects to login. |
| 02 | initDbConn() | Initializes the database connection for the filter. Takes no parameters and returns a Connection object. Handles any connection errors. |
| 03 | checkUserInfo(request) | Validates the user session information. Takes the HttpServletRequest object, extracts session data, and returns a User object if valid, null otherwise. |

### BaseController Class
[Base class with common functionality for all controllers]

| No | Method | Description |
|----|--------|-------------|
| 01 | initDbConn() | Initializes a database connection. Takes no parameters and returns a Connection object. Handles connection pooling and error logging. |
| 02 | checkUserInfo(request) | Validates the current user session. Takes HttpServletRequest as input and returns the User object if valid, or null if invalid. |
| 03 | checkAccessRight(user, module) | Verifies if a user has access to a specific module. Takes a User object and a module name string, returns a boolean indicating whether access is granted. |
| 04 | redirect(response, path) | Redirects the user to a different page. Takes HttpServletResponse and a target path string, performs the redirect. |

### MyUtils Class
[Utility functions used across the application]

| No | Method | Description |
|----|--------|-------------|
| 01 | getDbConnection() | Creates and returns a database connection from the connection pool. Takes no parameters, returns a Connection object. Handles retries and connection errors. |
| 02 | closeConnection(connection) | Safely closes a database connection. Takes a Connection object and ensures proper release of resources. |
| 03 | storeUserInSession(session, user) | Stores user information in the session. Takes HttpSession and User objects, saves the user data for future requests. |
| 04 | getUserFromSession(session) | Retrieves user information from the session. Takes HttpSession object, returns User object or null if not found. |

### ProductDao Class
[Data access object for product-related database operations]

| No | Method | Description |
|----|--------|-------------|
| 01 | queryProducts(connection) | Retrieves all products from the database. Takes a Connection object, executes the SQL query to fetch products, and returns a list of Product objects. |
| 02 | getProductById(connection, id) | Retrieves a specific product by ID. Takes a Connection object and product ID, returns the Product object if found or null if not found. |
| 03 | insertProduct(connection, product) | Creates a new product record. Takes a Connection object and Product object, inserts the data into the database, and returns the ID of the new product. |
| 04 | updateProduct(connection, product) | Updates an existing product. Takes a Connection object and Product object with updated values, executes the SQL update, and returns boolean indicating success. |
| 05 | deleteProduct(connection, id) | Removes a product from the database. Takes a Connection object and product ID, executes the SQL delete statement, and returns boolean indicating success. |

### AuthController Class
[REST controller for handling authentication requests]

| No | Method | Description |
|----|--------|-------------|
| 01 | login(credentials) | Handles user login requests. Takes a Map containing email and password, validates credentials against the database, and returns a ResponseEntity with user information or error message. Includes fallback for test accounts. |
| 02 | register(userData) | Processes user registration. Takes a Map with user details (email, password, username, etc.), creates a User object, saves it to the database, generates an OTP for email verification, and returns a ResponseEntity with registration status. |
| 03 | verifyOtp(verificationData) | Verifies the one-time password sent to user's email. Takes a Map with email and OTP, validates it using the OtpService, and returns a ResponseEntity with verification status. |
| 04 | generateOtp(data) | Generates a new OTP for an existing user. Takes a Map with the user's email, finds the user in the database, generates a new OTP, and returns a ResponseEntity with the operation status. |

### AuthService Interface
[Service interface for authentication operations]

| No | Method | Description |
|----|--------|-------------|
| 01 | login(email, password) | Authenticates a user with email and password. Takes email and password strings, returns User object if authentication succeeds, throws exception otherwise. |
| 02 | register(user) | Registers a new user. Takes a User object with registration details, saves it to the database with a hashed password, and returns the saved User object. |
| 03 | verifyAccount(email, otp) | Verifies a user account with OTP. Takes email and OTP strings, returns boolean indicating verification success. |
| 04 | getUserRepository() | Returns the UserRepository instance. Takes no parameters, returns UserRepository object. |
| 05 | generateOtpForEmail(email) | Generates a new OTP for the specified email. Takes email string, returns the generated OTP string. |

### AuthServiceImpl Class
[Implementation of the AuthService interface]

| No | Method | Description |
|----|--------|-------------|
| 01 | login(email, password) | Implements user authentication. Takes email and password strings, retrieves user from database, verifies password hash, checks verification status, and returns User object or throws exception. |
| 02 | register(user) | Implements user registration. Takes User object, checks for existing email, hashes the password, sets verification status to false, saves user to database, generates and sends OTP, and returns saved User object. |
| 03 | verifyAccount(email, otp) | Implements account verification. Takes email and OTP strings, validates OTP using OtpService, marks user as verified if valid, and returns boolean indicating success. |
| 04 | getUserRepository() | Returns the autowired UserRepository instance. Takes no parameters, returns UserRepository object. |
| 05 | generateOtpForEmail(email) | Delegates OTP generation to OtpService. Takes email string, returns the generated OTP string. |

### OtpService Interface
[Service interface for OTP operations]

| No | Method | Description |
|----|--------|-------------|
| 01 | generateAndSendOtp(email) | Generates a new OTP for the given email and sends it. Takes email string, returns the generated OTP string. |
| 02 | validateOtp(email, otp) | Validates an OTP for the given email. Takes email and OTP strings, returns boolean indicating if OTP is valid. |
| 03 | markUserAsVerified(email) | Marks a user as verified after successful OTP validation. Takes email string, returns boolean indicating success. |

### OtpServiceImpl Class
[Implementation of the OtpService interface]

| No | Method | Description |
|----|--------|-------------|
| 01 | generateOtp() | Creates a random numeric OTP. Takes no parameters, returns OTP string of specified length. |
| 02 | generateAndSendOtp(email) | Implements OTP generation and delivery. Takes email string, invalidates existing OTPs, creates new OTP, saves to database, sends via EmailService, and returns OTP string. |
| 03 | validateOtp(email, otp) | Implements OTP validation. Takes email and OTP strings, checks database for matching OTP, verifies it's not expired or used, marks as used if valid, and returns boolean indicating validity. |
| 04 | markUserAsVerified(email) | Implements user verification. Takes email string, finds user in database, sets verified status to true, saves user, sends welcome email, and returns boolean indicating success. |

### EmailService Interface
[Service interface for email operations]

| No | Method | Description |
|----|--------|-------------|
| 01 | sendSimpleEmail(to, subject, body) | Sends a simple text email. Takes recipient email, subject, and body strings. |
| 02 | sendHtmlEmail(to, subject, htmlBody) | Sends an HTML-formatted email. Takes recipient email, subject, and HTML body strings. |
| 03 | sendOtpEmail(to, otp) | Sends an email containing OTP. Takes recipient email and OTP strings, returns boolean indicating success. |
| 04 | sendNotificationEmail(to, subject, message) | Sends a notification email. Takes recipient email, subject, and message strings, returns boolean indicating success. |

### EmailServiceImpl Class
[Implementation of the EmailService interface]

| No | Method | Description |
|----|--------|-------------|
| 01 | sendSimpleEmail(to, subject, body) | Implements simple email sending. Takes recipient email, subject, and body strings, uses JavaMailSender to send plain text email. |
| 02 | sendHtmlEmail(to, subject, htmlBody) | Implements HTML email sending. Takes recipient email, subject, and HTML body strings, uses MimeMessage and MimeMessageHelper to send HTML-formatted email. |
| 03 | sendOtpEmail(to, otp) | Implements OTP email sending. Takes recipient email and OTP strings, creates HTML email with OTP formatted in a styled template, and returns boolean indicating success. |
| 04 | sendNotificationEmail(to, subject, message) | Implements notification email sending. Takes recipient email, subject, and message strings, creates HTML email with the notification message, and returns boolean indicating success. |

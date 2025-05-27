<%-- 
    Document   : index2
    Created on : 14 thg 4, 2025, 07:45:15
    Author     : todin
--%>
<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>My JSP Website</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
                font-family: Arial, sans-serif;
            }

            body {
                background-color: #f4f4f4;
                color: #333;
                line-height: 1.6;
            }

            .container {
                width: 80%;
                margin: 0 auto;
                overflow: hidden;
            }

            /* Header Styles */
            header {
                background: #50b3a2;
                color: white;
                padding: 20px 0;
                margin-bottom: 30px;
            }

            header h1 {
                float: left;
            }

            /* Navigation Styles */
            nav {
                float: right;
                margin-top: 10px;
            }

            nav ul {
                list-style: none;
            }

            nav li {
                display: inline;
                margin: 0 15px;
            }

            nav a {
                color: white;
                text-decoration: none;
                text-transform: uppercase;
                font-size: 18px;
            }

            nav a:hover {
                color: #e8e8e8;
                border-bottom: 2px solid #e8e8e8;
            }

            /* Main Content */
            .main-content {
                background: white;
                padding: 30px;
                margin-bottom: 30px;
                border-radius: 5px;
                box-shadow: 0 2px 5px rgba(0,0,0,0.1);
            }

            .main-content h2 {
                margin-bottom: 20px;
                color: #50b3a2;
            }

            /* Sidebar */
            aside {
                float: right;
                width: 30%;
                background: #e8e8e8;
                padding: 20px;
                margin-bottom: 30px;
                border-radius: 5px;
            }

            aside h3 {
                margin-bottom: 15px;
            }

            /* Footer */
            footer {
                background: #333;
                color: white;
                text-align: center;
                padding: 20px;
                clear: both;
            }

            /* Form Styles */
            .form-group {
                margin-bottom: 15px;
            }

            label {
                display: block;
                margin-bottom: 5px;
            }

            input[type="text"], input[type="email"], textarea {
                width: 100%;
                padding: 10px;
                border: 1px solid #ddd;
            }

            button {
                background: #50b3a2;
                color: white;
                padding: 10px 15px;
                border: none;
                cursor: pointer;
            }

            button:hover {
                background: #429e8e;
            }
        </style>
    </head>
    <body>
        <header>
            <div class="container">
                <h1>My Website</h1>
                <nav>
                    <ul>
                        <li><a href="#">Home</a></li>
                        <li><a href="#">About</a></li>
                        <li><a href="#">Services</a></li>
                        <li><a href="#">Contact</a></li>
                    </ul>
                </nav>
            </div>
        </header>

        <div class="container">
            <section class="main-content">
                <h2>Welcome to My Website</h2>
                <p>This is a simple JSP webpage with a clean and responsive design. You can customize this content according to your needs.</p>
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus lacinia odio vitae vestibulum vestibulum. Cras porttitor metus justo, ut sodales dui eleifend sit amet.</p>

                <h3>Features</h3>
                <ul>
                    <li>Responsive Design</li>
                    <li>Clean Layout</li>
                    <li>Easy to Customize</li>
                    <li>Contact Form</li>
                </ul>

                <h3>Contact Us</h3>
                <form action="processForm.jsp" method="post">
                    <div class="form-group">
                        <label for="name">Name:</label>
                        <input type="text" id="name" name="name" required>
                    </div>

                    <div class="form-group">
                        <label for="email">Email:</label>
                        <input type="email" id="email" name="email" required>
                    </div>

                    <div class="form-group">
                        <label for="message">Message:</label>
                        <textarea id="message" name="message" rows="5" required></textarea>
                    </div>

                    <button type="submit">Send Message</button>
                </form>
            </section>

            <aside>
                <h3>Recent Posts</h3>
                <ul>
                    <li><a href="#">Post Title 1</a></li>
                    <li><a href="#">Post Title 2</a></li>
                    <li><a href="#">Post Title 3</a></li>
                    <li><a href="#">Post Title 4</a></li>
                </ul>

                <%-- JSP Dynamic Content Example --%>
                <h3>Current Date and Time</h3>
                <p><%= new java.util.Date()%></p>
            </aside>
        </div>

        <footer>
            <div class="container">
                <p>&copy; <%= java.time.Year.now()%> My Website. All Rights Reserved.</p>
            </div>
        </footer>
    </body>
</html>

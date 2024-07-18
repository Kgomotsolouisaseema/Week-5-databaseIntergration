const express = require('express');
const app = express();
const dotenv = require('dotenv');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const cors = require('cors');

dotenv.config();
app.use(express.json());
app.use(cors());

// MySQL Connection Configuration
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE
});

// Connect to MySQL
connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL database.');

  // Create users table if not exists
  const createUsersTable = `
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(255) NOT NULL UNIQUE,
      username VARCHAR(100) NOT NULL,
      password VARCHAR(100) NOT NULL
    )
  `;

  connection.query(createUsersTable, (error, results, fields) => {
    if (error) {
      console.error('Error creating users table:', error);
      return;
    }
    console.log('Users table created successfully.');
  });
});

// User registration route
app.post('/api/register', async (req, res) => {
  try {
    const { email, username, password } = req.body;

    // Check if user already exists
    const checkUserQuery = `SELECT * FROM users WHERE email = ?`;
    connection.query(checkUserQuery, [email], async (err, data) => {
      if (err) {
        console.error('Error checking user existence:', err);
        return res.status(500).json({ message: 'Internal Server Error' });
      }
      if (data.length > 0) {
        return res.status(409).json({ message: 'User already exists' });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Insert new user into database
      const insertUserQuery = `INSERT INTO users (email, username, password) VALUES (?, ?, ?)`;
      connection.query(insertUserQuery, [email, username, hashedPassword], (err, result) => {
        if (err) {
          console.error('Error inserting new user:', err);
          return res.status(500).json({ message: 'Internal Server Error' });
        }
        return res.status(200).json({ message: 'User created successfully' });
      });
    });
  } catch (err) {
    console.error('Error in user registration:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// User login route
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const getUserQuery = `SELECT * FROM users WHERE email = ?`;
    connection.query(getUserQuery, [email], async (err, data) => {
      if (err) {
        console.error('Error fetching user:', err);
        return res.status(500).json({ message: 'Internal Server Error' });
      }
      if (data.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Validate password
      const isPasswordValid = await bcrypt.compare(password, data[0].password);
      if (!isPasswordValid) {
        return res.status(400).json({ message: 'Invalid email or password' });
      }

      // Successful login
      return res.status(200).json({ message: 'Login successful' });
    });
  } catch (err) {
    console.error('Error in user login:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on PORT ${PORT}`);
});

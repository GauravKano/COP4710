const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PATCH, DELETE, OPTIONS'
  );
  next();
});

const db = mysql.createConnection({
  host: '35.175.224.17',
  user: 'root',
  password: '',
  database: 'College_Event_Manager'
});

db.connect(err => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL database');
});

// Login endpoint
app.post('/login', async (req, res) => {
  try {
    const { UID, password } = req.body;

    if (!UID || !password) {
      return res.status(400).json({ message: 'UID and password are required' });
    }

    // Check if user exists
    db.query('SELECT * FROM Users WHERE UID = ?', [UID], async (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Database error' });
      }

      if (results.length === 0) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const user = results[0];

      // Compare passwords
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Successful login
      const userData = { UID: user.UID };
      res.status(200).json({
        message: 'Login successful',
        user: userData
      });
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});


// Register endpoint
app.post('/register', async (req, res) => {
    try {
      const { UID, password } = req.body;
  
      if (!UID || !password) {
        return res.status(400).json({ message: 'UID and password are required' });
      }
  
      // Check if user already exists
      db.query('SELECT * FROM Users WHERE UID = ?', [UID], async (err, results) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ message: 'Database error' });
        }
  
        if (results.length > 0) {
          return res.status(400).json({ message: 'User already exists' });
        }
  
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
  
        // Insert new user
        db.query('INSERT INTO Users (UID, password) VALUES (?, ?)', [UID, hashedPassword], (err) => {
          if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ message: 'Database error' });
          }
  
          res.status(201).json({ message: 'User registered successfully' });
        });
      });
  
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ message: 'Server error during registration' });
    }
});

app.listen(3001, '0.0.0.0', () => {
    console.log("Server is running on port 3001");
  });
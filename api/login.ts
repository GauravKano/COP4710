import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import mysql from 'mysql2';

const app = express();
const port = 3000;

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Create a MySQL connection pool
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root', 
  password: 'password', 
  database: 'College_Event_Manager', 
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Login endpoint
app.post('/login', async (req: Request, res: Response) => {
  const { UID, password } = req.body;

  if (!UID || !password) {
    return res.status(400).json({ message: 'UID and password are required' });
  }

  try {
    // Query the database to find the user
    const [rows] = await pool.promise().query(
      'SELECT * FROM Users WHERE UID = ? AND password = ?',
      [UID, password]
    );

    if (Array.isArray(rows) && rows.length > 0) {
      // User found, login successful
      return res.status(200).json({ message: 'Login successful', user: rows[0] });
    } else {
      // User not found or invalid credentials
      return res.status(401).json({ message: 'Invalid UID or password' });
    }
  } catch (error) {
    console.error('Error during login:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
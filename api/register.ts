import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import bcrypt from 'bcrypt';
import { createPool, Pool } from 'mysql2/promise';

// Database connection setup
const pool: Pool = createPool({
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'College_Event_Manager',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());

// Types
interface User {
  UID: string;
  password: string;
}

interface RegisterRequest {
  username: string;
  password: string;
}

// Register endpoint
app.post('/register', async (req: Request, res: Response) => {
  let connection;
  try {
    const { username, password }: RegisterRequest = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    if (username.length > 20) {
      return res.status(400).json({ error: 'Username must be 20 characters or less' });
    }

    // Get a connection from the pool
    connection = await pool.getConnection();

    // Check if user already exists
    const [existingUsers] = await connection.query(
      'SELECT UID FROM Users WHERE UID = ?',
      [username]
    );

    if (Array.isArray(existingUsers) && existingUsers.length > 0) {
      return res.status(409).json({ error: 'Username already exists' });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user
    const [result] = await connection.query(
      'INSERT INTO Users (UID, password) VALUES (?, ?)',
      [username, hashedPassword]
    );

    // Type assertion for the result
    const insertResult = result as { affectedRows: number, insertId: number };

    if (insertResult.affectedRows !== 1) {
      throw new Error('Failed to create user');
    }

    res.status(201).json({ 
      message: 'User registered successfully',
      userId: username 
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

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
  socketPath: '/run/mysqld/mysqld.sock',
  user: 'root',
  password: 'password',
  database: 'College_Event_Manager'
});

db.connect(err => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL database');
});

// token
const authenticateUser = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Authorization token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    db.query('SELECT * FROM Users WHERE email = ?', [email], async (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Database error' });
      }

      if (results.length === 0) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const user = results[0];

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      res.status(200).json({ message: 'Login successful', user });
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Register User
app.post('/api/register', async (req, res) => {
  try {
    const { username, email, password, user_type, university_id } = req.body;

    if (!username || !email || !password || !user_type) {
      return res.status(400).json({ 
        message: 'Username, email, password, and user_type are required' 
      });
    }

    // Check user_type
    if (!['super_admin', 'admin', 'student'].includes(user_type)) {
      return res.status(400).json({ message: 'Invalid user type' });
    }

    // Check if user already exists
    db.query('SELECT * FROM Users WHERE email = ?', [email], async (err, results) => {
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
      db.query(
        'INSERT INTO Users (username, email, password, user_type, university_id) VALUES (?, ?, ?, ?, ?)', 
        [username, email, hashedPassword, user_type, university_id || null], 
        (err, results) => {
          if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ message: 'Database error' });
          }

          // Return the created user
          const newUser = {
            id: results.insertId,
            username,
            email,
            user_type,
            university_id: university_id || null
          };

          res.status(201).json({ 
            message: 'User registered successfully',
            user: newUser
          });
        }
      );
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// Delete User
app.delete('/api/users/:id', (req, res) => {
  try {
    const userId = req.params.id;

    // First check if user exists
    db.query('SELECT * FROM Users WHERE id = ?', [userId], (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Database error' });
      }
      if (results.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }

      const user = results[0];

      // Super Admin
      if (user.user_type === 'super_admin') {
        return res.status(403).json({ 
          message: 'Cannot delete super_admin account through this endpoint' 
        });
      }

      // Delete the user
      db.query('DELETE FROM Users WHERE id = ?', [userId], (err) => {
        if (err) {
          console.error('Database error:', err);
          
          // Foreign key constraint errors
          if (err.code === 'ER_ROW_IS_REFERENCED_2') {
            return res.status(409).json({ 
              message: 'Cannot delete user because they have associated records. Delete associated events or transfer ownership first.'
            });
          }
          
          return res.status(500).json({ message: 'Failed to delete user' });
        }

        res.status(200).json({
          message: 'User deleted successfully',
          deleted_user_id: userId
        });
      });
    });

  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Server error during user deletion' });
  }
});

// Add University
app.post('/api/universities', (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'University name is required' });
    }

    // Check if university already exists
    db.query('SELECT * FROM Universities WHERE name = ?', [name], (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Database error' });
      }

      if (results.length > 0) {
        return res.status(400).json({ message: 'University already exists' });
      }

      // Insert new university
      db.query('INSERT INTO Universities (name) VALUES (?)', [name], (err, results) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ message: 'Failed to create university' });
        }

        // Return the created university
        db.query('SELECT * FROM Universities WHERE id = ?', [results.insertId], (err, universityResults) => {
          if (err || universityResults.length === 0) {
            return res.status(201).json({ 
              message: 'University created successfully (but could not retrieve details)',
              university_id: results.insertId
            });
          }

          res.status(201).json({
            message: 'University created successfully',
            university: universityResults[0]
          });
        });
      });
    });

  } catch (error) {
    console.error('Create university error:', error);
    res.status(500).json({ message: 'Server error during university creation' });
  }
});

// Get All Universities
app.get('/api/universities', (req, res) => {
  try {
    db.query('SELECT * FROM Universities', (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Failed to fetch universities' });
      }
      res.status(200).json(results);
    });
  } catch (error) {
    console.error('Get universities error:', error);
    res.status(500).json({ message: 'Server error while fetching universities' });
  }
});

// Get Single University
app.get('/api/universities/:id', (req, res) => {
  try {
    const universityId = req.params.id;
    db.query('SELECT * FROM Universities WHERE id = ?', [universityId], (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Failed to fetch university' });
      }
      if (results.length === 0) {
        return res.status(404).json({ message: 'University not found' });
      }
      res.status(200).json(results[0]);
    });
  } catch (error) {
    console.error('Get university error:', error);
    res.status(500).json({ message: 'Server error while fetching university' });
  }
});

// Delete University
app.delete('/api/universities/:id', (req, res) => {
  try {
    const universityId = req.params.id;

    // First check if university exists
    db.query('SELECT * FROM Universities WHERE id = ?', [universityId], (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Database error' });
      }
      if (results.length === 0) {
        return res.status(404).json({ message: 'University not found' });
      }

      // Delete the university
      db.query('DELETE FROM Universities WHERE id = ?', [universityId], (err) => {
        if (err) {
          console.error('Database error:', err);
          
          // Foreign key constraint errors
          if (err.code === 'ER_ROW_IS_REFERENCED_2') {
            return res.status(409).json({ 
              message: 'Cannot delete university because it has associated users or events. Delete those first.'
            });
          }
          
          return res.status(500).json({ message: 'Failed to delete university' });
        }

        res.status(200).json({
          message: 'University deleted successfully',
          deleted_university_id: universityId
        });
      });
    });

  } catch (error) {
    console.error('Delete university error:', error);
    res.status(500).json({ message: 'Server error during university deletion' });
  }
});

// Add Event
app.post('/api/events', async (req, res) => {
  try {
    const {
      name,
      description,
      date_time,
      location_name,
      latitude,
      longitude,
      contact_phone,
      contact_email,
      event_type,
      rso_id,
      university_id,
      created_by
    } = req.body;

    // Check required fields
    if (!name || !date_time || !location_name || !latitude || !longitude || !event_type || !created_by) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Check Event type
    if (!['public', 'private', 'rso'].includes(event_type)) {
      return res.status(400).json({ message: 'Invalid event type' });
    }

    // If event_type is 'rso', rso_id must be provided
    if (event_type === 'rso' && !rso_id) {
      return res.status(400).json({ message: 'RSO ID is required for RSO events' });
    }

    // Insert new event
    db.query(
      `INSERT INTO Events (
        name, description, date_time, location_name, latitude, longitude,
        contact_phone, contact_email, event_type, rso_id, university_id, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        description || null,
        date_time,
        location_name,
        latitude,
        longitude,
        contact_phone || null,
        contact_email || null,
        event_type,
        rso_id || null,
        university_id || null,
        created_by
      ],
      (err, results) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ message: 'Failed to create event' });
        }

        // Return the created event
        db.query('SELECT * FROM Events WHERE id = ?', [results.insertId], (err, eventResults) => {
          if (err || eventResults.length === 0) {
            return res.status(201).json({ 
              message: 'Event created successfully (but could not retrieve details)',
              event_id: results.insertId
            });
          }

          res.status(201).json({
            message: 'Event created successfully',
            event: eventResults[0]
          });
        });
      }
    );

  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ message: 'Server error during event creation' });
  }
});

// Get All Events
app.get('/api/events', (req, res) => {
  try {
    db.query('SELECT * FROM Events', (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Failed to fetch events' });
      }
      res.status(200).json(results);
    });
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({ message: 'Server error while fetching events' });
  }
});

// Get Single Event
app.get('/api/events/:id', (req, res) => {
  try {
    const eventId = req.params.id;
    db.query('SELECT * FROM Events WHERE id = ?', [eventId], (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Failed to fetch event' });
      }
      if (results.length === 0) {
        return res.status(404).json({ message: 'Event not found' });
      }
      res.status(200).json(results[0]);
    });
  } catch (error) {
    console.error('Get event error:', error);
    res.status(500).json({ message: 'Server error while fetching event' });
  }
});

// Update Event
app.put('/api/events/:id', async (req, res) => {
  try {
    const eventId = req.params.id;
    const {
      name,
      description,
      date_time,
      location_name,
      latitude,
      longitude,
      contact_phone,
      contact_email,
      event_type,
      status,
      rso_id,
      university_id
    } = req.body;

    // First check if event exists
    db.query('SELECT * FROM Events WHERE id = ?', [eventId], async (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Database error' });
      }
      if (results.length === 0) {
        return res.status(404).json({ message: 'Event not found' });
      }

      const currentEvent = results[0];

      // Check event type
      if (event_type && !['public', 'private', 'rso'].includes(event_type)) {
        return res.status(400).json({ message: 'Invalid event type' });
      }

      // If changing to 'rso' type, rso_id must be provided
      if (event_type === 'rso' && !rso_id) {
        return res.status(400).json({ message: 'RSO ID is required for RSO events' });
      }

      // Check status
      if (status && !['pending', 'approved', 'rejected'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
      }

      // Update event
      db.query(
        `UPDATE Events SET
          name = ?,
          description = ?,
          date_time = ?,
          location_name = ?,
          latitude = ?,
          longitude = ?,
          contact_phone = ?,
          contact_email = ?,
          event_type = ?,
          status = ?,
          rso_id = ?,
          university_id = ?
        WHERE id = ?`,
        [
          name || currentEvent.name,
          description !== undefined ? description : currentEvent.description,
          date_time || currentEvent.date_time,
          location_name || currentEvent.location_name,
          latitude || currentEvent.latitude,
          longitude || currentEvent.longitude,
          contact_phone !== undefined ? contact_phone : currentEvent.contact_phone,
          contact_email !== undefined ? contact_email : currentEvent.contact_email,
          event_type || currentEvent.event_type,
          status || currentEvent.status,
          rso_id !== undefined ? rso_id : currentEvent.rso_id,
          university_id !== undefined ? university_id : currentEvent.university_id,
          eventId
        ],
        (err) => {
          if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ message: 'Failed to update event' });
          }

          // Return the updated event
          db.query('SELECT * FROM Events WHERE id = ?', [eventId], (err, updatedResults) => {
            if (err || updatedResults.length === 0) {
              return res.status(200).json({ 
                message: 'Event updated successfully (but could not retrieve details)'
              });
            }

            res.status(200).json({
              message: 'Event updated successfully',
              event: updatedResults[0]
            });
          });
        }
      );
    });

  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({ message: 'Server error during event update' });
  }
});

// Delete Event
app.delete('/api/events/:id', (req, res) => {
  try {
    const eventId = req.params.id;

    // First check if event exists
    db.query('SELECT * FROM Events WHERE id = ?', [eventId], (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Database error' });
      }
      if (results.length === 0) {
        return res.status(404).json({ message: 'Event not found' });
      }

      // Delete the event
      db.query('DELETE FROM Events WHERE id = ?', [eventId], (err) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ message: 'Failed to delete event' });
        }

        res.status(200).json({
          message: 'Event deleted successfully',
          deleted_event_id: eventId
        });
      });
    });

  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({ message: 'Server error during event deletion' });
  }
});

// Add Comment
app.post('/api/comments', (req, res) => {
  const { event_id, user_id, content } = req.body;

  // Check fields
  if (!event_id || !user_id || !content) {
    return res.status(400).json({ message: 'event_id, user_id, and content are required' });
  }

  db.query(
    'INSERT INTO Comments (event_id, user_id, content) VALUES (?, ?, ?)',
    [event_id, user_id, content],
    (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Failed to add comment' });
      }
      res.status(201).json({ 
        message: 'Comment added successfully',
        comment_id: results.insertId 
      });
    }
  );
});

// Get All Comment
app.get('/api/comments/:event_id', (req, res) => {
  const event_id = req.params.event_id;

  db.query(
    'SELECT * FROM Comments WHERE event_id = ?',
    [event_id],
    (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Failed to fetch comments' });
      }
      res.status(200).json(results);
    }
  );
});

// Update Comment
app.put('/api/comments/:id', (req, res) => {
  const comment_id = req.params.id;
  const { content } = req.body;

  if (!content) {
    return res.status(400).json({ message: 'content is required' });
  }

  db.query(
    'UPDATE Comments SET content = ? WHERE id = ?',
    [content, comment_id],
    (err) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Failed to update comment' });
      }
      res.status(200).json({ message: 'Comment updated successfully' });
    }
  );
});

// Delete Comment
app.delete('/api/comments/:id', (req, res) => {
  const comment_id = req.params.id;

  db.query(
    'DELETE FROM Comments WHERE id = ?',
    [comment_id],
    (err) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Failed to delete comment' });
      }
      res.status(200).json({ message: 'Comment deleted successfully' });
    }
  );
});

// Add RSO
app.post('/api/rsos', authenticateUser, async (req, res) => {
  const { name, university_id } = req.body;
  const user_id = req.user.id;
  const user_type = req.user.user_type;

  // Check required fields
  if (!name || !university_id) {
    return res.status(400).json({ message: 'Name and university_id are required' });
  }

  try {
    // Check user belongs to specified university
    const [user] = await db.promise().query(
      'SELECT university_id FROM Users WHERE id = ?', 
      [user_id]
    );
    
    if (user.length === 0 || user[0].university_id !== university_id) {
      return res.status(403).json({ message: 'University ID mismatch' });
    }

    // Start transaction
    await db.promise().beginTransaction();

    // 1. Create RSO
    const [rsoResult] = await db.promise().query(
      'INSERT INTO RSOs (name, status, university_id, admin_id) VALUES (?, "active", ?, ?)',
      [name, university_id, user_id]
    );

    // 2. Upgrade student to admin if needed
    if (user_type === 'student') {
      await db.promise().query(
        'UPDATE Users SET user_type = "admin" WHERE id = ?',
        [user_id]
      );
    }

    await db.promise().commit();

    res.status(201).json({
      message: 'RSO created successfully',
      rso_id: rsoResult.insertId,
      ...(user_type === 'student' && { new_user_type: 'admin' }) // Only show if upgraded
    });

  } catch (err) {
    await db.promise().rollback();
    console.error('Database error:', err);
    res.status(500).json({ message: 'Failed to create RSO' });
  }
});

// Get RSO based on Uni
app.get('/api/rsos', authenticateUser, (req, res) => {
  const user_id = req.user.id;
  const user_type = req.user.user_type;

  // Only show active RSOs
  const statusCondition = user_type === 'student' ? 'AND status = "active"' : '';

  db.query(
    `SELECT r.* FROM RSOs r
     JOIN Users u ON r.university_id = u.university_id
     WHERE u.id = ? ${statusCondition}`,
    [user_id],
    (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Failed to fetch RSOs' });
      }
      res.status(200).json(results);
    }
  );
});

// Update RSO
app.put('/api/rsos/:id', authenticateUser, (req, res) => {
  const rso_id = req.params.id;
  const { name, status } = req.body;
  const user_id = req.user.id;
  const user_type = req.user.user_type;

  // Check fields
  if (!name && !status) {
    return res.status(400).json({ message: 'Name or status is required' });
  }

  // Check ownership
  db.query(
    'SELECT admin_id FROM RSOs WHERE id = ?',
    [rso_id],
    (err, results) => {
      if (err || (results[0].admin_id !== user_id && user_type !== 'super_admin')) {
        return res.status(403).json({ message: 'Not authorized to update this RSO' });
      }

      // Update RSO
      db.query(
        'UPDATE RSOs SET name = COALESCE(?, name), status = COALESCE(?, status) WHERE id = ?',
        [name, status, rso_id],
        (err) => {
          if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ message: 'Failed to update RSO' });
          }
          res.status(200).json({ message: 'RSO updated successfully' });
        }
      );
    }
  );
});

// Delete RSO
app.delete('/api/rsos/:id', authenticateUser, (req, res) => {
  const rso_id = req.params.id;
  const user_id = req.user.id;
  const user_type = req.user.user_type;

  // Check ownership
  db.query(
    'SELECT admin_id FROM RSOs WHERE id = ?',
    [rso_id],
    (err, results) => {
      if (err || (results[0].admin_id !== user_id && user_type !== 'super_admin')) {
        return res.status(403).json({ message: 'Not authorized to delete this RSO' });
      }

      // Delete RSO
      db.query(
        'DELETE FROM RSOs WHERE id = ?',
        [rso_id],
        (err) => {
          if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ message: 'Failed to delete RSO' });
          }
          res.status(200).json({ message: 'RSO deleted successfully' });
        }
      );
    }
  );
});

app.listen(8080, '0.0.0.0', () => {
    console.log("Server is running on port 8080");
  });
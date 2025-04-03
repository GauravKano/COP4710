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

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Check if user exists
    db.query('SELECT * FROM Users WHERE email = ?', [email], async (err, results) => {
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
      const userData = {
        id: user.id,
        username: user.username,
        email: user.email,
        user_type: user.user_type,
        university_id: user.university_id
      };
      
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

// Register User
app.post('/api/register', async (req, res) => {
  try {
    const { username, email, password, user_type, university_id } = req.body;

    if (!username || !email || !password || !user_type) {
      return res.status(400).json({ 
        message: 'Username, email, password, and user_type are required' 
      });
    }

    // Validate user_type
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

      // For safety, prevent deletion of super_admin unless absolutely necessary
      if (user.user_type === 'super_admin') {
        return res.status(403).json({ 
          message: 'Cannot delete super_admin account through this endpoint' 
        });
      }

      // Delete the user
      db.query('DELETE FROM Users WHERE id = ?', [userId], (err) => {
        if (err) {
          console.error('Database error:', err);
          
          // Handle foreign key constraint errors
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
app.post('/universities', (req, res) => {
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
app.get('/universities', (req, res) => {
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
app.get('/universities/:id', (req, res) => {
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
app.delete('/universities/:id', (req, res) => {
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
          
          // Handle foreign key constraint errors
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

    // Validate required fields
    if (!name || !date_time || !location_name || !latitude || !longitude || !event_type || !created_by) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Validate event_type
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

      // Validate event_type if provided
      if (event_type && !['public', 'private', 'rso'].includes(event_type)) {
        return res.status(400).json({ message: 'Invalid event type' });
      }

      // If changing to 'rso' type, rso_id must be provided
      if (event_type === 'rso' && !rso_id) {
        return res.status(400).json({ message: 'RSO ID is required for RSO events' });
      }

      // Validate status if provided
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



app.listen(3001, '0.0.0.0', () => {
    console.log("Server is running on port 3001");
  });
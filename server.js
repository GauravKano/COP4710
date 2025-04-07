const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mysql = require("mysql2");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PATCH, DELETE, OPTIONS"
  );
  next();
});

//database connection
const db = mysql.createConnection({
  socketPath: "/run/mysqld/mysqld.sock",
  user: "root",
  password: "password",
  database: "College_Event_Manager",
});

db.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL:", err);
    return;
  }
  console.log("Connected to MySQL database");
});

// token
const authenticateUser = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Authorization token required" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Invalid or expired token" });
    }
    req.user = user;
    next();
  });
};

/* -------------------------------------------------------------------------- */
/*                                user                                        */
/* -------------------------------------------------------------------------- */

// Login
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    db.query(
      "SELECT * FROM Users WHERE email = ?",
      [email],
      async (err, results) => {
        if (err) {
          console.error("Database error:", err);
          return res.status(500).json({ message: "Database error" });
        }

        if (results.length === 0) {
          return res.status(401).json({ message: "Invalid credentials" });
        }

        const user = results[0];

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
          return res.status(401).json({ message: "Invalid credentials" });
        }

        // Create JWT token
        const token = jwt.sign(
          {
            id: user.id,
            email: user.email,
            user_type: user.user_type,
            university_id: user.university_id,
          },
          process.env.JWT_SECRET,
          { expiresIn: "1h" } // Token expires in 1 hour
        );

        // Return user info and token
        const userResponse = {
          id: user.id,
          username: user.username,
          email: user.email,
          user_type: user.user_type,
          university_id: user.university_id,
        };

        res.status(200).json({
          message: "Login successful",
          user: userResponse,
          token: token,
        });
      }
    );
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error during login" });
  }
});

// Register User
app.post("/api/register", async (req, res) => {
  try {
    const { username, email, password, user_type, university_id } = req.body;

    if (!username || !email || !password || !user_type) {
      return res.status(400).json({
        message: "Username, email, password, and user_type are required",
      });
    }

    // Check user_type
    if (!["super_admin", "admin", "student"].includes(user_type)) {
      return res.status(400).json({ message: "Invalid user type" });
    }

    // Check if user already exists
    db.query(
      "SELECT * FROM Users WHERE email = ?",
      [email],
      async (err, results) => {
        if (err) {
          console.error("Database error:", err);
          return res.status(500).json({ message: "Database error" });
        }

        if (results.length > 0) {
          return res.status(400).json({ message: "User already exists" });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert new user
        db.query(
          "INSERT INTO Users (username, email, password, user_type, university_id) VALUES (?, ?, ?, ?, ?)",
          [username, email, hashedPassword, user_type, university_id || null],
          (err, results) => {
            if (err) {
              console.error("Database error:", err);
              return res.status(500).json({ message: "Database error" });
            }

            // Return the created user
            const newUser = {
              id: results.insertId,
              username,
              email,
              user_type,
              university_id: university_id || null,
            };

            res.status(201).json({
              message: "User registered successfully",
              user: newUser,
            });
          }
        );
      }
    );
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Server error during registration" });
  }
});

// Delete User
app.delete("/api/users/:id", (req, res) => {
  try {
    const userId = req.params.id;

    // First check if user exists
    db.query("SELECT * FROM Users WHERE id = ?", [userId], (err, results) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ message: "Database error" });
      }
      if (results.length === 0) {
        return res.status(404).json({ message: "User not found" });
      }

      const user = results[0];

      // Super Admin
      if (user.user_type === "super_admin") {
        return res.status(403).json({
          message: "Cannot delete super_admin account through this endpoint",
        });
      }

      // Delete the user
      db.query("DELETE FROM Users WHERE id = ?", [userId], (err) => {
        if (err) {
          console.error("Database error:", err);

          // Foreign key constraint errors
          if (err.code === "ER_ROW_IS_REFERENCED_2") {
            return res.status(409).json({
              message:
                "Cannot delete user because they have associated records. Delete associated events or transfer ownership first.",
            });
          }

          return res.status(500).json({ message: "Failed to delete user" });
        }

        res.status(200).json({
          message: "User deleted successfully",
          deleted_user_id: userId,
        });
      });
    });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ message: "Server error during user deletion" });
  }
});

/* -------------------------------------------------------------------------- */
/*                                univeristy                                  */
/* -------------------------------------------------------------------------- */

// Add University
app.post("/api/universities", (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: "University name is required" });
    }

    // Check if university already exists
    db.query(
      "SELECT * FROM Universities WHERE name = ?",
      [name],
      (err, results) => {
        if (err) {
          console.error("Database error:", err);
          return res.status(500).json({ message: "Database error" });
        }

        if (results.length > 0) {
          return res.status(400).json({ message: "University already exists" });
        }

        // Insert new university
        db.query(
          "INSERT INTO Universities (name) VALUES (?)",
          [name],
          (err, results) => {
            if (err) {
              console.error("Database error:", err);
              return res
                .status(500)
                .json({ message: "Failed to create university" });
            }

            // Return the created university
            db.query(
              "SELECT * FROM Universities WHERE id = ?",
              [results.insertId],
              (err, universityResults) => {
                if (err || universityResults.length === 0) {
                  return res.status(201).json({
                    message:
                      "University created successfully (but could not retrieve details)",
                    university_id: results.insertId,
                  });
                }

                res.status(201).json({
                  message: "University created successfully",
                  university: universityResults[0],
                });
              }
            );
          }
        );
      }
    );
  } catch (error) {
    console.error("Create university error:", error);
    res
      .status(500)
      .json({ message: "Server error during university creation" });
  }
});

// Get All Universities
app.get("/api/universities", (req, res) => {
  try {
    db.query("SELECT * FROM Universities", (err, results) => {
      if (err) {
        console.error("Database error:", err);
        return res
          .status(500)
          .json({ message: "Failed to fetch universities" });
      }
      res.status(200).json(results);
    });
  } catch (error) {
    console.error("Get universities error:", error);
    res
      .status(500)
      .json({ message: "Server error while fetching universities" });
  }
});

// Get Single University
app.get("/api/universities/:id", (req, res) => {
  try {
    const universityId = req.params.id;
    db.query(
      "SELECT * FROM Universities WHERE id = ?",
      [universityId],
      (err, results) => {
        if (err) {
          console.error("Database error:", err);
          return res
            .status(500)
            .json({ message: "Failed to fetch university" });
        }
        if (results.length === 0) {
          return res.status(404).json({ message: "University not found" });
        }
        res.status(200).json(results[0]);
      }
    );
  } catch (error) {
    console.error("Get university error:", error);
    res.status(500).json({ message: "Server error while fetching university" });
  }
});

// Delete University
app.delete("/api/universities/:id", (req, res) => {
  try {
    const universityId = req.params.id;

    // First check if university exists
    db.query(
      "SELECT * FROM Universities WHERE id = ?",
      [universityId],
      (err, results) => {
        if (err) {
          console.error("Database error:", err);
          return res.status(500).json({ message: "Database error" });
        }
        if (results.length === 0) {
          return res.status(404).json({ message: "University not found" });
        }

        // Delete the university
        db.query(
          "DELETE FROM Universities WHERE id = ?",
          [universityId],
          (err) => {
            if (err) {
              console.error("Database error:", err);

              // Foreign key constraint errors
              if (err.code === "ER_ROW_IS_REFERENCED_2") {
                return res.status(409).json({
                  message:
                    "Cannot delete university because it has associated users or events. Delete those first.",
                });
              }

              return res
                .status(500)
                .json({ message: "Failed to delete university" });
            }

            res.status(200).json({
              message: "University deleted successfully",
              deleted_university_id: universityId,
            });
          }
        );
      }
    );
  } catch (error) {
    console.error("Delete university error:", error);
    res
      .status(500)
      .json({ message: "Server error during university deletion" });
  }
});

/* -------------------------------------------------------------------------- */
/*                                event                                       */
/* -------------------------------------------------------------------------- */

// Add Event
app.post("/api/events", async (req, res) => {
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
      created_by,
    } = req.body;

    // Check required fields
    if (
      !name ||
      !date_time ||
      !location_name ||
      !latitude ||
      !longitude ||
      !event_type ||
      !created_by
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Check Event type
    if (!["public", "private", "rso"].includes(event_type)) {
      return res.status(400).json({ message: "Invalid event type" });
    }

    if (event_type === "rso" && !rso_id) {
      return res
        .status(400)
        .json({ message: "RSO ID is required for RSO events" });
    }

    let status = "pending";
    if (event_type === "rso" || event_type === "private") {
      status = "approved";
    }

    // Insert new event
    db.query(
      `INSERT INTO Events (
        name, description, date_time, location_name, latitude, longitude,
        contact_phone, contact_email, event_type, rso_id, university_id, 
        created_by, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
        created_by,
        status,
      ],
      (err, results) => {
        if (err) {
          console.error("Database error:", err);
          return res.status(500).json({ message: "Failed to create event" });
        }

        // Return the created event
        db.query(
          "SELECT * FROM Events WHERE id = ?",
          [results.insertId],
          (err, eventResults) => {
            if (err || eventResults.length === 0) {
              return res.status(201).json({
                message:
                  "Event created successfully (but could not retrieve details)",
                event_id: results.insertId,
              });
            }

            res.status(201).json({
              message: "Event created successfully",
              event: eventResults[0],
            });
          }
        );
      }
    );
  } catch (error) {
    console.error("Create event error:", error);
    res.status(500).json({ message: "Server error during event creation" });
  }
});

// Get All Events
app.get("/api/events", (req, res) => {
  try {
    db.query("SELECT * FROM Events", (err, results) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ message: "Failed to fetch events" });
      }
      res.status(200).json(results);
    });
  } catch (error) {
    console.error("Get events error:", error);
    res.status(500).json({ message: "Server error while fetching events" });
  }
});

// Get Single Event
app.get("/api/events/:id", (req, res) => {
  try {
    const eventId = req.params.id;

    // First get the event
    db.query(
      "SELECT * FROM Events WHERE id = ?",
      [eventId],
      (err, eventResults) => {
        if (err) {
          console.error("Database error:", err);
          return res.status(500).json({ message: "Failed to fetch event" });
        }
        if (eventResults.length === 0) {
          return res.status(404).json({ message: "Event not found" });
        }

        const event = eventResults[0];
        const responseEvent = { ...event };

        // If university id exists, get university name
        if (event.university_id) {
          db.query(
            "SELECT name FROM Universities WHERE id = ?",
            [event.university_id],
            (err, uniResults) => {
              if (err) {
                console.error("Database error fetching university:", err);
                checkRSO();
                return;
              }

              if (uniResults.length > 0) {
                responseEvent.university_name = uniResults[0].name;
              }

              checkRSO();
            }
          );
        } else {
          checkRSO();
        }

        function checkRSO() {
          // If rso id exists get RSO name
          if (event.rso_id) {
            db.query(
              "SELECT name FROM RSOs WHERE id = ?",
              [event.rso_id],
              (err, rsoResults) => {
                if (err) {
                  console.error("Database error fetching RSO:", err);
                  return res.status(200).json(responseEvent);
                }

                if (rsoResults.length > 0) {
                  responseEvent.rso_name = rsoResults[0].name;
                }

                res.status(200).json(responseEvent);
              }
            );
          } else {
            res.status(200).json(responseEvent);
          }
        }
      }
    );
  } catch (error) {
    console.error("Get event error:", error);
    res.status(500).json({ message: "Server error while fetching event" });
  }
});

// Update Event
app.put("/api/events/:id", async (req, res) => {
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
      university_id,
    } = req.body;

    // First check if event exists
    db.query(
      "SELECT * FROM Events WHERE id = ?",
      [eventId],
      async (err, results) => {
        if (err) {
          console.error("Database error:", err);
          return res.status(500).json({ message: "Database error" });
        }
        if (results.length === 0) {
          return res.status(404).json({ message: "Event not found" });
        }

        const currentEvent = results[0];

        // Check event type
        if (event_type && !["public", "private", "rso"].includes(event_type)) {
          return res.status(400).json({ message: "Invalid event type" });
        }

        // If changing to 'rso' type, rso_id must be provided
        if (event_type === "rso" && !rso_id) {
          return res
            .status(400)
            .json({ message: "RSO ID is required for RSO events" });
        }

        // Check status
        if (status && !["pending", "approved", "rejected"].includes(status)) {
          return res.status(400).json({ message: "Invalid status" });
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
            contact_phone !== undefined
              ? contact_phone
              : currentEvent.contact_phone,
            contact_email !== undefined
              ? contact_email
              : currentEvent.contact_email,
            event_type || currentEvent.event_type,
            status || currentEvent.status,
            rso_id !== undefined ? rso_id : currentEvent.rso_id,
            university_id !== undefined
              ? university_id
              : currentEvent.university_id,
            eventId,
          ],
          (err) => {
            if (err) {
              console.error("Database error:", err);
              return res
                .status(500)
                .json({ message: "Failed to update event" });
            }

            // Return the updated event
            db.query(
              "SELECT * FROM Events WHERE id = ?",
              [eventId],
              (err, updatedResults) => {
                if (err || updatedResults.length === 0) {
                  return res.status(200).json({
                    message:
                      "Event updated successfully (but could not retrieve details)",
                  });
                }

                res.status(200).json({
                  message: "Event updated successfully",
                  event: updatedResults[0],
                });
              }
            );
          }
        );
      }
    );
  } catch (error) {
    console.error("Update event error:", error);
    res.status(500).json({ message: "Server error during event update" });
  }
});

// Delete Event
app.delete("/api/events/:id", (req, res) => {
  try {
    const eventId = req.params.id;

    // First check if event exists
    db.query("SELECT * FROM Events WHERE id = ?", [eventId], (err, results) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ message: "Database error" });
      }
      if (results.length === 0) {
        return res.status(404).json({ message: "Event not found" });
      }

      // Delete the event
      db.query("DELETE FROM Events WHERE id = ?", [eventId], (err) => {
        if (err) {
          console.error("Database error:", err);
          return res.status(500).json({ message: "Failed to delete event" });
        }

        res.status(200).json({
          message: "Event deleted successfully",
          deleted_event_id: eventId,
        });
      });
    });
  } catch (error) {
    console.error("Delete event error:", error);
    res.status(500).json({ message: "Server error during event deletion" });
  }
});

// Get all events for the corresponding user
app.post("/api/user/events", authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const universityId = req.user.university_id;

    const query = `
      SELECT 
        e.id AS event_id,
        e.name AS event_name,
        e.event_type,
        e.date_time,
        e.location_name,
        e.latitude,
        e.longitude,
        u.name AS university_name,
        r.name AS rso_name
      FROM Events e
      LEFT JOIN Universities u ON e.university_id = u.id
      LEFT JOIN RSOs r ON e.rso_id = r.id
      WHERE 
        (e.status = 'approved') AND
        (
          /* RSO events the user is part of */
          (e.event_type = 'rso' AND e.rso_id IN (
            SELECT rso_id FROM RSO_Members WHERE student_id = ?
          ))
          OR
          /* Public events from user's university */
          (e.event_type = 'public' AND e.university_id = ?)
          OR
          /* Private events from user's university */
          (e.event_type = 'private' AND e.university_id = ?)
        )
      ORDER BY e.date_time ASC
    `;

    db.query(query, [userId, universityId, universityId], (err, results) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ message: "Failed to fetch events" });
      }

      const formattedEvents = results.map((event) => ({
        id: event.event_id,
        name: event.event_name,
        type: event.event_type,
        time: event.date_time,
        location: {
          name: event.location_name,
          coordinates: {
            latitude: event.latitude,
            longitude: event.longitude,
          },
        },
        university: event.university_id
          ? {
              id: event.university_id,
              name: event.university_name,
            }
          : null,
        rso: event.rso_id
          ? {
              id: event.rso_id,
              name: event.rso_name,
            }
          : null,
      }));

      res.status(200).json(formattedEvents);
    });
  } catch (error) {
    console.error("Get user events error:", error);
    res
      .status(500)
      .json({ message: "Server error while fetching user events" });
  }
});

// Get all pending public events
app.get("/api/pendingpublic/events", authenticateUser, async (req, res) => {
  try {
    // Check admin status
    if (!["admin", "super_admin"].includes(req.user.user_type)) {
      return res.status(403).json({
        message: "Admin access required",
        user_type: req.user.user_type,
      });
    }

    const query = `
      SELECT 
        id,
        name,
        date_time AS time
      FROM Events
      WHERE 
        event_type = 'public' COLLATE utf8mb4_general_ci AND
        status = 'pending' COLLATE utf8mb4_general_ci
      ORDER BY date_time ASC
    `;

    db.query(query, (err, results) => {
      if (err) {
        return res.status(500).json({
          message: "Query execution failed",
          error: err.message,
        });
      }

      const response = results.map((event) => ({
        id: event.id,
        name: event.name,
        time: event.time,
      }));

      res.status(200).json(response);
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
});

// Approve or reject an event
app.put("/api/events/:eventId/status", authenticateUser, async (req, res) => {
  try {
    const eventId = req.params.eventId;
    const { approved } = req.body;
    const userType = req.user.user_type;

    // Only allow admins to approve/reject events
    if (userType !== "admin" && userType !== "super_admin") {
      return res
        .status(403)
        .json({ message: "Only admin users can approve/reject events" });
    }

    // Check the event exists and is pending
    const [event] = await db
      .promise()
      .query(`SELECT id, status FROM Events WHERE id = ?`, [eventId]);

    if (event.length === 0) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (event[0].status !== "pending") {
      return res.status(400).json({
        message: "Event is not in pending status",
        current_status: event[0].status,
      });
    }

    // Update the event status
    const newStatus = approved ? "approved" : "rejected";
    await db
      .promise()
      .query(`UPDATE Events SET status = ? WHERE id = ?`, [newStatus, eventId]);

    res.status(200).json({
      message: `Event ${newStatus} successfully`,
      event_id: eventId,
      new_status: newStatus,
    });
  } catch (error) {
    console.error("Update event status error:", error);
    res
      .status(500)
      .json({ message: "Server error while updating event status" });
  }
});

/* -------------------------------------------------------------------------- */
/*                                comment                                     */
/* -------------------------------------------------------------------------- */

// Add Comment
app.post("/api/comments", (req, res) => {
  const { event_id, user_id, content } = req.body;

  // Check fields
  if (!event_id || !user_id || !content) {
    return res
      .status(400)
      .json({ message: "event_id, user_id, and content are required" });
  }

  db.query(
    "INSERT INTO Comments (event_id, user_id, content) VALUES (?, ?, ?)",
    [event_id, user_id, content],
    (err, results) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ message: "Failed to add comment" });
      }
      res.status(201).json({
        message: "Comment added successfully",
        comment_id: results.insertId,
      });
    }
  );
});

// Get All Comment
app.get("/api/comments/:event_id", (req, res) => {
  const event_id = req.params.event_id;

  db.query(
    `SELECT c.*, u.id as user_id, u.username 
     FROM Comments c
     JOIN Users u ON c.user_id = u.id
     WHERE c.event_id = ?
     ORDER BY c.created_at DESC`,
    [event_id],
    (err, results) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ message: "Failed to fetch comments" });
      }

      const formattedComments = results.map((comment) => ({
        id: comment.id,
        event_id: comment.event_id,
        content: comment.content,
        created_at: comment.created_at,
        user: {
          id: comment.user_id,
          username: comment.username,
        },
      }));

      res.status(200).json(formattedComments);
    }
  );
});

// Update Comment
app.put("/api/comments/:id", (req, res) => {
  const comment_id = req.params.id;
  const { content } = req.body;

  if (!content) {
    return res.status(400).json({ message: "content is required" });
  }

  db.query(
    "UPDATE Comments SET content = ? WHERE id = ?",
    [content, comment_id],
    (err) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ message: "Failed to update comment" });
      }
      res.status(200).json({ message: "Comment updated successfully" });
    }
  );
});

// Delete Comment
app.delete("/api/comments/:id", (req, res) => {
  const comment_id = req.params.id;

  db.query("DELETE FROM Comments WHERE id = ?", [comment_id], (err) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Failed to delete comment" });
    }
    res.status(200).json({ message: "Comment deleted successfully" });
  });
});

/* -------------------------------------------------------------------------- */
/*                                rso                                         */
/* -------------------------------------------------------------------------- */

// Add RSO
app.post("/api/rsos", authenticateUser, async (req, res) => {
  const { name, university_id, member_emails } = req.body;
  const admin_id = req.user.id;
  const user_type = req.user.user_type;

  // Check inputs
  if (
    !name ||
    !university_id ||
    !member_emails ||
    !Array.isArray(member_emails)
  ) {
    return res.status(400).json({
      message: "Name, university_id, and member_emails array are required",
    });
  }

  if (member_emails.length < 4) {
    return res.status(400).json({ message: "Need at least 4 other members" });
  }

  try {
    // First check for triggers on the table
    const [triggers] = await db
      .promise()
      .query(`SHOW TRIGGERS FROM College_Event_Manager LIKE 'RSO_Members'`);

    if (triggers.length > 0) {
      console.warn(
        "Warning: The following triggers exist on RSO_Members:",
        triggers
      );
    }

    await db.promise().beginTransaction();

    // Check members
    const [members] = await db
      .promise()
      .query(`SELECT id, email, university_id FROM Users WHERE email IN (?)`, [
        member_emails,
      ]);

    if (members.length !== member_emails.length) {
      const missing = member_emails.filter(
        (e) => !members.some((m) => m.email === e)
      );
      return res.status(400).json({
        message: "Some members not found",
        missing_emails: missing,
      });
    }

    // 3. Create RSO
    const [rsoResult] = await db.promise().query(
      `INSERT INTO RSOs (name, status, university_id, admin_id)
       VALUES (?, 'active', ?, ?)`,
      [name, university_id, admin_id]
    );
    const rso_id = rsoResult.insertId;

    // 4. Add members with trigger workaround
    const allMembers = [admin_id, ...members.map((m) => m.id)];

    // Insert members one at a time as a workaround
    for (const student_id of allMembers) {
      await db
        .promise()
        .query(`INSERT INTO RSO_Members (rso_id, student_id) VALUES (?, ?)`, [
          rso_id,
          student_id,
        ]);
    }

    // 5. Upgrade creator if needed
    if (user_type === "student") {
      await db
        .promise()
        .query(`UPDATE Users SET user_type = 'admin' WHERE id = ?`, [admin_id]);
    }

    await db.promise().commit();

    return res.status(201).json({
      message: "RSO created successfully",
      rso_id: rso_id,
      member_count: allMembers.length,
      ...(user_type === "student" && { new_user_type: "admin" }),
    });
  } catch (err) {
    await db.promise().rollback();
    console.error("Database operation failed:", {
      error: err.message,
      code: err.code,
      sql: err.sql,
      stack: err.stack,
    });

    // Special handling for trigger related errors
    if (err.code === "ER_BAD_FIELD_ERROR" && err.sqlMessage.includes("WHERE")) {
      return res.status(500).json({
        message: "Database trigger conflict",
        solution:
          "Please check and modify any triggers on the RSO_Members table",
        detail: "A trigger is interfering with RSO member insertion",
      });
    }

    return res.status(500).json({
      message: "Failed to create RSO",
      error: err.message,
      code: err.code,
    });
  }
});

// Update RSO
app.put("/api/rsos/:id", authenticateUser, (req, res) => {
  const rso_id = req.params.id;
  const { name, status } = req.body;
  const user_id = req.user.id;
  const user_type = req.user.user_type;

  // Check fields
  if (!name && !status) {
    return res.status(400).json({ message: "Name or status is required" });
  }

  // Check ownership
  db.query(
    "SELECT admin_id FROM RSOs WHERE id = ?",
    [rso_id],
    (err, results) => {
      if (
        err ||
        (results[0].admin_id !== user_id && user_type !== "super_admin")
      ) {
        return res
          .status(403)
          .json({ message: "Not authorized to update this RSO" });
      }

      // Update RSO
      db.query(
        "UPDATE RSOs SET name = COALESCE(?, name), status = COALESCE(?, status) WHERE id = ?",
        [name, status, rso_id],
        (err) => {
          if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ message: "Failed to update RSO" });
          }
          res.status(200).json({ message: "RSO updated successfully" });
        }
      );
    }
  );
});

// Delete RSO
app.delete("/api/rsos/:id", authenticateUser, (req, res) => {
  const rso_id = req.params.id;
  const user_id = req.user.id;
  const user_type = req.user.user_type;

  // Check ownership
  db.query(
    "SELECT admin_id FROM RSOs WHERE id = ?",
    [rso_id],
    (err, results) => {
      if (
        err ||
        (results[0].admin_id !== user_id && user_type !== "super_admin")
      ) {
        return res
          .status(403)
          .json({ message: "Not authorized to delete this RSO" });
      }

      // Delete RSO
      db.query("DELETE FROM RSOs WHERE id = ?", [rso_id], (err) => {
        if (err) {
          console.error("Database error:", err);
          return res.status(500).json({ message: "Failed to delete RSO" });
        }
        res.status(200).json({ message: "RSO deleted successfully" });
      });
    }
  );
});

// Get RSOs where user is the creator
app.post("/api/admin/rsos", authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const userType = req.user.user_type;

    // Check user is an admin
    if (userType !== "admin" && userType !== "super_admin") {
      return res
        .status(403)
        .json({ message: "Only admin users can access this endpoint" });
    }

    const query = `
      SELECT 
        id AS rso_id,
        name AS rso_name,
        status,
        university_id
      FROM RSOs 
      WHERE admin_id = ?
      ORDER BY name ASC
    `;

    db.query(query, [userId], (err, results) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ message: "Failed to fetch RSOs" });
      }

      const formattedRSOs = results.map((rso) => ({
        id: rso.rso_id,
        name: rso.rso_name,
        status: rso.status,
        university_id: rso.university_id,
      }));

      res.status(200).json(formattedRSOs);
    });
  } catch (error) {
    console.error("Get admin RSOs error:", error);
    res.status(500).json({ message: "Server error while fetching admin RSOs" });
  }
});

// Get all RSOs the user is part of
app.get("/api/user/rsos", authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;

    const query = `
      SELECT 
        r.id AS rso_id,
        r.name AS rso_name,
        r.status,
        r.admin_id,
        u.username AS admin_username,
        univ.name AS university_name
      FROM RSOs r
      JOIN RSO_Members rm ON r.id = rm.rso_id
      JOIN Users u ON r.admin_id = u.id
      LEFT JOIN Universities univ ON r.university_id = univ.id
      WHERE rm.student_id = ?
      ORDER BY r.status DESC, r.name ASC
    `;

    db.query(query, [userId], (err, results) => {
      if (err) {
        console.error("Database error:", err);
        return res
          .status(500)
          .json({ message: "Failed to fetch RSO memberships" });
      }

      const formattedRSOs = results.map((rso) => ({
        id: rso.rso_id,
        name: rso.rso_name,
        status: rso.status,
        admin: {
          id: rso.admin_id,
          username: rso.admin_username,
        },
        university: rso.university_id
          ? {
              name: rso.university_name,
            }
          : null,
      }));

      res.status(200).json(formattedRSOs);
    });
  } catch (error) {
    console.error("Get user RSOs error:", error);
    res.status(500).json({ message: "Server error while fetching user RSOs" });
  }
});

// Get all RSOs the user is not part of
app.get("/api/user/rsos/notmember", authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const universityId = req.user.university_id;

    const query = `
      SELECT 
        r.id AS rso_id,
        r.name AS rso_name,
        r.status,
        r.admin_id,
        u.username AS admin_username,
        univ.name AS university_name
      FROM RSOs r
      JOIN Users u ON r.admin_id = u.id
      LEFT JOIN Universities univ ON r.university_id = univ.id
      WHERE 
        r.university_id = ? AND
        r.id NOT IN (
          SELECT rso_id FROM RSO_Members WHERE student_id = ?
        )
      ORDER BY r.status DESC, r.name ASC
    `;

    db.query(query, [universityId, userId], (err, results) => {
      if (err) {
        console.error("Database error:", {
          error: err.message,
          sql: err.sql,
          stack: err.stack,
        });
        return res.status(500).json({
          message: "Failed to fetch nonmember RSOs",
          error: err.message,
        });
      }

      const formattedRSOs = results.map((rso) => ({
        id: rso.rso_id,
        name: rso.rso_name,
        status: rso.status,
        admin: {
          id: rso.admin_id,
          username: rso.admin_username,
        },
        university: rso.university_id
          ? {
              name: rso.university_name,
            }
          : null,
      }));

      res.status(200).json(formattedRSOs);
    });
  } catch (error) {
    console.error("Get nonmember RSOs error:", error);
    res.status(500).json({
      message: "Server error while fetching nonmember RSOs",
      error: error.message,
    });
  }
});

// Add user to RSO members
app.post("/api/rsos/:rsoId/join", authenticateUser, async (req, res) => {
  try {
    const rsoId = req.params.rsoId;
    const userId = req.user.id;
    const universityId = req.user.university_id;

    // Check RSO exists and is from the same university
    const [rsoCheck] = await db.promise().query(
      `SELECT id, university_id, status FROM RSOs 
       WHERE id = ? AND university_id = ?`,
      [rsoId, universityId]
    );

    if (rsoCheck.length === 0) {
      return res.status(404).json({
        message: "RSO not found or not from your university",
      });
    }

    if (rsoCheck[0].status !== "active") {
      return res.status(400).json({
        message: "Cannot join an inactive RSO",
      });
    }

    // Check if user is already a member
    const [existingMembership] = await db.promise().query(
      `SELECT id FROM RSO_Members 
       WHERE rso_id = ? AND student_id = ?`,
      [rsoId, userId]
    );

    if (existingMembership.length > 0) {
      return res.status(400).json({
        message: "You are already a member of this RSO",
      });
    }

    // Add user to RSO
    await db.promise().query(
      `INSERT INTO RSO_Members (rso_id, student_id, joined_at) 
       VALUES (?, ?, NOW())`,
      [rsoId, userId]
    );

    res.status(200).json({
      message: "Successfully joined RSO",
      rso_id: rsoId,
      user_id: userId,
    });
  } catch (error) {
    console.error("Join RSO error:", {
      message: error.message,
      sql: error.sql,
      stack: error.stack,
    });
    res.status(500).json({
      message: "Server error while joining RSO",
      error: error.message,
    });
  }
});

/* -------------------------------------------------------------------------- */
/*                                rating                                      */
/* -------------------------------------------------------------------------- */

// Add rating for event
app.post("/api/events/:id/ratings", async (req, res) => {
  try {
    const eventId = req.params.id;
    const { user_id, rating } = req.body;

    if (!user_id || rating === undefined) {
      return res
        .status(400)
        .json({ message: "User ID and rating are required" });
    }

    // Validate rating range (assuming 1 to 5)
    if (rating < 1 || rating > 5) {
      return res
        .status(400)
        .json({ message: "Rating must be between 1 and 5" });
    }

    //Check if events exists
    db.query(
      "SELECT * FROM Events WHERE id = ?",
      [eventId],
      (err, eventResults) => {
        if (err) {
          console.error("Database error:", err);
          return res.status(500).json({ message: "Database error" });
        }
        if (eventResults.length === 0) {
          return res.status(404).json({ message: "Event not found" });
        }

        // Ensure the user hasn't already rated this event
        db.query(
          "SELECT * FROM Ratings WHERE event_id = ? AND user_id = ?",
          [eventId, user_id],
          (err, ratingResults) => {
            if (err) {
              console.error("Database error:", err);
              return res.status(500).json({ message: "Database error" });
            }
            if (ratingResults.length > 0) {
              return res
                .status(400)
                .json({ message: "User has already rated this event" });
            }

            // Insert the new rating
            db.query(
              "INSERT INTO Ratings (event_id, user_id, rating) VALUES (?, ?, ?)",
              [eventId, user_id, rating],
              (err, insertResults) => {
                if (err) {
                  console.error("Database error:", err);
                  return res.status(500).json({ message: "Database error" });
                }
                res.status(201).json({
                  message: "Rating submitted successfully",
                  rating_id: insertResults.insertId,
                });
              }
            );
          }
        );
      }
    );
  } catch (error) {
    console.error("Rating submission error:", error);
    res.status(500).json({ message: "Server error while submitting rating" });
  }
});

// Get All Ratings for an Event (with Average Rating)
app.get("/api/events/:id/ratings", (req, res) => {
  try {
    const eventId = req.params.id;

    db.query(
      "SELECT * FROM Ratings WHERE event_id = ?",
      [eventId],
      (err, results) => {
        if (err) {
          console.error("Database error:", err);
          return res.status(500).json({ message: "Database error" });
        }

        let averageRating = null;
        if (results.length > 0) {
          const sum = results.reduce((acc, curr) => acc + curr.rating, 0);
          averageRating = sum / results.length;
        }

        res.status(200).json({
          ratings: results,
          average_rating: averageRating,
        });
      }
    );
  } catch (error) {
    console.error("Error fetching ratings:", error);
    res.status(500).json({ message: "Server error while fetching ratings" });
  }
});

// Update a Rating for an Event (by user)
app.put("/api/events/:id/ratings", (req, res) => {
  try {
    const eventId = req.params.id;
    const { user_id, rating } = req.body;

    if (!user_id || rating === undefined) {
      return res
        .status(400)
        .json({ message: "User ID and rating are required" });
    }

    if (rating < 1 || rating > 5) {
      return res
        .status(400)
        .json({ message: "Rating must be between 1 and 5" });
    }

    // Check if the rating exists for this user and event
    db.query(
      "SELECT * FROM Ratings WHERE event_id = ? AND user_id = ?",
      [eventId, user_id],
      (err, results) => {
        if (err) {
          console.error("Database error:", err);
          return res.status(500).json({ message: "Database error" });
        }
        if (results.length === 0) {
          return res
            .status(404)
            .json({ message: "Rating not found for this user and event" });
        }

        // Update the rating record
        db.query(
          "UPDATE Ratings SET rating = ? WHERE event_id = ? AND user_id = ?",
          [rating, eventId, user_id],
          (err) => {
            if (err) {
              console.error("Database error:", err);
              return res.status(500).json({ message: "Database error" });
            }
            res.status(200).json({ message: "Rating updated successfully" });
          }
        );
      }
    );
  } catch (error) {
    console.error("Error updating rating:", error);
    res.status(500).json({ message: "Server error while updating rating" });
  }
});

// Delete a Rating for an Event (by user)
app.delete("/api/events/:id/ratings", (req, res) => {
  try {
    const eventId = req.params.id;
    const { user_id } = req.body;

    if (!user_id) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // Verify that the rating exists before deletion
    db.query(
      "SELECT * FROM Ratings WHERE event_id = ? AND user_id = ?",
      [eventId, user_id],
      (err, results) => {
        if (err) {
          console.error("Database error:", err);
          return res.status(500).json({ message: "Database error" });
        }
        if (results.length === 0) {
          return res
            .status(404)
            .json({ message: "Rating not found for this user and event" });
        }

        // Delete the rating
        db.query(
          "DELETE FROM Ratings WHERE event_id = ? AND user_id = ?",
          [eventId, user_id],
          (err) => {
            if (err) {
              console.error("Database error:", err);
              return res.status(500).json({ message: "Database error" });
            }
            res.status(200).json({ message: "Rating deleted successfully" });
          }
        );
      }
    );
  } catch (error) {
    console.error("Error deleting rating:", error);
    res.status(500).json({ message: "Server error while deleting rating" });
  }
});

app.listen(8080, "0.0.0.0", () => {
  console.log("Server is running on port 8080");
});

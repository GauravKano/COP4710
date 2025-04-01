# create db
```
create database College_Event_Manager;
use College_Event_Manager;
```
# tables
```
CREATE TABLE Universities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);

CREATE TABLE Users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    user_type ENUM('super_admin', 'admin', 'student') NOT NULL,
    university_id INT DEFAULT NULL,
    FOREIGN KEY (university_id) REFERENCES Universities(id) ON DELETE CASCADE
);

CREATE TABLE RSOs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    status ENUM('pending', 'approved', 'rejected') NOT NULL,
    university_id INT NOT NULL,
    admin_id INT NOT NULL,
    FOREIGN KEY (university_id) REFERENCES Universities(id) ON DELETE CASCADE,
    FOREIGN KEY (admin_id) REFERENCES Users(id) ON DELETE CASCADE
);

CREATE TABLE RSO_Members (
    id INT AUTO_INCREMENT PRIMARY KEY,
    rso_id INT NOT NULL,
    student_id INT NOT NULL,
    FOREIGN KEY (rso_id) REFERENCES RSOs(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES Users(id) ON DELETE CASCADE
);

CREATE TABLE Events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    date_time TIMESTAMP NOT NULL,
    location_name VARCHAR(255) NOT NULL,
    latitude DECIMAL(9,6) NOT NULL,
    longitude DECIMAL(9,6) NOT NULL,
    contact_phone VARCHAR(20),
    contact_email VARCHAR(255),
    event_type ENUM('public', 'private', 'rso') NOT NULL,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    rso_id INT NULL,
    university_id INT DEFAULT NULL,
    created_by INT NOT NULL,
    FOREIGN KEY (rso_id) REFERENCES RSOs(id) ON DELETE SET NULL,
    FOREIGN KEY (university_id) REFERENCES Universities(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES Users(id) ON DELETE CASCADE
);

CREATE TABLE Comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    event_id INT NOT NULL,
    user_id INT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES Events(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
);

CREATE TABLE Ratings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    event_id INT NOT NULL,
    user_id INT NOT NULL,
    rating INT NOT NULL,
    FOREIGN KEY (event_id) REFERENCES Events(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
    CHECK (rating BETWEEN 1 AND 5)
);
```
# triggers
```
DELIMITER $$

CREATE TRIGGER RSOStatusUpdateA
AFTER INSERT ON RSO_Members
FOR EACH ROW
BEGIN
    DECLARE member_count INT;
    
    -- Count the number of members in the RSO
    SELECT COUNT(*) INTO member_count
    FROM RSO_Members
    WHERE rso_id = NEW.rso_id;
    
    -- Update RSO status if it has more than 4 members
    IF member_count > 4 THEN
        UPDATE RSOs
        SET Status = 'active'
        WHERE rso_id = NEW.rso_id;
    END IF;
END$$

DELIMITER ;

DELIMITER $$

CREATE TRIGGER RSOStatusUpdateP
AFTER DELETE ON RSO_Members
FOR EACH ROW
BEGIN
    DECLARE member_count INT;
    
    -- Count the number of remaining members in the RSO
    SELECT COUNT(*) INTO member_count
    FROM RSO_Members
    WHERE rso_id = OLD.rso_id;
    
    -- Update RSO status if it has less than 5 members
    IF member_count < 5 THEN
        UPDATE RSOs
        SET Status = 'inactive'
        WHERE rso_id = OLD.rso_id;
    END IF;
END$$

DELIMITER ;
```

# test Universities
```
INSERT INTO Universities (name)
VALUES ('UCF');

INSERT INTO Universities (name)
VALUES ('UF');

INSERT INTO Universities (name)
VALUES ('MIT');

INSERT INTO Universities (name)
VALUES ('Harvard');
```

# test Users
```
INSERT INTO Users (username,email, password, user_type, university_id)
VALUES ('test1', 'email@something', 'test', 'student', 1);

INSERT INTO Users (username, email, password, user_type, university_id)
VALUES ('John Doe', 'JohnDoe@gmail.com', 'password123', 'super_admin', NULL);

INSERT INTO Users (username, email, password, user_type, university_id)
VALUES ('Super Admin', 'SuperAdmin@gmail.com', 'password123', 'super_admin', NULL);

INSERT INTO Users (username, email, password, user_type, university_id)
VALUES ('Admin', 'Admin@gmail.com', 'password123', 'admin', 1);

INSERT INTO Users (username, email, password, user_type, university_id)
VALUES 
('John Doe', 'john.doe@example.com', 'password123', 'super_admin', NULL),
('Jane Smith', 'jane.smith@example.com', 'password456', 'admin', 1),
('Alice Johnson', 'alice.johnson@example.com', 'password789', 'student', 2),
('Bob Brown', 'bob.brown@example.com', 'password321', 'student', 1),
('Charlie Davis', 'charlie.davis@example.com', 'password654', 'admin', 3),
('Eve Clark', 'eve.clark@example.com', 'password987', 'student', 4),
('Grace Lee', 'grace.lee@example.com', 'password111', 'student', 2),
('Hank Miller', 'hank.miller@example.com', 'password222', 'super_admin', NULL),
('Ivy Wilson', 'ivy.wilson@example.com', 'password333', 'student', 1),
('Jack Martinez', 'jack.martinez@example.com', 'password444', 'admin', 3);
```

# db Admin login
USERNAME should be replaced with a username(Ex: Bob) same for PASSWORD
```
CREATE USER 'root'@'%' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON College_Event_Manager.* TO 'root'@'%';
```
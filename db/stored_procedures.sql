-- Execute all of these after create_db so that we can invoke procedure functions in the backend

use boaDB;

-- Adding Movies
DELIMITER //
CREATE PROCEDURE addMovie (
    IN p_title VARCHAR(100),
    IN p_ttID VARCHAR(10),
    IN p_imageUrl VARCHAR(255),
    IN p_releaseYear INT
)
BEGIN
    -- Ensures we are not adding duplicates
    IF EXISTS (SELECT 1 FROM Movies WHERE ttID = p_ttID) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Movie already exists!!!';
    ELSE
        INSERT INTO Movies (title, ttID, imageUrl, releaseYear) VALUES (p_title, p_ttID, p_imageUrl, p_releaseYear);
    END IF;
END //
DELIMITER ;

-- Getting all Movies
DELIMITER //
CREATE PROCEDURE getAllMovies ()
BEGIN
    SELECT movieId, title, ttID, imageUrl, releaseYear FROM Movies;
END //
DELIMITER ;


-- Adding Users
DELIMITER //
CREATE PROCEDURE addUser (
    IN p_username VARCHAR(50),
    IN p_passwordEncrypt VARCHAR(255),
    IN p_passwordSalt VARCHAR(255)
)
BEGIN
    -- Ensures we are not adding duplicates
    IF EXISTS (SELECT 1  FROM Users WHERE username = p_username) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Username already exists';
    ELSE
        INSERT INTO Users (username, passwordEncrypt, passwordSalt) VALUES (p_username, p_passwordEncrypt, p_passwordSalt);
    END IF;
END //
DELIMITER ;

-- Getting userId by username
DELIMITER //
CREATE PROCEDURE getUserIdByUsername (IN p_username VARCHAR(50))
BEGIN
    SELECT userId FROM Users WHERE username = p_username;
END //
DELIMITER ;

-- Verifying User Credentials
DELIMITER //
CREATE PROCEDURE verifyUserCredentials (IN p_username VARCHAR(50), IN p_password VARCHAR(255))
BEGIN
    SELECT userId, username FROM Users WHERE username = p_username AND passwordEncrypt = p_password;
END //
DELIMITER ;

-- Getting passwordEncrypt by username
DELIMITER //
CREATE PROCEDURE getpasswordSaltByUsername (IN p_username VARCHAR(50))
BEGIN
    SELECT passwordSalt FROM Users WHERE username = p_username;
END //
DELIMITER ;
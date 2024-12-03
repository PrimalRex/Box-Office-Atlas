-- Execute all of these after create_db so that we can invoke procedure functions in the backend
use boaDB;

-- Adding Movies
DELIMITER // 
CREATE PROCEDURE addMovie (
    IN p_title VARCHAR(100),
    IN p_ttID VARCHAR(10),
    IN p_imageUrl VARCHAR(255),
    IN p_releaseYear INT
) BEGIN
-- Ensures we are not adding duplicates but is a non fatal signal so it wont crash the app
IF EXISTS (
    SELECT
        1
    FROM
        Movies
    WHERE
        ttID = p_ttID
) THEN SIGNAL SQLSTATE '01000'
SET
    MESSAGE_TEXT = 'Movie already exists!!!';

ELSE
INSERT INTO
    Movies (title, ttID, imageUrl, releaseYear)
VALUES
    (p_title, p_ttID, p_imageUrl, p_releaseYear);

END IF;

END //
DELIMITER ;

-- Getting all Movies
DELIMITER //
CREATE PROCEDURE getAllMovies () BEGIN
SELECT
    movieId,
    title,
    ttID,
    imageUrl,
    releaseYear
FROM
    Movies;

END //
DELIMITER ;

-- Get all favourites by userId
DELIMITER //
CREATE PROCEDURE getUserFavouritesByUserId (IN p_userId INT) BEGIN
-- Retrieves relevant information about each movie favorited by the user
SELECT
    m.title,
    m.ttID,
    m.imageUrl,
    m.releaseYear
FROM
    UserFavourites uf
    INNER JOIN Movies m ON uf.movieId = m.movieId
WHERE
    uf.userId = p_userId
    -- Ensures that it matches the order in which the user has saved the titles in 
ORDER BY
    uf.favouriteId;

END // 
DELIMITER ;

-- Gets titles data for the app-wide saved movies, ordered by count
DELIMITER //
CREATE PROCEDURE getMostSavedTitles () BEGIN
-- Retrieves all column data from movies table
SELECT 
    m.*, 
    COUNT(*) AS count 
FROM 
    UserFavourites uf 
INNER JOIN 
    Movies m ON uf.movieId = m.movieId 
GROUP BY 
    m.movieId;

END //
DELIMITER ;

-- Finds matching titles based on a keyword search
DELIMITER //
CREATE PROCEDURE findMatchingTitles (IN p_keyword VARCHAR(50)) 
BEGIN
    SELECT *
FROM 
    Movies m
WHERE
	m.title LIKE CONCAT('%', p_keyword, '%');
    
END //
DELIMITER ;

-- Toggling favourite state of a movie for a user
DELIMITER //
CREATE PROCEDURE toggleUserFavourite (
    IN p_userId INT,
    IN p_ttId VARCHAR(10),
    IN p_title VARCHAR(100),
    IN p_imageUrl VARCHAR(255),
    IN p_releaseYear INT
) BEGIN
-- Variable to track the state of the operation
DECLARE stateTracker INT;

-- Add the movie (Duplicates are verified in its own procedure)
CALL addMovie (p_title, p_ttId, p_imageUrl, p_releaseYear);

-- Check if the user has it already favourited
IF EXISTS (
    SELECT
        1
    FROM
        UserFavourites uf
        INNER JOIN Movies m ON uf.movieId = m.movieId
    WHERE
        uf.userId = p_userId
        AND m.ttID = p_ttId
) THEN
-- Remove the current entry if it exists
DELETE FROM UserFavourites USING UserFavourites
INNER JOIN Movies ON UserFavourites.movieId = Movies.movieId
WHERE
    UserFavourites.userId = p_userId
    AND Movies.ttID = p_ttId;

SET
    stateTracker = 0;

ELSE
-- If it doesn't exist, add the favorite
INSERT INTO
    UserFavourites (userId, movieId)
SELECT
    p_userId,
    movieId
FROM
    Movies
WHERE
    ttID = p_ttId;

SET
    stateTracker = 1;

END IF;

-- Return the state reflecting the removal or addition of the title from userfavourties
SELECT
    stateTracker AS state;

END //
DELIMITER ;

-- Adding Users
DELIMITER //
CREATE PROCEDURE addUser (
    IN p_username VARCHAR(50),
    IN p_passwordEncrypt VARCHAR(255),
    IN p_passwordSalt VARCHAR(255)
) BEGIN
-- Ensures we are not adding duplicates, fatal signal so it will fully cancel execution
IF EXISTS (
    SELECT
        1
    FROM
        Users
    WHERE
        username = p_username
) THEN SIGNAL SQLSTATE '45000'
SET
    MESSAGE_TEXT = 'Username already exists';

ELSE
INSERT INTO
    Users (username, passwordEncrypt, passwordSalt)
VALUES
    (p_username, p_passwordEncrypt, p_passwordSalt);

END IF;

END //
DELIMITER ;

-- Getting userId by username
DELIMITER //
CREATE PROCEDURE getUserIdByUsername (IN p_username VARCHAR(50)) BEGIN
SELECT
    userId
FROM
    Users
WHERE
    username = p_username;

END //
DELIMITER ;

-- Verifying User Credentials
DELIMITER //
CREATE PROCEDURE verifyUserCredentials (
    IN p_username VARCHAR(50),
    IN p_password VARCHAR(255)
) BEGIN
SELECT
    userId,
    username
FROM
    Users
WHERE
    username = p_username
    AND passwordEncrypt = p_password;

END //
DELIMITER ;

-- Getting passwordEncrypt by username
DELIMITER //
CREATE PROCEDURE getpasswordSaltByUsername (IN p_username VARCHAR(50)) BEGIN
SELECT
    passwordSalt
FROM
    Users
WHERE
    username = p_username;

END //
DELIMITER ;
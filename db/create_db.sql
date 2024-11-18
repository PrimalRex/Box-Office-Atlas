-- Make sure we are using the correct database
use boaDB;

-- Create Users table
-- User credential information is stored here
CREATE TABLE Users (
    userId INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    passwordEncrypt VARCHAR(255) NOT NULL,
    passwordSalt VARCHAR(255) NOT NULL
);

-- Create Movies table
-- Stores abstract information about movies, most importantly the title and the ttID
CREATE TABLE Movies (
    movieId INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(100) NOT NULL,
    ttID VARCHAR(10) NOT NULL,
    imageUrl VARCHAR(255) NOT NULL,
    releaseYear INT NOT NULL
);

-- Create UserFavorites table
-- Separates the Users from Movies
CREATE TABLE UserFavorites (
    favouriteId INT PRIMARY KEY AUTO_INCREMENT,
    userId INT NOT NULL,
    movieId INT NOT NULL,
    FOREIGN KEY (userId) REFERENCES Users(userId) ON DELETE CASCADE,
    FOREIGN KEY (movieId) REFERENCES Movies(movieId) ON DELETE CASCADE
);
-- Create the database if it doesn't exist
DROP DATABASE IF EXISTS boaDB;
CREATE DATABASE boaDB;
-- Create a database user and grant them priveleges to the database
CREATE USER 'boaAdmin'@'localhost' IDENTIFIED WITH mysql_native_password BY 'boagenericpass';
GRANT ALL PRIVILEGES ON boaDB.* TO 'boaAdmin'@'localhost';
DELIMITER //
CREATE PROCEDURE hasUserFavouritedTitle (IN p_userId INT, IN p_ttId VARCHAR(10)) BEGIN
-- Checks if the user has favorited the movie
SELECT
    *
FROM
    UserFavourites uf
    INNER JOIN Movies m ON uf.movieId = m.movieId
WHERE
    uf.userId = p_userId
    AND m.ttID = p_ttId;

END //
DELIMITER ;
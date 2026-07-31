const { sql, getPool } = require('../config/database');

async function evaluateBadges(userId) {
  const pool = await getPool();
  await pool.request()
    .input('userId', sql.Int, userId)
    .query(`
      INSERT INTO UserBadges (UserId, BadgeId)
      SELECT @userId, b.BadgeId
      FROM Badges b
      WHERE b.Code = 'FIRST_TASK'
        AND EXISTS (SELECT 1 FROM Tasks WHERE UserId = @userId AND IsCompleted = 1)
        AND NOT EXISTS (SELECT 1 FROM UserBadges ub WHERE ub.UserId = @userId AND ub.BadgeId = b.BadgeId);

      INSERT INTO UserBadges (UserId, BadgeId)
      SELECT @userId, b.BadgeId
      FROM Badges b
      WHERE b.Code = 'TASK_MASTER'
        AND (SELECT COUNT(*) FROM Tasks WHERE UserId = @userId AND IsCompleted = 1) >= 5
        AND NOT EXISTS (SELECT 1 FROM UserBadges ub WHERE ub.UserId = @userId AND ub.BadgeId = b.BadgeId);

      INSERT INTO UserBadges (UserId, BadgeId)
      SELECT @userId, b.BadgeId
      FROM Badges b
      WHERE b.Code = 'POINT_COLLECTOR'
        AND (SELECT Points FROM Users WHERE UserId = @userId) >= 100
        AND NOT EXISTS (SELECT 1 FROM UserBadges ub WHERE ub.UserId = @userId AND ub.BadgeId = b.BadgeId);
    `);
}

async function getAllForUser(userId) {
  const pool = await getPool();
  const result = await pool.request()
    .input('userId', sql.Int, userId)
    .query(`SELECT b.BadgeId, b.Code, b.Name, b.Description,
                   CASE WHEN ub.UserBadgeId IS NULL THEN 0 ELSE 1 END AS Earned,
                   ub.AwardedAt
            FROM Badges b
            LEFT JOIN UserBadges ub ON ub.BadgeId = b.BadgeId AND ub.UserId = @userId
            ORDER BY Earned DESC, b.BadgeId`);
  return result.recordset;
}

module.exports = { evaluateBadges, getAllForUser };

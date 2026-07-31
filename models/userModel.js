const { sql, getPool } = require('../config/database');

async function findByEmail(email) {
  const pool = await getPool();
  const result = await pool.request()
    .input('email', sql.NVarChar(255), email)
    .query(`SELECT UserId, FullName, Email, PasswordHash, Points, CreatedAt
            FROM Users WHERE Email = @email`);
  return result.recordset[0] || null;
}

async function findById(userId) {
  const pool = await getPool();
  const result = await pool.request()
    .input('userId', sql.Int, userId)
    .query(`SELECT UserId, FullName, Email, Points, CreatedAt
            FROM Users WHERE UserId = @userId`);
  return result.recordset[0] || null;
}

async function createUser({ fullName, email, passwordHash }) {
  const pool = await getPool();
  const result = await pool.request()
    .input('fullName', sql.NVarChar(120), fullName)
    .input('email', sql.NVarChar(255), email)
    .input('passwordHash', sql.NVarChar(255), passwordHash)
    .query(`INSERT INTO Users (FullName, Email, PasswordHash)
            OUTPUT INSERTED.UserId, INSERTED.FullName, INSERTED.Email, INSERTED.Points
            VALUES (@fullName, @email, @passwordHash)`);
  return result.recordset[0];
}

module.exports = { findByEmail, findById, createUser };

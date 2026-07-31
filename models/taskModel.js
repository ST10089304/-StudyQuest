const { sql, getPool } = require('../config/database');

async function getByUser(userId) {
  const pool = await getPool();
  const result = await pool.request()
    .input('userId', sql.Int, userId)
    .query(`SELECT TaskId, Title, Description, Priority, DueDate, IsCompleted, PointsAwarded, CreatedAt
            FROM Tasks
            WHERE UserId = @userId
            ORDER BY IsCompleted ASC,
              CASE Priority WHEN 'High' THEN 1 WHEN 'Medium' THEN 2 ELSE 3 END,
              DueDate ASC`);
  return result.recordset;
}

async function getById(taskId, userId) {
  const pool = await getPool();
  const result = await pool.request()
    .input('taskId', sql.Int, taskId)
    .input('userId', sql.Int, userId)
    .query(`SELECT * FROM Tasks WHERE TaskId = @taskId AND UserId = @userId`);
  return result.recordset[0] || null;
}

async function createTask(userId, task) {
  const pool = await getPool();
  await pool.request()
    .input('userId', sql.Int, userId)
    .input('title', sql.NVarChar(150), task.title)
    .input('description', sql.NVarChar(1000), task.description || null)
    .input('priority', sql.NVarChar(10), task.priority)
    .input('dueDate', sql.Date, task.dueDate)
    .query(`INSERT INTO Tasks (UserId, Title, Description, Priority, DueDate)
            VALUES (@userId, @title, @description, @priority, @dueDate)`);
}

async function updateTask(taskId, userId, task) {
  const pool = await getPool();
  await pool.request()
    .input('taskId', sql.Int, taskId)
    .input('userId', sql.Int, userId)
    .input('title', sql.NVarChar(150), task.title)
    .input('description', sql.NVarChar(1000), task.description || null)
    .input('priority', sql.NVarChar(10), task.priority)
    .input('dueDate', sql.Date, task.dueDate)
    .query(`UPDATE Tasks
            SET Title = @title, Description = @description, Priority = @priority, DueDate = @dueDate
            WHERE TaskId = @taskId AND UserId = @userId`);
}

async function deleteTask(taskId, userId) {
  const pool = await getPool();
  await pool.request()
    .input('taskId', sql.Int, taskId)
    .input('userId', sql.Int, userId)
    .query(`DELETE FROM Tasks WHERE TaskId = @taskId AND UserId = @userId`);
}

async function completeTask(taskId, userId) {
  const pool = await getPool();
  const transaction = new sql.Transaction(pool);
  await transaction.begin();

  try {
    const request = new sql.Request(transaction);
    const taskResult = await request
      .input('taskId', sql.Int, taskId)
      .input('userId', sql.Int, userId)
      .query(`SELECT TaskId, IsCompleted FROM Tasks WITH (UPDLOCK, ROWLOCK)
              WHERE TaskId = @taskId AND UserId = @userId`);

    const task = taskResult.recordset[0];
    if (!task || task.IsCompleted) {
      await transaction.rollback();
      return false;
    }

    await new sql.Request(transaction)
      .input('taskId', sql.Int, taskId)
      .input('userId', sql.Int, userId)
      .query(`UPDATE Tasks SET IsCompleted = 1, CompletedAt = SYSUTCDATETIME(), PointsAwarded = 10
              WHERE TaskId = @taskId AND UserId = @userId;
              UPDATE Users SET Points = Points + 10 WHERE UserId = @userId;`);

    await transaction.commit();
    return true;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

async function getStats(userId) {
  const pool = await getPool();
  const result = await pool.request()
    .input('userId', sql.Int, userId)
    .query(`SELECT
              COUNT(*) AS TotalTasks,
              SUM(CASE WHEN IsCompleted = 1 THEN 1 ELSE 0 END) AS CompletedTasks,
              SUM(CASE WHEN IsCompleted = 0 THEN 1 ELSE 0 END) AS OpenTasks,
              SUM(CASE WHEN IsCompleted = 0 AND DueDate < CAST(GETDATE() AS DATE) THEN 1 ELSE 0 END) AS OverdueTasks
            FROM Tasks WHERE UserId = @userId`);
  return result.recordset[0];
}

module.exports = { getByUser, getById, createTask, updateTask, deleteTask, completeTask, getStats };

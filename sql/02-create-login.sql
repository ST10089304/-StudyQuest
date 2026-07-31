USE master;
GO

IF NOT EXISTS (SELECT 1 FROM sys.sql_logins WHERE name = 'studyquest_app')
BEGIN
    CREATE LOGIN studyquest_app WITH PASSWORD = 'ChangeThisPassword123!';
END
GO

USE StudyQuestDB;
GO

IF NOT EXISTS (SELECT 1 FROM sys.database_principals WHERE name = 'studyquest_app')
BEGIN
    CREATE USER studyquest_app FOR LOGIN studyquest_app;
END
GO

ALTER ROLE db_datareader ADD MEMBER studyquest_app;
ALTER ROLE db_datawriter ADD MEMBER studyquest_app;
GO

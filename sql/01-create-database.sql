USE master;
GO

IF DB_ID('StudyQuestDB') IS NULL
    CREATE DATABASE StudyQuestDB;
GO

USE StudyQuestDB;
GO

CREATE TABLE Users (
    UserId INT IDENTITY(1,1) PRIMARY KEY,
    FullName NVARCHAR(120) NOT NULL,
    Email NVARCHAR(255) NOT NULL UNIQUE,
    PasswordHash NVARCHAR(255) NOT NULL,
    Points INT NOT NULL CONSTRAINT DF_Users_Points DEFAULT 0,
    CreatedAt DATETIME2 NOT NULL CONSTRAINT DF_Users_CreatedAt DEFAULT SYSUTCDATETIME()
);
GO

CREATE TABLE Tasks (
    TaskId INT IDENTITY(1,1) PRIMARY KEY,
    UserId INT NOT NULL,
    Title NVARCHAR(150) NOT NULL,
    Description NVARCHAR(1000) NULL,
    Priority NVARCHAR(10) NOT NULL,
    DueDate DATE NOT NULL,
    IsCompleted BIT NOT NULL CONSTRAINT DF_Tasks_IsCompleted DEFAULT 0,
    PointsAwarded INT NOT NULL CONSTRAINT DF_Tasks_Points DEFAULT 0,
    CreatedAt DATETIME2 NOT NULL CONSTRAINT DF_Tasks_CreatedAt DEFAULT SYSUTCDATETIME(),
    CompletedAt DATETIME2 NULL,
    CONSTRAINT FK_Tasks_Users FOREIGN KEY (UserId) REFERENCES Users(UserId) ON DELETE CASCADE,
    CONSTRAINT CK_Tasks_Priority CHECK (Priority IN ('Low', 'Medium', 'High'))
);
GO

CREATE TABLE Badges (
    BadgeId INT IDENTITY(1,1) PRIMARY KEY,
    Code NVARCHAR(50) NOT NULL UNIQUE,
    Name NVARCHAR(100) NOT NULL,
    Description NVARCHAR(255) NOT NULL
);
GO

CREATE TABLE UserBadges (
    UserBadgeId INT IDENTITY(1,1) PRIMARY KEY,
    UserId INT NOT NULL,
    BadgeId INT NOT NULL,
    AwardedAt DATETIME2 NOT NULL CONSTRAINT DF_UserBadges_AwardedAt DEFAULT SYSUTCDATETIME(),
    CONSTRAINT UQ_UserBadges UNIQUE (UserId, BadgeId),
    CONSTRAINT FK_UserBadges_Users FOREIGN KEY (UserId) REFERENCES Users(UserId) ON DELETE CASCADE,
    CONSTRAINT FK_UserBadges_Badges FOREIGN KEY (BadgeId) REFERENCES Badges(BadgeId) ON DELETE CASCADE
);
GO

INSERT INTO Badges (Code, Name, Description) VALUES
('FIRST_TASK', 'First Task Completed', 'Complete your first StudyQuest task.'),
('TASK_MASTER', 'Task Master', 'Complete five StudyQuest tasks.'),
('POINT_COLLECTOR', 'Point Collector', 'Earn at least 100 quest points.');
GO

CREATE INDEX IX_Tasks_UserId_DueDate ON Tasks(UserId, DueDate);
CREATE INDEX IX_Tasks_UserId_IsCompleted ON Tasks(UserId, IsCompleted);
GO

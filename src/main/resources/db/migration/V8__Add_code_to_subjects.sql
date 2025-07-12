-- Add Code column to Subjects table if it doesn't exist
ALTER TABLE Subjects ADD COLUMN IF NOT EXISTS Code varchar(20) DEFAULT NULL;

-- Update existing subjects with sample codes (adjust as needed)
UPDATE Subjects SET Code = CONCAT('SUB', LPAD(ID, 3, '0')) WHERE Code IS NULL;

-- Add some common subject codes for known subjects
UPDATE Subjects SET Code = 'PRO192' WHERE Name LIKE '%Object-Oriented Programming%' AND Code IS NULL;
UPDATE Subjects SET Code = 'CEA201' WHERE Name LIKE '%Computer Organization and Architecture%' AND Code IS NULL;
UPDATE Subjects SET Code = 'CSI104' WHERE Name LIKE '%Introduction to Computing%' AND Code IS NULL;
UPDATE Subjects SET Code = 'MAE101' WHERE Name LIKE '%Mathematics%' AND Code IS NULL;
UPDATE Subjects SET Code = 'PRF192' WHERE Name LIKE '%Programming Fundamentals%' AND Code IS NULL;
UPDATE Subjects SET Code = 'DBI202' WHERE Name LIKE '%Database%' AND Code IS NULL;
UPDATE Subjects SET Code = 'WEB101' WHERE Name LIKE '%Web Development%' AND Code IS NULL;
UPDATE Subjects SET Code = 'OSG202' WHERE Name LIKE '%Operating System%' AND Code IS NULL;
UPDATE Subjects SET Code = 'NWC203' WHERE Name LIKE '%Computer Networking%' AND Code IS NULL;
UPDATE Subjects SET Code = 'SWE201' WHERE Name LIKE '%Software Engineering%' AND Code IS NULL; 
INSERT INTO roles (id, role_code, role_name, role_category) VALUES
(1, 'dummy', 'dummy', 'dummy'),
(2, 'LCSHLMR03', 'Functional Consultant', 'Functional'),
(3, 'LCSSTGR01', 'DIC - Security', 'Strategic'),
(4, 'LCSSTGR02', 'SIC – Staffing Operations', 'Managerial'),
(5, 'LCSSTGR03', 'Key Account Manager', 'Functional'),
(6, 'LCSSTGR06', 'SIC-Recruitment', 'Managerial'),
(7, 'RVLOPSR08', 'Field Officer- WFM', 'Functional'),
(8, 'RVLOPSR04', 'Officer-HR MIS', 'Functional'),
(9, 'RVLOPSR05', 'HSMS', 'Managerial');




INSERT INTO roles (role_code, role_name, role_category) VALUES
( 'dummy', 'dummy', 'dummy'),
( 'LCSHLMR03', 'Functional Consultant', 'Functional'),
( 'LCSSTGR01', 'DIC - Security', 'Strategic'),
( 'LCSSTGR02', 'SIC – Staffing Operations', 'Managerial'),
('LCSSTGR03', 'Key Account Manager', 'Functional'),
('LCSSTGR06', 'SIC-Recruitment', 'Managerial'),
( 'RVLOPSR08', 'Field Officer- WFM', 'Functional'),
( 'RVLOPSR04', 'Officer-HR MIS', 'Functional'),
('RVLOPSR05', 'dsgdfg', 'dfgdfg');




INSERT INTO competencies (competency_code, competency_name, competency_description) VALUES

('CTP 13', 'Knowledge of database SQL Server', 'Functional'),
('CMP 02', 'Effective Communication Skills', 'Behavioral'),
('CLC 01', 'Leadership Development & Team Management', 'Behavioral'),
('CRS 20', 'Time Management-Techniques', 'Behavioral'),
('CLC 02', 'Adapting Change Management Positively', 'Behavioral'),
('CST 01', 'Competency on Strategic Thinking', 'Behavioral'),
('CDM 01', 'Data Driven Decision Making & Problem Solving', 'Behavioral'),
('CTP 10', 'Advanced BI Tool Proficiency', 'Functional'),
('CRU 04', 'Business Intelligence Reporting', 'Functional'),
('CRU 01', 'User Requirement Understanding', 'Functional'),
('CCF 02', 'Customer-Centric Focus', 'Behavioral'),
('CRS 25', 'Cross-functional Project Coordination', 'Behavioral'),
('CPS 01', 'Critical Thinking', 'Behavioral'),
('CCF 01', 'Customer Feedback Analysis', 'Functional'),
('CRS 22', 'Agile Sprint Planning', 'Functional'),
('CTP 12', 'Documentation Standardization', 'Functional'),
('CBP 22', 'Business Model Innovation', 'Functional'),
('CBP 20', 'Process Optimization Strategies', 'Functional'),
('CRS 14', 'Risk Management in Projects', 'Functional'),
('CBP 18', 'Product Lifecycle Understanding', 'Functional'),
('CBQ 05', 'Quality Assurance Planning', 'Functional'),
('CBQ 04', 'Defect Tracking and Reporting', 'Functional');



-- Insert data into role_competencies table mapping roles to competencies
INSERT INTO role_competencies (role_id, competency_code,role_competency_required_score)
VALUES
    -- Role: Functional Consultant (role_id = 1)
    (1, 'CRS 22',3),  -- Agile Sprint Planning
    (1, 'CRS 25',3),  -- Cross-functional Project Coordination
    (1, 'CCF 02',3),  -- Customer-Centric Focus
    (1, 'CMP 02',3),  -- Effective Communication Skills
    (1, 'CTP 10',3),  -- Knowledge on BI Tools
    (1, 'CRS 20',3),  -- Time Management-Techniques
    (1, 'CLC 02',3),  -- Adapting Change Management Positively
    (1, 'CCF 01',3),  -- Customer Feedback Analysis
    (1, 'CBQ 05',3),  -- Quality Assurance Planning
    (1, 'CST 01',3),  -- Competency on Strategic Thinking
    (1, 'CRS 14',3),  -- Risk Management in Projects
    (1, 'CBP 22',3),  -- Business Model Innovation
    (1, 'CTP 12',3),  -- Documentation Standardization
    (1, 'CLC 01',3),  -- Leadership Development & Team Management
    (1, 'CBQ 04',3),  -- Defect Tracking and Reporting
    (1, 'CBP 20',3),  -- Process Optimization Strategies
    (1, 'CTP 13',3),  -- Knowledge of database SQL Server
    (1, 'CPS 01',3),  -- Critical Thinking
    (1, 'CBP 18',3),  -- Product Lifecycle Understanding

    -- Role: DIC - Security (role_id = 2)
    (2, 'CRS 22',3),  -- Agile Sprint Planning
    (2, 'CTP 10',3),  -- Knowledge on BI Tools
    (2, 'CCF 01',3),  -- Customer Feedback Analysis
    (2, 'CTP 13',3),  -- Knowledge of database SQL Server
    (2, 'CRS 14',3),  -- Risk Management in Projects
    (2, 'CBP 18',3),  -- Product Lifecycle Understanding

    -- Role: SIC – Staffing Operations (role_id = 3)
    (3, 'CTP 10',3),  -- Knowledge on BI Tools
    (3, 'CRS 20',3),  -- Time Management-Techniques
    (3, 'CRS 25',3),  -- Cross-functional Project Coordination
    (3, 'CST 01',3),  -- Competency on Strategic Thinking
    (3, 'CBP 22',3),  -- Business Model Innovation
    (3, 'CBP 20',3),  -- Process Optimization Strategies

    -- Role: Key Account Manager (role_id = 4)
    (4, 'CRS 22',3),  -- Agile Sprint Planning
    (4, 'CTP 10',3),  -- Knowledge on BI Tools
    (4, 'CBP 22',3),  -- Business Model Innovation
    (4, 'CRS 20',3),  -- Time Management-Techniques
    (4, 'CPS 01',3),  -- Critical Thinking
    (4, 'CBP 18',3),  -- Product Lifecycle Understanding

    -- Role: SIC-Recruitment (role_id = 5)
    (5, 'CTP 13',3),  -- Knowledge of database SQL Server
    (5, 'CBP 22',3),  -- Business Model Innovation
    (5, 'CTP 10',3),  -- Knowledge on BI Tools
    (5, 'CST 01',3),  -- Competency on Strategic Thinking
    (5, 'CBP 20',3),  -- Process Optimization Strategies
    (5, 'CRS 22',3),  -- Agile Sprint Planning

    -- Role: Field Officer- WFM (role_id = 6)
    (6, 'CTP 13',3),  -- Knowledge of database SQL Server
    (6, 'CTP 10',3),  -- Knowledge on BI Tools
    (6, 'CRS 22',3),  -- Agile Sprint Planning
    (6, 'CBP 22',3),  -- Business Model Innovation
    (6, 'CBP 20',3),  -- Process Optimization Strategies

    -- Role: Officer-HR MIS (role_id = 7)
    (7, 'CTP 10',3),  -- Knowledge on BI Tools
    (7, 'CRS 22',3),  -- Agile Sprint Planning
    (7, 'CST 01',3),  -- Competency on Strategic Thinking
    (7, 'CBP 22',3),  -- Business Model Innovation
    (7, 'CRS 14',3),  -- Risk Management in Projects

    -- Role: HSMS (role_id = 8)
    (8, 'CRS 22',3),  -- Agile Sprint Planning
    (8, 'CTP 13',3),  -- Knowledge of database SQL Server
    (8, 'CBP 22',3),  -- Business Model Innovation
    (8, 'CBP 18',3),  -- Product Lifecycle Understanding
    (8, 'CPS 01',3);  -- Critical Thinking
-- Insert data into department_roles table mapping departments to roles






INSERT INTO department_roles (department_id, role_id)
VALUES
    (2, 2),  -- HLM -> Functional Consultant
    (3, 3),  -- Security -> DIC - Security
    (4, 4),  -- Staffing -> SIC – Staffing Operations
    (5, 5),  -- Corporate Services -> Key Account Manager
    (6, 6),  -- Staffing & Security -> SIC-Recruitment
    (7, 7),  -- Recruitment -> Field Officer- WFM
    (8, 8),  -- Finance -> Officer-HR MIS
    (9, 9),  -- Human Resources -> HSMS
    (10, 10), -- Information Technology -> Functional Consultant
    (11, 11), -- Legal -> Project Manager
    (12, 12), -- Marketing -> HR Director
    (13, 13), -- Operations -> Operations Manager
    (14, 14), -- Product Development -> Technical Lead
    (15, 15), -- Training & Development -> Finance Analyst
    (3, 16),  -- Security -> Engineering Manager
    (5, 17),  -- Corporate Services -> Project Coordinator
    (8, 18);  -- Finance -> Business Development Manager
-- Create the roles table




CREATE TABLE roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    role_code VARCHAR(255) UNIQUE NOT NULL,
    role_name VARCHAR(255) NOT NULL,
    role_category VARCHAR(255) NOT NULL
);

-- Insert additional role data
INSERT INTO roles (role_code, role_name, role_category)
VALUES
    ('LCSFNC01', 'Functional Consultant', 'Functional'),
    ('LCSMNG01', 'Project Manager', 'Managerial'),
    ('LCSHR00', 'HR Director', 'Strategic'),
    ('LCSMNG02', 'Operations Manager', 'Managerial'),
    ('LCSTEC01', 'Technical Lead', 'Functional'),
    ('LCSFIN01', 'Finance Analyst', 'Functional'),
    ('LCSENG01', 'Engineering Manager', 'Managerial'),
    ('LCSPRJ01', 'Project Coordinator', 'Functional'),
    ('LCSBIZ01', 'Business Development Manager', 'Strategic');
-- Create the departments table
CREATE TABLE departments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL
);

-- Insert department data
INSERT INTO departments (name)
VALUES
    ('HLM'),
    ('Security'),
    ('Staffing'),
    ('Corporate Services'),
    ('Staffing & Security'),
    ('Recruitment'),
    ('Finance'),
    ('Human Resources'),
    ('Information Technology'),
    ('Legal'),
    ('Marketing'),
    ('Operations'),
    ('Product Development'),
    ('Training & Development');



INSERT INTO employees (
    employee_number, employee_name, job_code,
    reporting_to, role_id, department_id,
    sent_to_evaluation_by, evaluation_status, evaluation_by, last_evaluated_date
)
VALUES
    ('EMP001', 'Employee 1', 'dummy', 'dummy', 1, '1', 1, 1, 'Not sent by anyone', NULL, 'Not evaluated', NULL),
    ('EMP002', 'Employee 2', 'LCSHLMR03', 'Functional Consultant', 1, '1', 2, 2, 'Not sent by anyone', NULL, 'Not evaluated', NULL),
    ('EMP003', 'Employee 3', 'LCSSTGR01', 'DIC - Security', 2, '1', 3, 3, 'Not sent by anyone', NULL, 'Not evaluated', NULL),
    ('EMP004', 'Employee 4', 'LCSSTGR02', 'SIC – Staffing Operations', 2, '1', 4, 4, 'Not sent by anyone', NULL, 'Not evaluated', NULL),
    ('EMP005', 'Employee 5', 'LCSSTGR02', 'SIC – Staffing Operations', 2, '1', 4, 4, 'Not sent by anyone', NULL, 'Not evaluated', NULL),
    ('EMP006', 'Employee 6', 'LCSSTGR03', 'Key Account Manager', 2, '1', 5, 4, 'Not sent by anyone', NULL, 'Not evaluated', NULL),
    ('EMP007', 'Employee 7', 'RVLOPSR05', 'HSMS', 2, '1', 9, 5, 'Not sent by anyone', NULL, 'Not evaluated', NULL),
    ('EMP008', 'Employee 8', 'RVLOPSR04', 'Officer-HR MIS', 2, '1', 8, 5, 'Not sent by anyone', NULL, 'Not evaluated', NULL),
    ('EMP009', 'Employee 9', 'RVLOPSR08', 'Field Officer- WFM', 2, '1', 7, 6, 'Not sent by anyone', NULL, 'Not evaluated', NULL),
    ('EMP010', 'Employee 10', 'LCSHLMR03', 'Functional Consultant', 1, '1', 2, 2, 'Not sent by anyone', NULL, 'Not evaluated', NULL),
    ('EMP011', 'Employee 11', 'LCSSTGR01', 'DIC - Security', 2, '1', 3, 3, 'Not sent by anyone', NULL, 'Not evaluated', NULL),
    ('EMP012', 'Employee 12', 'LCSSTGR03', 'Key Account Manager', 2, '1', 4, 4, 'Not sent by anyone', NULL, 'Not evaluated', NULL),
    ('EMP013', 'Employee 13', 'LCSSTGR06', 'SIC-Recruitment', 2, '1', 5, 5, 'Not sent by anyone', NULL, 'Not evaluated', NULL),
    ('EMP014', 'Employee 14', 'LCSSTGR06', 'SIC-Recruitment', 2, '1', 6, 6, 'Not sent by anyone', NULL, 'Not evaluated', NULL),
    ('EMP015', 'Employee 15', 'RVLOPSR08', 'Field Officer- WFM', 2, '1', 7, 7, 'Not sent by anyone', NULL, 'Not evaluated', NULL),
    ('EMP016', 'Employee 16', 'RVLOPSR04', 'Officer-HR MIS', 2, '1', 8, 8, 'Not sent by anyone', NULL, 'Not evaluated', NULL),
    ('EMP017', 'Employee 17', 'RVLOPSR05', 'HSMS', 3, '1', 9, 9, 'Not sent by anyone', NULL, 'Not evaluated', NULL),
    ('EMP018', 'Employee 18', 'LCSFNC01', 'Functional Consultant', 1, '1', 10, 10, 'Not sent by anyone', NULL, 'Not evaluated', NULL),
    ('EMP019', 'Employee 19', 'LCSMNG01', 'Project Manager', 3, '1', 11, 11, 'Not sent by anyone', NULL, 'Not evaluated', NULL),
    ('EMP020', 'Employee 20', 'LCSHR00', 'HR Director', 3, '1', 12, 12, 'Not sent by anyone', NULL, 'Not evaluated', NULL),
    ('EMP021', 'Employee 21', 'LCSMNG02', 'Operations Manager', 3, '1', 13, 13, 'Not sent by anyone', NULL, 'Not evaluated', NULL),
    ('EMP022', 'Employee 22', 'LCSTEC01', 'Technical Lead', 2, '1', 14, 14, 'Not sent by anyone', NULL, 'Not evaluated', NULL),
    ('EMP023', 'Employee 23', 'LCSFIN01', 'Finance Analyst', 2, '1', 15, 15, 'Not sent by anyone', NULL, 'Not evaluated', NULL),
    ('EMP024', 'Employee 24', 'LCSENG01', 'Engineering Manager', 2, '1', 16, 3, 'Not sent by anyone', NULL, 'Not evaluated', NULL),
    ('EMP025', 'Employee 25', 'LCSPRJ01', 'Project Coordinator', 2, '1', 17, 5, 'Not sent by anyone', NULL, 'Not evaluated', NULL),
    ('EMP026', 'Employee 26', 'LCSBIZ01', 'Business Development Manager', 3, '1', 18, 8, 'Not sent by anyone', NULL, 'Not evaluated', NULL);



-- Set NULL for managers' reporting_to
UPDATE employees SET reporting_to = NULL WHERE employee_number IN ('EMP002', 'EMP003', 'EMP004', 'EMP005');

-- Assign random managers to other employees

-- Assign random managers to other employees
UPDATE employees SET reporting_to = 'EMP002' WHERE employee_number IN ('EMP001', 'EMP007', 'EMP013', 'EMP020', 'EMP025');
UPDATE employees SET reporting_to = 'EMP004' WHERE employee_number IN ('EMP006', 'EMP008', 'EMP014', 'EMP021', 'EMP026');
UPDATE employees SET reporting_to = 'EMP004' WHERE employee_number IN ('EMP009', 'EMP010', 'EMP015', 'EMP018', 'EMP022');
UPDATE employees SET reporting_to = 'EMP005' WHERE employee_number IN ('EMP011', 'EMP012', 'EMP016', 'EMP017', 'EMP019', 'EMP023', 'EMP024');

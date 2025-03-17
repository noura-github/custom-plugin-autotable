import sqlite3
import os


db_name = 'autotable_plugin.db'

def check_database_exists():
    # Check if the database file already exists
    if os.path.exists(db_name):
        print("Database already exists.")
        return True
    else:
        print("Database does not exist. It will be created upon connection.")
        return False

# Function to create the database and tables
def create_database():
    # Connect to SQLite database (or create it if it doesn't exist)
    conn = sqlite3.connect(db_name)
    cursor = conn.cursor()

    # Create the files table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS files (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        filename TEXT NOT NULL,
        description TEXT,
        file BLOB
    )
    ''')
    print("Table 'files' created successfully.")

    # Create the company table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS company (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE
    )
    ''')
    print("Table 'company' created successfully.")

    # Create the department table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS department (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        company_id INTEGER NOT NULL,
        FOREIGN KEY (company_id) REFERENCES company (id)
    )
    ''')
    print("Table 'department' created successfully.")

    # Create the employee table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS employee (
        id INTEGER PRIMARY KEY,
        firstname TEXT NOT NULL,
        lastname TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT NOT NULL,
        departmentId INTEGER NOT NULL,
        file_id INTEGER,
        FOREIGN KEY (departmentId) REFERENCES department (id),
        FOREIGN KEY (file_id) REFERENCES files (id)
    )
    ''')
    print("Table 'employee' created successfully.")

    # Commit changes and close the connection
    conn.commit()
    conn.close()


# Function to populate the files table
def insert_file(filename, description, filepath):
    # Connect to SQLite database
    conn = sqlite3.connect(db_name)
    cursor = conn.cursor()

    # Read the file as binary data
    with open(filepath, 'rb') as file:
        file_data = file.read()

    # Insert the file into the table
    cursor.execute('''
        INSERT INTO files (filename, description, file)
        VALUES (?, ?, ?)
    ''', (filename, description, file_data))

    print(f"File '{filename}' inserted successfully.")

    # Commit changes and close the connection
    conn.commit()
    conn.close()

def populate_files():
    insert_file('Dock.jpg', 'A dock over a lake at night.', 'static/images/Dock.jpg')
    insert_file('Fields.jpg', 'A road in the fields of flowers leading to the mountains.', 'static/images/Fields.jpg')
    insert_file('Waterfall.jpg', 'A Cascading Waterfall under pink trees.', 'static/images/Waterfall.jpg')
    insert_file('Lake.jpg', 'A a blue water lake.', 'static/images/Lake.jpg')

# Function to populate the employee table (with companies and departments)
def populate_employee_table():
    employee_data = {
        "employees": [
            {"id": 1, "firstname": "Alice", "lastname": "Smith", "email": "alice@techcorp.com", "phone": "555-0246",
             "departmentName": "Engineering", "companyName": "TechCorp"},
            {"id": 2, "firstname": "Bob", "lastname": "Brown", "email": "bob@techcorp.com", "phone": "555-1234",
             "departmentName": "Engineering", "companyName": "TechCorp"},
            {"id": 3, "firstname": "Charlie", "lastname": "Davis", "email": "charlie@techcorp.com", "phone": "555-3781",
             "departmentName": "Marketing", "companyName": "TechCorp"},
            {"id": 4, "firstname": "David", "lastname": "Wilson", "email": "david@techmicro.com", "phone": "555-0998",
             "departmentName": "Sales", "companyName": "TechMicro"},
            {"id": 5, "firstname": "Mary", "lastname": "Johnson", "email": "mary@techmicro.com", "phone": "555-1165",
             "departmentName": "HR", "companyName": "TechMicro"}
        ]
    }

    # Connect to SQLite database
    conn = sqlite3.connect(db_name)
    cursor = conn.cursor()

    # Cache inserted company and department IDs
    company_ids = {}
    department_ids = {}

    for emp in employee_data["employees"]:
        company_name = emp["companyName"]
        department_name = emp["departmentName"]

        # Insert company if it doesn't exist
        if company_name not in company_ids:
            cursor.execute('SELECT id FROM company WHERE name = ?', (company_name,))
            result = cursor.fetchone()
            if result:
                company_id = result[0]
            else:
                cursor.execute('INSERT INTO company (name) VALUES (?)', (company_name,))
                company_id = cursor.lastrowid
            company_ids[company_name] = company_id

        # Insert department if it doesn't exist
        dept_key = (department_name, company_ids[company_name])
        if dept_key not in department_ids:
            cursor.execute('SELECT id FROM department WHERE name = ? AND company_id = ?', dept_key)
            result = cursor.fetchone()
            if result:
                department_id = result[0]
            else:
                cursor.execute('INSERT INTO department (name, company_id) VALUES (?, ?)', dept_key)
                department_id = cursor.lastrowid
            department_ids[dept_key] = department_id

        # Insert employee
        cursor.execute('''
        INSERT INTO employee (id, firstname, lastname, email, phone, departmentId)
        VALUES (?, ?, ?, ?, ?, ?)
        ''', (
            emp["id"],
            emp["firstname"],
            emp["lastname"],
            emp["email"],
            emp["phone"],
            department_ids[dept_key]
        ))

    print("Employee, Department, and Company data inserted successfully.")

    # Commit changes and close the connection
    conn.commit()
    conn.close()


# Function to link an employee to a file
def link_employee_to_file(employee_id, file_id):
    # Connect to SQLite database
    conn = sqlite3.connect(db_name)
    cursor = conn.cursor()

    # Update the employee table with the file_id
    cursor.execute('''
    UPDATE employee SET file_id = ? WHERE id = ?
    ''', (file_id, employee_id))

    print(f"Employee with ID {employee_id} linked to file ID {file_id}.")

    # Commit changes and close the connection
    conn.commit()
    conn.close()

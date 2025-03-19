
from RequestUtils import Employee, Feedback, SaveResult
from employee_db import db_name


def get_employee_data():
    # Connect to SQLite database
    conn = sqlite3.connect(db_name)
    cursor = conn.cursor()

    # Query to join employee, department, company, and files
    cursor.execute('''
        SELECT employee.id, employee.firstname, employee.lastname, employee.email, employee.phone,
               department.id AS departmentId, department.name AS departmentName,
               company.name AS companyName,
               employee.file_id, files.filename, files.description
        FROM employee
        INNER JOIN department ON employee.departmentId = department.id
        INNER JOIN company ON department.company_id = company.id
        LEFT JOIN files ON employee.file_id = files.id
    ''')

    # Fetch the employee data
    rows = cursor.fetchall()

    # Convert to a list of dictionaries
    employee_data = [
        {
            "id": row[0],
            "firstname": row[1],
            "lastname": row[2],
            "email": row[3],
            "phone": row[4],
            "departmentId": row[5],
            "departmentName": row[6],
            "companyName": row[7],
            "file_id": row[8],
            "filename": row[9],
            "description": row[10]
        }
        for row in rows
    ]

    # Close the connection
    conn.close()

    return employee_data


# Function to find an image file by file_id
def find_image_file(file_id):
    # Connect to SQLite database
    conn = sqlite3.connect(db_name)
    cursor = conn.cursor()

    # Query the table for the file
    cursor.execute('''
        SELECT file FROM files WHERE id = ?
    ''', (file_id,))

    # Fetch the file data
    file_data = cursor.fetchone()

    # Close the connection
    conn.close()

    return file_data


def get_employee_data():
    # Connect to SQLite database
    conn = sqlite3.connect(db_name)
    cursor = conn.cursor()

    # Query to join employee, department, company, and files
    cursor.execute('''
        SELECT employee.id, employee.firstname, employee.lastname, employee.email, employee.phone,
               department.id AS departmentId, department.name AS departmentName,
               company.id AS companyId, company.name AS companyName,
               employee.file_id, files.filename, files.description
        FROM employee
        INNER JOIN department ON employee.departmentId = department.id
        INNER JOIN company ON department.company_id = company.id
        LEFT JOIN files ON employee.file_id = files.id
    ''')

    # Fetch the employee data
    rows = cursor.fetchall()

    # Convert to a list of dictionaries
    employee_data = [
        {
            "id": row[0],
            "firstname": row[1],
            "lastname": row[2],
            "email": row[3],
            "phone": row[4],
            "departmentId": row[5],
            "departmentName": row[6],
            "companyId": row[7],
            "companyName": row[8],
            "file_id": row[9],
            "filename": row[10],
            "description": row[11]
        }
        for row in rows
    ]

    # Close the connection
    conn.close()

    return employee_data


# Function to find an image file by file_id
def find_image_file(file_id):
    # Connect to SQLite database
    conn = sqlite3.connect(db_name)
    cursor = conn.cursor()

    # Query the table for the file
    cursor.execute('''
        SELECT file FROM files WHERE id = ?
    ''', (file_id,))

    # Fetch the file data
    file_data = cursor.fetchone()

    # Close the connection
    conn.close()

    return file_data


# ✅ New: Function to get all companies
def get_companies():
    # Connect to SQLite database
    conn = sqlite3.connect(db_name)
    cursor = conn.cursor()

    # Query all companies
    cursor.execute('SELECT id, name FROM company')
    rows = cursor.fetchall()

    # Convert to a list of dictionaries
    companies = [
        {"id": row[0], "name": row[1]}
        for row in rows
    ]

    # Close the connection
    conn.close()

    return companies


def get_company_departments(comp_id):
    # Connect to SQLite database
    conn = sqlite3.connect(db_name)
    cursor = conn.cursor()

    # Query all departments for the given company ID
    cursor.execute('''
        SELECT id, name FROM department
        WHERE company_id = ?
    ''', (comp_id,))

    rows = cursor.fetchall()

    # Convert to list of dictionaries
    departments = [
        {"id": row[0], "name": row[1]}
        for row in rows
    ]

    # Close connection
    conn.close()

    return departments


import re
import sqlite3

def validate_employee_data(emp):
    if not isinstance(emp, Employee):
        return SaveResult(0, "Invalid data. Expected an Employee instance."), 400

    # First name: only letters
    if emp.emp_firstname and not re.fullmatch(r"[A-Za-z]+", emp.emp_firstname):
        return SaveResult(0, "First name must contain only letters."), 400

    # Last name: only letters
    if emp.emp_lastname and not re.fullmatch(r"[A-Za-z]+", emp.emp_lastname):
        return SaveResult(0, "Last name must contain only letters."), 400

    # Email: simple pattern check
    if emp.emp_email and not re.fullmatch(r"[^@]+@[^@]+\.[^@]+", emp.emp_email):
        return SaveResult(0, "Invalid email format."), 400

    # Phone: allow digits, optional dashes/spaces/parentheses
    if emp.emp_phone and not re.fullmatch(r"[\d\s\-\(\)]+", emp.emp_phone):
        return SaveResult(0, "Invalid phone number format."), 400

    return None  # Everything is valid


def check_company_and_department(cursor, emp):
    # Validate company
    cursor.execute('SELECT id FROM company WHERE id = ?', (emp.emp_comp,))
    if not cursor.fetchone():
        return SaveResult(0, f"Company with ID {emp.emp_comp} does not exist."), 400

    # Validate department under company
    cursor.execute('SELECT id FROM department WHERE id = ? AND company_id = ?', (emp.emp_dep, emp.emp_comp))
    if not cursor.fetchone():
        return SaveResult(0, f"Department with ID {emp.emp_dep} under company ID {emp.emp_comp} does not exist."), 400

    return None


def insert_employee(cursor, emp):
    cursor.execute('''
        INSERT INTO employee (firstname, lastname, email, phone, departmentId)
        VALUES (?, ?, ?, ?, ?)
    ''', (
        emp.emp_firstname,
        emp.emp_lastname,
        emp.emp_email,
        emp.emp_phone,
        emp.emp_dep
    ))
    return cursor.lastrowid


def update_employee(cursor, emp):
    # Check if employee exists
    cursor.execute('SELECT id FROM employee WHERE id = ?', (emp.emp_id,))
    if not cursor.fetchone():
        return SaveResult(0, f"Employee with ID {emp.emp_id} does not exist."), 400

    # Perform update
    cursor.execute('''
        UPDATE employee
        SET firstname = ?, lastname = ?, email = ?, phone = ?, departmentId = ?
        WHERE id = ?
    ''', (
        emp.emp_firstname,
        emp.emp_lastname,
        emp.emp_email,
        emp.emp_phone,
        emp.emp_dep,
        emp.emp_id
    ))
    return SaveResult(emp.emp_id, "Employee updated successfully."), 200


def save_employee(emp):
    # Step 1: Validate object and fields
    validation_error = validate_employee_data(emp)
    if validation_error:
        return validation_error

    conn = sqlite3.connect(db_name)
    cursor = conn.cursor()

    try:
        # Step 2: Validate related data (company & department)
        relation_error = check_company_and_department(cursor, emp)
        if relation_error:
            return relation_error

        # Step 3: Insert or update
        if emp.emp_id == 0:
            new_emp_id = insert_employee(cursor, emp)
            conn.commit()
            return SaveResult(new_emp_id, "Employee created successfully."), 201
        else:
            result = update_employee(cursor, emp)
            conn.commit()
            return result

    except sqlite3.IntegrityError as e:
        conn.rollback()
        return SaveResult(0, f"Database error: {e}"), 400

    except Exception as e:
        conn.rollback()
        return SaveResult(0, f"Unexpected error: {e}"), 500

    finally:
        conn.close()



# Function to delete an employee
def delete_employee(emp_id):
    try:
        with sqlite3.connect(db_name) as conn:
            cursor = conn.cursor()

            # Check if employee exists
            cursor.execute('SELECT id FROM employee WHERE id = ?', (emp_id,))
            if not cursor.fetchone():
                return Feedback(False, f"Employee with ID {emp_id} does not exist.")

            # Perform the delete operation
            cursor.execute('DELETE FROM employee WHERE id = ?', (emp_id,))
            conn.commit()

            return Feedback(True, f"Employee with ID {emp_id} deleted successfully.")

    except sqlite3.Error as e:
        print(f"SQLite error: {e}")
        return Feedback(False, f"Database error: {e}")

    except Exception as e:
        print(f"Unexpected error: {e}")
        return Feedback(False, f"Unexpected error: {e}")


import sqlite3
from werkzeug.utils import secure_filename

import sqlite3
from werkzeug.utils import secure_filename
from flask import Response, jsonify

def save_or_update_file_and_link_employee(employee_id, file, filename, description, file_id=0):
    try:
        # Connect to SQLite database
        conn = sqlite3.connect(db_name)
        cursor = conn.cursor()

        if file_id == 0:
            # If no file_id is provided (or file_id is 0), insert a new file
            file_data = file.read()

            # Insert the new file into the 'files' table
            cursor.execute('''
                INSERT INTO files (filename, description, file)
                VALUES (?, ?, ?)
            ''', (filename, description, file_data))

            # Get the file_id of the inserted file
            file_id = cursor.lastrowid

            print(f"New file '{filename}' inserted into database with file_id {file_id}.")
        else:
            # If file_id is provided (i.e., file already exists), update the existing file
            file_data = file.read()

            # Update the existing file in the 'files' table
            cursor.execute('''
                UPDATE files
                SET filename = ?, description = ?, file = ?
                WHERE id = ?
            ''', (filename, description, file_data, file_id))

            print(f"Existing file with file_id {file_id} updated in the database.")

        # Link the file to the employee by updating the employee's file_id
        cursor.execute('''
            UPDATE employee SET file_id = ? WHERE id = ?
        ''', (file_id, employee_id))

        print(f"File with file_id {file_id} linked to employee with ID {employee_id}.")

        # Commit changes and close the connection
        conn.commit()
        conn.close()

        return file_id  # Optionally, return the file_id for further use

    except sqlite3.DatabaseError as e:
        # Handle database errors
        print(f"Database error: {e}")
        return Response(f"Database error: {e}", status=500)

    except Exception as e:
        # Handle other unexpected errors
        print(f"Unexpected error: {e}")
        return Response(f"Unexpected error: {e}", status=500)


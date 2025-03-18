from flask import Flask, jsonify, render_template, request, Response

from RequestUtils import Employee
from employee_db import create_database, populate_employee_table, populate_files, link_employee_to_file, \
    check_database_exists
from employee_module import find_image_file, get_employee_data, get_companies, get_company_departments, delete_employee, \
    save_employee

import time

app = Flask(__name__)


# Route to create or update employee
@app.route('/save_data', methods=['POST'])
def save_employee_data():
    data = request.get_json()
    if not data:
        return Response("Missing data in request body", status=400)

    try:
        emp = Employee(**data)
    except TypeError as e:
        print(f"Invalid employee data: {e}")
        return Response("Invalid employee data", status=400)

    feedback, status = save_employee(emp)
    return jsonify({
        "message": feedback.message,
        "emp_id": feedback.emp_id
    }), status



# Route to delete an employee
@app.route('/delete_employee', methods=['POST'])
def remove_employee():
    data = request.get_json()
    if not data or "id" not in data:
        return Response("Missing 'id' in request body", status=400)


    feedback = delete_employee(data.get('id'))

    if not feedback.status:
        return Response(feedback.message, status=400)

    return jsonify(feedback.message)




# Route to fetch data
@app.route('/employees_data', methods=['GET'])
def get_data():
    # Sample data to send to the frontend
    return jsonify(get_employee_data())


# Route to fetch companies data
@app.route('/companies', methods=['GET'])
def get_companies_data():
    # Sample data to send to the frontend
    return jsonify(get_companies())


# Route to fetch departments data
@app.route('/departments', methods=['POST'])
def get_departments():
    data = request.get_json()
    if not data or "id" not in data:
        return Response("Missing 'id' in request body", status=400)

    companyId = data.get('id')

    # Dummy return for now
    return jsonify(get_company_departments(companyId))


@app.route('/imagedata', methods=['POST'])
def get_image_data():
    # Ensure request contains JSON data
    data = request.get_json()

    if not data or 'id' not in data:
        return Response("Missing 'id' in request body", status=400)

    file_id = data.get('id')

    # Your logic to retrieve the file data
    file_row = find_image_file(file_id)
    if not file_row or not file_row[0]:
        return Response("File not found", status=404)

    blob_data = file_row[0]

    # Return binary data with appropriate headers
    response = Response(blob_data, mimetype='application/octet-stream')
    response.headers['Content-Disposition'] = 'attachment; filename="output_file.bin"'
    return response


# Route for the home page
@app.route('/')
def index():
    return render_template('index.html')


def init_db():
    create_database()
    populate_employee_table()
    populate_files()

    # Link employees to files
    link_employee_to_file(1, 1)
    link_employee_to_file(3, 2)
    link_employee_to_file(4, 3)
    link_employee_to_file(2, 4)

if __name__ == '__main__':
    # Initialize the database, populate it with data, and link employees to files
    # You can replace this with your own initialization logic
    if not check_database_exists():
        init_db()
    app.run(debug=True)



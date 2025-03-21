import os

import pytest
from app.employee_db import create_database, populate_employee_table
from app.employee_module import (
    get_employee_data,
    find_image_file,
    get_companies,
    get_company_departments,
    validate_employee_data,
    save_employee,
    delete_employee
)
from app.RequestUtils import Employee, Feedback


TEST_DB = 'test_autotable.db'

@pytest.fixture(autouse=True)
def setup_and_teardown(monkeypatch):
    monkeypatch.setattr('employee_db.db_name', TEST_DB)
    monkeypatch.setattr('employee_module.db_name', TEST_DB)

    if os.path.exists(TEST_DB):
        os.remove(TEST_DB)

    create_database()
    populate_employee_table()

    yield

    if os.path.exists(TEST_DB):
        os.remove(TEST_DB)

def test_get_employee_data():
    data = get_employee_data()
    assert isinstance(data, list)
    assert len(data) > 0
    assert "firstname" in data[0]

def test_get_companies():
    companies = get_companies()
    assert isinstance(companies, list)
    assert len(companies) > 0
    assert "id" in companies[0]
    assert "name" in companies[0]

def test_get_company_departments():
    companies = get_companies()
    company_id = companies[0]["id"]
    departments = get_company_departments(company_id)
    assert isinstance(departments, list)
    assert "id" in departments[0]
    assert "name" in departments[0]

def test_validate_employee_data_valid():
    emp = Employee(0, "John", "Doe", "john@example.com", "123-4567", 1, 1)
    result = validate_employee_data(emp)
    assert result is None

def test_validate_employee_data_invalid_email():
    emp = Employee(0, "John", "Doe", "invalid-email", "123-4567", 1, 1)
    result, code = validate_employee_data(emp)
    assert code == 400
    assert "Invalid email format" in result.message

def test_save_new_employee():
    emp = Employee(0, "Anna", "Taylor", "anna@company.com", "555-9090", 1, 1)
    result, code = save_employee(emp)
    assert code == 201
    assert result.emp_id > 0

def test_update_existing_employee():
    emp = Employee(0, "Update", "Test", "update@test.com", "555-1111", 1, 1)
    created, _ = save_employee(emp)
    emp.emp_id = created.emp_id  # Corrected attribute name
    emp.emp_firstname = "UpdatedName"
    result, code = save_employee(emp)
    assert code == 200
    assert result.message == "Employee updated successfully."


def test_delete_employee_success():
    emp = Employee(0, "Delete", "Me", "delete@me.com", "555-2222", 1, 1)
    saved, _ = save_employee(emp)
    emp_id = saved.emp_id
    response = delete_employee(emp_id)
    assert isinstance(response, Feedback)
    assert response.status
    assert f"Employee with ID {emp_id} deleted successfully." in response.message

def test_delete_employee_not_found():
    response = delete_employee(9999)
    assert isinstance(response, Feedback)
    assert not response.status  # Correct attribute name
    assert "does not exist" in response.message


def test_find_image_file_returns_none_for_missing():
    assert find_image_file(9999) is None

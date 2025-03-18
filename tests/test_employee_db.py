import os
import sqlite3
import pytest
from employee_db import (
    check_database_exists,
    create_database,
    insert_file,
    populate_files,
    populate_employee_table,
    link_employee_to_file,
    db_name
)

# Override db_name for test isolation
TEST_DB = 'test_autotable_plugin.db'


@pytest.fixture(autouse=True)
def setup_and_teardown(monkeypatch):
    # Redirect to a test DB
    monkeypatch.setattr('employee_db.db_name', TEST_DB)
    # Cleanup before and after each test
    if os.path.exists(TEST_DB):
        os.remove(TEST_DB)
    yield
    if os.path.exists(TEST_DB):
        os.remove(TEST_DB)


def test_check_database_exists_false():
    assert check_database_exists() is False


def test_create_database_creates_tables():
    create_database()
    conn = sqlite3.connect(TEST_DB)
    cursor = conn.cursor()

    tables = [row[0] for row in cursor.execute(
        "SELECT name FROM sqlite_master WHERE type='table'").fetchall()]

    expected = {'files', 'company', 'department', 'employee'}
    assert expected.issubset(set(tables))
    conn.close()


def test_insert_file_creates_file_entry(tmp_path):
    create_database()

    # Create a dummy file
    file_path = tmp_path / "dummy.jpg"
    file_path.write_bytes(b"fake image content")

    insert_file("dummy.jpg", "A test file", str(file_path))

    conn = sqlite3.connect(TEST_DB)
    cursor = conn.cursor()
    cursor.execute("SELECT filename, description FROM files")
    result = cursor.fetchone()
    assert result == ("dummy.jpg", "A test file")
    conn.close()


def test_populate_employee_table():
    create_database()
    populate_employee_table()

    conn = sqlite3.connect(TEST_DB)
    cursor = conn.cursor()

    cursor.execute("SELECT COUNT(*) FROM employee")
    employee_count = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM company")
    company_count = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM department")
    dept_count = cursor.fetchone()[0]

    assert employee_count == 5
    assert company_count >= 2
    assert dept_count >= 3
    conn.close()


def test_link_employee_to_file(tmp_path):
    create_database()
    populate_employee_table()

    # Create dummy file
    file_path = tmp_path / "dummy.jpg"
    file_path.write_bytes(b"fake image content")
    insert_file("dummy.jpg", "A test file", str(file_path))

    # Get file ID and employee ID
    conn = sqlite3.connect(TEST_DB)
    cursor = conn.cursor()
    cursor.execute("SELECT id FROM files LIMIT 1")
    file_id = cursor.fetchone()[0]

    cursor.execute("SELECT id FROM employee LIMIT 1")
    employee_id = cursor.fetchone()[0]
    conn.close()

    link_employee_to_file(employee_id, file_id)

    conn = sqlite3.connect(TEST_DB)
    cursor = conn.cursor()
    cursor.execute("SELECT file_id FROM employee WHERE id = ?", (employee_id,))
    linked_id = cursor.fetchone()[0]
    assert linked_id == file_id
    conn.close()

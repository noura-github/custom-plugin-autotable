from marshmallow import Schema, fields, ValidationError

class Employee:
    def __init__(self, emp_id=0, emp_firstname='', emp_lastname='', emp_email='', emp_phone='', emp_comp=1, emp_dep=1):
        self.emp_id = emp_id
        self.emp_firstname = emp_firstname
        self.emp_lastname = emp_lastname
        self.emp_email = emp_email
        self.emp_phone = emp_phone
        self.emp_comp = emp_comp
        self.emp_dep = emp_dep


class Feedback:
    def __init__(self, status, message):
        self.status = status
        self.message = message


class SaveResult:
    def __init__(self, emp_id=0, message=""):
        self.emp_id = emp_id
        self.message = message

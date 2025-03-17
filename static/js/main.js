
$(document).ready(function () {
    getCompanyData();
});

function getCompanyData() {

    $.ajax({
        type: 'GET',
        url: '/companies',
        data: {
        },
        dataType: 'json',
        success: function(data) {
            $("#table_container").data("companies", JSON.stringify(data));
            for (let item of data) {
                getDepartmentData(item.id);
            }
        },
        error: function(xhr, status, error) {
            console.error("Error: ", error, "Status: ", status);
        }
    });
}

function getDepartmentData(companyId) {

    $.ajax({
        type: 'POST',
        url: '/departments',
        dataType: 'json',
        contentType: 'application/json',
        data: JSON.stringify({ 'id': companyId }),
        success: function(data) {
            $("#table_container").data("company-" + companyId, JSON.stringify(data));
            getEmployeeData();
        },
        error: function(xhr, status, error) {
            console.error("Error: ", error, "Status: ", status);
        }
    });
}

function buildSelect(data, id, cls) {
    let $select = $("<select class='" + cls + "'></select>");
    for (let item of data) {
        let $option = $("<option></option>");
        $option.attr("value", item.id);
        if (item.id === id){
            $option.attr("selected", true);
        }
        $option.text(item.name);
        $select.append($option);
    }
    return $select;
}

function loadSelectOptions($select, data, id) {
    // Clear all existing options
    $select.empty();

    // Add new options from the data
    for (let item of data) {
        let $option = $("<option></option>");
        $option.attr("value", item.id);
        if (item.id === id){
            $option.attr("selected", true);
        }
        $option.text(item.name);
        $select.append($option);
    }
}

function fill_header(){
    let header = [];
    header.push("ID");
    header.push("First Name");
    header.push("Last Name");
    header.push("Email");
    header.push("Phone");
    header.push("Company Name");
    header.push("Department Name");
    header.push("Profile" + "<img src='static/images/profile.png' id='profile_info' class='plugin_img'>");
    return header;
}

function initAutoTab(data) {

    let tab = $("#table_container");
    let initialRows = [];

    $.each(data, function(index, employee) {
        initialRows.push(getNewRow(employee));
    });

    var header = fill_header();

    tab.autotable({
        headDef: {
            title: header
        },
        onInsert: function(row, startup, prevRow) {
            let td = $("<td class='no_border'></td>");
            td.append('<img src="static/images/wait.png" class="hidden emp_wait plugin_img">');
            td.append('<img src="static/images/warning.png" class="hidden emp_warning plugin_img">');
            td.append('<img src="static/images/success.png" class="hidden emp_success plugin_img">');
            row.append(td);
            if(startup) {
                row.find(".emp_success").show();
            } 
        },
        onRemove: deleteRow,
        emptyRow: getNewRow,
        initialRows: initialRows,
        afterInsert: function() {
        },
        insertImageSrc: "static/images/add.png",
        removeImageSrc: "static/images/minus.png",
        addImgTitle: "Insert new row",
        removeImageTitle: "Delete row",
        tableClass: 'employee_table',
        disabled: false
    });
}

function deleteRow($row, callback) {
    let id = $row.data("id");
    if (!id) {
        $row.remove();
        return;
    }
    $row.find(".emp_wait").show();
    $row.find(".emp_warning").hide();
    $row.find(".emp_success").hide();

    $.ajax({
        type: 'POST',
        url: '/delete_employee',
        dataType: 'json',
        contentType: 'application/json',
        data: JSON.stringify({ 'id': id }),
        success: function(data) {
            $row.remove();
        },
        error: function(xhr, status, error) {
            $row.find(".emp_wait").hide();
            $row.find(".emp_warning").show();
            $row.find(".emp_warning").attr("title", xhr.responseText);
        }
    });
}

function getRowData(cells) {
    return {
        emp_id: Number(cells.find(".emp_id").text()),
        emp_firstname: cells.find(".emp_firstname").val(),
        emp_lastname: cells.find(".emp_lastname").val(),
        emp_email: cells.find(".emp_email").val(),
        emp_phone: cells.find(".emp_phone").val(),
        emp_comp: Number(cells.find(".emp_comp").val()),
        emp_dep: Number(cells.find(".emp_dep").val()),
    }
}

function saveRowData($row) {
    $row.find(".emp_success").hide();
    $row.find(".emp_warning").hide();
    $row.find(".emp_wait").show();
    let cells = $row.find("td");
    let employee_data = getRowData(cells);

    $.ajax({
        type: 'POST',
        url: '/save_data',
        dataType: 'json',
        contentType: 'application/json',
        data: JSON.stringify(employee_data),
        success: function(result) {
            result.emp_id
            if (result && result.emp_id > 0){
                cells.find(".emp_id").text(result.emp_id);
            }
            $row.find(".emp_wait").hide();
            $row.find(".emp_success").show();
        },
        error: function(xhr, status, error) {
            let result = JSON.parse(xhr.responseText)
            $row.find(".emp_wait").hide();
            $row.find(".emp_warning").attr("title", result.message);
            $row.find(".emp_warning").show();
        }
    });
}

function getNewRow(e) {
    let tab = $("#table_container");

    let row = $("<tr></tr>");
    let id = (e && e.id ? e.id : 0);
    id && row.data("id", id);
    td = $("<td><span class='emp_id'>" + id + "</span></td>");row.append(td);

    let firstname = (e && e.firstname ? e.firstname : "");
    let input_firstname = $("<input type='text' class='emp_firstname' placeholder='Enter first name' value='" + firstname + "'>");
    input_firstname.attr("disabled", (firstname ? true : false));
    input_firstname.on("change", function() {
        let firstname = $(this).val();
        saveRowData(row);
        //Save the new firstname in DB
    })
    td = $("<td></td>");td.append(input_firstname);row.append(td);

    let lastname = (e && e.lastname ? e.lastname : "");
    let input_lastname = $("<input type='text' class='emp_lastname' placeholder='Enter last name' value='" + lastname + "'>");
    input_lastname.attr("disabled", (lastname ? true : false));
    input_lastname.on("change", function() {
        let lastname = $(this).val();
        //Save the new lastname in DB
        saveRowData(row);
    })
    td = $("<td></td>");td.append(input_lastname);row.append(td);

    let email = (e && e.email ? e.email : "");
    let input_email = $("<input type='text' class='emp_email' placeholder='Enter email' value='" + email + "'>");
    input_email.on("change", function() {
        let email = $(this).val();
        //Save the new email in DB
        saveRowData(row);
    })
    td = $("<td></td>");td.append(input_email);row.append(td);

    let phone = (e && e.phone ? e.phone : "");
    let input_phone = $("<input type='text' class='emp_phone' placeholder='Enter phone' value='" + phone + "'>");
    input_phone.on("change", function() {
        let phone = $(this).val();
        //Save the new phone in DB
        saveRowData(row);
    })
    td = $("<td></td>");td.append(input_phone);row.append(td);

    let companiesJson = tab.data("companies");
    let companies = companiesJson ? JSON.parse(companiesJson) : [];
    let companyId = e && e.companyId ? e.companyId : 0;
    let $companySelect = buildSelect(companies, companyId, "emp_comp");

    if (companyId === 0 && $companySelect.val()){
        companyId = $companySelect.val();
    }
    td = $("<td></td>");td.append($companySelect);
    row.append(td);

    let depsJson = tab.data("company-" + companyId)
    let departments = depsJson ? JSON.parse(depsJson) : [];
    let depId = (e && e.departmentId ? e.departmentId : 0)
    let $depSelect = buildSelect(departments, depId, "emp_dep");
    td = $("<td></td>");td.append($depSelect);
    row.append(td);

    $companySelect.on("change", function(){
        let selCp = $(this).val();
        let depsJsonPerCp = tab.data("company-" + selCp)
        let departmentsPerCp = depsJsonPerCp ? JSON.parse(depsJsonPerCp) : [];
        loadSelectOptions($depSelect, departmentsPerCp, selCp);
    });

    $depSelect.on("change", function(){
        saveRowData(row);
    });

    td = $("<td><img src='static/images/info.png' class='plugin_img'></td>");
    row.append(td);

    return row;
}


function getEmployeeData() {
    $.ajax({
        type: 'GET',
        url: '/employees_data',
        dataType: 'json',
        success: function(data) {
            initAutoTab(data);
        },
        error: function(xhr, status, error) {
            console.error("Error: ", error, "Status: ", status);
        }
    });
}
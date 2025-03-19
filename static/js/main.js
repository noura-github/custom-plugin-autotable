
$(document).ready(function () {
    getCompanyData();
});

var imageCache = {};
var folderSrc = "static/images/folder.png";

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
        afterInsert: function($row) {
            loadInfoContent($row);

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
            if (result && result.emp_id > 0){
                $row.data("id", result.emp_id);
                cells.find(".emp_id").text(result.emp_id);
            }
            $row.find(".emp_wait").hide();
            $row.find(".emp_success").show();
            if (isDisabledInfoContent($row)){
                toggleInfoContent($row, false);
                loadInfoContent($row);
            }
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
    e && e.file_id && row.data("file_id", e.file_id);
    e && e.filename && row.data("filename", e.filename);
    e && e.description && row.data("description", e.description);
    td = $("<td><span class='emp_id'>" + id + "</span></td>");row.append(td);

    let firstname = (e && e.firstname ? e.firstname : "");
    let input_firstname = $("<input type='text' class='emp_firstname' placeholder='Enter first name' value='" + firstname + "'>");
    input_firstname.attr("disabled", (firstname ? true : false));
    input_firstname.on("change", function() {
        let firstname = $(this).val();
        //Save the new firstname in DB
        saveRowData(row);
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

    td = $("<td><img src='static/images/info.png' class='plugin_img info_tip'></td>");
    row.append(td);

    return row;
}
function isDisabledInfoContent($row){
    return $row.find(".info_tip").attr("disabled");
}

function toggleInfoContent($row, disabled){
    $row.find(".info_tip").attr("disabled", disabled);
}

function loadInfoContent($row){

    let id = $row.data("id");
    if (!id){
        toggleInfoContent($row, true);
        return;
    }
    let file_id = $row.data("file_id");
    if (!file_id){
        createInfoContent($row, folderSrc);
        return;
    }

    $.ajax({
        type: 'POST',
        url: "/imagedata",
        dataType: 'binary',
        processData: false,
        contentType: 'application/json',
        xhrFields: { responseType: 'blob' },
        data: JSON.stringify({ 'id': file_id }),
        success: function(blob) {
            // Create a URL for the blob
            let imageUrl = blob ? URL.createObjectURL(blob) : folderSrc;
            // Cache the image
            if (imageUrl !== folderSrc) {
                imageCache[id] = imageUrl;
            }
            createInfoContent($row, imageUrl)
        },
        error: function(xhr, status, error) {
            console.error("Error: ", xhr);
        }
    });
}

function createInfoContent($row, imageUrl){
    let id = $row.data("id");
    let filename = $row.data("filename") ? $row.data("filename") : "";
    let description = $row.data("description") ? $row.data("description") : "";

    let info_elem = $row.find(".info_tip");

    let content = $("<div class='tooltip-container'></div>");

    let imageContainer = $("<div class='content'></div>");
    let footerContainer = $("<div class='footer'></div>");
    let tooltipImg = $("<img class='tooltip_img' src='" + imageUrl + "'>");
    imageContainer.append(tooltipImg);

    let uploadFile = $("<div class='mb-3'></div>");
    let uploadFileInput = $("<input data-id='" + id + "' class='form-control' type='file' accept='image/png, image/jpg, image/jpeg'>");
    uploadFile.append(uploadFileInput);

    let descArea = $("<textarea class='img_desc form-control' rows='3'>" + description + "</textarea>");
    let infoFootSpan = $("<div></div>");
    infoFootSpan.append(descArea);
    footerContainer.append(infoFootSpan);

    content.append(imageContainer);
    content.append(footerContainer);
    content.append(uploadFile);

    tippy(".info_tip", {
        content: "",
        trigger: 'click',
        interactive: true,
        allowHTML: true,
    });

    let tippy_instance = info_elem[0]._tippy;
    info_elem[0]._tippy.setContent(content.html());

    $(document).on('change', uploadFileInput, function(e){
        let target = $(e.target);
        if (target.data("id") === id && e.target.files){
            const file = e.target.files[0];
            if (file) {
                saveInfoImage($row, file, descArea.val());
            }
        }
    });

}

function saveInfoImage($row, file, description){

    let file_id = $row.data("file_id") ? $row.data("file_id") : 0;
    let id = $row.data("id");
    console.log(file_id);

    const formData = new FormData();
    formData.append('id', file_id);
    formData.append('file_id', file_id);
    formData.append('file', file);
    formData.append('filename', file.name);
    formData.append('description', description);

    $.ajax({
        type: 'POST',
        url: "/save_imagedata",
        data: formData,
        processData: false,
        contentType: false,
        dataType: 'json',
        success: function(response) {
            $row.find(".tooltip_img").attr("src", URL.createObjectURL(file));
        },
        error: function(xhr, status, error) {
            console.error("Error: ", xhr);
        }
    });



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
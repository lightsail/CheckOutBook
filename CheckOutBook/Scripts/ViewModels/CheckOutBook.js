
qAViewModel = {
    ErrorMessage: null,
    IsErrorMessage: true,

    getApiUrl: function (apiURL) {
        return sessionStorage.getItem("domain") + apiURL;
    },

    getSchools: function () {
        var authorization_token = sessionStorage.getItem("authorization_token");
        var url = "api/Schools";
        url = qAViewModel.getApiUrl(url);

        $.ajax({
            type: 'GET',
            url: url,
            headers: { 'Authorization': authorization_token },
            dataType: 'json',
            contentType: 'application/json',
            async: false,
            success: function (result) {
                if (result) {
                    $("#ddlSchool").append("<option value='0' disabled selected>Select School</option>");
                    for (var i = 0; i < result.length; i++) {
                        $("#ddlSchool").append("<option value='" + result[i].schoolId + "'>" + result[i].userGroupOrganizationName + "</option>");
                    }
                }
            },
            error: function (err) {
            }
        });
    },

    getClasses: function (schoolId) {
        var authorization_token = sessionStorage.getItem("authorization_token");
        var url = "api/Schools/" + schoolId + "/Classes/";

        url = qAViewModel.getApiUrl(url);
        
        $.ajax({
            type: 'GET',
            url: url,
            headers: { 'Authorization': authorization_token },
            dataType: 'json',
            contentType: 'application/json',
            async: false,
            success: function (result) {
                if (result) {
                    $("#ddlClass").append("<option value='0' disabled selected>Select Class</option>");

                    for (var i = 0; i < result.length; i++) {
                        $("#ddlClass").append("<option value='" + result[i].classId + ',' + result[i].userGroupId + "'>" + result[i].name + "</option>");
                    }
                }
            },
            error: function (err) {
            }
        });
    },

    getStudents: function () {
        var classId = sessionStorage.getItem("classId");
        var authorization_token = sessionStorage.getItem("authorization_token");
        var url = "api/Classes/" + classId + "/Students/";

        url = qAViewModel.getApiUrl(url);
        
        $.ajax({
            type: 'GET',
            url: url,
            headers: { 'Authorization': authorization_token },
            dataType: 'json',
            contentType: 'application/json',
            async: false,
            success: function (result) {
                if (result) {
                    sessionStorage.setItem("Students",JSON.stringify(result));
                }
            },
            error: function (err) {
            }
        });
    },
    
    checkOutBookClicked: function (e) {
        var flag = false;

        if (sessionStorage.getItem("schoolId") == null) {
            qAViewModel.ErrorMessage ="Please select school";
            flag = true;
        }
        else if (sessionStorage.getItem("classId") == null || sessionStorage.getItem("classId") == "null") {
            qAViewModel.ErrorMessage = "Please select class";
            flag = true;
        }
        else if ($('#bookId').val() == "") {
            qAViewModel.ErrorMessage = "Please enter Book Id";
            flag = true;
        }

        if (flag) {
            qAViewModel.IsErrorMessage = true;
            $("#dvInstructions").show();
            $("#dvInstructions").removeClass("instructions").addClass("error-message").text(qAViewModel.ErrorMessage);
            $("#btnCheckOut").removeClass("btn-green").addClass("btn-error");
            return;
        }

        showSpinner();
        var students = JSON.parse(sessionStorage.getItem("Students"));
        var userGroupId = sessionStorage.getItem("userGroupId");
        //debugger;
        for (var i = 0; i < students.length; i++) {
            qAViewModel.checkOutBook(students[i].userId, userGroupId);
        }
        debugger;
        hideSpinner();
    },

    checkOutBook: function (userId, userGroupId) {
        var authorization_token = sessionStorage.getItem("authorization_token");
        var url = "api/Users/" + userId + "/CheckOut";

        url = qAViewModel.getApiUrl(url);
        debugger;
        var data =
                {
                    UserGroupId: userGroupId,
                    BookId: $('#bookId').val(),
                    BookTagId: null
                };

        $.ajax({
            type: 'PUT',
            url: url,
            headers: { 'Authorization': authorization_token },
            dataType: 'json',
            async: false,
            data : data,
            contentType: 'application/x-www-form-urlencoded',
            success: function (result) {
                debugger;
                if (result) {
                    debugger;
                }
            },
            error: function (err) {
                debugger;
            }
        });
    },
};

function schoolChanged(e) {
    showSpinner();
    $("#dvInstructions").removeClass("error-message").addClass("instructions");
    $("#btnCheckOut").removeClass("btn-error").addClass("btn-green");
    $("#dvInstructions").hide();
    sessionStorage.setItem("schoolId", e.value);
    sessionStorage.setItem("classId", null);
    $("#ddlClass").find('option').remove()
    qAViewModel.getClasses(e.value);
    hideSpinner();
}

function classChanged(e) {
    showSpinner();
    $("#dvInstructions").removeClass("error-message").addClass("instructions");
    $("#btnCheckOut").removeClass("btn-error").addClass("btn-green");
    $("#dvInstructions").hide();
    //debugger;
    var res = e.value.split(",");
    sessionStorage.setItem("classId", res[0]);
    sessionStorage.setItem("userGroupId", res[1]);

    qAViewModel.getStudents();
    hideSpinner();
}

$(document).ready(function () {
    showSpinner();
    qAViewModel.getSchools();
    hideSpinner();
})

function showSpinner() {
    $('#dvSpinnerPageLoad').removeClass('page-load-spinner-hide').addClass('page-load-spinner-show');
}

function hideSpinner() {
    $('#dvSpinnerPageLoad').removeClass('page-load-spinner-show').addClass('page-load-spinner-hide');
}


var sess_pollInterval = 60000;
var sess_expirationMinutes = 10;  // Log Out after minutes.
var sess_warningMinutes = 1;
var sess_intervalID;
var sess_lastActivity;

qAViewModel = {
    ErrorMessage: null,
    IsErrorMessage: true,
    bookCheckOutCount: 0,

    getApiUrl: function (apiURL)
    {
        return sessionStorage.getItem("domain") + apiURL;
    },

    getSchools: function ()
    {
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
            success: function (result)
            {
                if (result)
                {
                    $("#ddlSchool").append("<option value='0' disabled selected>Select School</option>");
                    for (var i = 0; i < result.length; i++)
                    {
                        $("#ddlSchool").append("<option value='" + result[i].schoolId + "'>" + result[i].userGroupOrganizationName + "</option>");
                    }
                }
            },
            error: function (err)
            {
            }
        });
    },

    getClasses: function (schoolId)
    {
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
            success: function (result)
            {
                if (result)
                {
                    $("#ddlClass").append("<option value='0' disabled selected>Select Class</option>");

                    for (var i = 0; i < result.length; i++)
                    {
                        $("#ddlClass").append("<option value='" + result[i].classId + ',' + result[i].userGroupId + "'>" + result[i].name + "</option>");
                    }
                }
            },
            error: function (err)
            {
            }
        });
    },

    getStudents: function ()
    {
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
            success: function (result)
            {
                if (result)
                {
                    sessionStorage.setItem("Students", JSON.stringify(result));
                    $("#tblStudents").find('tr').remove();

                    $("#tblStudents").append("<tr><td><b>S. No.</b></td><td><b>Student Name</b></td></tr>");
                    for (var i = 0; i < result.length; i++)
                    {
                        $("#tblStudents").append("<tr><td>" + parseInt(parseInt(i) + 1) + "</td><td>" + result[i].lastName + " , " + result[i].firstName + "</td></tr>");
                    }
                }
            },
            error: function (err)
            {
            }
        });
    },

    checkOutBookClicked: function (e)
    {
        var flag = false;

        if (sessionStorage.getItem("schoolId") == null)
        {
            qAViewModel.ErrorMessage = "Please select school";
            flag = true;
        }
        else if (sessionStorage.getItem("classId") == null || sessionStorage.getItem("classId") == "null")
        {
            qAViewModel.ErrorMessage = "Please select class";
            flag = true;
        }
        else if ($('#bookId').val() == "")
        {
            qAViewModel.ErrorMessage = "Please enter Book Id";
            flag = true;
        }

        if (flag)
        {
            qAViewModel.IsErrorMessage = true;
            $("#dvInstructions").show();
            $("#dvInstructions").removeClass("instructions").addClass("error-message").text(qAViewModel.ErrorMessage);
            $("#btnCheckOut").removeClass("btn-green").addClass("btn-error");
            return;
        }

        showSpinner();
        qAViewModel.bookCheckOutCount = 0;
        qAViewModel.bookCheckOutFailCount = 0;
        var students = JSON.parse(sessionStorage.getItem("Students"));
        var userGroupId = sessionStorage.getItem("userGroupId");
        for (var i = 0; i < students.length; i++)
        {
            qAViewModel.checkOutBook(students[i].userId, userGroupId);
        }

        hideSpinner();
        alert("Book checkout completed for " + students.length + " students. " + qAViewModel.bookCheckOutCount + " succeeded and " + qAViewModel.bookCheckOutFailCount + " failed.");
    },

    checkOutBook: function (userId, userGroupId)
    {
        var authorization_token = sessionStorage.getItem("authorization_token");
        var url = "api/Users/" + userId + "/CheckOut";

        url = qAViewModel.getApiUrl(url);

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
            data: data,
            contentType: 'application/x-www-form-urlencoded',
            success: function (result)
            {
                if (result) {
                    qAViewModel.bookCheckOutCount = parseInt(parseInt(qAViewModel.bookCheckOutCount) + 1);
                } else {
                    qAViewModel.bookCheckOutFailCount = parseInt(parseInt(qAViewModel.bookCheckOutFailCount) + 1);
                }
            },
            error: function (err)
            {
                qAViewModel.bookCheckOutFailCount = parseInt(parseInt(qAViewModel.bookCheckOutFailCount) + 1);
            }
        });
    }
};

function schoolChanged(e)
{
    showSpinner();
    $("#dvInstructions").removeClass("error-message").addClass("instructions");
    $("#btnCheckOut").removeClass("btn-error").addClass("btn-green");
    $("#dvInstructions").hide();
    sessionStorage.setItem("schoolId", e.value);
    sessionStorage.setItem("classId", null);
    $("#ddlClass").find('option').remove();
    qAViewModel.getClasses(e.value);
    hideSpinner();
}

function classChanged(e)
{
    showSpinner();
    $("#dvInstructions").removeClass("error-message").addClass("instructions");
    $("#btnCheckOut").removeClass("btn-error").addClass("btn-green");
    $("#dvInstructions").hide();

    var res = e.value.split(",");
    sessionStorage.setItem("classId", res[0]);
    sessionStorage.setItem("userGroupId", res[1]);

    qAViewModel.getStudents();
    hideSpinner();
}

$(document).ready(function ()
{
    showSpinner();
    qAViewModel.getSchools();
    hideSpinner();

    initSession();
    $(document).bind('keypress.session', function (ed, e)
    {
        initSession();
    });

    $(document).mousemove(function (event)
    {
        initSession();
    });
});

// functions for Log Out on inactivity for certain time
function initSession()
{
    sess_lastActivity = new Date();
    sessSetInterval();
}

function sessSetInterval()
{
    sess_intervalID = setInterval('sessInterval()', sess_pollInterval);
}

function sessKeyPressed()
{
    sess_lastActivity = new Date();
}

function sessInterval()
{
    var now = new Date();
    //get milliseconds of differneces
    var diff = now - sess_lastActivity;
    //get minutes between differences
    var diffMins = (diff / 1000 / 60);
    if (diffMins >= sess_expirationMinutes)
    {
        sessLogOut();
    }
}

function sessLogOut()
{
    window.location.href = "/Login/LogOff";
}

// Log out functions end here

function showSpinner()
{
    $('#dvSpinnerPageLoad').removeClass('page-load-spinner-hide').addClass('page-load-spinner-show');
}

function hideSpinner()
{
    $('#dvSpinnerPageLoad').removeClass('page-load-spinner-show').addClass('page-load-spinner-hide');
}

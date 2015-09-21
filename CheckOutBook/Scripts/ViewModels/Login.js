
var viewModel = kendo.observable({
    domain: "http://int.ls-api.com/",
    token_Prefix: "Bearer ",
    grant_type: 'password',     //The requested grant type. Should always be 'password'.
    username: 'atul.gupta',//null,    
    password: 'lightsail',//null,      
    access_token: null,	
    token_type: null,	
    userId: null,
    authorization_token : null,
    ErrorMessage: null,
    IsErrorMessage: true, 
    PanelLogin: true,

    getApiUrl: function (apiURL) {
        return this.domain + apiURL;
    },

    LoginClick: function (e) {
        var flag = false; 
        if ((this.username == "" || this.username == null) && (this.password == "" || this.password == null)) {
            this.set("ErrorMessage", "PLEASE ENTER A USERNAME AND PASSWORD TO CONTINUE");
            $("#BtnLogin").text("Try Again");
            flag = true;
        }
        else if (this.username == "" || this.username == null) {
            this.set("ErrorMessage", "PLEASE ENTER A VALID USERNAME");
            flag = true;
        }
        else if (this.password == "" || this.password == null) {
            this.set("ErrorMessage", "PLEASE ENTER A VALID PASSWORD");
            flag = true;
        }

        if (flag) {
            this.set("IsErrorMessage", true);
            $("#dvInstructions").removeClass("instructions").addClass("error-message").text(viewModel.ErrorMessage);
            $("#BtnLogin").removeClass("btn-green").addClass("btn-error");
            return;
        }

        showSpinner();
        viewModel.authenticate();
    },

    authenticate: function () {
        var url = viewModel.getApiUrl("Authenticate");
        var data =
                {
                    grant_type: viewModel.grant_type,
                    username: viewModel.username,            
                    password: viewModel.password             
                };
            
        $.ajax({
            type: 'POST',
            url: url,
            dataType: 'json',
            data: data,
            contentType: 'application/x-www-form-urlencoded',
            success: function (result) {
                
                if (result) {
                    viewModel.access_token = result.access_token,
                    viewModel.token_type = result.token_type,
                    viewModel.username = result.username,
                    viewModel.userId = result.userId,
                    viewModel.authorization_token = viewModel.token_Prefix + viewModel.access_token;
                    viewModel.loadQAPage();
                }
            },
            error: function (err) {
                if ((err.responseJSON.error == "invalid_grant" && err.responseJSON.error_description == "Incorrect username or password. Please try again.")) {
                    viewModel.ErrorMessage = "User is not authenticated";
                    $("#dvInstructions").removeClass("instructions").addClass("error-message").text(viewModel.ErrorMessage);
                    $("#BtnLogin").removeClass("btn-green").addClass("btn-error");

                    hideSpinner();
	                return;
	            }
            }
        });
    },
   
    loadQAPage: function () {
        sessionStorage.setItem("authorization_token", viewModel.authorization_token);
        sessionStorage.setItem("domain", viewModel.domain);
        window.location.href = "/CheckOutBook/Index"; // Transfering to CheckOutBook page.
    },
});

$(function () {
    kendo.bind($("#LoginForm"), viewModel);
});

function showSpinner() {
    $('#dvSpinnerLogin').removeClass('login-spinner-hide').addClass('login-spinner-show');
}

function hideSpinner() {
    $('#dvSpinnerLogin').removeClass('login-spinner-show').addClass('login-spinner-hide');
}



var loginapp = angular.module("loginapp",['ngCookies']).config(function($anchorScrollProvider) {
    $anchorScrollProvider.disableAutoScrolling();
});

loginapp.factory('LANGUAGE', function(){
    return {Language:ZH_CN_LANG};
});

loginapp.controller('languageController',languageController);
loginapp.controller('topMenuController',topMenuController);
loginapp.controller('mainContainController',mainContainController);



function regMemoController($scope, $rootScope, LANGUAGE) {

    $rootScope.$on(LANGUAGE_CHANGED,function(event,data){
        if (data != null && data.from == "topMenuController"){
            initText();
        }
    });

    function initText() {
        if(LANGUAGE.Language == ZH_CN_LANG) {
            $scope.TitleText = "注册/登录说明";
            $scope.GoogleAuthenticatorTitle = "Google身份验证器";
            $scope.GoogleAuthenticatorContext = "注册之后，使用 \"Google身份验证器\"可以确保你账户的安全，在Google电子市场或在国内电子市场安装即可。本网站不提供下载。当前最新版本号为2.49。";
            $scope.GAUseTitle = "验证器怎么用";
            $scope.GAUseContext = "Google身份验证器 使用可以参考百度经验中的文章 \" Google身份验证器怎么用 \"";
            $scope.GAUseiOSContext = "iOS操作系统手机，可以在App Store中进行安装, 或者参看 https://support.google.com/ 《Google iPhone、iPod Touch、iPad 安装说明》";
            $scope.EmailTitle = "邮箱登录";
            $scope.EmailContext = "注册使用邮箱做为登录用户名，所以请在注册前，保证有一个可以正常使用的邮箱。";
        }else{
            $scope.TitleText = "Register / Login Description";
            $scope.GoogleAuthenticatorTitle = "Google Authenticator";
            $scope.GoogleAuthenticatorContext = "After registration , user can install \"Google Authenticator \" , that will be able safety on your account. in the Google Market can be installed. This site is not available for download. The most current version number is 2.49.";
            $scope.GAUseTitle = "How to use GA";
            $scope.GAUseContext = "Reference \"Install Google Authenticator\" from https://support.google.com .";
            $scope.GAUseiOSContext = "iOS operating system mobile phone, can be installed in the App Store, or reference https://support.google.com/ \"Google iPhone, iPod Touch, iPad Installation Instructions\" .";
            $scope.EmailTitle = "Email address";
            $scope.EmailContext = "Registered user mailbox as the logged-on user name, so please pre-registration to ensure that there is a mailbox can be normal use.";
        }
    }

    initText();
}
loginapp.controller('regMemoController',regMemoController);

//otpauth://totp/ledgercn@qqq.com?secret=DPI45HCEBCJK6HG7 二维码格式

//function createqrCode(){
//    //qrcode.makeCode("otpauth://totp/ledgercn@qqq.com?secret=DPI45HCEBCJK6HG7");
//    $("#ga_qr_code").html("");
//    $("#ga_qr_code").qrcode({
//        "render": "div",
//        "size": 100,
//        width : 200,
//        height : 200,
//        "color": "#3a3",
//        "text": "otpauth://totp/ledgercn@qqq.com?secret=DPI45HCEBCJK6HG7"
//    });
//}
function regMainViewController($scope, $rootScope, $cookies, $location, $http, LANGUAGE){

    $rootScope.$on(LANGUAGE_CHANGED,function(event,data){
        if (data != null && data.from == "topMenuController"){
            initText();
        }
    });

    $scope.$on(LOGIN_CHECK,function(event,data){
        if (data != null){
            $scope.isLogin = data.isLogin;
            if($scope.isLogin){
                $scope.loginUser = data.loginUser;
                $scope.userLevel = data.level;
                $scope.hasGA = data.gaUsed;

                if ($scope.hasGA){
                    $scope.gaOpenBtnStatus = "btn-primary active";
                    $scope.gaCloseBtnStatus = "btn-default";
                }
            }
        }
    });

    function initText(){
        if(LANGUAGE.Language == ZH_CN_LANG){
            $scope.Title = "注册 / 登录";
            $scope.emailPlaceholder = "登录用户邮件地址 abc@abd.com";
            $scope.loginPwPlaceholder = "登录密码(长度在6个字符以上)";
            $scope.confirmPwPlaceholder = "确认密码";
            $scope.googleAuthCodePlaceholder = "Google身份验证数字";
            //$scope.rqcodeMemo = "用Google身份验证器扫描上面的二维码，或者手工输入安全码";
            $scope.viCodePlaceholder = "请输入右边等式结果";
            $scope.prevBtnTitle = "上一步";
            $scope.nextBtnTitle = "下一步";

            $scope.userActiveTitle = "用户激活";
            $scope.changePWTitle = "修改登录密码";
            $scope.userOrigPasswordPlaceholder = "输入用户登录密码";
            $scope.userNewPassword1Placeholder = "输入新设置的登录密码";
            $scope.userNewPassword2Placeholder = "再输入一次新登录密码";
            $scope.userfidPlaceholder = "请输入用户激活邮件中的fid";

            $scope.gaConfigTitle = "Google验证器配置";
            $scope.gaCurrentStateTitle = "当前GA验证状态:";
            $scope.gaOpenBtnTitle = "开启";
            $scope.gaCloseBtnTitle = "关闭";
            $scope.gaUserPasswordPlaceholder = "请输入登录密码";
            $scope.gaTotpCodePlaceholder = "请输入Google验证码";
            $scope.gaMemoTitle = "请用安装Google身份验证器扫描上面的二维码，或者直接输入如下密匙";

            $scope.logoutText = "注销登录";

            $scope.ErrMsgTable = {
                EmailFormatErr : "输入的Email格式不正确!",
                ServiceLostErr : "服务器无响应!",
                PasswordIsEmpty : "密码输入有误，请重新输入!",
                PasswordNotEqu : "两次输入的密码不匹配!",
                UserIsNotLogin : "用户还未登录，请先登录!",
                ReCaptchaCodeError: "输入的验证码有误,请重新输入!",
                ServerBusy: "服务器失去联系，请稍后再试!"
            };

            $scope.AlertMsgTable = {
                ChangePWSuccess : "修改密码成功"
            };
        }else{
            $scope.Title = "Sign up / Sign in";
            $scope.emailPlaceholder = "Login user name format as abc@abd.com";
            $scope.loginPwPlaceholder = "Password (length >= 6)";
            $scope.confirmPwPlaceholder = "Confirm password";
            $scope.googleAuthCodePlaceholder = "Google Auth code";
            //$scope.rqcodeMemo = "Google Authenticator with the above two-dimensional code scanning, or manually enter the security code";
            $scope.viCodePlaceholder = "Please enter the result of the right side of the equation";
            $scope.prevBtnTitle = "Back";
            $scope.nextBtnTitle = "Next";

            $scope.userActiveTitle = "Email activation";
            $scope.changePWTitle = "Modify the login password";
            $scope.userOrigPasswordPlaceholder = "Enter user login password";
            $scope.userNewPassword1Placeholder = "Enter a new login password";
            $scope.userNewPassword2Placeholder = "Re-enter new password";
            $scope.userfidPlaceholder = "Please enter fid in the activation email";

            $scope.gaConfigTitle = "Google Authenticator config";
            $scope.gaCurrentStateTitle = "Current GA status :";
            $scope.gaOpenBtnTitle = "Open";
            $scope.gaCloseBtnTitle = "Close";
            $scope.gaUserPasswordPlaceholder = "Enter login password";
            $scope.gaTotpCodePlaceholder = "Enter google auth code";
            $scope.gaMemoTitle = "Please use the Google Authenticator, scanning the above two-dimensional code, or by entering the following key";

            $scope.logoutText = "Logout";

            $scope.ErrMsgTable = {
                EmailFormatErr : "Your Email address is not valid!",
                ServiceLostErr : "Server is not response!",
                PasswordIsEmpty : "The password is not valid, please re-enter!",
                PasswordNotEqu : "The passwords do not match!",
                UserIsNotLogin : "User is not logged in, please log in at first!",
                ReCaptchaCodeError: "Verification code entered is incorrect, please re-enter!",
                ServerBusy: "The server is out of contact. Please try again later!"
            };

            $scope.AlertMsgTable = {
                ChangePWSuccess : "Modify login password success!"
            };
        }
    }

    function getReCaptcha() {
        ret = {
            Value1:"",
            Value2:"",
            Value3:"",
            OperatorMark:"",
            viCodeText:"",

            clearValue : function(){
                this.Value1 = "";
                this.Value2 = "";
                this.Value3 = "";
                this.OperatorMark = "";
                this.viCodeText = "";
            },

            setValue : function(v1,v2,v3,op){
                this.Value1 = v1;
                this.Value2 = v2;
                this.Value3 = v3;
                this.OperatorMark = op;
            },

            setResult : function (v) {
                this.viCodeText = v;
            },

            getPostString : function () {
                return  "&" + POST_MARK_REG_VICODE + "=" + encodeURIComponent(this.viCodeText) +
                        "&" + POST_MARK_REG_VALUE1 + "=" + encodeURIComponent(this.Value1) +
                        "&" + POST_MARK_REG_VALUE2 + "=" + encodeURIComponent(this.Value2) +
                        "&" + POST_MARK_REG_VALUE3 + "=" + encodeURIComponent(this.Value3) +
                        "&" + POST_MARK_REG_OPERA + "=" + encodeURIComponent(this.OperatorMark);
            }
        };
        return ret;
    }

    function initView(){
        initText();
        $scope.stepIndex = 1;
        $scope.nextBtnIcon = "fa fa-angle-double-right";

        $scope.nextBtnAbled = "";
        $scope.prevBtnAbled = "disabled";
        $scope.isSignIn = false;
        $scope.hasGA = false;
        $scope.equationValue = "";
        $scope.errorMessage = "";
        $scope.reCaptcha = getReCaptcha();

        $scope.isLogin = false;
        $scope.loginUser = "";
        $scope.userLevel = 0;
        $scope.changePWBtnIcon = "fa fa-check";
        $scope.isChangePWReadOnly = false;
        $scope.userOrigPassword = "";
        $scope.userNewPassword1 = "";
        $scope.userNewPassword2 = "";
        $scope.userfid = "";
        $scope.errorMessageCPW = "";
        $scope.alertMessageCPW = "";

        $scope.gaKeyString = "";
        $scope.gaOpenBtnStatus = "btn-default";
        $scope.gaCloseBtnStatus = "btn-primary active";
        //$scope.gaShowKeyBtnIcon = "fa-eye"; //fa-eye-slash
        $scope.gaUserPassword = "";
        $scope.gaTotpCode = "";
        $scope.gaUserPwVisible = false;
        $scope.gaWaitingVisible = false;
        $scope.gaRQcodeVisible = false;
        //$scope.isGaShowKeyBtnClick = false;
        $scope.errorMessageGA = "";
    }

    function setStepIndex(i){
        $scope.stepIndex += i;
        if ($scope.stepIndex > 1){
            $scope.prevBtnAbled = "";
        }else{
            $scope.prevBtnAbled = "disabled";
        }

        if($scope.stepIndex == 3){
            //homeurl = $location.host() +":" + $location.port();
            window.location.href = "index.html";//"http://" + homeurl;
        }

        if($scope.stepIndex == 4){
            //homeurl = $location.host() +":" + $location.port();
            window.location.href = "activeaccount.html";
        }
    }

    function transform(data){
        return data;
    }

    function NextStep1Execute(){
        // http post 当前用户名到服务器，等待返回结果设置界面 todo
        function checkEmail(email){
            if ((email.length > 128) || (email.length < 6)) {
                return false;
            }
            var format = /^[A-Za-z0-9+]+[A-Za-z0-9\.\_\-+]*@([A-Za-z0-9\-]+\.)+[A-Za-z0-9]+$/;
            if (!email.match(format)) {
                return false;
            }
            return true;
        }

        if ($scope.userNameEmail == null || $scope.userNameEmail == "" || !checkEmail($scope.userNameEmail)){
            $scope.errorMessage = $scope.ErrMsgTable.EmailFormatErr;
            $scope.nextBtnIcon = "fa fa-angle-double-right";
            return
        }

        $scope.errorMessage = "";
        $scope.loginPassword = "";
        $scope.confirmLoginPassword = "";
        $scope.googleAuthCode = "";
        $scope.reCaptcha.clearValue();

        postUrl = BACK_SERVICE_URL + "/" + BACK_SERVICE_ACCOUNT;
        tx = POST_TYPE_FLAG + "=" + PT_CHECK_USERNAME + "&" + POST_MARK_CHECK_USERNAME + "=" + encodeURIComponent($scope.userNameEmail);
        $http({
            method: 'POST',
            url: postUrl,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
            },
            transformRequest: transform,
            data: tx
        }).
            success(function (data, status, headers, config){
                console.log("success\r\n",data);
                if(data.Error == null){
                    $scope.isSignIn = data.data.IsExist;
                    $scope.hasGA = data.data.user_ga_used;
                    if ($scope.isSignIn == false || $scope.hasGA == false) {
                        $scope.EquationClick();
                    }
                    setStepIndex(1);
                }else{
                    $scope.errorMessage = data.Error;
                }
                $scope.nextBtnIcon = "fa fa-angle-double-right";
            }).
            error(function (data, status, headers, config){
                console.log("error\r\n",data);
                console.log("status\r\n",status);
                console.log("headers\r\n",headers);
                console.log("config\r\n",config);
                $scope.errorMessage = $scope.ErrMsgTable.ServiceLostErr;
                $scope.nextBtnIcon = "fa fa-angle-double-right";
            });
    }

    function NextStep2Execute(){

        if ($scope.isSignIn){
            // 如果是登录状态
            UserLoginExecute();
        }else{
            // 如果是注册状态
            UserRegistrationExecute();
        }
    }

    function UserLoginExecute(){
        postUrl = BACK_SERVICE_URL + "/" + BACK_SERVICE_ACCOUNT;

        md5Pw = hex_md5($scope.loginPassword);
        $scope.loginPassword = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaa";

        tx = POST_TYPE_FLAG + "=" + PT_USER_LOGIN + "&" +
            POST_MARK_USER_NAME + "=" + encodeURIComponent($scope.userNameEmail) + "&" +
            POST_MARK_PASS_WORD + "=" + encodeURIComponent(md5Pw) + "&" +
            POST_MARK_GACODE + "=" + encodeURIComponent($scope.googleAuthCode) + "&" +
            $scope.reCaptcha.getPostString();
        $http({
            method: 'POST',
            url: postUrl,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
            },
            transformRequest: transform,
            data: tx
        }).
            success(function (data, status, headers, config){
                console.log("success\r\n",data);
                if (data.Error == null){
                    saveToCookie($cookies,"auth",data.data.user_auth,-1);
                    saveToCookie($cookies,"ulvl",data.data.user_level,-1);
                    saveToCookie($cookies,"uname",data.data.login_user,-1);
                    $scope.hasGA = data.data.user_ga_used;
                    setStepIndex(1);
                }else{
                    $scope.EquationClick();
                    $scope.errorMessage = data.Error;
                }
                //$scope.isSignIn = data.data.IsExist;
                //$scope.hasGA = data.data.HasGA;
                $scope.nextBtnIcon = "fa fa-angle-double-right";
                //if ($scope.hasGA == false) {
                //    $scope.EquationClick();
                //}
            }).
            error(function (data, status, headers, config){
                console.log("error\r\n",data);
                console.log("status\r\n",status);
                console.log("headers\r\n",headers);
                console.log("config\r\n",config);
                $scope.errorMessage = $scope.ErrMsgTable.ServiceLostErr;
                $scope.nextBtnIcon = "fa fa-angle-double-right";
                $scope.loginPassword = "";
            });
    }

    function UserRegistrationExecute(){
        if ($scope.loginPassword == "" || $scope.loginPassword.length < 6){
            $scope.EquationClick();
            $scope.errorMessage = $scope.ErrMsgTable.PasswordIsEmpty;
            $scope.nextBtnIcon = "fa fa-angle-double-right";
            $scope.loginPassword = "";
            $scope.confirmLoginPassword = "";
            return;
        }

        if ($scope.loginPassword != $scope.confirmLoginPassword){
            $scope.EquationClick();
            $scope.errorMessage = $scope.ErrMsgTable.PasswordNotEqu;
            $scope.nextBtnIcon = "fa fa-angle-double-right";
            $scope.loginPassword = "";
            $scope.confirmLoginPassword = "";
            return;
        }

        if ($scope.reCaptcha.viCodeText == null || $scope.reCaptcha.viCodeText == ""){
            $scope.EquationClick();
            $scope.errorMessage = $scope.ErrMsgTable.ReCaptchaCodeError;
            $scope.nextBtnIcon = "fa fa-angle-double-right";
            $scope.loginPassword = "";
            $scope.confirmLoginPassword = "";
            return;
        }


        $scope.errorMessage = "";

        md5Pw = hex_md5($scope.loginPassword);
        console.log("password ================ \r\n\t",md5Pw);

        $scope.loginPassword = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
        $scope.confirmLoginPassword = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaa";

        postUrl = BACK_SERVICE_URL + "/" + BACK_SERVICE_ACCOUNT;
        tx = POST_TYPE_FLAG + "=" + PT_USER_REGISTRATION + "&" +
            POST_MARK_REG_USERNAME + "=" + encodeURIComponent($scope.userNameEmail) + "&" +
            POST_MARK_REG_PASSWORD + "=" + encodeURIComponent(md5Pw) + $scope.reCaptcha.getPostString();
        $http({
            method: 'POST',
            url: postUrl,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
            },
            transformRequest: transform,
            data: tx
        }).
            success(function (data, status, headers, config){
                console.log("success\r\n",data);
                if (data.Error == null) {
                    //UserInfo.UserEmailAddr = $scope.userNameEmail;
                    //UserInfo.UserPassword = md5Pw;
                    $scope.userNameEmail = "";
                    setStepIndex(2);
                } else {
                    $scope.errorMessage = data.Error;
                    $scope.loginPassword = "";
                    $scope.confirmLoginPassword = "";
                }
                $scope.nextBtnIcon = "fa fa-angle-double-right";
            }).
            error(function (data, status, headers, config){
                console.log("error\r\n",data);
                if (data == null && status == -1) {
                    $scope.errorMessage = $scope.ErrMsgTable.ServiceLostErr
                }

                $scope.loginPassword = "";
                $scope.confirmLoginPassword = "";
                $scope.nextBtnIcon = "fa fa-angle-double-right";
            });
    }

    function createRqcode(uri) {
        $("#ga_qr_code").qrcode({
            "render": "canvas",
            "size": 100,
            width : 210,
            height : 210,
            "color": "#3a3",
            "text": uri
        });
        //$("#ga_qr_code").qrcode({
        //    render: "table", //table方式
        //    "size": 100,
        //    width: 212, //宽度
        //    height:212, //高度
        //    text: uri //格式"otpauth://totp/ledgercn.com:jojopoper@163.com?issuer=ledgercn.com&secret=XZQUJET66PPYLZJF"
        //});
    }

    $scope.removeUserEmailClick = function () {
        if($scope.nextBtnIcon == WAIT_ICON_STATE){
            return;
        }
        $scope.userNameEmail = "";
    };

    $scope.EquationClick = function() {
        if ($scope.equationValue == null) {
            return;
        }

        console.log("Equation Click");

        $scope.errorMessage = "";
        $scope.equationValue = null;
        $scope.reCaptcha.setResult("");

        postUrl = BACK_SERVICE_URL + "/" + BACK_SERVICE_RECAPTCHA;
        tx = "Equation="+encodeURIComponent("quary");
        $http({
            method: 'POST',
            url: postUrl,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
            },
            transformRequest: transform,
            data: tx
        }).
            success(function (data, status, headers, config){
                if (data.data.Error == null)
                {
                    $scope.equationValue = data.data.Value1 + " " + data.data.Operator + " " +
                        data.data.Value2 + " = " + data.data.Value3;
                    $scope.reCaptcha.setValue(data.data.Value1,data.data.Value2,data.data.Value3,data.data.Operator)
                } else {
                    $scope.equationValue = "255 - ? = 0";
                    $scope.reCaptcha.setValue("255","?","0","-");
                }
                //setStepIndex(1);
            }).
            error(function (data, status, headers, config){
                console.log("error\r\n",data);
                $scope.equationValue = "128 - ? = 0";
                $scope.reCaptcha.setValue("128","?","0","-");
            });
    };

    $scope.prevBtnClickEvent = function(){
        if ($scope.nextBtnIcon == "fa fa-angle-double-right") {
            setStepIndex(-1);
        }
    };

    $scope.nextBtnClickEvent = function(){
        if ($scope.nextBtnIcon == "fa fa-angle-double-right") {
            switch ($scope.stepIndex){
                case 1: //需要去服务器查询当前用户名是否存在
                    $scope.nextBtnIcon = WAIT_ICON_STATE;
                    NextStep1Execute();
                    break;
                case 2:
                    $scope.nextBtnIcon = WAIT_ICON_STATE;
                    NextStep2Execute();
                    break;
            }
        }
    };

    $scope.changePWClick = function(){
        if($scope.changePWBtnIcon == WAIT_ICON_STATE){
            return;
        }

        if ($scope.userOrigPassword == "" || $scope.userOrigPassword.length < 6){
            $scope.errorMessageCPW = $scope.ErrMsgTable.PasswordIsEmpty;
            resetChangePWView();
            return;
        }

        if ($scope.userNewPassword1 == "" || $scope.userNewPassword1.length < 6){
            $scope.errorMessageCPW = $scope.ErrMsgTable.PasswordIsEmpty;
            resetChangePWView();
            return;
        }

        if ($scope.userNewPassword1 != $scope.userNewPassword2){
            $scope.errorMessageCPW = $scope.ErrMsgTable.PasswordNotEqu;
            resetChangePWView();
            return;
        }

        authStr = $cookies.get("auth");
        if (authStr == ""){
            $scope.errorMessageCPW = $scope.ErrMsgTable.UserIsNotLogin;
            resetChangePWView();
            return;
        }

        $scope.errorMessageCPW = "";

        $scope.changePWBtnIcon = WAIT_ICON_STATE;
        $scope.isChangePWReadOnly = true;

        md5OrgPw = hex_md5($scope.userOrigPassword);
        $scope.userOrigPassword = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaa";

        md5NewPw = hex_md5($scope.userNewPassword1);
        $scope.userNewPassword1 = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
        $scope.userNewPassword2 = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaa";

        postUrl = BACK_SERVICE_URL + "/" + BACK_SERVICE_ACCOUNT;
        tx = POST_TYPE_FLAG + "=" + PT_USER_MODIFY_PW + "&" +
            POST_MARK_USER_NAME + "=" + encodeURIComponent($scope.loginUser) + "&" +
            POST_MARK_PASS_WORD + "=" + encodeURIComponent(md5OrgPw) + "&" +
            POST_MARK_NEW_PASS_WORD + "=" + encodeURIComponent(md5NewPw) + "&" +
            POST_MARK_FID + "=" + encodeURIComponent($scope.userfid) + "&" +
            POST_MARK_AUTHCODE + "=" + encodeURIComponent(authStr);
        $http({
            method: 'POST',
            url: postUrl,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
            },
            transformRequest: transform,
            data: tx
        }).
            success(function (data, status, headers, config){
                console.log("success\r\n",data);
                if (data.Error == null){
                    $scope.alertMessageCPW = $scope.AlertMsgTable.ChangePWSuccess;
                    if (data.data.update_auth == true){
                        saveToCookie($cookies,"auth",data.data.user_auth);
                    }
                    saveToCookie($cookies,"uname",data.data.login_user);
                    saveToCookie($cookies,"ulvl",data.data.user_level);
                } else {
                    $scope.errorMessageCPW = data.Error;
                }
                resetChangePWView();
            }).
            error(function (data, status, headers, config){
                console.log("error\r\n",data);
                $scope.errorMessageCPW = $scope.ErrMsgTable.ServerBusy;
                resetChangePWView();
            });
    };

    function resetChangePWView(){
        $scope.changePWBtnIcon = "fa fa-check";
        $scope.userOrigPassword = "";
        $scope.userNewPassword1 = "";
        $scope.userNewPassword2 = "";
        $scope.userfid = "";
        $scope.isChangePWReadOnly = false;
    }

    $scope.logoutBtnClick = function(){
        $cookies.remove("uname",{'path':'/'});
        $cookies.remove("auth",{'path':'/'});
        $cookies.remove("ulvl",{'path':'/'});
        $scope.isLogin = false;
        $scope.hasGA = false;
        $scope.loginUser = "";
    };

    $scope.gaSwitchBtnClick = function() {
        if($scope.gaWaitingVisible)
            return;
        if($scope.hasGA){
            $scope.gaUserPwVisible = true;
            $scope.gaUserPassword = "";
        }else{
            $scope.gaUserPwVisible = false;
            $scope.gaWaitingVisible = true;
            gaOperationNew();
        }
    };

    function gaOperationNew() {
        postUrl = BACK_SERVICE_URL + "/" + BACK_SERVICE_ACCOUNT;
        tx =  POST_TYPE_FLAG + "=" + PT_CHECK_GA_OPERA + "&" +
            POST_MARK_USER_NAME + "=" + encodeURIComponent($scope.loginUser) + "&" +
            POST_MARK_MODIFY_GA + "=" + GA_PT_MODIFY_NEW;

        $http({
            method: 'POST',
            url: postUrl,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
            },
            transformRequest: transform,
            data: tx
        }).
            success(function (data, status, headers, config){
                console.log("success\r\n",data);
                if (data.Error == null){
                    $scope.gaKeyString = data.data.user_ga_key;
                    uri = data.data.user_ga_uri;
                    createRqcode(uri);
                    $scope.hasGA = true;
                    hasGAChanged();
                } else {
                    $scope.errorMessageGA = data.Error;
                }
                $scope.gaUserPwVisible = false;
                $scope.gaWaitingVisible = false;
                $scope.gaRQcodeVisible = true;
            }).
            error(function (data, status, headers, config){
                console.log("error\r\n",data);
                $scope.errorMessageGA = $scope.ErrMsgTable.ServerBusy;
                $scope.gaUserPwVisible = false;
                $scope.gaWaitingVisible = false;
            });

    }

    function hasGAChanged() {
        if ($scope.hasGA){
            $scope.gaOpenBtnStatus = "btn-primary active";
            $scope.gaCloseBtnStatus = "btn-default";
        }else{
            $scope.gaOpenBtnStatus = "btn-default";
            $scope.gaCloseBtnStatus = "btn-primary active";
        }
    }

    $scope.gaUserPwBtnClick = function() {
        if($scope.gaUserPassword == "" || $scope.gaUserPassword.length < 6 ||
            $scope.gaTotpCode == "" || $scope.gaTotpCode.length < 6){
            $scope.errorMessageGA = $scope.ErrMsgTable.PasswordIsEmpty;
            $scope.gaUserPassword = "";
            $scope.gaTotpCode = "";
            return;
        }
        md5Pw = hex_md5($scope.gaUserPassword);
        $scope.gaUserPassword = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaa";

        $scope.gaUserPwVisible = false;
        $scope.gaWaitingVisible = true;
        $scope.errorMessageGA = "";

        postUrl = BACK_SERVICE_URL + "/" + BACK_SERVICE_ACCOUNT;
        tx =  POST_TYPE_FLAG + "=" + PT_CHECK_GA_OPERA + "&" +
            POST_MARK_USER_NAME + "=" + encodeURIComponent($scope.loginUser) + "&" +
            POST_MARK_PASS_WORD + "=" + encodeURIComponent(md5Pw) + "&" +
            POST_MARK_GACODE + "=" + encodeURIComponent($scope.gaTotpCode) + "&" +
            POST_MARK_MODIFY_GA + "=" + GA_PT_MODIFY_DELETE;

        $http({
            method: 'POST',
            url: postUrl,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
            },
            transformRequest: transform,
            data: tx
        }).
            success(function (data, status, headers, config){
                console.log("success\r\n",data);
                if (data.Error == null){
                    $scope.hasGA = data.data.user_ga_used;
                    saveToCookie($cookies,"ulvl",data.data.user_level);
                    $scope.gaWaitingVisible = false;
                    $scope.gaUserPwVisible = false;
                    $scope.gaUserPassword = "";
                    $scope.gaTotpCode = "";
                    hasGAChanged();
                } else {
                    $scope.errorMessageGA = data.Error;
                    $scope.gaWaitingVisible = false;
                    $scope.gaUserPwVisible = true;
                    $scope.gaUserPassword = "";
                }
            }).
            error(function (data, status, headers, config){
                console.log("error\r\n",data);
                $scope.errorMessageGA = $scope.ErrMsgTable.ServerBusy;
                $scope.gaWaitingVisible = false;
                $scope.gaUserPwVisible = true;
                $scope.gaUserPassword = "";
            });
    };

    initView();

}
loginapp.controller('regMainViewController',regMainViewController);
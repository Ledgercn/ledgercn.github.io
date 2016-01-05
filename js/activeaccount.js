
var activeaccapp = angular.module("activeaccapp",['ngCookies']).config(function($anchorScrollProvider) {
    $anchorScrollProvider.disableAutoScrolling();
});

activeaccapp.factory('LANGUAGE', function(){
    return {Language:ZH_CN_LANG};
});

activeaccapp.controller('languageController',languageController);
activeaccapp.controller('topMenuController',topMenuController);
activeaccapp.controller('mainContainController',mainContainController);

function aaMainController($scope, $rootScope, $cookies, $http, LANGUAGE){
    $rootScope.$on(LANGUAGE_CHANGED,function(event,data){
        if (data != null && data.from == "topMenuController"){
            initText();
        }
    });

    function initText(){
        if(LANGUAGE.Language == ZH_CN_LANG){
            $scope.memoText = "我们已经将激活邮件发送到你注册的邮箱，请查收并进行账户激活。长时间未收到邮件请联系support@ledgercn.com。";
            $scope.mainTitle = "邮箱激活";
            $scope.userEmailTitle = "注册使用的邮箱";
            $scope.userEmailPlaceholder = "请输入你的注册邮箱地址";
            $scope.userPaswordTitle = "登录密码";
            $scope.userPaswordPlaceholder = "请输入登录密码";
            $scope.userfidTitle = "用户的FID";
            $scope.userfidPlaceholder = "请输入激活邮件中的fid";
            $scope.usertidTitle = "用户的TID";
            $scope.usertidPlaceholder = "请输入激活邮件中的tid";

            $scope.ErrMsg = {
                UserEmailErr:"登录用户邮件地址格式错误!",
                UserPassword:"登录用户密码错误!",
                UserFid:"用户 fid 不正确!",
                UserTid:"用户 tid 不正确!",
                ServiceLostErr : "服务器无响应!"
            }

        }else{
            $scope.memoText = "We have send you a e-mail, please check and account activation. For a long time did not receive the message please contact support@ledgercn.com.";
            $scope.mainTitle = "Active email address";
            $scope.userEmailTitle = "Mailbox when registering";
            $scope.userEmailPlaceholder = "Please enter your registered email address";
            $scope.userPaswordTitle = "Login password";
            $scope.userPaswordPlaceholder = "Please enter your login password";
            $scope.userfidTitle = "User FID";
            $scope.userfidPlaceholder = "Please enter the fid in your activation email";
            $scope.usertidTitle = "User TID";
            $scope.usertidPlaceholder = "Please enter the tid in your activation email";

            $scope.ErrMsg = {
                UserEmailErr:"Login User e-mail address format error!",
                UserPassword:"Login user password is incorrect!",
                UserFid:"Login user fid is incorrect!",
                UserTid:"Login user tid is incorrect!",
                ServiceLostErr : "Server is not response!"
            }
        }
    }

    function initView(){
        initText();
        $scope.isReadOnly = false;
        $scope.activeBtnIcon = "fa fa-check";
        $scope.errorMessage = "";
        $scope.userEmail = "";
        $scope.userPassword = "";
        $scope.userfid = "";
        $scope.usertid = "";
    }

    $scope.activeClick = function(){
        if ($scope.activeBtnIcon == WAIT_ICON_STATE){
            return;
        }

        if (!checkInput()){
            return;
        }
        $scope.activeBtnIcon = WAIT_ICON_STATE;
        $scope.isReadOnly = true;

        activeUserEmailExecute();
    };

    function checkInput() {
        $scope.errorMessage = "";
        if($scope.userEmail == null || $scope.userEmail == ""){
            $scope.errorMessage = $scope.ErrMsg.UserEmailErr;
            return false
        }
        if($scope.userPassword == null || $scope.userPassword == ""){
            $scope.errorMessage = $scope.ErrMsg.UserPassword;
            return false
        }
        if($scope.userfid == null || $scope.userfid == ""){
            $scope.errorMessage = $scope.ErrMsg.UserFid;
            return false
        }
        if($scope.usertid == null || $scope.usertid == ""){
            $scope.errorMessage = $scope.ErrMsg.UserTid;
            return false
        }
        return true;
    }

    function transform(data){
        return data;
    }

    function activeUserEmailExecute(){
        postUrl = BACK_SERVICE_URL + "/" + BACK_SERVICE_ACCOUNT;
        md5Pw = CryptoJS.SHA256($scope.userPassword+$scope.userEmail).toString(CryptoJS.enc.Hex);
        shastr = CryptoJS.SHA256($scope.userEmail+";"+$scope.userPassword).toString(CryptoJS.enc.Hex);

        $scope.userPassword = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
        tx = POST_TYPE_FLAG + "=" + PT_USER_ACTIVE + "&" + POST_MARK_USER_NAME + "=" + encodeURIComponent($scope.userEmail) + "&" +
            POST_MARK_PASS_WORD + "=" + encodeURIComponent(md5Pw) + "&" +
            POST_MARK_FID + "=" + encodeURIComponent($scope.userfid) + "&" +
            POST_MARK_TID + "=" + encodeURIComponent($scope.usertid);
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
                    if(data.data.success){
                        saveToCookie($cookies,COOKIE_KEY_USERAUTH,data.data.user_auth,-1);
                        saveToCookie($cookies,COOKIE_KEY_USERLEVEL,data.data.user_level,-1);
                        saveToCookie($cookies,COOKIE_KEY_USERNAME,data.data.login_user,-1);
                        saveToCookie($cookies,COOKIE_KEY_SECRETSTR,shastr,-1);
                        window.location.href = "index.html";
                    }
                }else{
                    $scope.errorMessage = data.Error;
                    $scope.userPassword = "";
                }
                $scope.activeBtnIcon = "fa fa-check";
                $scope.isReadOnly = false;
            }).
            error(function (data, status, headers, config){
                console.log("error\r\n",data);
                console.log("status\r\n",status);
                console.log("headers\r\n",headers);
                console.log("config\r\n",config);
                $scope.errorMessage = $scope.ErrMsgTable.ServiceLostErr;
                $scope.activeBtnIcon = "fa fa-check";
                $scope.isReadOnly = false;
                $scope.userPassword = "";
            });
    }

    initView();
}
activeaccapp.controller('aaMainController',aaMainController);


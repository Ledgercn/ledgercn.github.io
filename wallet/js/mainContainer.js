

function mainContainController($cookies,$scope,$rootScope,$http,LANGUAGE) {
    $rootScope.$on(LANGUAGE_CHANGED,function(event,data){
        if (data != null && data.from == "topMenuController"){
            initText();
        }
    });

    $rootScope.$on(BLOCK_VIEW,function(event,data){
        if (data != null){
            $scope.isBlockView = data.blockview;
        }
    });

    $scope.$on(BLOCK_VIEW,function(event,data){
        if (data != null){
            $scope.isBlockView = data.blockview;
        }
    });

    function initText(){
        if(LANGUAGE.Language == ZH_CN_LANG){
            $scope.ErrMsg = "正在建设中...";
        }else{
            $scope.ErrMsg = "We are building ....";
        }
    }

    function initUserStatus(){
        logUser = $cookies.get(COOKIE_KEY_USERNAME);
        userAuth = $cookies.get(COOKIE_KEY_USERAUTH);

        if (logUser != null && userAuth != null){
            postUrl = BACK_SERVICE_URL + "/" + BACK_SERVICE_ACCOUNT;
            tx = POST_TYPE_FLAG + "=" + PT_CHECK_USERAUTH + "&" +
                POST_MARK_USER_NAME + "=" + encodeURIComponent(logUser) + "&" +
                POST_MARK_AUTHCODE + "=" + encodeURIComponent(userAuth);

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
                        if (data.data.success == true){
                            $scope.$broadcast(LOGIN_CHECK,{
                                isLogin:true,
                                loginUser:data.data.login_user,
                                level: data.data.user_level,
                                gaUsed: data.data.user_ga_used
                            });
                            if ( data.data.update_auth ) {
                                saveToCookie($cookies,COOKIE_KEY_USERAUTH,data.data.user_auth)
                            }
                            $scope.isLoading = false;
                            $scope.isLogin = true;
                            return
                        }
                    }

                    $scope.$broadcast(LOGIN_CHECK,{
                        isLogin:false
                    });
                    $scope.isLogin = false;
                    showError(true);
                }).
                error(function (data, status, headers, config){
                    console.log("error\r\n",data);
                    console.log("status\r\n",status);
                    console.log("headers\r\n",headers);
                    console.log("config\r\n",config);
                    $scope.$broadcast(LOGIN_CHECK,{
                        isLogin:false
                    });
                    $scope.isLogin = false;
                    showError(false);
                });
        }
        $scope.$broadcast(LOGIN_CHECK,{
            isLogin:false
        });
        $scope.isLogin = false;
        showError(true);
    }

    function showError(fshow){
        initText();
        if ($scope.isBlockView && !fshow) {
            $scope.isLoading = true;
            $scope.loadingIcon = "";
        }else{
            $scope.isLoading = false;
            $scope.loadingIcon = "fa fa-spinner fa-pulse fa-4x";
        }
    }

    $scope.initView = function(b){
        $scope.isLoading = true;
        $scope.loadingIcon = "fa fa-spinner fa-pulse fa-4x";
        $scope.ErrMsg = "";
        $scope.isBlockView = b;
        initUserStatus();
    };
}

var proapp = angular.module("proapp",['ngCookies']).config(function($anchorScrollProvider) {
    $anchorScrollProvider.disableAutoScrolling();
});

proapp.factory('LANGUAGE', function(){
    return {Language:null};
});

proapp.factory("COOKIE_SAVE",function(){
    return {addresses:null};
});

proapp.factory("CURRENT_NETWORK",function(){
    //return {net:TEST_NET};
    return {net:LIVE_NET};
});

proapp.controller('languageController',languageController);

function headerController($cookies, $cookieStore, $scope, $rootScope, LANGUAGE, COOKIE_SAVE){

    $scope.$on(LOGIN_CHECK,function(event,data){
        if (data != null){
            $scope.isLogin = data.isLogin;
            if($scope.isLogin){
                $scope.loginUser = data.loginUser;
                $scope.userLevel = data.level;
                //$scope.hasGA = data.gaUsed;
            }
        }
    });


    function saveLanguageCookie(langValue){
        var expireDate = new Date();
        expireDate.setDate(expireDate.getDate() + 365);
        $cookies.put("LANGUAGE",langValue,{'expires': expireDate, 'path':'/'});
    }

    function initText() {
        if (LANGUAGE.Language == ZH_CN_LANG) {
            $scope.activeTitle = "已经激活";
            $scope.configUserTitle = "配置用户";
            $scope.LogoutUserTitle = "注销登录";
            $scope.languageTitle = "English";
        } else {
            $scope.activeTitle = "Actived";
            $scope.configUserTitle = "Configuration";
            $scope.LogoutUserTitle = "Logout";
            $scope.languageTitle = " 中文 ";
        }
    }

    function initView() {
        initText();
        $scope.loginUser = "";
        $scope.userLevel = 0;
    }


    $scope.ChangeLanguageClick = function(){
        if ($scope.languageTitle == " 中文 "){
            LANGUAGE.Language = ZH_CN_LANG;
        } else {
            LANGUAGE.Language = EN_LANG;
            $scope.languageTitle = " 中文 ";
        }

        initText();
        saveLanguageCookie(LANGUAGE.Language);

        $rootScope.$broadcast(LANGUAGE_CHANGED,{
            event:LANGUAGE.Language
        });
    };

    $scope.logoutBtnClick = function(){
        $cookies.remove(COOKIE_KEY_USERNAME,{'path':'/'});
        $cookies.remove(COOKIE_KEY_USERAUTH,{'path':'/'});
        $cookies.remove(COOKIE_KEY_USERLEVEL,{'path':'/'});
        $cookies.remove(COOKIE_KEY_SECRETSTR,{'path':'/'});
        $scope.isLogin = false;
        $scope.loginUser = "";
    };
    initView();
}
proapp.controller('headerController',headerController);

function mainviewController($cookies, $cookieStore, $scope, $rootScope, $http, LANGUAGE, COOKIE_SAVE){
    function initText() {
        if (LANGUAGE.Language == ZH_CN_LANG) {
            $scope.loadingTitle = "正在读取...";
            $scope.ErrorTable = {
                serverError:"连接不上服务器",
                loginRetry:"登录验证失败，可能由于你的账户在一个电脑上登录！"
            };
        } else {
            $scope.loadingTitle = "Loading...";
            $scope.ErrorTable = {
                serverError:"Not connect server",
                loginRetry:"Login verification failed! Your account is logged in to other computer!"
            };
        }
    }

    function Loading(){
        logUser = $cookies.get(COOKIE_KEY_USERNAME);
        userAuth = $cookies.get(COOKIE_KEY_USERAUTH);
        if (logUser != null && userAuth != null) {
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
                            if (data.data.user_level >= 1){
                                $scope.$broadcast(LOGIN_CHECK,{
                                    isLogin:true,
                                    loginUser:data.data.login_user,
                                    level: data.data.user_level,
                                    gaUsed: data.data.user_ga_used
                                });
                                if ( data.data.update_auth ) {
                                    saveToCookie($cookies,COOKIE_KEY_USERAUTH,data.data.user_auth)
                                }
                                $scope.isLogin = true;
                            } else {
                                $scope.isLogin = false;
                                window.location.href = "activeaccount.html";
                            }
                            return
                        } else {
                            $scope.ErrMsg = $scope.ErrorTable.loginRetry
                        }
                    }else{
                        $scope.ErrMsg = data.Error;
                    }

                    $scope.$broadcast(LOGIN_CHECK,{
                        isLogin:false
                    });
                    $scope.isLogin = false;
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
                    $scope.ErrMsg = $scope.ErrorTable.serverError;
                });
        } else {
            $scope.$broadcast(LOGIN_CHECK,{
                isLogin:false
            });
            $scope.isLogin = false;
            window.location.href = "../login.html";
        }
    }

    function initView() {
        initText();
        $scope.isLogin = false;
        $scope.ErrMsg = "";
        Loading();
    }

    initView();
}
proapp.controller('mainviewController',mainviewController);

function contentController($cookies, $cookieStore, $scope, $rootScope, $http,LANGUAGE, COOKIE_SAVE,CURRENT_NETWORK){
    $scope.$on(LOGIN_CHECK,function(event,data){
        if (data != null){
            $scope.isLogin = data.isLogin;
            if($scope.isLogin){
                $scope.loginUser = data.loginUser;
                $scope.userLevel = data.level;
                $scope.hasGA = data.gaUsed;
                loadWallets();
                loadFriends();
            }
        }
    });

    $scope.$on(LANGUAGE_CHANGED,function(event,data){
        if (data != null){
            initText();
        }
    });

    function loadEndFunc(data){
        if (data.data != null) {
            $scope.refreshAllBalance();
        }else{
            $scope.AlertMessage = data.Error;
        }
    }

    function loadWallets(){
        auth = $cookies.get(COOKIE_KEY_USERAUTH);
        if (auth == null || auth.length < 10){
            $cookies.remove(COOKIE_KEY_USERNAME,{'path':'/'});
            $cookies.remove(COOKIE_KEY_USERAUTH,{'path':'/'});
            $cookies.remove(COOKIE_KEY_USERLEVEL,{'path':'/'});
            $cookies.remove(COOKIE_KEY_SECRETSTR,{'path':'/'});
            alert($scope.ErrorTable.loginRetry);
            window.location.href = "../login.html";
        }
        $scope.AccountsManager.reloadAccounts($http,$scope.loginUser,auth,loadEndFunc);
    }

    function loadFriendEndFunc(data){
        if (data.data == null) {
            $scope.AlertMessage += data.Error;
        }
    }

    function loadFriends(){
        auth = $cookies.get(COOKIE_KEY_USERAUTH);
        if (auth == null || auth.length < 10){
            $cookies.remove(COOKIE_KEY_USERNAME,{'path':'/'});
            $cookies.remove(COOKIE_KEY_USERAUTH,{'path':'/'});
            $cookies.remove(COOKIE_KEY_USERLEVEL,{'path':'/'});
            $cookies.remove(COOKIE_KEY_SECRETSTR,{'path':'/'});
            alert($scope.ErrorTable.loginRetry);
            window.location.href = "../login.html";
        }
        $scope.AccountsManager.reloadFriends($http,$scope.loginUser,auth,loadFriendEndFunc);
    }

    function setCurrentNetwork(){
        console.log(CURRENT_NETWORK.net);
        if(CURRENT_NETWORK.net == LIVE_NET){
            StellarBase.Network.usePublicNetwork();
            STELLAR_DEFAULT_NETWORK = STELLAR_LIVE_NETWORK;
        } else {
            StellarBase.Network.useTestNetwork();
            STELLAR_DEFAULT_NETWORK = STELLAR_TEST_NETWORK;
        }
    }

    function initText() {
        if (LANGUAGE.Language == ZH_CN_LANG) {
            $scope.leftside_accTitle = "所有账户的余额为";

            $scope.context_title_all_account = "所有账户";
            $scope.context_title_s_no_account = "你还没有账户，快点新建一个";

            $scope.leftside_menu_accTitle = "账户";
            $scope.leftside_menu_acc_InfoTitle = "详细信息";
            $scope.leftside_menu_acc_PayTitle = "付款";
            $scope.leftside_menu_acc_MergeTitle = "合并账户";
            $scope.leftside_menu_acc_HistoryTitle = "历史";
            $scope.leftside_menu_acc_OrderTitle = "挂单";
            $scope.leftside_menu_acc_SettingTitle = "设置";
            $scope.leftside_menu_acc_BackTitle = "返回";

            $scope.leftside_menu_contactTitle = "通讯录";
            $scope.leftside_menu_friendsTitle = "所有好友";
            $scope.leftside_menu_groupTitle = "好友分组";

            $scope.litbox_createAccTitle = "创建";
            $scope.litbox_createAccMemo1 = "新建一个恒星账户";
            $scope.litbox_createAccMemo2 = "使用已有账户或新建";
            $scope.litbox_createAccBtnTitle = "新建账户";
            $scope.litbox_accDetailTitle = "详细信息";

            $scope.context_detailShowTitle = "查看";
            $scope.context_detailHideTitle = "隐藏";
            $scope.context_detailMiniTitle = "最小化";
            $scope.context_detailBackTopTitle = "返回顶部";
            $scope.context_detailRefreshTitle = "刷新";

            $scope.context_detailAddressrTitle = "地址信息";
            $scope.context_detailPublicAddrTitle = "公共地址";
            $scope.context_detailSecretKeyTitle = "私密Key";
            $scope.context_detailAccBalanceTitle = "账户余额";
            $scope.context_detailOthersTitle = "其他信息";
            $scope.context_detailNotSet = "未设置";
            $scope.context_detailHomeDomain = "主域名";
            $scope.context_detailInfDest = "通胀地址";
            $scope.context_detailSequence = "序号";
            $scope.context_detailFlags = "标示";
            $scope.context_detailThresholds = "门限";
            $scope.context_detailSigners = "签名权重";

            $scope.context_paySelecFriends = "选择好友";
            $scope.context_pay_friendsPlaceholder = "输入接收地址或选择好友";
            $scope.context_pay_friendsExplanation = "[必填]多个地址或好友以分号分割";
            $scope.context_pay_amountPlaceholder = "输入要发送的金额（单位：lumens）";
            $scope.context_pay_amountExplanation = "[必填] 当前余额:";
            $scope.context_pay_memoPlaceholder = "输入Memo";
            $scope.context_pay_memoExplanation = "[可选]MemoText最多可以输入28个英文字符；MemoID只允许输入数字；MemoHash是一个Hash字符串（16进制显示）；MemoReturn是编码之后的字符串；";
            $scope.context_pay_UserAgentTitle = "使用服务器代理";
            $scope.context_pay_UserAgentExplanation = "(支付成功才会收取20XLM费用，不成功不收费)";
            $scope.context_pay_SendBtnTitle = "发送";

            $scope.context_detailMergeSecretKeyPlaceholder = "需要并入的账户私Key";
            $scope.context_detailMergeSecretKeyExplanation = "[必填]操作成功后，并入账户的所有金额将打入到当前账户中";
            $scope.context_detailMergeAtLeastBalance = "合并操作要求被并入的账户余额最少需要 20.0000100 XLM";
            $scope.context_detailMergeAmountExplanation = "当前余额:";
            $scope.context_detailMergeConfirmTitle = "我确认需要合并";
            $scope.context_detailMergeBtnTitle = "确认合并";

            $scope.toolbar_addAccTitle = "添加账户";
            $scope.toolbar_addAcc_NickNamePlaceholder = "账户昵称(长度>=4)";
            $scope.toolbar_addAcc_SecretKeyPlaceholder = "输入账户私有Key";
            $scope.toolbar_addAcc_GATitle = "使用Google验证";
            $scope.toolbar_addAcc_RandomBtnTitle = "随机生成";
            $scope.toolbar_addAcc_ConfirmBtnTitle = "确定添加";
            $scope.toolbar_addAcc_NickNameMemo = "用户昵称设置后不可更改，全网唯一，其他账户可以通过你的昵称直接为你付款。";

            $scope.context_settingAccNickNamePlaceholder = "账户名称";
            $scope.context_settingAccDeleteBtnTitle = "删除账户";
            $scope.context_settingAccModifyBtnTitle = "确认修改";

            $scope.popup_OperationTitle = "操作";
            $scope.popup_SelectFriendTitle = "选择好友";

            $scope.popup_DeleteAccTitle = "删除当前账户";
            $scope.popup_loginPasswordTitle = "登录密码";
            $scope.popup_loginPasswordPlaceholder = "输入登录密码";
            $scope.popup_GATitle = "Google验证码";
            $scope.popup_GAPlaceholder = "输入Google验证码";
            $scope.popup_MergetoTitle = "合并余额到";
            $scope.popup_MergetoPlaceholder = "选择合并余额后，当前被删除的账户余额将合并到选中的账户中，被删除的账户将不可用。";
            $scope.popup_CancelBtnTitle = "取消";
            $scope.popup_OKBtnTitle = "确认";

            $scope.history_AllTitle = "全部";
            $scope.history_IncomingTitle = "收入";
            $scope.history_OutgoingTitle = "支出";
            $scope.history_OtherTitle = "其他";
            $scope.history_DatetimeTitle = "时间";
            $scope.history_DatetimeOption_1D = "1 天";
            $scope.history_DatetimeOption_7D = "7 天";
            $scope.history_DatetimeOption_10D = "10 天";
            $scope.history_DatetimeOption_30D = "30 天";
            $scope.history_DatetimeOption_All = "所有";
            $scope.history_RefreshTitle = "刷新";
            $scope.history_loadingTitle = "正在读取...";

            $scope.menu_friend_searchTitle = "查找";
            $scope.menu_friend_SearchSelect_Addr = "地址";
            $scope.menu_friend_SearchSelect_NickName = "昵称";
            $scope.menu_friend_listTitle = "好友列表";
            $scope.menu_friend_SearchAddrPlaceholder = "输入要查找的地址";
            $scope.menu_friend_SearchNickNamePlaceholder = "输入要查找的昵称";
            $scope.menu_friend_SearchAddTitle = "加为好友";
            $scope.menu_friend_SearchDelTitle = "删除";
            $scope.menu_friend_IsFriendTitle = "好友";

            $scope.ErrorTable = {
                SecretKeyError:"无效的私有Key，请检查你的输入！",
                NickNameFormatError:"输入的昵称有误！",
                SSKeyError:"出现严重错误，请重新登录！",
                FriendsIsEmpty:"接收地址格式错误!",
                PaymentAmountIsEmpty:"发送金额格式错误!",
                TextMemoError:"Memo长度超过28个字符!",
                FriendIncludeSelf:"不能自己发给自己!",
                SourceAccNotSufficientFunds:"账户地址余额不足，不能被合并!",
                UnknownError:"出现未知错误，请重新操作！",
                DeletAccNotFindDestMergeAcc:"找不到合并需要的目标账户!",
                DeletAccGAEmpty:"Google验证码填写错误!",
                DeletAccPasswordEmpty:"登录密码输入错误!",

                Input_Error:"请输入要查找的内容!",
                Search_Type_Error:"请输入正确的查找类型!",
                Search_NoResult:"未发现符合条件的用户!",
            };

            $scope.PaymentMessages = {
                CHECK_NICKNAME: "检查地址有效性...",
                NETWORK_ERROR:"网络连接出现错误！",
                START_SEND_AMOUNT:"开始发送...",
                CHECK_DEST_VALID:"检查发送信息...",
                DEST_ERROR:"目标账户信息存在错误！发送终止！",
                CHECK_SOURCE_BALANCE:"检查当前账户余额...",
                SOURCE_ERROR:"当前账户信息存在错误！发送终止！",
                SOURCE_BALANCE_NOT_SUFF_FUNDS:"当前账户余额不足，请检查！发送终止！",
                CHECK_DEST_EXIST:"检查目标账户是否存在...",
                DEST_NOT_EXIST:"** 目标账户不存在，需要新建账户 **",
                FRAME_SIGNER:"开始发送到目标账户...",
                LOGIN_USER_ERROR:"登录用户信息有误，重新登录！",
                SEND_COMPLETE:"发送成功！",
                SEND_FAILURE:"发送失败！",
                MEMO_TEXT_ERROR:"Memo Text 格式错误！",
                MEMO_ID_ERROR:"Memo ID 格式错误！",
                MEMO_HASH_ERROR:"Memo Hash 格式错误！",
                MEMO_RETURN_ERROR:"Memo Return 格式错误！",

                MERGE_START:"开始合并...",
                MERGE_FAILURE:"合并失败!",
                MERGE_SUCCESS:"合并成功!",
            };
        } else {
            $scope.leftside_accTitle = "Accounts balance";

            $scope.context_title_all_account = "All accounts";
            $scope.context_title_s_no_account = "You don't have an account, you can build a new one.";

            $scope.leftside_menu_accTitle = "Accounts";
            $scope.leftside_menu_acc_InfoTitle = "Details";
            $scope.leftside_menu_acc_PayTitle = "Payment";
            $scope.leftside_menu_acc_MergeTitle = "Merge";
            $scope.leftside_menu_acc_HistoryTitle = "History";
            $scope.leftside_menu_acc_OrderTitle = "Order";
            $scope.leftside_menu_acc_SettingTitle = "Settings";
            $scope.leftside_menu_acc_BackTitle = "Back";

            $scope.leftside_menu_contactTitle = "Contact";
            $scope.leftside_menu_friendsTitle = "All friends";
            $scope.leftside_menu_groupTitle = "Friend group";
            $scope.litbox_createAccTitle = "Create";
            $scope.litbox_createAccMemo1 = "Create an account for yourself";
            $scope.litbox_createAccMemo2 = "New or use an Existing account";
            $scope.litbox_createAccBtnTitle = "Create account";
            $scope.litbox_accDetailTitle = "Information";
            $scope.toolbar_addAcc_NickNameMemo = "Wallet nickname can not be changed, the whole network only, other wallet can be paid directly to you through your nickname.";

            $scope.context_detailShowTitle = "Show";
            $scope.context_detailHideTitle = "Hide";
            $scope.context_detailMiniTitle = "minimize";
            $scope.context_detailBackTopTitle = "Back top";
            $scope.context_detailRefreshTitle = "Refresh";

            $scope.context_detailAddressrTitle = "Address informations";
            $scope.context_detailPublicAddrTitle = "Public address";
            $scope.context_detailSecretKeyTitle = "Secret key";
            $scope.context_detailAccBalanceTitle = "Account balance";
            $scope.context_detailOthersTitle = "Other informations";
            $scope.context_detailNotSet = "Not set";
            $scope.context_detailHomeDomain = "HomeDomain";
            $scope.context_detailInfDest = "Inflation Destination";
            $scope.context_detailSequence = "Sequence";
            $scope.context_detailFlags = "Flags";
            $scope.context_detailThresholds = "Thresholds";
            $scope.context_detailSigners = "Signers";

            $scope.context_paySelecFriends = "Select friends";
            $scope.context_pay_friendsPlaceholder = "Enter the receiving address or select friends";
            $scope.context_pay_friendsExplanation = "[Required] multiple addresses or friends separated by semicolons";
            $scope.context_pay_amountPlaceholder = "Enter the amount you want to send (unit: lumens)";
            $scope.context_pay_amountExplanation = "[Required] Balance:";
            $scope.context_pay_memoPlaceholder = "Enter memo";
            $scope.context_pay_memoExplanation = "[Optional] Memo Text can enter up to 28 English characters; MemoID only allowed to enter numbers; MemoHash is a Hash string (hexadecimal display); MemoReturn string after encoding;";
            $scope.context_pay_UserAgentTitle = "By Server Agent";
            $scope.context_pay_UserAgentExplanation = "(Paying success fees will be charged 20XLM, pay no fee unsuccessful)";
            $scope.context_pay_SendBtnTitle = "Send";

            $scope.context_detailMergeSecretKeyPlaceholder = "Need to be merged into this account of private Key";
            $scope.context_detailMergeSecretKeyExplanation = "[Required] After the success of the operation, all the amount of the account will be merge into current account";
            $scope.context_detailMergeAtLeastBalance = "The merge operation requirements are incorporated into the account balance at least 20.0000100 XLM";
            $scope.context_detailMergeConfirmTitle = "I confirmed the need to merge";
            $scope.context_detailMergeAmountExplanation = "Balance:";
            $scope.context_detailMergeBtnTitle = "Confirm";

            $scope.toolbar_addAccTitle = "Add account";
            $scope.toolbar_addAcc_NickNamePlaceholder = "Account nick name(Length >= 4)";
            $scope.toolbar_addAcc_SecretKeyPlaceholder = "Enter account secret key";
            $scope.toolbar_addAcc_GATitle = "Enable google auth";
            $scope.toolbar_addAcc_RandomBtnTitle = "Randomly";
            $scope.toolbar_addAcc_ConfirmBtnTitle = "Confirm";

            $scope.context_settingAccNickNamePlaceholder = "Account nick name";
            $scope.context_settingAccDeleteBtnTitle = "DELETE";
            $scope.context_settingAccModifyBtnTitle = "MODIFY";

            $scope.popup_OperationTitle = "Operation";
            $scope.popup_SelectFriendTitle = "Select friend";

            $scope.popup_DeleteAccTitle = "Delete current account";
            $scope.popup_loginPasswordTitle = "Login password";
            $scope.popup_loginPasswordPlaceholder = "Enter login password";
            $scope.popup_GATitle = "Google auth code";
            $scope.popup_GAPlaceholder = "Enter Google auth code";
            $scope.popup_MergetoTitle = "Merge balance to";
            $scope.popup_MergetoPlaceholder = "After selecting the merge balance, the current account balance will be removed and the account will be merged into the selected account.";
            $scope.popup_CancelBtnTitle = "Cancel";
            $scope.popup_OKBtnTitle = "Confirm";

            $scope.history_AllTitle = "All";
            $scope.history_IncomingTitle = "Incoming";
            $scope.history_OutgoingTitle = "Outgoing";
            $scope.history_OtherTitle = "Other";
            $scope.history_DatetimeTitle = "Date";
            $scope.history_DatetimeOption_1D = "1 Day";
            $scope.history_DatetimeOption_7D = "7 Day";
            $scope.history_DatetimeOption_10D = "10 Day";
            $scope.history_DatetimeOption_30D = "30 Day";
            $scope.history_DatetimeOption_All = "All";
            $scope.history_RefreshTitle = "Refresh";
            $scope.history_loadingTitle = "loading...";

            $scope.menu_friend_searchTitle = "Search";
            $scope.menu_friend_SearchSelect_Addr = "Address";
            $scope.menu_friend_SearchSelect_NickName = "Nick name";
            $scope.menu_friend_listTitle = "Friend list";
            $scope.menu_friend_SearchAddrPlaceholder = "Enter public address for search";
            $scope.menu_friend_SearchNickNamePlaceholder = "Enter nick name for search";
            $scope.menu_friend_SearchAddTitle = "Add friend";
            $scope.menu_friend_SearchDelTitle = "Delete";
            $scope.menu_friend_IsFriendTitle = "Friend";

            $scope.ErrorTable = {
                SecretKeyError:"Invalid secret key format, please re-enter!",
                NickNameFormatError:"Nick name is invalid!",
                SSKeyError:"There is a serious error, please re-login!",
                FriendsIsEmpty:"Receiving address format error!",
                PaymentAmountIsEmpty:"Amount format is error!",
                TextMemoError:"Memo text length > 28!",
                FriendIncludeSelf:"Can not send yourself address!",
                SourceAccNotSufficientFunds:"Account balance not sufficient funds, can not be merged!",
                UnknownError:"An unknown error occurred, please re-operation!",
                DeletAccNotFindDestMergeAcc:"Can not find merge to account information!",
                DeletAccGAEmpty:"Google auth code is invalid!",
                DeletAccPasswordEmpty:"Login password is invalid!",

                Input_Error:"Please enter the search content!",
                Search_Type_Error:"Please enter the correct type of search!",
                Search_NoResult:"Not findout the conditions of the users!",
           };

            $scope.PaymentMessages = {
                CHECK_NICKNAME: "Checking destination ...",
                NETWORK_ERROR:"Network is Invalid!",
                START_SEND_AMOUNT:"Start sending...",
                CHECK_DEST_VALID:"Check send informations...",
                DEST_ERROR:"Error in target account information! Send termination!",
                CHECK_SOURCE_BALANCE:"Confirm current account balance...",
                SOURCE_ERROR:"Error in current account information! Send termination!",
                SOURCE_BALANCE_NOT_SUFF_FUNDS:"current account balance is insufficient, please check! Send termination! ",
                CHECK_DEST_EXIST:"Check target account exist...",
                DEST_NOT_EXIST:"** Target account is not exist，Need to build a new account **",
                FRAME_SIGNER:"Begin send progress...",
                LOGIN_USER_ERROR:"Login user information is invalid, re-login please!",
                SEND_COMPLETE:"Send success!",
                SEND_FAILURE:"Send failure!",
                MEMO_TEXT_ERROR:"Memo Text format error!",
                MEMO_ID_ERROR:"Memo ID format error!",
                MEMO_HASH_ERROR:"Memo Hash format error!",
                MEMO_RETURN_ERROR:"Memo Return format error!",

                MERGE_START:"Start merging...",
                MERGE_FAILURE:"Merge Failure!",
                MERGE_SUCCESS:"Merge success!",
            };
        }
    }

    function initViewVisible(){
        $scope.AlertMessage = "";
        $scope.AccInfosViewVisible = false;
        $scope.PaymentViewVisible = false;
        $scope.HistoryViewVisible = false;
        $scope.OrderViewVisible = false;
        $scope.MergeViewVisible = false;
        $scope.AccSettingsViewVisible = false;
        $scope.AddAccViewVisible = false;

        $scope.MenuAllFriendsVisible = false;
        $scope.MenuGroupFriendsVisible = false;
    }

    function initAddAccountView(){
        $scope.toolbar_AddAcc_AlertMessage = "";
        $scope.toolbar_addAcc_NickName = "";
        $scope.toolbar_addAcc_SecretKey = "";
        $scope.toolbar_addAcc_SecretKeyType = "password";
        $scope.toolbar_addAcc_SecretKeyEyeBtnIcon = "fa-eye"; // fa-eye-slash
        $scope.toolbar_addAcc_PublicAddr = "";
        $scope.toolbar_addAcc_GAChecked = false;
    }

    function initHistoryView(){
        $scope.history_AllBtnIcon = "btn-primary";
        $scope.history_IncomingBtnIcon = "btn-default";
        $scope.history_OutgoingBtnIcon = "btn-default";
        $scope.history_OtherBtnIcon = "btn-default";
        $scope.history_DateSelection = "7";
        $scope.history_RefreshBtnIcon = "";
        $scope.history_AlertMessage = "";
        $scope.history_loadingVisible = false;
        $scope.HistoryListViewController = {
            currentPage:0,
            pages:0,
            currentViewOption:0,
            currentDayOption:7,
            isEnd:false,
            lastIndex:-1,
            InCount:0,
            OutCount: 0,
            InBalances:0,
            OutBalances:0,
        };
    }

    function initPopupView(){
        $scope.popup_friendListVisible = false;
        $scope.popup_deleteAccContextVisible = false;
        $scope.popup_passwordVisible = false;
        $scope.popup_loginPassword = "";
        $scope.popup_GA = "";
        $scope.popup_Mergeto = false;
    }

    function initMenuFriendView(){
        $scope.menu_friend_AlertMessage = "";
        $scope.menu_friendsSearchBtnIcon = "fa-search";
        $scope.menu_friend_SearchInput = "";
        $scope.menu_friend_SearchPlaceholder = $scope.menu_friend_SearchAddrPlaceholder;
        $scope.menu_friend_SearchResult = [];
    }

    function initView() {
        setCurrentNetwork();
        initText();
        initViewVisible();
        initPopupView();

        $scope.AccountsManager = new Pro_Accounts();
        //$scope.Accounts = $scope.AccountsManager.getAccounts($http);

        $scope.leftside_balance = "0";
        $scope.refreshAllBalanceBtnIcon = "fa fa-rocket";
        $scope.executing = "";
        $scope.currentSelectIndex = 0;

        initAccInfoView();
        initPaymentView();
        $scope.context_payment_AlertMessage = "";
        initMergeView();
        $scope.context_merge_AlertMessage = "";
        initAddAccountView();

        initHistoryView();
        $scope.HistoryList = [];

        initMenuFriendView();
        $scope.menu_friend_List = [];

        $scope.context_detailMergeSrcAcc = null;
        $scope.selectionAccountList = [];

    }

    function RefreshBalanceEndFunc(index,retAcc){
        if($scope.AccountsManager.isAllBalanceReady()){
            $scope.refreshAllBalanceBtnIcon = "fa fa-rocket";
            $scope.AlertMessage = $scope.AccountsManager.getErrorMessage();
        }
        $scope.leftside_balance = $scope.AccountsManager.totalBalance();

        if(index == $scope.current_account_index){
            $scope.curAccInfo = $scope.AccountsManager.getAccInfo(index);
            $scope.currentNickName = $scope.curAccInfo.NickName;
            if ($scope.curAccInfo.Info == null){
                $scope.context_pay_balance = "-";
            } else {
                $scope.context_pay_balance = $scope.curAccInfo.Info.Balance_XLM;
            }
            $scope.context_pay_balanceBtnIcon = "";
        }
    }

    $scope.refreshAllBalance = function(){
        if($scope.refreshAllBalanceBtnIcon == WAIT_ICON_STATE ||
            $scope.AccountsManager.Count() == 0){
            return
        }
        $scope.refreshAllBalanceBtnIcon = WAIT_ICON_STATE;
        $scope.leftside_balance = "-";
        $scope.AccountsManager.refreshBalances($http,RefreshBalanceEndFunc)
    };

    $scope.createAccountBtnClick = function(){
        initViewVisible();
        $scope.AddAccViewVisible = true;
    };

    $scope.leftside_menu_AccBtnClick = function(){
        $scope.currentSelectIndex = 0;
        initViewVisible();
    };

    function initAccInfoView(){
        $scope.curAccInfo = null;
        $scope.context_detailPublicAddr = "";
        $scope.context_detailSecretKetSave = "";
        $scope.context_detailSecretKey = "********************************************************";
        $scope.context_detailSecretKeyBtnIcon = "fa fa-eye";
    }

    function initPaymentView(){
        $scope.context_pay_friends = "";
        $scope.context_pay_amount = "";
        $scope.context_pay_memoTitle = "Memo Text";
        $scope.context_pay_memo = "";
        $scope.context_pay_balance = "";
        $scope.context_pay_balanceBtnIcon = "";
        $scope.context_pay_UserAgent=false;
        $scope.context_pay_SendBtnIcon = "";
    }

    function initMergeView() {
        $scope.context_detailMergeBalance = "-";
        $scope.context_detailMergeConfirm = false;
        $scope.context_detailMergeUserAgent = false;
        $scope.context_detailMergeConfirmCheckState = true;
        $scope.context_detailMergeSecretKey = "";
        $scope.context_detailMergePublicAddr = "";
        $scope.context_detailMergeBtnIcon = "fa-check";
    }

    function initSettingView(){
        $scope.context_settingAccNickName = "";
        $scope.context_settingAccPublicAddr = "";
        $scope.context_settingAccSecretSave = "";
        $scope.context_settingAccSecretKey = "********************************************************";
        $scope.context_settingSecretKeyBtnIcon = "fa fa-eye";
        $scope.context_settingGAChecked = false;
    }

    $scope.leftside_menu_acc_InfoBtnClick = function(index){
        initViewVisible();
        initAccInfoView();
        initPaymentView();
        initMergeView();
        $scope.context_payment_AlertMessage = "";
        $scope.context_merge_AlertMessage = "";
        $scope.currentSelectIndex = 1;
        $scope.current_account_index = index;
        $scope.curAccInfo = $scope.AccountsManager.getAccInfo(index);
        $scope.curAccInfo.ErrorMessage = "";

        if($scope.curAccInfo.Actived){
            $scope.PaymentViewVisible = true;
            $scope.MergeViewVisible = true;
            $scope.OrderViewVisible = true;
        }
        //$scope.HistoryViewVisible = true;

        $scope.AccountsManager.refreshBalances($http,RefreshBalanceEndFunc,index);
        $scope.currentNickName = $scope.curAccInfo.NickName;
        $scope.AccInfosViewVisible = true;
        if ($scope.curAccInfo.Info == null){
            $scope.context_pay_balance = "-";
        } else {
            $scope.context_pay_balance = $scope.curAccInfo.Info.Balance_XLM;
        }
        $scope.context_detailPublicAddr = $scope.curAccInfo.PublicAddr;
        $scope.context_detailSecretKetSave = $scope.curAccInfo.SecretKey;
    };

    $scope.context_detailSecretKeyBtnClick = function(){
        if($scope.context_detailSecretKeyBtnIcon == "fa fa-eye"){
            $scope.context_detailSecretKeyBtnIcon = "fa fa-eye-slash";
            ssKey = $cookies.get(COOKIE_KEY_SECRETSTR);
            if (ssKey == null || ssKey.length < 10){
                $cookies.remove(COOKIE_KEY_USERNAME,{'path':'/'});
                $cookies.remove(COOKIE_KEY_USERAUTH,{'path':'/'});
                $cookies.remove(COOKIE_KEY_USERLEVEL,{'path':'/'});
                $cookies.remove(COOKIE_KEY_SECRETSTR,{'path':'/'});
                alert($scope.ErrorTable.SSKeyError);
                window.location.href = "../login.html";
            }
            $scope.context_detailSecretKey = UencSecretKey($scope.context_detailSecretKetSave,ssKey);
        } else {
            $scope.context_detailSecretKeyBtnIcon = "fa fa-eye";
            $scope.context_detailSecretKey = "********************************************************";
        }
    };

    $scope.leftside_menu_acc_PayBtnClick = function(index){
        $scope.currentSelectIndex = 2;
        $scope.currentNickName = $scope.AccountsManager.getAccInfo(index).NickName;
        initViewVisible();
        $scope.PaymentViewVisible = true;
    };

    function staticsHistory(){
        $scope.HistoryListViewController.InCount = 0;
        $scope.HistoryListViewController.InBalances = 0;
        $scope.HistoryListViewController.OutCount = 0;
        $scope.HistoryListViewController.OutBalances = 0;
        for(var i = 0 ; i < $scope.HistoryList.length ; ++i){
            his = $scope.HistoryList[i];
            //console.log(his.SubType);
            if(his.SubType == PAYMENT_IN && (his.AssetCode == null || his.AssetCode == "")){
                $scope.HistoryListViewController.InCount++;
                $scope.HistoryListViewController.InBalances += his.Amount*1
            } else if(his.SubType == CREATE_IN){
                $scope.HistoryListViewController.InCount++;
                $scope.HistoryListViewController.InBalances += his.StartingBalance*1
            } else if(his.SubType == MERGE_IN){
                $scope.HistoryListViewController.InCount++;
            } else if(his.SubType == PAYMENT_OUT && (his.AssetCode == null || his.AssetCode == "")){
                $scope.HistoryListViewController.OutCount++;
                $scope.HistoryListViewController.OutBalances += his.Amount*1
            } else if(his.SubType == CREATE_OUT){
                $scope.HistoryListViewController.OutCount++;
                $scope.HistoryListViewController.OutBalances += his.StartingBalance*1
            } else if(his.SubType == MERGE_DESTROY){
                $scope.HistoryListViewController.OutCount++;
            }
        }
    }

    function LoadHistorysEndFunc(index,acc,isOver){
        //console.log("isOver ========\r\n",isOver);
        if(isOver){
            $scope.history_loadingVisible = false;
            $scope.HistoryListViewController.isEnd = true;
            $scope.history_RefreshBtnIcon = "";
            if(acc.ErrorMessage != ""){
                $scope.history_AlertMessage = acc.ErrorMessage;
            }
            staticsHistory();
            //console.log("HistoryListViewController ==========\r\n",$scope.HistoryListViewController);
            //return;
        }
        HistoryConditionView(acc,index,true,$scope.HistoryListViewController.lastIndex);
    }

    function LoadHistorys(acc,index){
        $scope.history_loadingVisible = true;
        $scope.HistoryListViewController.isEnd = false;
        $scope.HistoryListViewController.lastIndex = -1;
        acc.AccHistorys.Breakout = false;
        acc.ErrorMessage = "";
        HistoryConditionView(acc,index);
    }

    function HistoryConditionView(acc,index,isAppend,starIndex){
        var endDate = getDate();

        //console.log("HistoryListViewController = ",$scope.HistoryListViewController);
        //console.log("isAppend = ",isAppend);
        //console.log("starIndex = ",starIndex);

        if ($scope.HistoryListViewController.currentDayOption != 65535){
            endDate = addDate(endDate,-1 * $scope.HistoryListViewController.currentDayOption);
        } else{
            endDate = 0;
        }

        if(isAppend == null || isAppend == false){
            $scope.HistoryList = [];
            starIndex = 0;
        }else if(starIndex <= 0){
            $scope.HistoryList = [];
            starIndex = 0;
        } else {
            starIndex += 1;
        }

        for(var i = starIndex ; i < acc.AccHistorys.Historys.length ; ++i){
            his = acc.AccHistorys.Historys[i];
            dtime = getDate(his.created_datetime);

            switch (his.Type){
                case PAYMENT_TYPE:
                    formatPaymentOperationEx(his,LANGUAGE.Language);
                    break;
                case CREATE_TYPE:
                    formatCreateOperationEx(his,LANGUAGE.Language);
                    break;
                case MERGE_TYPE:
                    formatMergeOperationEx(his,LANGUAGE.Language);
                    break;
                case CHANGE_TRUST_TYPE:
                    formatChangeTrustOperationEx(his,LANGUAGE.Language);
                    break;
                case MANAGE_OFFER_TYPE:
                    formatManageOfferOperationEx(his,LANGUAGE.Language);
                    break;
                case SET_OPTIONS_TYPE:
                    formatSetOptionsOperationEx(his,LANGUAGE.Language);
                    break;
            }

            //console.log("\r\nHistory Time = ",his.created_datetime,"\r\n");

            if(dtime - endDate < 0){
                $scope.HistoryListViewController.isEnd = true;
                break;
            }

            switch ($scope.HistoryListViewController.currentViewOption){
                case 0: // all
                    $scope.HistoryList[$scope.HistoryList.length] = his;
                    $scope.HistoryListViewController.lastIndex = i;
                    break;
                case 1:
                    if(his.SubType == PAYMENT_IN || his.SubType == CREATE_IN || his.SubType == MERGE_IN)
                        $scope.HistoryList[$scope.HistoryList.length] = his;
                    $scope.HistoryListViewController.lastIndex = i;
                    break;
                case 2:
                    if(his.SubType == PAYMENT_OUT || his.SubType == CREATE_OUT || his.SubType == MERGE_DESTROY)
                        $scope.HistoryList[$scope.HistoryList.length] = his;
                    $scope.HistoryListViewController.lastIndex = i;
                    break;
                case 3:
                    if(his.SubType == "" || his.SubType == CREATE_OTHER || his.Type == CHANGE_TRUST_TYPE ||
                        his.Type == MANAGE_OFFER_TYPE || his.Type == SET_OPTIONS_TYPE)
                        $scope.HistoryList[$scope.HistoryList.length] = his;
                    $scope.HistoryListViewController.lastIndex = i;
                    break;
            }
        }
        if($scope.HistoryListViewController.isEnd == false){
            acc.AccHistorys.Breakout = false;
            GetAccHistoryDatas($http,index,acc,true,LoadHistorysEndFunc);
        } else {
            $scope.history_loadingVisible = false;
            $scope.HistoryListViewController.isEnd = true;
            $scope.history_RefreshBtnIcon = "";
            if(acc.ErrorMessage != ""){
                $scope.history_AlertMessage = acc.ErrorMessage;
            }
            staticsHistory();
        }
    }

    $scope.getLocalTimeString = function(dt){
        return getLocalDateTimeString(dt,false,LANGUAGE.Language);
    };

    $scope.getAddrShort = function(addr){
        return getAddressShort(addr);
    };

    // 历史菜单点击事件
    $scope.leftside_menu_acc_HistoryBtnClick = function(index){
        initViewVisible();
        initHistoryView();
        $scope.HistoryViewVisible = true;
        $scope.currentSelectIndex = 4;
        $scope.current_account_index = index;
        $scope.curAccInfo = $scope.AccountsManager.getAccInfo(index);
        $scope.currentNickName = $scope.curAccInfo.NickName;
        LoadHistorys($scope.curAccInfo,index);
    };

    // 历史界面点击“全部”、“收入”、“支出”、“其他”按键事件
    $scope.history_Filter_BtnClick = function(index,subIndex){
        switch (subIndex){
            case 0:
                $scope.history_AllBtnIcon = "btn-primary";
                $scope.history_IncomingBtnIcon = "btn-default";
                $scope.history_OutgoingBtnIcon = "btn-default";
                $scope.history_OtherBtnIcon = "btn-default";
                break;
            case 1:
                $scope.history_AllBtnIcon = "btn-default";
                $scope.history_IncomingBtnIcon = "btn-primary";
                $scope.history_OutgoingBtnIcon = "btn-default";
                $scope.history_OtherBtnIcon = "btn-default";
                break;
            case 2:
                $scope.history_AllBtnIcon = "btn-default";
                $scope.history_IncomingBtnIcon = "btn-default";
                $scope.history_OutgoingBtnIcon = "btn-primary";
                $scope.history_OtherBtnIcon = "btn-default";
                break;
            case 3:
                $scope.history_AllBtnIcon = "btn-default";
                $scope.history_IncomingBtnIcon = "btn-default";
                $scope.history_OutgoingBtnIcon = "btn-default";
                $scope.history_OtherBtnIcon = "btn-primary";
                break;
        }

        $scope.HistoryListViewController.currentViewOption = subIndex;
        $scope.history_loadingVisible = true;
        $scope.HistoryListViewController.isEnd = false;
        $scope.curAccInfo.AccHistorys.Breakout = false;
        HistoryConditionView($scope.curAccInfo,index,true,-1);
    };

    // 历史界面切换过滤时间事件
    $scope.history_DateSelectionChanged = function(index,selector){
        //console.log("history_DateSelectionChanged = ",selector);
        $scope.HistoryListViewController.currentDayOption = selector*1;
        $scope.history_loadingVisible = true;
        $scope.HistoryListViewController.isEnd = false;
        $scope.curAccInfo.AccHistorys.Breakout = false;
        HistoryConditionView($scope.curAccInfo,index,true,-1);
    };

    // 历史界面点击“刷新”按键事件
    $scope.history_RefreshBtnClick = function(index){
        if($scope.history_RefreshBtnIcon == "fa-pulse" || $scope.history_loadingVisible){
            return;
        }
        $scope.history_RefreshBtnIcon = "fa-pulse";
        $scope.curAccInfo = $scope.AccountsManager.getAccInfo(index);
        $scope.curAccInfo.AccHistorys = new(proAccountHistory);
        LoadHistorys($scope.curAccInfo,index);
    };

    //$scope.leftside_menu_acc_OrderBtnClick = function(index){
    //    $scope.currentSelectIndex = 5;
    //    $scope.currentNickName = $scope.AccountsManager.getAccInfo(index).NickName;
    //    initViewVisible();
    //};

    //账户 用户信息按键事件
    $scope.leftside_menu_acc_SettingBtnClick = function(index){
        initViewVisible();
        initSettingView();
        $scope.currentSelectIndex = 6;
        $scope.AccSettingsViewVisible = true;
        $scope.current_account_index = index;
        $scope.curAccInfo = $scope.AccountsManager.getAccInfo(index);
        $scope.currentNickName = $scope.curAccInfo.NickName;
        $scope.context_settingAccNickName = $scope.currentNickName;
        $scope.context_settingAccPublicAddr = $scope.curAccInfo.PublicAddr;
        $scope.context_settingAccSecretSave = $scope.curAccInfo.SecretKey;
        $scope.context_settingGAChecked = $scope.curAccInfo.UserGA;
    };

    //账户设计界面显示or隐藏SecretKey按键事件
    $scope.context_settingSecretKeyBtnClick = function(index){
        if($scope.context_settingAccSecretSave == null || $scope.context_settingAccSecretSave == ""){
            return;
        }
        if($scope.context_settingSecretKeyBtnIcon == "fa fa-eye"){
            $scope.context_settingSecretKeyBtnIcon = "fa fa-eye-slash";

            ssKey = $cookies.get(COOKIE_KEY_SECRETSTR);
            if (ssKey == null || ssKey.length < 10){
                $cookies.remove(COOKIE_KEY_USERNAME,{'path':'/'});
                $cookies.remove(COOKIE_KEY_USERAUTH,{'path':'/'});
                $cookies.remove(COOKIE_KEY_USERLEVEL,{'path':'/'});
                $cookies.remove(COOKIE_KEY_SECRETSTR,{'path':'/'});
                alert($scope.ErrorTable.SSKeyError);
                window.location.href = "../login.html";
            }
            $scope.context_settingAccSecretKey = UencSecretKey($scope.context_settingAccSecretSave,ssKey);
        } else {
            $scope.context_settingAccSecretKey = "********************************************************";
            $scope.context_settingSecretKeyBtnIcon = "fa fa-eye";
        }
    };

    // 账户设置界面删除账户按键事件
    $scope.context_settingAccDeleteBtnClick = function(index){
        initPopupView();
        $scope.popup_modelIndex = 0;
        $scope.popup_friendListVisible = true;
        $scope.popup_deleteAccContextVisible = true;
        $scope.popup_passwordVisible = true;
        $scope.curAccInfo = $scope.AccountsManager.getAccInfo(index);

        $scope.selectionAccountList = [];
        if($scope.curAccInfo.Actived){
            for(var i=0;i<$scope.AccountsManager.Count();++i){
                if(index != i){
                    tmpAcc = $scope.AccountsManager.getAccInfo(i);
                    if(tmpAcc.Actived && tmpAcc.Info!=null && tmpAcc.Info.Balance_XLM*1 > 20.00001){
                        if($scope.selectionAccountList.length == 0){
                            $scope.popup_MergetoAccName = tmpAcc.NickName + " " + tmpAcc.PublicAddr;
                        }
                        $scope.selectionAccountList.push(tmpAcc);
                    }
                }
            }
        }
    };

    //删除账户结束事件响应
    function deleteAccEndFunc(data){
        if(data.data != null && data.data.success){
            if(data.data.update_auth){
                saveToCookie($cookies,COOKIE_KEY_USERAUTH,data.data.user_auth)
            }
            $scope.leftside_menu_AccBtnClick();
            $scope.refreshAllBalance();
        } else {
            $scope.AlertMessage = data.Error;
        }
        $scope.executing = "";
    }

    //删除账户中合并结束事件响应
    function deleteAccMergeEndFunc(itype,msg,srcAcc,destAcc){
        switch (itype){
            case MERGE_START:
                break;
            case LOGIN_USER_ERROR:
                $scope.AlertMessage = $scope.PaymentMessages.LOGIN_USER_ERROR;
                $cookies.remove(COOKIE_KEY_USERNAME,{'path':'/'});
                $cookies.remove(COOKIE_KEY_USERAUTH,{'path':'/'});
                $cookies.remove(COOKIE_KEY_USERLEVEL,{'path':'/'});
                $cookies.remove(COOKIE_KEY_SECRETSTR,{'path':'/'});
                alert($scope.PaymentMessages.LOGIN_USER_ERROR);
                window.location.href = "../login.html";
                break;
            case MERGE_FAILURE:
                $scope.AlertMessage = $scope.PaymentMessages.MERGE_FAILURE + "[ error: "+ msg +" ]";
                $scope.executing = "";
                break;
            case MERGE_SUCCESS:
                $scope.AlertMessage += $scope.PaymentMessages.MERGE_SUCCESS;
                md5Pw = "";
                if($scope.popup_GA != ""){
                    md5Pw = $scope.popup_GA;
                }else{
                    md5Pw = CryptoJS.SHA256($scope.popup_loginPassword+$scope.loginUser).toString(CryptoJS.enc.Hex);
                    $scope.popup_loginPassword = "";
                }
                $scope.AccountsManager.deleteAccount($http,srcAcc,md5Pw,deleteAccEndFunc);
                break;
        }

    }

    //删除账户操作
    function deleteAccountBtnClick(index,data){
        if($scope.executing == "fa fa-spinner fa-pulse"){
            return;
        }
        auth = $cookies.get(COOKIE_KEY_USERAUTH);
        if (auth == null || auth.length < 10){
            alert($scope.ErrorTable.loginRetry);
            window.location.href = "../login.html";
        }
        $scope.executing = "fa fa-spinner fa-pulse";
        srcAcc = $scope.AccountsManager.getAccInfo(index);
        srcAcc.LogUserAuth = auth;

        // 如果需要merge，就先merge，merge操作不论成功或者失败，之后再删除账户。
        if(data.mergeSelect){
            destAcc = $scope.AccountsManager.getAccInfoFromName(data.mergeto);
            if(destAcc == null){
                $scope.AlertMessage = $scope.ErrorTable.DeletAccNotFindDestMergeAcc;
                return;
            }
            destAcc.LogUserAuth = auth;
            MergeAccount($http,$cookies,index,srcAcc,destAcc,deleteAccMergeEndFunc)
        } else {
            md5Pw = "";
            if(data.ga_code != ""){
                md5Pw = data.ga_code;
            }else{
                md5Pw = CryptoJS.SHA256(data.password+$scope.loginUser).toString(CryptoJS.enc.Hex);
                $scope.popup_loginPassword = "";
            }
            $scope.AccountsManager.deleteAccount($http,srcAcc,md5Pw,deleteAccEndFunc);
        }
    }

    //弹出框OK按键事件
    $scope.popup_OKBtnClick = function(index,modelIndex){
        switch (modelIndex){
            case 0: // delete account
                if($scope.curAccInfo.UserGA && ($scope.popup_GA == null || $scope.popup_GA == "")) {
                    $scope.AlertMessage = $scope.ErrorTable.DeletAccGAEmpty;
                    return;
                }else if (!$scope.curAccInfo.UserGA && ($scope.popup_loginPassword == null || $scope.popup_loginPassword == "")) {
                    $scope.AlertMessage = $scope.ErrorTable.DeletAccPasswordEmpty;
                    return;
                }
                mergeToAccName = "";
                if($scope.popup_Mergeto && $scope.popup_MergetoAccName != null && $scope.popup_MergetoAccName != ""){
                    tmpStr = $scope.popup_MergetoAccName.split(" ");
                    mergeToAccName = tmpStr[0];
                }
                deleteAccountBtnClick(index,{
                    password:$scope.popup_loginPassword,
                    ga_code:$scope.popup_GA,
                    mergeSelect:$scope.popup_Mergeto,
                    mergeto:mergeToAccName,
                });
                break;
        }
    };

    function modifyAccountInfoEndFunc(data){
        $scope.executing = "";
        if (data.data != null) {
            if ( data.data.update_auth ) {
                saveToCookie($cookies,COOKIE_KEY_USERAUTH,data.data.user_auth);
            }
            $scope.currentNickName = data.data.nickname;
        }else{
            $scope.AlertMessage = data.Error;
        }
    }

    $scope.context_settingAccModifyBtnClick = function(index){
        if($scope.executing == "fa fa-spinner fa-pulse"){
            return;
        }
        $scope.curAccInfo = $scope.AccountsManager.getAccInfo(index);
        if($scope.context_settingAccNickName == $scope.curAccInfo.NickName &&
            $scope.context_settingGAChecked == $scope.curAccInfo.UserGA){
            return;
        }
        if($scope.context_settingAccNickName.length < 4){
            $scope.AlertMessage = $scope.ErrorTable.NickNameFormatError;
            return;
        }
        auth = $cookies.get(COOKIE_KEY_USERAUTH);
        if (auth == null || auth.length < 10){
            alert($scope.ErrorTable.loginRetry);
            window.location.href = "../login.html";
        }
        $scope.curAccInfo.LogUserAuth = auth;

        $scope.executing = "fa fa-spinner fa-pulse";
        $scope.AlertMessage = "";
        newAccInfo = new(proAccountInfo);
        newAccInfo.copyFrom($scope.curAccInfo);
        newAccInfo.NickName = $scope.context_settingAccNickName;
        newAccInfo.UserGA = $scope.context_settingGAChecked;
        $scope.AccountsManager.UpdateAccountInfo($http,index,newAccInfo,modifyAccountInfoEndFunc)
    };

    //好友分组按键事件
    $scope.leftside_menu_groupBtnClick = function(){
        $scope.currentSelectIndex = 30;
        initViewVisible();
        $scope.MenuGroupFriendsVisible = true;
    };

    //所有好友按键事件
    $scope.leftside_menu_friendsBtnClick = function(){
        $scope.currentSelectIndex = 31;
        initViewVisible();
        $scope.MenuAllFriendsVisible = true;
        $scope.AccountsManager.setAllFriendIcon("fa-user-times");
    };

    // 搜索好友按键事件结束
    function friendSearchEndFunc(data){
        $scope.menu_friendsSearchBtnIcon = "fa-search";
        $scope.menu_friend_SearchResult = [];
        $scope.menu_friend_AlertMessage = "";
        if(data == null){
            $scope.menu_friend_AlertMessage = $scope.PaymentMessages.NETWORK_ERROR;
        } else if(data.Error != null){
            $scope.menu_friend_AlertMessage = data.Error;
        } else {
            //console.log(" ======= friendSearchEndFunc =======\r\n",data);
            if(data.data.success == true){
                if(data.data.update_auth == true){
                    saveToCookie($cookies,COOKIE_KEY_USERAUTH,data.data.user_auth);
                }
                if(data.data.results != null){
                    if(data.data.results.length == 0){
                        $scope.menu_friend_AlertMessage = $scope.ErrorTable.Search_NoResult;
                        return;
                    }
                    for(var i = 0 ; i < data.data.results.length ; ++i){
                        tmp = new(FriendInfo);
                        tmp.IsFriend = $scope.AccountsManager.getFriendFromID(data.data.results[i].wid) != null;
                        tmp.id = data.data.results[i].wid;
                        tmp.nickName = data.data.results[i].nickname;
                        tmp.PublicAddr = data.data.results[i].public_address;
                        $scope.menu_friend_SearchResult[i] = tmp;
                    }
                }
            }
        }
    }

    // 搜索好友按键事件
    $scope.menu_friendsSearchBtnClick = function(){
        if($scope.menu_friendsSearchBtnIcon == "fa-spinner fa-pulse"){
            return;
        }
        if($scope.menu_friend_SearchInput == null || $scope.menu_friend_SearchInput == ""){
            $scope.menu_friend_AlertMessage = $scope.ErrorTable.Input_Error;
            return;
        }
        addr = "";
        nickname = "";
        if($scope.menu_friend_SearchSelect == $scope.menu_friend_SearchSelect_Addr){
            $scope.menu_friend_SearchInput = $scope.menu_friend_SearchInput.toUpperCase();
            addr = $scope.menu_friend_SearchInput;
        } else if ($scope.menu_friend_SearchSelect == $scope.menu_friend_SearchSelect_NickName){
            nickname = $scope.menu_friend_SearchInput;
        } else {
            $scope.menu_friend_AlertMessage = $scope.ErrorTable.Search_Type_Error;
            return;
        }

        auth = $cookies.get(COOKIE_KEY_USERAUTH);
        if (auth == null || auth.length < 10){
            $cookies.remove(COOKIE_KEY_USERNAME,{'path':'/'});
            $cookies.remove(COOKIE_KEY_USERAUTH,{'path':'/'});
            $cookies.remove(COOKIE_KEY_USERLEVEL,{'path':'/'});
            $cookies.remove(COOKIE_KEY_SECRETSTR,{'path':'/'});
            alert($scope.ErrorTable.loginRetry);
            window.location.href = "../login.html";
        }
        $scope.menu_friendsSearchBtnIcon = "fa-spinner fa-pulse";
        $scope.AccountsManager.SearchFriend($http,$scope.loginUser,auth,addr,nickname,friendSearchEndFunc);
    };

    // 添加好友按键事件结束
    function friendAddEndFunc(data,fInfo){
        $scope.menu_friend_AlertMessage = "";
        fInfo.AddBtnIcon = "fa-plus-circle";
        if(data == null){
            $scope.menu_friend_AlertMessage = $scope.PaymentMessages.NETWORK_ERROR;
        } else if(data.Error != null){
            $scope.menu_friend_AlertMessage = data.Error;
        } else {
            if(data.data.success == true){
                fInfo.IsFriend = true;
                fInfo.AddBtnIcon = "fa-user-times";
            }
        }
    }

    // 添加当前为好友按键事件
    $scope.menu_friendsAddBtnClick = function(index){
        ret = $scope.menu_friend_SearchResult[index];
        if( ret.AddBtnIcon == "fa-spinner fa-pulse"){
            return;
        }

        auth = $cookies.get(COOKIE_KEY_USERAUTH);
        if (auth == null || auth.length < 10){
            $cookies.remove(COOKIE_KEY_USERNAME,{'path':'/'});
            $cookies.remove(COOKIE_KEY_USERAUTH,{'path':'/'});
            $cookies.remove(COOKIE_KEY_USERLEVEL,{'path':'/'});
            $cookies.remove(COOKIE_KEY_SECRETSTR,{'path':'/'});
            alert($scope.ErrorTable.loginRetry);
            window.location.href = "../login.html";
        }

        ret.AddBtnIcon = "fa-spinner fa-pulse";
        $scope.AccountsManager.addFriend($http,$scope.loginUser,auth,ret,friendAddEndFunc);
    };

    // 删除好友按键事件结束
    function friendDeleteEndFunc(data,fInfo){
        $scope.menu_friend_AlertMessage = "";
        fInfo.AddBtnIcon = "fa-user-times";
        if(data == null){
            $scope.menu_friend_AlertMessage = $scope.PaymentMessages.NETWORK_ERROR;
        } else if(data.Error != null){
            $scope.menu_friend_AlertMessage = data.Error;
        } else {
            if(data.data.update_auth){
                saveToCookie($cookies,COOKIE_KEY_USERAUTH,data.data.user_auth);
            }
        }
    }

    // 删除当前为好友按键事件
    $scope.menu_friendsDeleteBtnClick = function(index){
        ret = $scope.AccountsManager.getFriendFromIndex(index);
        if( ret.AddBtnIcon == "fa-spinner fa-pulse"){
            return;
        }

        auth = $cookies.get(COOKIE_KEY_USERAUTH);
        if (auth == null || auth.length < 10){
            $cookies.remove(COOKIE_KEY_USERNAME,{'path':'/'});
            $cookies.remove(COOKIE_KEY_USERAUTH,{'path':'/'});
            $cookies.remove(COOKIE_KEY_USERLEVEL,{'path':'/'});
            $cookies.remove(COOKIE_KEY_SECRETSTR,{'path':'/'});
            alert($scope.ErrorTable.loginRetry);
            window.location.href = "../login.html";
        }

        ret.AddBtnIcon = "fa-spinner fa-pulse";
        $scope.AccountsManager.deleteFriend($http,$scope.loginUser,auth,ret,friendDeleteEndFunc);
    };

    // 支付选择好友按键事件
    $scope.SelectFriendBtnClick = function(index){
        //$scope.curAccInfo = $scope.AccountsManager.getAccInfo(index);
        $scope.AccountsManager.setAllFriendIcon("fa-circle-o");
    };

    $scope.selectFriendCheckBtnClick = function(index){
        friendInfo = $scope.AccountsManager.getFriendFromIndex(index);
        if(friendInfo.AddBtnIcon == "fa-circle-o"){
            friendInfo.AddBtnIcon = "fa-check-circle-o";
        } else {
            friendInfo.AddBtnIcon = "fa-circle-o";
        }
    };

    $scope.popup_selectFriendOkBtnClick = function(index){
        for(var i = 0 ; i < $scope.AccountsManager.FriendsCount() ; ++i){
            frInfo = $scope.AccountsManager.getFriendFromIndex(i);
            if(frInfo.AddBtnIcon == "fa-check-circle-o"){
                $scope.context_pay_friends += $scope.AccountsManager.getFriendFromIndex(i).nickName+";";
            }
        }
    };

    $scope.toolbar_addAcc_SecretKeyEyeBtnClick = function(){
        if($scope.toolbar_addAcc_SecretKeyType == "password"){
            $scope.toolbar_addAcc_SecretKeyType = "text";
            $scope.toolbar_addAcc_SecretKeyEyeBtnIcon = "fa-eye-slash"
        } else {
            $scope.toolbar_addAcc_SecretKeyType = "password";
            $scope.toolbar_addAcc_SecretKeyEyeBtnIcon = "fa-eye"
        }
    };

    $scope.toolbar_addAcc_SecretKeyBlur = function(){
        $scope.toolbar_AddAcc_AlertMessage = "";
        $scope.toolbar_addAcc_PublicAddr = "";
        if($scope.toolbar_addAcc_SecretKey == ""){
            return;
        }
        $scope.toolbar_addAcc_SecretKey = $scope.toolbar_addAcc_SecretKey.toUpperCase();
        try {
            srcSct = StellarBase.Keypair.fromSeed($scope.toolbar_addAcc_SecretKey);
            if (srcSct == null) {
                $scope.toolbar_AddAcc_AlertMessage = $scope.ErrorTable.SecretKeyError;
                return;
            }
            $scope.toolbar_addAcc_PublicAddr = srcSct.address();
        }catch(e){
            $scope.toolbar_AddAcc_AlertMessage = e.message;
            return;
        }
    };

    function MergeGetBalanceEndFunc(index,retAcc){
        if(retAcc.ErrorMessage != ""){
            $scope.context_merge_AlertMessage = retAcc.ErrorMessage;
            $scope.context_detailMergeBalance = "-";
            return;
        }
        $scope.context_detailMergeBalance = retAcc.Info.Balance_XLM;
        if(parseFloat($scope.context_detailMergeBalance) >= 20.00001){
            $scope.context_detailMergeConfirmCheckState = false;
            $scope.context_detailMergeSrcAcc = retAcc;
        }else{
            $scope.context_detailMergeSrcAcc = null;
        }
    }

    $scope.context_detailMergeSecretKeyBlur = function(){
        $scope.context_merge_AlertMessage = "";
        $scope.context_detailMergePublicAddr = "";
        if($scope.context_detailMergeSecretKey == ""){
            $scope.context_detailMergePublicAddr = "";
            return;
        }
        $scope.context_detailMergeSecretKey = $scope.context_detailMergeSecretKey.toUpperCase();
        try {
            srcSct = StellarBase.Keypair.fromSeed($scope.context_detailMergeSecretKey);
            if (srcSct == null) {
                $scope.context_merge_AlertMessage = $scope.ErrorTable.SecretKeyError;
                return;
            }
            $scope.context_detailMergePublicAddr = srcSct.address();
        }catch(e){
            $scope.context_detailMergePublicAddr = "";
            $scope.context_merge_AlertMessage = e.message;
            return;
        }

        accInfo = new(proAccountInfo);
        accInfo.PublicAddr = $scope.context_detailMergePublicAddr;
        $scope.context_detailMergeBalance = "";
        GetBalance($http,-1,accInfo,MergeGetBalanceEndFunc)
    };

    function MergeExecuteEndFunc(itype,msg,srcAcc,destAcc){
        switch (itype){
            case MERGE_START:
                $scope.context_merge_AlertMessage += $scope.PaymentMessages.MERGE_START;
                break;
            case LOGIN_USER_ERROR:
                $scope.context_merge_AlertMessage += $scope.PaymentMessages.LOGIN_USER_ERROR;
                $cookies.remove(COOKIE_KEY_USERNAME,{'path':'/'});
                $cookies.remove(COOKIE_KEY_USERAUTH,{'path':'/'});
                $cookies.remove(COOKIE_KEY_USERLEVEL,{'path':'/'});
                $cookies.remove(COOKIE_KEY_SECRETSTR,{'path':'/'});
                alert($scope.PaymentMessages.LOGIN_USER_ERROR);
                window.location.href = "../login.html";
                break;
            case MERGE_FAILURE:
                $scope.context_merge_AlertMessage += $scope.PaymentMessages.MERGE_FAILURE + "[ error: "+ msg +" ]";
                $scope.context_detailMergeBtnIcon = "fa-check";
                break;
            case MERGE_SUCCESS:
                $scope.context_merge_AlertMessage += $scope.PaymentMessages.MERGE_SUCCESS;
                $scope.context_detailMergeBtnIcon = "fa-check";
                initMergeView();
                break;
        }
    }

    $scope.context_detailMergeBtnClick = function(index){
        if($scope.context_detailMergeBtnIcon == "fa-spinner fa-pulse"){
            return;
        }

        if($scope.context_detailMergeBalance*1 < 20.00001){
            $scope.context_merge_AlertMessage = $scope.ErrorTable.SourceAccNotSufficientFunds;
            return;
        }
        if($scope.context_detailMergeSrcAcc == null){
            $scope.context_merge_AlertMessage = $scope.ErrorTable.UnknownError;
            return;
        }

        ssKey = $cookies.get(COOKIE_KEY_SECRETSTR);
        if (ssKey == null || ssKey.length < 10){
            $cookies.remove(COOKIE_KEY_USERNAME,{'path':'/'});
            $cookies.remove(COOKIE_KEY_USERAUTH,{'path':'/'});
            $cookies.remove(COOKIE_KEY_USERLEVEL,{'path':'/'});
            $cookies.remove(COOKIE_KEY_SECRETSTR,{'path':'/'});
            alert($scope.ErrorTable.SSKeyError);
            window.location.href = "../login.html";
        }
        $scope.context_detailMergeSrcAcc.SecretKey = EncSecretKey($scope.context_detailMergeSecretKey,ssKey);
        destAcc = $scope.AccountsManager.getAccInfo(index);
        $scope.context_merge_AlertMessage = "";
        if(destAcc != null){
            $scope.context_detailMergeBtnIcon = "fa-spinner fa-pulse";
            MergeAccount($http,$cookies,index,$scope.context_detailMergeSrcAcc,destAcc,MergeExecuteEndFunc);
        } else {
            $scope.context_merge_AlertMessage = $scope.ErrorTable.UnknownError;
        }
    };

    $scope.toolbar_addAcc_RandomBtnClick = function(){
        keypa = StellarBase.Keypair.random();
        $scope.toolbar_addAcc_SecretKey = keypa.seed();
        $scope.toolbar_addAcc_PublicAddr = keypa.address();
    };

    $scope.getAccountBalanceClick = function(index){
        if($scope.context_pay_balanceBtnIcon == "fa-pulse")
            return;
        $scope.context_pay_balanceBtnIcon = "fa-pulse";
        $scope.AccountsManager.refreshBalances($http,RefreshBalanceEndFunc,index);
    };

    function sendPaymentEndFunc(itype,msg,sendAcc){

        switch (itype){
            case NETWORK_ERROR:
                $scope.context_payment_AlertMessage += "\r\n"+$scope.PaymentMessages.NETWORK_ERROR;
                $scope.context_pay_SendBtnIcon = "";
                break;
            case START_SEND_AMOUNT:
                $scope.context_payment_AlertMessage += "\r\n"+$scope.PaymentMessages.START_SEND_AMOUNT;
                break;
            case CHECK_DEST_VALID:
                $scope.context_payment_AlertMessage += "\r\n"+$scope.PaymentMessages.CHECK_DEST_VALID;
                break;
            case DEST_ERROR:
                $scope.context_payment_AlertMessage += "\r\n"+$scope.PaymentMessages.DEST_ERROR + "[ address: "+ sendAcc.DestAddr +" ]";
                $scope.context_pay_SendBtnIcon = "";
                break;
            case CHECK_SOURCE_BALANCE:
                $scope.context_payment_AlertMessage += "\r\n"+$scope.PaymentMessages.CHECK_SOURCE_BALANCE;
                break;
            case SOURCE_ERROR:
                $scope.context_payment_AlertMessage += "\r\n"+$scope.PaymentMessages.SOURCE_ERROR +"[ error: "+ msg +" ]";
                $scope.context_pay_SendBtnIcon = "";
                break;
            case SOURCE_BALANCE_NOT_SUFF_FUNDS:
                $scope.context_payment_AlertMessage += "\r\n"+$scope.PaymentMessages.SOURCE_BALANCE_NOT_SUFF_FUNDS;
                $scope.context_pay_SendBtnIcon = "";
                break;
            case CHECK_DEST_EXIST:
                $scope.context_payment_AlertMessage += "\r\n"+$scope.PaymentMessages.CHECK_DEST_EXIST;
                break;
            case DEST_NOT_EXIST:
                $scope.context_payment_AlertMessage += "\r\n"+$scope.PaymentMessages.DEST_NOT_EXIST +"[ error: "+ msg +" ]";
                break;
            case FRAME_SIGNER:
                $scope.context_payment_AlertMessage += "\r\n"+$scope.PaymentMessages.FRAME_SIGNER;
                break;
            case LOGIN_USER_ERROR:
                $scope.context_payment_AlertMessage += "\r\n"+$scope.PaymentMessages.LOGIN_USER_ERROR;
                $cookies.remove(COOKIE_KEY_USERNAME,{'path':'/'});
                $cookies.remove(COOKIE_KEY_USERAUTH,{'path':'/'});
                $cookies.remove(COOKIE_KEY_USERLEVEL,{'path':'/'});
                $cookies.remove(COOKIE_KEY_SECRETSTR,{'path':'/'});
                alert($scope.PaymentMessages.LOGIN_USER_ERROR);
                window.location.href = "../login.html";
                break;
            case SEND_COMPLETE:
                $scope.context_payment_AlertMessage += "\r\n"+$scope.PaymentMessages.SEND_COMPLETE;
                $scope.context_pay_SendBtnIcon = "";
                initPaymentView();
                break;
            case SEND_FAILURE:
                $scope.context_payment_AlertMessage += "\r\n"+$scope.PaymentMessages.SEND_FAILURE +"[ status: "+ msg +" ]";
                $scope.context_pay_SendBtnIcon = "";
                break;
            case MEMO_TEXT_ERROR:
                $scope.context_payment_AlertMessage += "\r\n"+$scope.PaymentMessages.MEMO_TEXT_ERROR +"[ status: "+ msg +" ]";
                $scope.context_pay_SendBtnIcon = "";
                break;
            case MEMO_ID_ERROR:
                $scope.context_payment_AlertMessage += "\r\n"+$scope.PaymentMessages.MEMO_ID_ERROR +"[ status: "+ msg +" ]";
                $scope.context_pay_SendBtnIcon = "";
                break;
            case MEMO_HASH_ERROR:
                $scope.context_payment_AlertMessage += "\r\n"+$scope.PaymentMessages.MEMO_HASH_ERROR +"[ status: "+ msg +" ]";
                $scope.context_pay_SendBtnIcon = "";
                break;
            case MEMO_RETURN_ERROR:
                $scope.context_payment_AlertMessage += "\r\n"+$scope.PaymentMessages.MEMO_RETURN_ERROR +"[ status: "+ msg +" ]";
                $scope.context_pay_SendBtnIcon = "";
                break;
        }
    }

    // 发送 payment 按键事件
    $scope.context_pay_SendBtnClick = function(index){
        if($scope.context_pay_SendBtnIcon == "fa-pulse"){
            return;
        }
        if($scope.context_pay_friends == null || $scope.context_pay_friends == ""){
            $scope.context_payment_AlertMessage = $scope.ErrorTable.FriendsIsEmpty;
            return;
        }
        if($scope.context_pay_amount == null || $scope.context_pay_amount == ""){
            $scope.context_payment_AlertMessage = $scope.ErrorTable.PaymentAmountIsEmpty;
            return;
        }
        if($scope.context_pay_memoTitle == "Memo Text" && $scope.context_pay_memo != "" && $scope.context_pay_memo.length > 28){
            $scope.context_payment_AlertMessage = $scope.ErrorTable.TextMemoError;
            return;
        }
        lastIndex = $scope.context_pay_friends.lastIndexOf(";");
        if(lastIndex == $scope.context_pay_friends.length-1){
            $scope.context_pay_friends = $scope.context_pay_friends.substring(0,lastIndex);
        }

        $scope.context_pay_SendBtnIcon = "fa-pulse";
        $scope.context_payment_AlertMessage = "";

        sendInfo = Nickname_addr_split($scope.context_pay_friends);
        DecodeNickName2Addr(sendInfo,index);
        //console.log(sendInfo);
        //SendAmount($http,$cookies,index,$scope.curAccInfo,sendPaymentEndFunc,sendInfo);
    };

    function Nickname_addr_split(inputStr) {
        destAddrs = inputStr.split(";");
        retUsers = new(Array);
        for(var i = 0 ; i < destAddrs.length ; ++i){
            if(destAddrs[i] == $scope.curAccInfo.PublicAddr){
                $scope.context_payment_AlertMessage = $scope.ErrorTable.FriendIncludeSelf + "[" + destAddrs[i] + "]";
                return;
            }
            tmpInfo = new(SendAmountDefine);
            try{
                StellarBase.Keypair.fromAddress(destAddrs[i]);
                tmpInfo.DestAddr = destAddrs[i];
            }
            catch(e){
                tmpInfo.Nickname = destAddrs[i];
            }
            tmpInfo.Amount = $scope.context_pay_amount;
            tmpInfo.MemoType = $scope.context_pay_memoTitle;
            tmpInfo.MemoText = $scope.context_pay_memo;
            retUsers[i] = tmpInfo;
        }
        return retUsers;
    }

    function SearchNickNameEndFunc(data,userIndex,infos,index){
        if($scope.context_pay_SendBtnIcon == ""){
            return;
        }
        if(data == null){
            $scope.context_payment_AlertMessage += "\r\n"+$scope.PaymentMessages.NETWORK_ERROR;
        } else if(data.Error != null){
            $scope.context_payment_AlertMessage += "\r\n"+data.Error;
        } else {
            //console.log(" ======= friendSearchEndFunc =======\r\n",data);
            if(data.data.success == true){
                if(data.data.results != null){
                    if(data.data.results.length == 0){
                        $scope.context_payment_AlertMessage +="\r\n" + $scope.ErrorTable.Search_NoResult + " [ " + infos[index].Nickname + " ] ";
                        $scope.context_pay_SendBtnIcon = "";
                        return;
                    }
                    findout = false;
                    for(var i = 0 ; i < data.data.results.length ; ++i){
                        if(infos[index].Nickname == data.data.results[i].nickname){
                            infos[index].DestAddr = data.data.results[i].public_address;
                            findout = true;
                            break;
                        }
                    }
                    if(!findout){
                        $scope.context_payment_AlertMessage +="\r\n" + $scope.ErrorTable.Search_NoResult + " [ " + infos[index].Nickname + " ] ";
                        $scope.context_pay_SendBtnIcon = "";
                        return;
                    }
                }
            }
        }
        for(var j = 0 ; j < infos.length ; ++j){
            if(infos[j].DestAddr == ""){
                return;
            }
        }
        SendAmount($http,$cookies,userIndex,$scope.curAccInfo,sendPaymentEndFunc,infos);
    }

    function DecodeNickName2Addr(userInfos,userIndex){
        $scope.context_payment_AlertMessage = $scope.PaymentMessages.CHECK_NICKNAME;
        for(var i = 0 ; i < userInfos.length ; ++i){
            if(userInfos[i].DestAddr == ""){
                $scope.AccountsManager.SearchNickName($http,userIndex,userInfos,i,SearchNickNameEndFunc);
            }
        }
    }

    $scope.getShortAddress = function(credit){
        if(credit == null || credit.issuer == null || credit.issuer == ""){
            return ""
        }
        if (credit.short){
            return credit.issuer.substr(0,8) + "....";
        }
        return credit.issuer;
    };

    function EndCreateAccount(data){
        $scope.executing = "";
        if (data.data != null) {
            initViewVisible();
            initAddAccountView();
            if(data.data.update_auth){
                saveToCookie($cookies,COOKIE_KEY_USERAUTH,data.data.user_auth);
            }
            $scope.refreshAllBalance();
        }else{
            $scope.toolbar_AddAcc_AlertMessage = data.Error;
        }
    }

    $scope.toolbar_addAcc_ConfirmBtnClick = function(){
        $scope.toolbar_addAcc_SecretKeyBlur();
        if($scope.toolbar_AddAcc_AlertMessage != ""){
            return;
        }
        if ($scope.toolbar_addAcc_SecretKey == "") {
            $scope.toolbar_AddAcc_AlertMessage = $scope.ErrorTable.SecretKeyError;
            return;
        }

        if($scope.toolbar_addAcc_NickName == "" || $scope.toolbar_addAcc_NickName.length < 4){
            $scope.toolbar_AddAcc_AlertMessage = $scope.ErrorTable.NickNameFormatError;
            return;
        }
        ssKey = $cookies.get(COOKIE_KEY_SECRETSTR);
        if (ssKey == null || ssKey.length < 10){
            $cookies.remove(COOKIE_KEY_USERNAME,{'path':'/'});
            $cookies.remove(COOKIE_KEY_USERAUTH,{'path':'/'});
            $cookies.remove(COOKIE_KEY_USERLEVEL,{'path':'/'});
            $cookies.remove(COOKIE_KEY_SECRETSTR,{'path':'/'});
            alert($scope.ErrorTable.SSKeyError);
            window.location.href = "../login.html";
        }
        auth = $cookies.get(COOKIE_KEY_USERAUTH);
        if (auth == null || auth.length < 10){
            $cookies.remove(COOKIE_KEY_USERNAME,{'path':'/'});
            $cookies.remove(COOKIE_KEY_USERAUTH,{'path':'/'});
            $cookies.remove(COOKIE_KEY_USERLEVEL,{'path':'/'});
            $cookies.remove(COOKIE_KEY_SECRETSTR,{'path':'/'});
            alert($scope.ErrorTable.loginRetry);
            window.location.href = "../login.html";
        }

        $scope.toolbar_AddAcc_AlertMessage = "";

        accCreate = new proAccountInfo();
        accCreate.NickName = $scope.toolbar_addAcc_NickName;
        accCreate.PublicAddr = $scope.toolbar_addAcc_PublicAddr;
        accCreate.SecretKey = EncSecretKey($scope.toolbar_addAcc_SecretKey,ssKey);
        $scope.toolbar_addAcc_SecretKey = "";
        accCreate.UserGA = $scope.hasGA & $scope.toolbar_addAcc_GAChecked;
        accCreate.LogUserAuth = auth;
        accCreate.LoginUser = $scope.loginUser;

        $scope.executing = "fa fa-spinner fa-pulse";
        $scope.AccountsManager.newAccount($http,accCreate,EndCreateAccount);
    };

    initView();
}
proapp.controller('contentController',contentController);
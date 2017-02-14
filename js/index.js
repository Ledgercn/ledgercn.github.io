
var indexapp = angular.module("indexapp",['ngCookies']).config(function($anchorScrollProvider) {
    $anchorScrollProvider.disableAutoScrolling();
});

function indexMainController($cookies, $cookieStore, $scope, $http, $rootScope) {
    function initLanguage(){
        langSave = $cookies.get("LANGUAGE");
        if (langSave != null){
            $scope.currlanguage = langSave;
        }else if ($scope.currlanguage == null) {
            $scope.currlanguage = ZH_CN_LANG;
            saveLanguageCookie($scope.currlanguage);
        }
    }

    function saveLanguageCookie(langValue){
        var expireDate = new Date();
        expireDate.setDate(expireDate.getDate() + 365);
        $cookies.put("LANGUAGE",langValue,{'expires': expireDate,'path':'/'});
    }

    function initText(){
        if($scope.currlanguage == ZH_CN_LANG){
            $scope.LanguageBtnTitle = "English";
            $scope.SignInTitle = "注册/登录";
            $scope.NavigationTitle = "导航";

            $scope.NavHomeTitle = "主页";
            $scope.NavIntroductionTitle = "账中介绍";
            $scope.NavToolsTitle = "工具";

            $scope.PageMainTitle = "账 中";

            $scope.SectionOneTitle = "什么是流明币/恒星币?";
            $scope.SectionTwoTitle = "开放式总账";
            $scope.SectionThreeTitle = "账中介绍";
            $scope.SectionFourTitle = "账中提供的服务";
            $scope.SectionFourContext = "你在账中的网络中，可以使用如下的服务。我们也将尽努力，不断推出各种应用和服务，你的支持和信任就是我们进步的源泉。";
            $scope.WebWalletTitle = "账中 Web 钱包";
            $scope.WebWalletContext = "打开浏览器就可以方便、快捷的进行新恒星账户的历史操作查询、支付等操作。PC、手机、PAD都能用!";
            $scope.WebWalletUseTitle = "开始使用";
            $scope.PCWalletTitle = "账中 PC 钱包";
            $scope.PCWalletContext = "下载到本地计算机中，安全、方便、快捷的满足使用者基本需求。可以进行新恒星账户的状态查询、历史查询、支付、合并账户等操作。";
            $scope.PCWalletDownloadTitle = "下载使用";
            $scope.ProWebWalletTitle = "Web 钱包（注册用户）";
            $scope.ProWebWalletContext = "更加安全、方便，功能全面，历史信息精确查询，注册用户将获得更多服务内容!";
            $scope.BlockChainTitle = "区块链浏览";
            $scope.BlockChainContext = "方便，全面，历史信息精确，全区块链信息查询!";
            $scope.BlockChainAddress = 'http://explorer.ledgercn.com/index.html?l=cn';
            $scope.WechatTitle = "微信公众号";
            $scope.WechatContext = "打开手机关注公众号，方便快捷，功能全面!";

            $scope.GetMoreTitle = "了解更多";
            $scope.footerQQGroupTitle = "QQ群:";
        } else {
            $scope.LanguageBtnTitle = "中文";
            $scope.SignInTitle = "Sign-in/Login";
            $scope.NavigationTitle = "Nav";

            $scope.NavHomeTitle = "Home";
            $scope.NavIntroductionTitle = "Introduction";
            $scope.NavToolsTitle = "Tools";

            $scope.PageMainTitle = "";

            $scope.SectionOneTitle = "What is the Lumen or Stellar coin?";
            $scope.SectionTwoTitle = "Open general ledger";
            $scope.SectionThreeTitle = "Our Introduction";
            $scope.SectionFourTitle = "Our services";
            $scope.SectionFourContext = "In our network, we are dedicated to provide the services as shown in the followings. We will try our best to deliver a verity of high quality services. Your supports and trusts are our best resources!";
            $scope.WebWalletTitle = "Wallet for Web";
            $scope.WebWalletContext = "Open the your browser, your can get historical action queries, payments and other operations easily and quickly. You can use any electronic devices including PC, mobile phone, or PAD.";
            $scope.WebWalletUseTitle = "Starting";
            $scope.PCWalletTitle = "Wallet for PC";
            $scope.PCWalletContext = "Downloading to your electronic devices, this program will meet your needs in difference level safely, conveniently and efficiently. Lumen accounts can query the status of historical inquiry, payment, merge accounts and other operations.";
            $scope.PCWalletDownloadTitle = "Download";
            $scope.ProWebWalletTitle = "Web Wallet(Register User)";
            $scope.ProWebWalletContext = "More secure, convenient, comprehensive, accurate historical information inquires. Registered members will receive more advanced services.";
            $scope.BlockChainTitle = "BlockChain Explorer";
            $scope.BlockChainContext = "More convenient, comprehensive, historical information inquires. All of informations in Stellar block-chain!";
            $scope.BlockChainAddress = 'http://explorer.ledgercn.com/index.html?l=en';
            $scope.WechatTitle = "Wechat - LumenStar";
            $scope.WechatContext = "Welcome to the LumenStar subscription service dedicated to the development of block chain applications!";

            $scope.GetMoreTitle = "more";
            $scope.footerQQGroupTitle = "QQ Group:";

        }
    }

    function transform(data){
        return data;
    }

    function initUserStatus(){
        logUser = $cookies.get("uname");
        userAuth = $cookies.get("auth");

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
                            $scope.isLogin = true;
                            $scope.SignInTitle = data.data.login_user;
                            if ( data.data.update_auth ) {
                                saveToCookie($cookies,"auth",data.data.user_auth)
                            }
                            $scope.isLoading = false;
                            return
                        }
                    }
                    $scope.isLogin = false;
                    if($scope.currlanguage == ZH_CN_LANG)
                        $scope.SignInTitle = "注册/登录";
                    else
                        $scope.SignInTitle = "Sign-in/Login";

                    $scope.isLoading = false;
                }).
                error(function (data, status, headers, config){
                    console.log("error\r\n",data);
                    console.log("status\r\n",status);
                    console.log("headers\r\n",headers);
                    console.log("config\r\n",config);
                    $scope.isLogin = false;
                    $scope.isLoading = false;
                });
        }else{
            $scope.isLogin = false;
            $scope.isLoading = false;
        }
    }

    function initView(){
        $scope.isLoading = true;
        initLanguage();
        initText();
        initUserStatus();
    }

    $scope.changeLanguageClick = function(){
        if($scope.currlanguage == ZH_CN_LANG){
            $scope.currlanguage = EN_LANG;
        } else {
            $scope.currlanguage = ZH_CN_LANG;
        }
        saveLanguageCookie($scope.currlanguage);
        initText();
    };

    $scope.loginBtnClick = function(){
        if ($scope.isLoading) {
            return;
        }

        if ($scope.isLogin) {
            // 提示是否注销登录
        } else {
            // 进入登录界面
            window.location.href = "login.html";
        }
    };

    initView();
}
indexapp.controller('indexMainController',indexMainController);

indexapp.directive("maincontext",function(){
    return {
        replace : true,
        template :  "<div><p ng-show=\"currlanguage != 'EN'\">安全 可靠 致力于完善<a href=\"https://stellar.org\"><strong>Stellar</strong></a>社区 <a href=\"https://github.com/Ledgercn\" >源码公开</a>透明你的<strong>信任</strong>就是我们前进的源泉</p>" +
        "<p ng-show=\"currlanguage == 'EN'\">Safe, reliable, and committed to improving <a href=\"https://stellar.org\"><strong>STELLAR</strong></a> community. The <a href=\"https://github.com/Ledgercn\" >source codes</a> are open and transparent. And your <strong>support</strong> is the source of our confidence and improvement.</p></div>"
    };
});

indexapp.directive("section1context",function(){
    return {
        replace : true,
        template :  "<div><p ng-show=\"currlanguage != 'EN'\"><strong>流明币/恒星币</strong>(Lumens)是基于SCP全球共识算法的加密电子货币，是全球最安全的加密电子货币之一。恒星币是一个用于价值交换的开源协议，全球有若干恒星币网络节点，由于恒星网络<a href='https://github.com/stellar'>源码</a>完全开源，所以全球各地支持者源源不断的参与到恒星网络的开发和升级过程中，也充分保证了信息的安全可靠和账本信息的公开性。</p>" +
        "<p ng-show=\"currlanguage == 'EN'\"><strong>Lumen / Stellar</strong> is encrypted electronic money thar is based on the SCP world-wide consensus algorithm, which is one of the world's most secure encrypted electronic currencies. Lumen/Stellar is an open protocol for the exchange of value, which includes a huge number of network nodes of global currencies. Because our network is completely based on an <a href='https://github.com/stellar'><strong>open source</strong></a>, the information security and ledger reliability are fully guaranteed. Our transparency or openness is further guaranteed by the consistent support and world-wide participation to the Luemns/Stellar network development and upgrade process.</p></div>"
    };
});

indexapp.directive("section2context",function(){
    return {
        replace : true,
        template :  "<div><p ng-show=\"currlanguage != 'EN'\"><strong>总账</strong> 包含网络中每一个账户的记录，包括余额，信任线，以及挂单。它是恒星网络某一时刻状态的“快照”。每一个恒星节点服务器都存有当前的总账，每一轮共识结束后，确认一组事务会将总账从当前状态向前推进。</p>" +
        "<p ng-show=\"currlanguage == 'EN'\"><strong>Ledger</strong> keeps a nice records of each network accounts that includes balance, credit lines, and pending orders. The current Lumen/Stellar status of the network is a time \"snapshot\" of account. Each of server nodes has a current record of summary of the account. After each round of consensus, confirmation of a general ledger from the current status will make sure the future events(or trades) going on reliably and smoothly.</p></div>"
    };
});

indexapp.directive("section3context",function(){
    return {
        replace : true,
        template :  "<div><p ng-show=\"currlanguage != 'EN'\">我们是国内第一家基于恒星新网络的总账平台，<strong>安全</strong>、<strong>方便</strong>、<strong>可靠</strong>，专业的开发人员，致力于将恒星币社区推广和完善。我们可以为各种在线服务提供便捷的支付手段，基于恒星币强大的网络和团队支持，能够发挥虚拟货币小额支付、流支付的优势。网站代码完全公开透明，绝对安全可靠。我们将不断推出和完善各种产品和服务，使恒星生态圈进一步得到完善。</p>" +
        "<p ng-show=\"currlanguage == 'EN'\">We are fortunate to be the first of the novel network-based general ledger platform in China, which has been proved most <strong>Safe</strong>, <strong>Convenient</strong> and <strong>Reliable</strong>. This is a consequence of efforts by our professional network developers who are committed to serve community outreach add keep improving the Lumen/Stellar network. We will provide an extremely convenient option of online payments for a variety of services and trades. This currency service is strongly network-supported and team-based, and can take advantage of real micro-payment and payment flow of money.</p></div>"
    };
});
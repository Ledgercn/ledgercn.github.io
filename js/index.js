
var indexapp = angular.module("indexapp",['ngCookies']).config(function($anchorScrollProvider) {
    $anchorScrollProvider.disableAutoScrolling();
});

function indexMainController($cookies, $cookieStore, $scope, $rootScope) {
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

            $scope.GetMoreTitle = "了解更多";
            $scope.footerQQGroupTitle = "QQ群:";
        } else {
            $scope.LanguageBtnTitle = "中文";
            $scope.SignInTitle = "Sign in/up";
            $scope.NavigationTitle = "Nav";

            $scope.NavHomeTitle = "Home";
            $scope.NavIntroductionTitle = "Introduction";
            $scope.NavToolsTitle = "Tools";

            $scope.PageMainTitle = "";

            $scope.SectionOneTitle = "What is the Lumen or Stellar icon?";
            $scope.SectionTwoTitle = "Open general ledger";
            $scope.SectionThreeTitle = "Our introduced";
            $scope.SectionFourTitle = "Our services";
            $scope.SectionFourContext = "In our network, you can use the following services. We will also make efforts to deliver a variety of applications and services, your support and trust is the source of our progress.";
            $scope.WebWalletTitle = "Wallet for Web";
            $scope.WebWalletContext = "Open the your browser, your can easily and quickly get historical action queries, payment and other operations. PC, mobile phone, PAD can use!";
            $scope.WebWalletUseTitle = "Starting";
            $scope.PCWalletTitle = "Wallet for PC";
            $scope.PCWalletContext = "Download to your computer, safe, convenient and efficient to meet the basic needs of the user. Lumen accounts can query the status of historical inquiry, payment, merge accounts and other operations.";
            $scope.PCWalletDownloadTitle = "Download";

            $scope.GetMoreTitle = "more";
            $scope.footerQQGroupTitle = "QQ Group:";

        }
    }

    function initView(){
        initLanguage();
        initText();
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

    initView();
}
indexapp.controller('indexMainController',indexMainController);

indexapp.directive("maincontext",function(){
    return {
        replace : true,
        template :  "<div><p ng-show=\"currlanguage != 'EN'\">安全 可靠 致力于完善<a href=\"https://stellar.org\"><strong>Stellar</strong></a>社区 <a href=\"https://github.com/Ledgercn\" >源码公开</a>透明你的<strong>信任</strong>就是我们前进的源泉</p>" +
        "<p ng-show=\"currlanguage == 'EN'\">Safe, reliable, and committed to improving <a href=\"https://stellar.org\"><strong>STELLAR</strong></a> community, <a href=\"https://github.com/Ledgercn\" >source code</a> open and transparent, and your <strong>trust</strong> is the source of our progress.</p></div>"
    };
});

indexapp.directive("section1context",function(){
    return {
        replace : true,
        template :  "<div><p ng-show=\"currlanguage != 'EN'\"><strong>流明币/恒星币</strong>(Lumens)是基于SCP全球共识算法的加密电子货币，是全球最安全的加密电子货币之一。恒星币是一个用于价值交换的开源协议，全球有若干恒星币网络节点，由于恒星网络<a href='https://github.com/stellar'>源码</a>完全开源，所以全球各地支持者源源不断的参与到恒星网络的开发和升级过程中，也充分保证了信息的安全可靠和账本信息的公开性。</p>" +
        "<p ng-show=\"currlanguage == 'EN'\"><strong>Lumen / Stellar</strong> icon is an encrypted electronic money based SCP global consensus algorithm, is one of the world's most secure encrypted electronic currency. Lumen/Stellar is an open protocol for the exchange of value, there are a number of global currency network nodes, since the network completely <a href='https://github.com/stellar'><strong>open source</strong></a>, so the steady stream of supporters around world participation to Lumen/Stellar network development and upgrade process, also fully guarantee the security of information and ledger reliable information openness.</p></div>"
    };
});

indexapp.directive("section2context",function(){
    return {
        replace : true,
        template :  "<div><p ng-show=\"currlanguage != 'EN'\"><strong>总账</strong> 包含网络中每一个账户的记录，包括余额，信任线，以及挂单。它是恒星网络某一时刻状态的“快照”。每一个恒星节点服务器都存有当前的总账，每一轮共识结束后，确认一组事务会将总账从当前状态向前推进。</p>" +
        "<p ng-show=\"currlanguage == 'EN'\"><strong>Ledger</strong> contains records of each network accounts, including balance, trust lines, and pending orders. It is the Lumen/Stellar status of the network at a time \"snapshot\". Each server node have stellar current ledger, after the end of each round of consensus, confirm a general ledger from the current state of affairs will move forward.</p></div>"
    };
});

indexapp.directive("section3context",function(){
    return {
        replace : true,
        template :  "<div><p ng-show=\"currlanguage != 'EN'\">我们是国内第一家基于恒星新网络的总账平台，<strong>安全</strong>、<strong>方便</strong>、<strong>可靠</strong>，专业的开发人员，致力于将恒星币社区推广和完善。我们可以为各种在线服务提供便捷的支付手段，基于恒星币强大的网络和团队支持，能够发挥虚拟货币小额支付、流支付的优势。网站代码完全公开透明，绝对安全可靠。我们将不断推出和完善各种产品和服务，使恒星生态圈进一步得到完善。</p>" +
        "<p ng-show=\"currlanguage == 'EN'\">We are the first of the new network-based general ledger platform in China, <strong>Safe</strong>, <strong>Convenient</strong> and <strong>Reliable</strong>, professional development, committed to community outreach and improve lumen/stellar network. We can provide a convenient means of payment for a variety of online services, this currency strong support network and team-based, can take advantage of virtual currency micro-payments, payment flow.</p></div>"
    };
});
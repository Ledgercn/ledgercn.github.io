
var pcwalletapp = angular.module("pcwalletapp",['ngCookies']).config(function($anchorScrollProvider) {
    $anchorScrollProvider.disableAutoScrolling();
});

function pcwalletController($cookies, $scope){
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
            $scope.mainTitle = "PC版本钱包";

            $scope.windowsDLTitle = "Windows 版本下载";
            $scope.windowsDLContext = "下载后，解压缩到电脑，在电脑\"运行\"框运行cmd，进入解压缩目录，运行程序，按照提示即可进行操作。";
            $scope.windowsDLMemoTitle = "说明";
            $scope.windowsDLMemoContext = "对于国内有时不能正常访问恒星官网的情况，请先在计算机中安装网络访问代理，之后，在运行程序时，加入参数 [ --proxy \"IP;PORT;UserName;Password\" ] ，UserName和Password允许为空，使用分号分割。";
            $scope.downloadLnkTitle = "下载链接";
            $scope.downloadTitle = "下载";

            $scope.linuxDLTitle = "Linux 版本下载";
            $scope.footerQQGroupTitle = "QQ群:";
        }else{
            $scope.LanguageBtnTitle = "中文";
            $scope.SignInTitle = "Sign in/up";
            $scope.mainTitle = "Lumens Wallet for PC";

            $scope.windowsDLTitle = "Windows download";
            $scope.windowsDLContext = "After downloading, unzip to a computer, the computer \"Run\" command box run cmd, enter unzipped folder, run the program, follow the prompts to operate.";
            $scope.windowsDLMemoTitle = "Explanation";
            $scope.windowsDLMemoContext = "In China circumstances sometimes can not normally access the official website of the horzion, install network access proxy in your computer, when you run the program, adding parameters  [ --proxy \"IP;PORT;UserName;Password\" ] , UserName and Password allowed to be empty, separated by semicolons.";
            $scope.downloadLnkTitle = "Download Link";
            $scope.downloadTitle = "Download";

            $scope.linuxDLTitle = "Linux download";
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
pcwalletapp.controller('pcwalletController',pcwalletController);

pcwalletapp.directive("maincontext",function(){
    return {
        replace : true,
        template :  "<div><p ng-show=\"currlanguage != 'EN'\">账中网 依靠<a href=\"https://github.com/stellar\">Stellar官方版本库</a>自主研发电脑端使用的恒星新网络钱包。<a href=\"https://github.com/ledgercn\">源码公开</a>,程序不保留任何个人信息，保证安全。中英文版本，命令行操作，带有提示功能。 </p>" +
        "<p ng-show=\"currlanguage == 'EN'\">LedgerCN depend on <a href=\"https://github.com/stellar\">STELLAR official libs</a>, self-developed PC Stellar wallet. <a href=\"https://github.com/ledgercn\">Open source</a>, does not retain any personal information, to ensure safety. In Chinese and English version, command line operation, with prompts.</p></div>"
    };
});

pcwalletapp.directive("linuxdlcontext",function(){
    return {
        replace : true,
        template :  "<div><p ng-show=\"currlanguage != 'EN'\">下载后，解压缩到电脑bin目录下，在提示符后运行程序，按照提示即可进行操作。未提供32bits可执行程序下载，如有需要，请到<a href=\"https://github.com/ledgercn/go-StellarWallet\">Github</a>下载源码编译运行。</p>" +
        "<p ng-show=\"currlanguage == 'EN'\">After downloading, extract to your computer bin directory, and run the program at the prompt, you can follow the prompts. Unavailable 32bits download an executable program, if necessary, go to <a href=\"https://github.com/ledgercn/go-StellarWallet\">Github</a> download the source code to compile and run.</p></div>"
    };
});
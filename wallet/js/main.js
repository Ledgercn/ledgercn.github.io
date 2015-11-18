
var myApp = angular.module("myApp",['ngCookies']).config(function($anchorScrollProvider) {
    $anchorScrollProvider.disableAutoScrolling();
});

var ZH_CN_LANG = "ZH-CN";
var LANGUAGE_CHANGED = "LANGUAGE_CHANGED";
var ACCOUNT_CHANGED = "ACCOUNT_CHANGED";
var LIVE_NET = "LIVE";
var TEST_NET = "TEST";

myApp.factory('LANGUAGE', function(){
    return {Language:null};
});

myApp.factory("COOKIE_SAVE",function(){
    return {addresses:null};
});

myApp.factory("CURRENT_NETWORK",function(){
    //return {net:TEST_NET};
    return {net:LIVE_NET};
});

function languageController($scope,$rootScope, LANGUAGE) {
    if ($scope.currlanguage == null) {
        $scope.currlanguage = "ZH-CN";
    }
    LANGUAGE.Language = $scope.currlanguage;

    $rootScope.$on(LANGUAGE_CHANGED,function(event,data){
        if (data != null && data.from == "topMenuController"){
            LANGUAGE.Language = data.event;
            $scope.currlanguage = data.event;
        }
    });
}
myApp.controller('languageController',languageController);

function topMenuController($scope,$rootScope, LANGUAGE) {
    $scope.toMenuTitle = "";
    if (LANGUAGE.Language == ZH_CN_LANG) {
        $scope.toMenuTitle = "返回";
        $scope.languageTitle = "English";
    } else {
        $scope.toMenuTitle = "Back";
        $scope.languageTitle = " 中文 ";
    }

    $scope.ChangeLanguageClick = function(){
        if ($scope.languageTitle == " 中文 "){
            LANGUAGE.Language = ZH_CN_LANG;
            $scope.languageTitle = "English";
            $scope.toMenuTitle = "返回";
        } else {
            LANGUAGE.Language = "EN";
            $scope.languageTitle = " 中文 ";
            $scope.toMenuTitle = "Back";
        }

        $rootScope.$broadcast(LANGUAGE_CHANGED,{
            from:"topMenuController",
            event:LANGUAGE.Language
        });
    }
}
myApp.controller('topMenuController',topMenuController);

function bottomMenuController($cookies, $cookieStore, $scope, $rootScope, LANGUAGE, COOKIE_SAVE) {
    $scope.initMenuString = function(){
        if (LANGUAGE.Language == ZH_CN_LANG) {
            $scope.bottomMenuTitle = "菜单";
            $scope.bottomMenuAccount = "账户";
            $scope.bottomMenuOperation = "操作";
            $scope.bottomMenuConfig = "配置";
            $scope.AddAddressPlaceholder = "输入公共地址 G....";
            $scope.addBtnTitle = "添加";
        } else {
            $scope.bottomMenuTitle = "Menu";
            $scope.bottomMenuAccount = "Acc";
            $scope.bottomMenuOperation = "Opera";
            $scope.bottomMenuConfig = "Cfg";
            $scope.AddAddressPlaceholder = "Input public address G....";
            $scope.addBtnTitle = "Add";
        }
    };

    $scope.initMenuString();

    $rootScope.$on(LANGUAGE_CHANGED,function(event,data){
        if (data != null && data.from == "topMenuController"){
            $scope.initMenuString();
        }
    });


    this.onConfirmInput = function(){
        if ($scope.newPublicAddress == null || $scope.newPublicAddress == "" ||
            !isValidAddress($scope.newPublicAddress)){
            alert('Address :"'+$scope.newPublicAddress+'" is not valid!');
            $scope.newPublicAddress = "";
            return;
        }
        if (COOKIE_SAVE.addresses == null)
            COOKIE_SAVE.addresses = new ArrayList();
        COOKIE_SAVE.addresses.add($scope.newPublicAddress);
        var expireDate = new Date();
        expireDate.setDate(expireDate.getDate() + 10);
        $cookies.put("address",COOKIE_SAVE.addresses,{'expires': expireDate});
        $scope.newPublicAddress = "";

        $rootScope.$broadcast(ACCOUNT_CHANGED,{
            from:"bottomMenuController",
            event:ACCOUNT_CHANGED
        });
    };

    this.readCookie = function(){
        if (COOKIE_SAVE.addresses == null)
            COOKIE_SAVE.addresses = new ArrayList();

        COOKIE_SAVE.addresses.set($cookieStore.get("address"));

        if (COOKIE_SAVE.addresses.size() == 0){
            $scope.addressInputVew = true;
        }else{
            $scope.addressInputVew = false;
        }
        $scope.currAddresses = COOKIE_SAVE.addresses.getArray();

        $scope.addBtnVisible = !($scope.currAddresses.length >= 3);
    };

    this.removeAddress = function(addr){
        if (addr == null || addr == "")
            return;

        COOKIE_SAVE.addresses.removeValue(addr);
        if (COOKIE_SAVE.addresses.size() == 0){
            $cookieStore.remove("address")
        }else{
            var expireDate = new Date();
            expireDate.setDate(expireDate.getDate() + 10);
            $cookies.put("address",COOKIE_SAVE.addresses,{'expires': expireDate});
        }
        this.readCookie();

        $rootScope.$broadcast(ACCOUNT_CHANGED,{
            from:"bottomMenuController",
            event:ACCOUNT_CHANGED
        });
    };
}
myApp.controller('bottomMenuController',bottomMenuController);

function middleContextController($scope, $rootScope, $cookieStore, $http, $q, LANGUAGE, COOKIE_SAVE,CURRENT_NETWORK){

    $rootScope.$on(ACCOUNT_CHANGED, function(event,data){
        if (data != null && data.from == "bottomMenuController"){
            loadingContext();
        }
    });

    $rootScope.$on(LANGUAGE_CHANGED,function(event,data){
        if (data != null && data.from == "topMenuController"){
            loadingContext();
        }
    });

    function readCookie(){
        if (COOKIE_SAVE.addresses == null)
            COOKIE_SAVE.addresses = new ArrayList();

        COOKIE_SAVE.addresses.set($cookieStore.get("address"));
    }

    function getIndicator(i) {
        ret = {
            index:i,
            actived:""
        };
        if (i == 0){
            ret.actived ="active";
        }
        return ret;
    }

    function getAccountInfo(ind,accountAddr){
        setCurrentNetwork();
        //$scope.innerContexts[ind].errorMessage = "";
        //$scope.innerContexts[ind].datas = "";
        urlget = STELLAR_DEFAULT_NETWORK + STELLAR_NETWORK_ACCOUNTS + '/' + accountAddr;
        $http.get(urlget)
            .success(function (data,header,config,status){
                //console.log("success->data ============ \r\n",data);
                $scope.innerContexts[ind].refreshBtnIcon = "icon-refresh";
                $scope.innerContexts[ind].balanceUnin.credits = [];
                if (data.balances != null) {
                    //console.log("data.balances\r\n",data.balances);
                    //console.log("data.balances.length\r\n",data.balances.length);
                    for (i = 0 ; i < data.balances.length ; ++i){
                        //console.log("data.balances.asset_type\r\n",data.balances[i].asset_type);
                        if (data.balances[i].asset_type == "native"){
                            //console.log(data.balances[i].balance);
                            $scope.innerContexts[ind].balanceUnin.balanceValue = data.balances[i].balance;
                        }else{
                            //console.log("data.balances[i].asset_code\r\n",data.balances[i].asset_code);
                            //console.log("data.balances[i].balance\r\n",data.balances[i].balance);
                            //console.log("data.balances[i].issuer\r\n",data.balances[i].issuer);
                            if ($scope.innerContexts[ind].balanceUnin == null)
                                $scope.innerContexts[ind].balanceUnin.credits = new Array();
                            ilen = $scope.innerContexts[ind].balanceUnin.credits.length;
                            $scope.innerContexts[ind].balanceUnin.credits[ilen] = {
                                asset_code : data.balances[i].asset_code,
                                balance : data.balances[i].balance,
                                issuer : data.balances[i].issuer
                            };
                            //console.log("$scope.innerContexts[ind].balanceUnin\r\n",$scope.innerContexts[ind].balanceUnin);
                        }
                    }
                }
            })
            .error(function (data,header,config,status){
                $scope.innerContexts[ind].refreshBtnIcon = "icon-refresh";
                if(data == null)
                    $scope.innerContexts[ind].errorMessage = "Network is not valid!";
                else if(header == "404")
                    $scope.innerContexts[ind].errorMessage = "Account can not be find!";
                else
                    $scope.innerContexts[ind].errorMessage = status;
                console.log("error->data ============ \r\n",data);
                console.log("error->header ============ \r\n",header);
                console.log("error->config ============ \r\n",config);
                console.log("error->status ============ \r\n",status);
                $scope.innerContexts[ind].datas = status.url;
                $scope.innerContexts[ind].dataRows = 3;
                $scope.innerContexts[ind].balanceUnin.balanceValue = "-"
            });
    }

    function setCurrentNetwork(){
        //console.log(CURRENT_NETWORK.net);
        if(CURRENT_NETWORK.net == LIVE_NET){
            StellarBase.Network.usePublicNetwork();
            STELLAR_DEFAULT_NETWORK = STELLAR_LIVE_NETWORK;
        } else {
            StellarBase.Network.useTestNetwork();
            STELLAR_DEFAULT_NETWORK = STELLAR_TEST_NETWORK;
        }
    }

    function initPaymentView(ind){
        $scope.innerContexts[ind].paymentInfo.btnStatus = "icon-ok";
        $scope.innerContexts[ind].paymentInfo.skey = "";
        $scope.innerContexts[ind].paymentInfo.destAddr = "";
        $scope.innerContexts[ind].paymentInfo.amount = "";
        $scope.innerContexts[ind].paymentInfo.tmemo = "";
        $scope.innerContexts[ind].paymentInfo.viewShow = false;
    }

    function initMergeView(ind){
        $scope.innerContexts[ind].mergeInfo.btnStatus = "icon-ok";
        $scope.innerContexts[ind].mergeInfo.srcKey = "";
        $scope.innerContexts[ind].mergeInfo.srcAddr = "";
        $scope.innerContexts[ind].mergeInfo.viewShow = false;
    }

    function getPaymentstep1Msg(flag,args){
        switch (flag){
            case "CHECK_ACCOUNT":
                if (LANGUAGE.Language == ZH_CN_LANG)
                    return "正在检查["+args[0]+"]有效性...";
                return "Reading ["+args[0]+"] informations...";
            case "ADDR_NOT_PAIR_SCR":
                if (LANGUAGE.Language == ZH_CN_LANG)
                    return "签名Key与发送账户地址不匹配!";
                return "Signature Key does not match the sending account address!";
            case "ACCOUNT_VALID":
                if (LANGUAGE.Language == ZH_CN_LANG)
                    return "账户余额["+args[0]+"]";
                return "Account balance["+args[0]+"]";
            case "BALANCE_NOT_VALID":
                if (LANGUAGE.Language == ZH_CN_LANG)
                    return "账户余额["+args[0]+"]不足!";
                return "Insufficient account balance["+args[0]+"]!";
            case "SOURCE_ADDR_INVALID":
                if (LANGUAGE.Language == ZH_CN_LANG)
                    return "账户["+args[0]+"]检查过程中出现错误!";
                return "An error occurred during the checking of the account["+args[0]+"]!";

        }
        return "";
    }

    function getPaymentstep2Msg(flag,args){
        switch (flag){
            case "CHECK_DEST_ADDR_INFO":
                if (LANGUAGE.Language == ZH_CN_LANG)
                    return "正在检查["+args[0]+"]有效性...";
                return "Reading ["+args[0]+"] informations...";
            case "DEST_ADDR_VALID":
                if (LANGUAGE.Language == ZH_CN_LANG)
                    return "目标地址账户余额["+args[0]+"]";
                return "Destination account balance["+args[0]+"]";
            case "DEST_ADDR_NOT_EXIST":
                if (LANGUAGE.Language == ZH_CN_LANG)
                    return "目标地址["+args[0]+"]不存在,需要新建账户.";
                return "Destination account address ["+args[0]+"] is not exist.";
            case "DEST_ADDR_INVALID":
                if (LANGUAGE.Language == ZH_CN_LANG)
                    return "目标地址["+args[0]+"]检查过程中出现错误!";
                return "An error occurred during the checking of the destination account["+args[0]+"]!";
            case "AMOUNT_IS_NOT_VALID":
                if (LANGUAGE.Language == ZH_CN_LANG)
                    return "失败!新建账户最少需要 20 lumens,当前发送金额为["+args[0]+"]!";
                return "Failure! Create accounts need at least 20 lumens, the current amount is ["+args[0]+"]!";
        }
        return "";
    }

    function getPaymentstep3Msg(flag,args){
        switch (flag){
            case "BEGIN_SENDING":
                if (LANGUAGE.Language == ZH_CN_LANG)
                    return "开始发送...";
                return "Begin sending...";
            case "SUCCESS_SIGNED":
                if (LANGUAGE.Language == ZH_CN_LANG)
                    return "签名成功!执行发送,请稍后...";
                return "Signature success! Executing signature, please wait...";
            case "SEND_SUCCESS":
                if (LANGUAGE.Language == ZH_CN_LANG)
                    return "发送成功!";
                return "Send success!";
            case "SEND_ERROR":
                if (LANGUAGE.Language == ZH_CN_LANG)
                    return "发送过程中发生错误!";
                return "An error occurred during the sending!";
        }
        return "";
    }

    function getPaymentstep4Msg(flag,args){
        switch (flag){
            case "BEGIN_CREATE_NEW_ACCOUNT":
                if (LANGUAGE.Language == ZH_CN_LANG)
                    return "开始新建账户...";
                return "Begin create account...";
            case "SUCCESS_SIGNED":
                if (LANGUAGE.Language == ZH_CN_LANG)
                    return "签名成功!执行发送,请稍后...";
                return "Signature success! Executing signature, please wait...";
            case "SEND_SUCCESS":
                if (LANGUAGE.Language == ZH_CN_LANG)
                    return "发送成功!";
                return "Send success!";
            case "SEND_ERROR":
                if (LANGUAGE.Language == ZH_CN_LANG)
                    return "发送过程中发生错误!";
                return "An error occurred during the sending!";
        }
        return "";
    }

    function getPaymentMessage(step,flag,args){
        switch (step){
            case 1:
                return getPaymentstep1Msg(flag,args);
            case 2:
                return getPaymentstep2Msg(flag,args);
            case 3:
                return getPaymentstep3Msg(flag,args);
            case 4:
                return getPaymentstep4Msg(flag,args);
        }
        return "";
    }

    // 检查发送账户
    function paymentStep1Execute(ind,srcAddr,skey,destAddr,amount,tmemo) {
        setCurrentNetwork();
        $scope.innerContexts[ind].errorMessage = "";
        $scope.innerContexts[ind].datas = "";

        $scope.innerContexts[ind].dataRows = 3;
        $scope.innerContexts[ind].datas = getPaymentMessage(1,"CHECK_ACCOUNT",[srcAddr]);

        try {
            srcSct = StellarBase.Keypair.fromSeed(skey);
            if (srcSct == null || srcSct.address() != srcAddr) {
                $scope.innerContexts[ind].datas = getPaymentMessage(1, "ADDR_NOT_PAIR_SCR");
                initPaymentView(ind);
                return;
            }
        }catch(e){
            $scope.innerContexts[ind].datas = getPaymentMessage(1, "ADDR_NOT_PAIR_SCR");
            initPaymentView(ind);
            return;
        }
        // 先检查源地址是否存在，余额是不是够进行支付
        urlget = STELLAR_DEFAULT_NETWORK + STELLAR_NETWORK_ACCOUNTS + '/' + srcAddr;
        $http.get(urlget)
            .success(function (data,header,config,status){
                //console.log("========== data ==========\r\n",data);
                //console.log("========== header ==========\r\n",header);
                //console.log("========== config ==========\r\n",config);
                //console.log("========== status ==========\r\n",status);
                if (data.balances != null && data.sequence != null){
                    for (i = 0 ; i < data.balances.length ; ++i){
                        if (data.balances[i].asset_type == "native"){
                            balance = parseFloat(data.balances[i].balance);
                            sendtoAmount = parseFloat(amount);
                            if ((balance - sendtoAmount - 20) > 0){
                                $scope.innerContexts[ind].datas += "\r\n" + getPaymentMessage(1,"ACCOUNT_VALID",[data.balances[i].balance]);
                                paymentStep2Execute(ind,srcAddr,skey,destAddr,amount,data.sequence,tmemo);
                                return;
                            }else{
                                $scope.innerContexts[ind].datas += "\r\n" + getPaymentMessage(1,"BALANCE_NOT_VALID",[data.balances[i].balance]);
                                initPaymentView(ind);
                                return;
                            }
                        }
                    }
                    $scope.innerContexts[ind].datas += "\r\n" + getPaymentMessage(1,"BALANCE_NOT_VALID",["0"]);
                    initPaymentView(ind);
                }
            })
            .error(function (data,header,config,status) {
                if(data == null)
                    $scope.innerContexts[ind].datas += "\r\n" + getPaymentMessage(1,"SOURCE_ADDR_INVALID",[srcAddr]) + "\r\n\tNetwork is not valid!";
                else if(header == "404")
                    $scope.innerContexts[ind].datas += "\r\n" + getPaymentMessage(1,"SOURCE_ADDR_INVALID",[srcAddr]) + "\r\n\tAccount can not be find!";
                else
                    $scope.innerContexts[ind].datas += "\r\n" + getPaymentMessage(1,"SOURCE_ADDR_INVALID",[srcAddr]) + "\r\n\t" + status;

                $scope.innerContexts[ind].dataRows += 2;
                initPaymentView(ind);
            });
    }

    // 检查接收账户
    function paymentStep2Execute(ind,srcAddr,skey,destAddr,amount,sequence,tmemo){
        // 检查目标地址是否存在，不存在将进入新建账户
        $scope.innerContexts[ind].datas += "\r\n" + getPaymentMessage(2,"CHECK_DEST_ADDR_INFO",[destAddr]);
        urlget = STELLAR_DEFAULT_NETWORK + STELLAR_NETWORK_ACCOUNTS + '/' + destAddr;
        $http.get(urlget)
            .success(function (data,header,config,status){
                if (data.balances != null){
                    for (i = 0 ; i < data.balances.length ; ++i){
                        if (data.balances[i].asset_type == "native"){
                            balance = parseFloat(data.balances[i].balance);
                            if (balance >= 0){
                                $scope.innerContexts[ind].datas += "\r\n" + getPaymentMessage(2,"DEST_ADDR_VALID",[data.balances[i].balance]);
                                $scope.innerContexts[ind].dataRows++;
                                paymentStep3Execute(ind,srcAddr,skey,destAddr,amount,sequence,tmemo,false);
                                return;
                            }
                        }
                    }
                    $scope.innerContexts[ind].datas += "\r\n" + getPaymentMessage(2,"DEST_ADDR_INVALID",[destAddr]);
                    initPaymentView(ind);
                }
            })
            .error(function (data,header,config,status) {
                if (header == "404") {
                    $scope.innerContexts[ind].datas += "\r\n" + getPaymentMessage(2,"DEST_ADDR_NOT_EXIST",[destAddr]);
                    if(amount >= 20){
                        paymentStep4Execute(ind,srcAddr,skey,destAddr,amount,sequence,tmemo,false);
                        return;
                    }else{
                        $scope.innerContexts[ind].datas += "\r\n" + getPaymentMessage(2,"AMOUNT_IS_NOT_VALID",[amount]);
                        initPaymentView(ind);
                    }
                }else if(data == null) {
                    $scope.innerContexts[ind].datas += "\r\n" + getPaymentMessage(2,"DEST_ADDR_INVALID",[destAddr]) + "\r\n\tNetwork is not valid!";
                    initPaymentView(ind);
                }else{
                    $scope.innerContexts[ind].datas += "\r\n" + getPaymentMessage(2,"DEST_ADDR_INVALID",[destAddr]) + "\r\n\t" + status;
                    initPaymentView(ind);
                }
                $scope.innerContexts[ind].dataRows += 2;
            });
    }

    // 目标账户存在，发送
    function paymentStep3Execute(ind,srcAddr,skey,destAddr,amount,sequence,tmemo,stopSend){
        $scope.innerContexts[ind].datas += "\r\n" + getPaymentMessage(3,"BEGIN_SENDING");
        $scope.innerContexts[ind].dataRows++;
        srcSct = StellarBase.Keypair.fromSeed(skey);
        //StellarBase.Network.usePublicNetwork();
        setCurrentNetwork();
        sourceAcc = new StellarBase.Account(srcAddr,sequence);
        payoper = StellarBase.Operation.payment({
            destination:destAddr,
            asset:StellarBase.Asset.native(),
            amount:amount,
            source:srcAddr
        });
        transaction = new StellarBase.TransactionBuilder(sourceAcc,{
            //fee: 100,
            memo: tmemo ? StellarBase.Memo.text(tmemo) : ""
        });
        transaction.addOperation(payoper);
        transaction.addSigner(srcSct);

        result = transaction.build();

        base64 = result.toEnvelope().toXDR().toString("base64");
        tx = "tx=" + encodeURIComponent(base64);

        var transform = function(data){
            return data;
        };
        $scope.innerContexts[ind].datas += "\r\n" + getPaymentMessage(3,"SUCCESS_SIGNED");
        $scope.innerContexts[ind].dataRows += 2;

        if (stopSend) {
            //如果只签名不执行，则将签名结果输出 todo...
        } else {
            urlpost = STELLAR_DEFAULT_NETWORK + STELLAR_NETWORK_TRANSACTIONS;
            $http({
                method: 'POST',
                url: urlpost,
                headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'},
                transformRequest: transform,
                data: tx
            }).
                success(function (data, status, headers, config) {
                    console.log(" ============ post success ===============");
                    console.log(" ============ data ===============\r\n\t", data);
                    console.log(" ============ status ===============\r\n\t", status);
                    console.log(" ============ headers ===============\r\n\t", headers);
                    console.log(" ============ config ===============\r\n\t", config);
                    $scope.innerContexts[ind].datas += "\r\n" + getPaymentMessage(3,"SEND_SUCCESS");
                    $scope.innerContexts[ind].dataRows ++;
                    initPaymentView(ind);
                    $scope.innerContexts[ind].refreshClick(ind);
                }).
                error(function (data, status, headers, config) {
                    console.log(" ============ post error ===============");
                    console.log(" ============ data ===============\r\n\t", data);
                    console.log(" ============ status ===============\r\n\t", status);
                    console.log(" ============ headers ===============\r\n\t", headers);
                    console.log(" ============ config ===============\r\n\t", config);
                    $scope.innerContexts[ind].datas += "\r\n" + getPaymentMessage(3,"SEND_ERROR") + "\r\n\t" + status;
                    $scope.innerContexts[ind].dataRows ++;
                    initPaymentView(ind);
                });
        }
    }

    // 目标账户不存在，新建账户
    function paymentStep4Execute(ind,srcAddr,skey,destAddr,amount,sequence,tmemo,stopSend){
        $scope.innerContexts[ind].datas += "\r\n" + getPaymentMessage(4,"BEGIN_CREATE_NEW_ACCOUNT");
        $scope.innerContexts[ind].dataRows++;
        srcSct = StellarBase.Keypair.fromSeed(skey);
        //StellarBase.Network.usePublicNetwork();
        setCurrentNetwork();
        sourceAcc = new StellarBase.Account(srcAddr,sequence);
        createopr = StellarBase.Operation.createAccount({
            destination:destAddr,
            startingBalance:amount,
            source:srcAddr
        });
        transaction = new StellarBase.TransactionBuilder(sourceAcc,{
            //fee: 100,
            memo: tmemo ? StellarBase.Memo.text(tmemo) : ""
        });
        transaction.addOperation(createopr);
        transaction.addSigner(srcSct);

        result = transaction.build();

        base64 = result.toEnvelope().toXDR().toString("base64");
        tx = "tx=" + encodeURIComponent(base64);

        var transform = function(data){
            return data;
        };
        $scope.innerContexts[ind].datas += "\r\n" + getPaymentMessage(4,"SUCCESS_SIGNED");
        $scope.innerContexts[ind].dataRows += 2;

        if (stopSend) {
            //如果只签名不执行，则将签名结果输出 todo...
        } else {
            urlpost = STELLAR_DEFAULT_NETWORK + STELLAR_NETWORK_TRANSACTIONS;
            $http({
                method: 'POST',
                url: urlpost,
                headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'},
                transformRequest: transform,
                data: tx
            }).
                success(function (data, status, headers, config) {
                    console.log(" ============ post success ===============");
                    console.log(" ============ data ===============\r\n\t", data);
                    console.log(" ============ status ===============\r\n\t", status);
                    console.log(" ============ headers ===============\r\n\t", headers);
                    console.log(" ============ config ===============\r\n\t", config);
                    $scope.innerContexts[ind].datas += "\r\n" + getPaymentMessage(4,"SEND_SUCCESS");
                    $scope.innerContexts[ind].dataRows ++;
                    initPaymentView(ind);
                    $scope.innerContexts[ind].refreshClick(ind);
                }).
                error(function (data, status, headers, config) {
                    console.log(" ============ post error ===============");
                    console.log(" ============ data ===============\r\n\t", data);
                    console.log(" ============ status ===============\r\n\t", status);
                    console.log(" ============ headers ===============\r\n\t", headers);
                    console.log(" ============ config ===============\r\n\t", config);
                    $scope.innerContexts[ind].datas += "\r\n" + getPaymentMessage(4,"SEND_ERROR") + "\r\n\t" + status;
                    $scope.innerContexts[ind].dataRows ++;
                    initPaymentView(ind);
                });
        }

    }

    function getMergestep2Msg(flag,args){
        switch (flag){
            case "BEGIN_MERGE":
                if (LANGUAGE.Language == ZH_CN_LANG)
                    return "开始准备进行账户合并...";
                return "Ready to merge accounts...";
            case "SUCCESS_SIGNED":
                if (LANGUAGE.Language == ZH_CN_LANG)
                    return "签名成功!执行合并,请稍后...";
                return "Signature success! Executing signature, please wait...";
            case "MERGE_SUCCESS":
                if (LANGUAGE.Language == ZH_CN_LANG)
                    return "合并成功!";
                return "Merge success!";
            case "MERGE_ERROR":
                if (LANGUAGE.Language == ZH_CN_LANG)
                    return "合并过程中发生错误!";
                return "An error occurred during the merging!";
        }
        return "";
    }

    function getMergeMessage(step,flag,args){
        switch(step){
            case 1:
                return getPaymentstep1Msg(flag,args);
            case 2:
                return getMergestep2Msg(flag,args);
        }
        return "";
    }

    function mergeStep1Execute(ind,srcAddr,skey,destAddr){
        setCurrentNetwork();
        $scope.innerContexts[ind].errorMessage = "";
        $scope.innerContexts[ind].datas = "";

        $scope.innerContexts[ind].dataRows = 3;
        $scope.innerContexts[ind].datas = getMergeMessage(1,"CHECK_ACCOUNT",[srcAddr]);

        try {
            srcSct = StellarBase.Keypair.fromSeed(skey);
            if (srcSct == null || srcSct.address() != srcAddr) {
                $scope.innerContexts[ind].datas = getMergeMessage(1, "ADDR_NOT_PAIR_SCR");
                initMergeView(ind);
                return;
            }
        }catch(e){
            $scope.innerContexts[ind].datas = getMergeMessage(1, "ADDR_NOT_PAIR_SCR");
            initMergeView(ind);
            return;
        }
        // 先检查源地址是否存在，余额是不是够进行支付
        urlget = STELLAR_DEFAULT_NETWORK + STELLAR_NETWORK_ACCOUNTS + '/' + srcAddr;
        $http.get(urlget)
            .success(function (data,header,config,status){
                //console.log("========== data ==========\r\n",data);
                //console.log("========== header ==========\r\n",header);
                //console.log("========== config ==========\r\n",config);
                //console.log("========== status ==========\r\n",status);
                if (data.balances != null && data.sequence != null){
                    for (i = 0 ; i < data.balances.length ; ++i){
                        if (data.balances[i].asset_type == "native"){
                            $scope.innerContexts[ind].datas += "\r\n" + getMergeMessage(1,"ACCOUNT_VALID",[data.balances[i].balance]);
                            mergeStep2Execute(ind,srcAddr,skey,destAddr,data.sequence);
                            return;
                        }
                    }
                    $scope.innerContexts[ind].datas += "\r\n" + getMergeMessage(1,"BALANCE_NOT_VALID",["-"]);
                    initMergeView(ind);
                }
            })
            .error(function (data,header,config,status) {
                if(data == null)
                    $scope.innerContexts[ind].datas += "\r\n" + getMergeMessage(1,"SOURCE_ADDR_INVALID",[srcAddr]) + "\r\n\tNetwork is not valid!";
                else if(header == "404")
                    $scope.innerContexts[ind].datas += "\r\n" + getMergeMessage(1,"SOURCE_ADDR_INVALID",[srcAddr]) + "\r\n\tAccount can not be find!";
                else
                    $scope.innerContexts[ind].datas += "\r\n" + getMergeMessage(1,"SOURCE_ADDR_INVALID",[srcAddr]) + "\r\n\t" + status;

                $scope.innerContexts[ind].dataRows += 2;
                initMergeView(ind);
            });

    }

    function mergeStep2Execute(ind,srcAddr,skey,destAddr,sequence,stopSend){
        $scope.innerContexts[ind].datas += "\r\n" + getMergeMessage(2,"BEGIN_MERGE");
        $scope.innerContexts[ind].dataRows++;
        srcSct = StellarBase.Keypair.fromSeed(skey);
        tmemo = "ledgercn.com";
        //StellarBase.Network.usePublicNetwork();
        setCurrentNetwork();
        sourceAcc = new StellarBase.Account(srcAddr,sequence);
        mergeOper = StellarBase.Operation.accountMerge({
            destination:destAddr,
            source:srcAddr
        });
        transaction = new StellarBase.TransactionBuilder(sourceAcc,{
            //fee: 100,
            memo: tmemo ? StellarBase.Memo.text(tmemo) : ""
        });
        transaction.addOperation(mergeOper);
        transaction.addSigner(srcSct);

        result = transaction.build();

        base64 = result.toEnvelope().toXDR().toString("base64");
        tx = "tx=" + encodeURIComponent(base64);

        var transform = function(data){
            return data;
        };
        $scope.innerContexts[ind].datas += "\r\n" + getMergeMessage(2,"SUCCESS_SIGNED");
        $scope.innerContexts[ind].dataRows += 2;

        if (stopSend) {
            //如果只签名不执行，则将签名结果输出 todo...
        } else {
            urlpost = STELLAR_DEFAULT_NETWORK + STELLAR_NETWORK_TRANSACTIONS;
            $http({
                method: 'POST',
                url: urlpost,
                headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'},
                transformRequest: transform,
                data: tx
            }).
                success(function (data, status, headers, config) {
                    console.log(" ============ post success ===============");
                    console.log(" ============ data ===============\r\n\t", data);
                    console.log(" ============ status ===============\r\n\t", status);
                    console.log(" ============ headers ===============\r\n\t", headers);
                    console.log(" ============ config ===============\r\n\t", config);
                    $scope.innerContexts[ind].datas += "\r\n" + getMergeMessage(2,"MERGE_SUCCESS");
                    $scope.innerContexts[ind].dataRows ++;
                    $scope.innerContexts[ind].refreshClick(ind);
                    initMergeView(ind);
                }).
                error(function (data, status, headers, config) {
                    console.log(" ============ post error ===============");
                    console.log(" ============ data ===============\r\n\t", data);
                    console.log(" ============ status ===============\r\n\t", status);
                    console.log(" ============ headers ===============\r\n\t", headers);
                    console.log(" ============ config ===============\r\n\t", config);
                    $scope.innerContexts[ind].datas += "\r\n" + getMergeMessage(2,"MERGE_ERROR") + "\r\n\t" + status;
                    $scope.innerContexts[ind].dataRows ++;
                    initMergeView(ind);
                });
        }
    }

    function quaryExecute(ind, mainAddr, quaryCount, isNext){
        setCurrentNetwork();
        $scope.innerContexts[ind].errorMessage = "";
        $scope.innerContexts[ind].datas = "";

        if(isNext == null){
            isNext = true;
            $scope.innerContexts[ind].quaryInfo.quaryNext = "";
            $scope.innerContexts[ind].quaryInfo.quaryPrev = "";
        }
        urlget = STELLAR_DEFAULT_NETWORK;
        if (isNext) {
            if ($scope.innerContexts[ind].quaryInfo.quaryNext == null ||
                $scope.innerContexts[ind].quaryInfo.quaryNext == "") {
                $scope.innerContexts[ind].quaryInfo.quaryNext = STELLAR_NETWORK_ACCOUNTS + "/" + mainAddr +
                    "/" + STELLAR_NETWORK_OPERATIONS + "?order=desc&limit="+quaryCount+"&cursor=";
            }
            urlget += $scope.innerContexts[ind].quaryInfo.quaryNext;
        }else{
            urlget += $scope.innerContexts[ind].quaryInfo.quaryPrev;
        }

        $http.get(urlget)
            .success(function (data,header,config,status){
                //console.log("success->data ============ \r\n",data);
                $scope.innerContexts[ind].quaryInfo.quaryResults = [];

                _links = data._links;
                if(isNext){
                    $scope.innerContexts[ind].quaryInfo.quaryNext = _links.next.href.substr(1);
                    $scope.innerContexts[ind].quaryInfo.quaryPrev = _links.prev.href.substr(1);
                } else {
                    $scope.innerContexts[ind].quaryInfo.quaryPrev = _links.next.href.substr(1);
                    $scope.innerContexts[ind].quaryInfo.quaryNext = _links.prev.href.substr(1);
                }

                //console.log("======== Next ==========\r\n",$scope.innerContexts[ind].quaryInfo.quaryNext);
                //console.log("======== Prev ==========\r\n",$scope.innerContexts[ind].quaryInfo.quaryPrev);

                _embedded = data._embedded;
                startIndex = 0;
                stepIndex = 1;
                if(!isNext) {
                    startIndex = _embedded.records.length - 1;
                    stepIndex = -1;
                }
                for(i = startIndex ; (i >= 0 && i < _embedded.records.length) ; ){
                    switch (_embedded.records[i].type){
                        case PAYMENT_TYPE:
                            opera = new PaymentOperation(mainAddr);
                            opera.DecodeBody(_embedded.records[i]);
                            //$scope.innerContexts[ind].quaryInfo.quaryResults[i] = formatPaymentOperation(opera,LANGUAGE.Language);
                            $scope.innerContexts[ind].quaryInfo.quaryResults.push(formatPaymentOperation(opera,LANGUAGE.Language));
                            break;
                        case CREATE_TYPE:
                            opera = new CreateOperation(mainAddr);
                            opera.DecodeBody(_embedded.records[i]);
                            //$scope.innerContexts[ind].quaryInfo.quaryResults[i] = formatCreateOperation(opera,LANGUAGE.Language);
                            $scope.innerContexts[ind].quaryInfo.quaryResults.push(formatCreateOperation(opera,LANGUAGE.Language));
                            break;
                        case MERGE_TYPE:
                            opera = new MergeOperation(mainAddr);
                            opera.DecodeBody(_embedded.records[i]);
                            //$scope.innerContexts[ind].quaryInfo.quaryResults[i] = formatMergeOperation(opera,LANGUAGE.Language);
                            $scope.innerContexts[ind].quaryInfo.quaryResults.push(formatMergeOperation(opera,LANGUAGE.Language));
                            break;
                        case CHANGE_TRUST_TYPE:
                            opera = new ChangeTrustOperation(mainAddr);
                            opera.DecodeBody(_embedded.records[i]);
                            //$scope.innerContexts[ind].quaryInfo.quaryResults[i] = formatChangeTrustOperation(opera,LANGUAGE.Language);
                            $scope.innerContexts[ind].quaryInfo.quaryResults.push(formatChangeTrustOperation(opera,LANGUAGE.Language));
                            break;
                        case MANAGE_OFFER_TYPE:
                            opera = new ManageOfferOperation(mainAddr);
                            opera.DecodeBody(_embedded.records[i]);
                            //$scope.innerContexts[ind].quaryInfo.quaryResults[i] = formatManageOfferOperation(opera,LANGUAGE.Language);
                            $scope.innerContexts[ind].quaryInfo.quaryResults.push(formatManageOfferOperation(opera,LANGUAGE.Language));
                            break;
                        case SET_OPTIONS_TYPE:
                            opera = new SetOptionsOperation(mainAddr);
                            opera.DecodeBody(_embedded.records[i]);
                            //$scope.innerContexts[ind].quaryInfo.quaryResults[i] = formatSetOptionsOperation(opera,LANGUAGE.Language);
                            $scope.innerContexts[ind].quaryInfo.quaryResults.push(formatSetOptionsOperation(opera,LANGUAGE.Language));
                            break;
                        default:
                            opera = new BaseOperation(mainAddr);
                            opera.BaseDecodeBody(_embedded.records[i]);
                            opera.Type = _embedded.records[i].type;
                            //$scope.innerContexts[ind].quaryInfo.quaryResults[i] = formatBaseOperation(baseOper,LANGUAGE.Language);
                            $scope.innerContexts[ind].quaryInfo.quaryResults.push(formatBaseOperation(opera,LANGUAGE.Language));
                            break;
                    }
                    i=i+stepIndex;
                    //console.log("======== Index ==========\r\n",i);
                }
                $scope.innerContexts[ind].quaryInfo.btnStatus = "icon-search";
                if($scope.innerContexts[ind].quaryInfo.quaryResults.length == 0){
                    $scope.innerContexts[ind].quaryInfo.quaryBtnVisible = true;
                    $scope.innerContexts[ind].quaryInfo.quaryNext = "";
                    $scope.innerContexts[ind].quaryInfo.quaryPrev = "";
                }else{
                    $scope.innerContexts[ind].quaryInfo.quaryBtnVisible = false;
                }
            })
            .error(function (data,header,config,status){
                $scope.innerContexts[ind].quaryInfo.btnStatus = "icon-search";
                if(data == null)
                    $scope.innerContexts[ind].errorMessage = "Network is not valid!";
                else if(header == "404")
                    $scope.innerContexts[ind].errorMessage = "Account can not be find!";
                else
                    $scope.innerContexts[ind].errorMessage = status;
                console.log("error->data ============ \r\n",data);
                console.log("error->header ============ \r\n",header);
                console.log("error->config ============ \r\n",config);
                console.log("error->status ============ \r\n",status);
                $scope.innerContexts[ind].datas = status.url;
                $scope.innerContexts[ind].dataRows = 3;
            });
    }

    function setLanguageTitle(iCon){
        if(LANGUAGE.Language == ZH_CN_LANG){
            iCon.title = "当前账户信息";
            iCon.balance = "余额";
            iCon.searchBtnTooltip = "查询历史";
            iCon.paymentBtnTooltip = "付款";
            iCon.mergeBtnTooltip = "合并账户";
            iCon.quaryInfo.quaryBtnTitle = "点击搜索";
            iCon.quaryInfo.quaryPrevTitle = "前一页";
            iCon.quaryInfo.quaryNextTitle = "下一页";
            iCon.paymentInfo.destAddrTitle = "接收地址";
            iCon.paymentInfo.amountTitle = "发送金额";
            iCon.paymentInfo.skeyTitle = "签名 Key";
            iCon.paymentInfo.tmemoTitle = "备注";
            iCon.mergeInfo.srcAddrTitle = "需要合并的账户地址";
            iCon.mergeInfo.srcKeyTitle = "需要合并的账户Key";
        }else{
            iCon.title = "Account Informations";
            iCon.balance = "Balance";
            iCon.searchBtnTooltip = "quary history list";
            iCon.paymentBtnTooltip = "payment";
            iCon.mergeBtnTooltip = "merge account";
            iCon.quaryInfo.quaryBtnTitle = "Search";
            iCon.quaryInfo.quaryPrevTitle = "Prev";
            iCon.quaryInfo.quaryNextTitle = "Next";
            iCon.paymentInfo.destAddrTitle = "Destination address";
            iCon.paymentInfo.amountTitle = "Amount";
            iCon.paymentInfo.skeyTitle = "Signer Key";
            iCon.paymentInfo.tmemoTitle = "Memo";
            iCon.mergeInfo.srcAddrTitle = "Source address";
            iCon.mergeInfo.srcKeyTitle = "Source key";
        }
        return iCon;
    }

    function getInnerContext(i,a){
        ret = {
            index:i,
            title:"",
            balance:"",
            balanceUnin:{
                balanceValue:"-",
                credits:[]
            },
            address:a,
            refreshBtnIcon:"icon-refresh",
            refreshClick : function(ind){
                if (this.refreshBtnIcon == "icon-spinner icon-spin"){
                    return;
                }
                //console.log("refreshClick ============");
                this.refreshBtnIcon = "icon-spinner icon-spin";
                getAccountInfo(ind,this.address);
            },
            actived:"",

            searchBtnTooltip:"",
            paymentBtnTooltip:"",
            mergeBtnTooltip:"",

            paymentInfo:{
                viewShow:false,
                btnStatus:"icon-ok",
                destAddrTitle:"",
                destAddr:"",
                amountTitle:"",
                amount:"",
                skeyTitle:"",
                skey:"",
                tmemoTitle:"",
                tmemo:""
            },

            paymentClick : function(ind) {
                if (this.mergeInfo.btnStatus == "icon-spinner icon-spin" ||
                    this.paymentInfo.btnStatus == "icon-spinner icon-spin" ||
                    this.quaryInfo.btnStatus == "icon-spinner icon-spin" )
                    return;
                this.paymentInfo.btnStatus = "icon-spinner icon-spin";
                paymentStep1Execute(ind,this.address,this.paymentInfo.skey,this.paymentInfo.destAddr,this.paymentInfo.amount,this.paymentInfo.tmemo);
            },

            mergeInfo :{
                viewShow:false,
                btnStatus:"icon-ok",
                srcAddrTitle:"",
                srcAddr:"",
                srcKeyTitle:"",
                srcKey:""
            },
            mergeClick : function(ind){
                if (this.mergeInfo.btnStatus == "icon-spinner icon-spin" ||
                    this.paymentInfo.btnStatus == "icon-spinner icon-spin" ||
                    this.quaryInfo.btnStatus == "icon-spinner icon-spin" )
                    return;
                this.mergeInfo.btnStatus = "icon-spinner icon-spin";
                mergeStep1Execute(ind,this.mergeInfo.srcAddr,this.mergeInfo.srcKey,this.address)
            },

            quaryInfo:{
                viewShow:false,
                btnStatus:"icon-search",
                resultPanelID:"Result_Panel_ID_" + i.toString(),
                quaryBtnTitle:"",
                quaryBtnVisible:true,
                quaryPrevTitle:"",
                quaryPrev:"",
                quaryNextTitle:"",
                quaryNext:"",
                quaryResults:[]
            },
            quaryClick : function(ind,isNext){
                if (this.mergeInfo.btnStatus == "icon-spinner icon-spin" ||
                    this.paymentInfo.btnStatus == "icon-spinner icon-spin" ||
                    this.quaryInfo.btnStatus == "icon-spinner icon-spin")
                    return;
                this.quaryInfo.btnStatus = "icon-spinner icon-spin";
                quaryExecute(ind,this.address,10,isNext);
            },

            datas:"",
            dataRows:3,
            errorMessage:""
        };

        if (i == 0){
            ret.actived = "active";
        }
        ret = setLanguageTitle(ret);
        return ret;
    }

    function loadingContext(){
        readCookie();
        $scope.minHeight = 300+68;
        if (COOKIE_SAVE.addresses == null || COOKIE_SAVE.addresses.size() == 0){
            $scope.indicators =[getIndicator(0)];
            if (LANGUAGE.Language == ZH_CN_LANG){
                $scope.innerContexts = [{
                    title:"请在屏幕下方的“账户”中添加账户公共地址",
                    actived:"active"
                }];
            } else {
                $scope.innerContexts = [{
                    title:'Please add public address form "Account" menu',
                    actived:"active"
                }];
            }
        } else {
            $scope.indicators =[];
            $scope.innerContexts = [];

            for (i = 0 ; i < COOKIE_SAVE.addresses.size() ; ++i){
                $scope.indicators[i] = getIndicator(i);
                $scope.innerContexts[i] = getInnerContext(i,COOKIE_SAVE.addresses.get(i));
                $scope.innerContexts[i].refreshClick(i);
            }
        }
    }

    loadingContext();
}
myApp.controller('middleContextController',middleContextController);
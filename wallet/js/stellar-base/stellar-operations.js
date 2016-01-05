

function EncSecretKey(msg , key){
    keyHex = CryptoJS.enc.Utf8.parse(key);
    encrypted = CryptoJS.TripleDES.encrypt(msg, keyHex, {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7
    });
    return encrypted.toString();
}

function UencSecretKey(msg , key){
    keyHex = CryptoJS.enc.Utf8.parse(key);
    decrypted = CryptoJS.TripleDES.decrypt({
        ciphertext: CryptoJS.enc.Base64.parse(msg)
    }, keyHex, {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7
    });
    return decrypted.toString(CryptoJS.enc.Utf8);
}

//获取账户余额
function GetBalance(http,index,acc,endFunc){
    if(acc == null || acc.loading)
        return;

    acc.Info = null;
    acc.loading = true;
    acc.Actived = false;

    //StellarBase.Network.usePublicNetwork();

    geturl = STELLAR_DEFAULT_NETWORK + STELLAR_NETWORK_ACCOUNTS + '/' + acc.PublicAddr;
    http.get(geturl)
        .success(function (data,header,config,status) {
            //console.log("success->data ============ \r\n", data);
            acc.loading = false;
            acc.Actived = true;
            acc.Info = AccountInfoDecode(data);
            acc.ErrorMessage = "";
            endFunc(index,acc);
        })
        .error(function (data,header,config,status) {
            if (data == null)
                acc.ErrorMessage = "Network is not valid!";
            else if (header == "404"){
                acc.ErrorMessage = "Account can not be find!";
            }
            else
                acc.ErrorMessage = status;
            acc.loading = false;
            endFunc(index,acc);
            //console.log("error->data ============ \r\n", data);
            //console.log("error->header ============ \r\n", header);
            //console.log("error->config ============ \r\n", config);
            //console.log("error->status ============ \r\n", status);
        });
}

function GetAccHistoryDatas(http,index,acc,isNext,endFunc){
    urlget = STELLAR_DEFAULT_NETWORK + STELLAR_NETWORK_ACCOUNTS + "/" + acc.PublicAddr + "/" + STELLAR_NETWORK_TRANSACTIONS +
        acc.AccHistorys.getQuaryParam(isNext);
    http.get(urlget)
        .success(function (data,header,config,status) {
            console.log("[GetAccHistoryDatas] success->data ============ \r\n", data);
            if(acc.AccHistorys.Breakout){
                endFunc(index,acc,true);
                return;
            }
            var trans = new BaseTransactionDef(acc.PublicAddr);
            for(var i = 0 ; i < data._embedded.records.length ; ++i){
                trans.DecodeBody(data._embedded.records[i]);
                opera = trans.DecodeOperation();
                acc.AccHistorys.AddHistoryDatas(opera,isNext,trans.paging_token,trans.ledger);

                //console.log(i.toString() +" success ===== trans\r\n",trans);
                //console.log(i.toString() +" success ===== opera\r\n",opera);
                //console.log("\r\n\r\n");
            }
            isOver = data._embedded.records.length < 10;
            endFunc(index,acc,isOver);
        })
        .error(function (data,header,config,status) {
            if (data == null)
                acc.ErrorMessage = "Network is not valid!";
            else if (header == "404"){
                acc.ErrorMessage = "Account can not be find!";
            }
            else
                acc.ErrorMessage = status;
            endFunc(index,acc,true);
            console.log("[GetAccHistoryDatas] error->data ============ \r\n", data);
            console.log("[GetAccHistoryDatas] error->header ============ \r\n", header);
            console.log("[GetAccHistoryDatas] error->config ============ \r\n", config);
            console.log("[GetAccHistoryDatas] error->status ============ \r\n", status);
        });
}

function SendAmountDefine() {
    this.DestAddr = "";
    this.Amount = "";
    this.MemoType = "";
    this.MemoText = "";
    this.IsExist = false;
    this.ErrorMessage = "";
}
SendAmountDefine.prototype.checkValid = function(){
    tmp = this;
    if(tmp.DestAddr == ""){
        tmp.ErrorMessage = "Invalid destination address";
        return false;
    } else if(tmp.Amount == ""){
        tmp.ErrorMessage = "Invalid amount format";
        return false;
    }
    return true;
};

var NETWORK_ERROR = 0;
var START_SEND_AMOUNT = 1;
var CHECK_DEST_VALID = 2;
var DEST_ERROR = 3;
var CHECK_SOURCE_BALANCE = 4;
var SOURCE_ERROR = 5;
var SOURCE_BALANCE_NOT_SUFF_FUNDS = 6;
var CHECK_DEST_EXIST = 7;
var DEST_NOT_EXIST = 8;
var FRAME_SIGNER = 9;
var LOGIN_USER_ERROR = 10;
var SEND_COMPLETE = 11;
var SEND_FAILURE = 12;
var MEMO_TEXT_ERROR = 13;
var MEMO_ID_ERROR = 14;
var MEMO_HASH_ERROR = 15;
var MEMO_RETURN_ERROR = 16;
var MERGE_START = 17;
var MERGE_FAILURE = 18;
var MERGE_SUCCESS = 19;

function SendAmount(http,cookies,index,acc,endFunc,sendInfo){
    endFunc(START_SEND_AMOUNT);
    paymentStep1Execute(http,cookies,index,acc,endFunc,sendInfo);
}

// 检查发送账户
function paymentStep1Execute(http,cookies,index,acc,endFunc,sendInfo) {
    endFunc(CHECK_DEST_VALID);
    for(i=0;i<sendInfo.length;i++){
        if(!sendInfo[i].checkValid()){
            endFunc(DEST_ERROR,sendInfo.ErrorMessage,sendInfo[i]);
            return;
        }
    }

    endFunc(CHECK_SOURCE_BALANCE);
    // 检查源账户余额
    GetBalance(http,index,acc,firstEndFunc);

    function firstEndFunc(index,retAcc){
        if(acc.ErrorMessage != ""){
            if(acc.ErrorMessage == "Network is not valid!")
                endFunc(NETWORK_ERROR);
            else
                endFunc(SOURCE_ERROR,acc.ErrorMessage);
            return;
        }

        balance = retAcc.Info.Balance_XLM*1;
        sendtoAmount = parseFloat(sendInfo[0].Amount);
        fee = 0.00001*sendInfo.length;
        if ((balance - sendtoAmount - fee) > 0){
            endFunc(CHECK_DEST_EXIST);
            paymentStep2Execute(http,cookies,index,acc,endFunc,sendInfo);
        }else{
            endFunc(SOURCE_BALANCE_NOT_SUFF_FUNDS);
        }
    }
}

// 检查接收账户
function paymentStep2Execute(http,cookies,index,acc,endFunc,sendInfo){
    checkflag=[];
    for(i = 0 ; i < sendInfo.length ; ++i){
        accTmp = new(proAccountInfo);
        accTmp.PublicAddr = sendInfo[i].DestAddr;
        checkflag[i] = accTmp;
        GetBalance(http,i,accTmp,secondEndFunc);
    }


    function secondEndFunc(index,retAcc){
        if(checkflag[index].ErrorMessage != ""){
            if(checkflag[index].ErrorMessage == "Network is not valid!"){
                endFunc(NETWORK_ERROR);
                return;
            }
            else if(checkflag[index].ErrorMessage != "Account can not be find!"){
                endFunc(SOURCE_ERROR,retAcc.ErrorMessage);
                return;
            }
        }

        sendInfo[index].IsExist = checkflag[index].Info != null;
        if(!sendInfo[index].IsExist){
            endFunc(DEST_NOT_EXIST,sendInfo[index].DestAddr);
        }

        for(i = 0 ; i < checkflag.length ; ++i){
            if(checkflag[i].loading)
                return;
        }

        endFunc(FRAME_SIGNER);
        paymentStep3Execute(http,cookies,index,acc,endFunc,sendInfo);
    }
}

// 目标账户存在，发送，不存在创建
function paymentStep3Execute(http,cookies,index,acc,endFunc,sendInfo){
    sourceAcc = new StellarBase.Account(acc.PublicAddr,GetAccSequence(acc.Info));
    tmemo = StellarBase.Memo.none();
    if(sendInfo[0].MemoText != ""){
        try{
            switch (sendInfo[0].MemoType){
                case "Memo Text":
                    tmemo = StellarBase.Memo.text(sendInfo[0].MemoText);
                    break;
                case "Memo ID":
                    tmemo = StellarBase.Memo.id(sendInfo[0].MemoText);
                    break;
                case "Memo Hash":
                    tmemo = StellarBase.Memo.hash(sendInfo[0].MemoText);
                    break;
                case "Memo RETURN":
                    tmemo = StellarBase.Memo.returnHash(sendInfo[0].MemoText);
                    break;
            }
        }
        catch(e){
            switch (sendInfo[0].MemoType){
                case "Memo Text":
                    endFunc(MEMO_TEXT_ERROR,e.message);
                    break;
                case "Memo ID":
                    endFunc(MEMO_ID_ERROR,e.message);
                    break;
                case "Memo Hash":
                    endFunc(MEMO_HASH_ERROR,e.message);
                    break;
                case "Memo RETURN":
                    endFunc(MEMO_RETURN_ERROR,e.message);
                    break;
            }
            return;
        }
    }
    transaction = new StellarBase.TransactionBuilder(sourceAcc,{fee: 100});
    for(i = 0 ; i < sendInfo.length ; ++i){
        destInfo = sendInfo[i];
        if(destInfo.IsExist){
            payoper = StellarBase.Operation.payment({
                destination:destInfo.DestAddr,
                asset:StellarBase.Asset.native(),
                amount:destInfo.Amount,
                source:acc.PublicAddr
            });
            transaction.addOperation(payoper);
        } else {
            createopr = StellarBase.Operation.createAccount({
                destination:destInfo.DestAddr,
                startingBalance:destInfo.Amount,
                source:acc.PublicAddr
            });
            transaction.addOperation(createopr);

        }
    }
    transaction.addMemo(tmemo);
    ssKey = cookies.get(COOKIE_KEY_SECRETSTR);
    if (ssKey == null || ssKey.length < 10){
        endFunc(LOGIN_USER_ERROR);
        return;
    }

    skey = UencSecretKey(acc.SecretKey,ssKey);
    srcSct = StellarBase.Keypair.fromSeed(skey);
    skey = "";
    base64 = "";
    try{
        transaction.addSigner(srcSct);

        result = transaction.build();

        base64 = result.toEnvelope().toXDR().toString("base64");
    }
    catch(e){
        endFunc(SEND_FAILURE,e.message);
        return;
    }
    tx = "tx=" + encodeURIComponent(base64);

    urlpost = STELLAR_DEFAULT_NETWORK + STELLAR_NETWORK_TRANSACTIONS;
    http({
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
            endFunc(SEND_COMPLETE);
        }).
        error(function (data, status, headers, config) {
                console.log(" ============ post error ===============");
                console.log(" ============ data ===============\r\n\t", data);
                console.log(" ============ status ===============\r\n\t", status);
                console.log(" ============ headers ===============\r\n\t", headers);
                console.log(" ============ config ===============\r\n\t", config);
            endFunc(SEND_FAILURE,status);
        });
}

// 合并账户
function MergeAccount(http,cookies,index,srcAcc,destAcc,endFunc){
    endFunc(MERGE_START);
    ssKey = cookies.get(COOKIE_KEY_SECRETSTR);
    if (ssKey == null || ssKey.length < 10){
        endFunc(LOGIN_USER_ERROR);
        return;
    }

    tmemo = "www.ledgercn.com";
    sourceAcc = new StellarBase.Account(srcAcc.PublicAddr,srcAcc.Info.Sequence);
    mergeOper = StellarBase.Operation.accountMerge({
        destination:destAcc.PublicAddr,
        source:srcAcc.PublicAddr
    });
    transaction = new StellarBase.TransactionBuilder(sourceAcc,{
        memo: StellarBase.Memo.text(tmemo)
    });
    transaction.addOperation(mergeOper);

    srcKey = UencSecretKey(srcAcc.SecretKey,ssKey);
    srcSct = StellarBase.Keypair.fromSeed(srcKey);
    srcKey = "";

    try{
        transaction.addSigner(srcSct);

        result = transaction.build();

        base64 = result.toEnvelope().toXDR().toString("base64");
    }
    catch(e){
        endFunc(MERGE_FAILURE,e.message);
        return;
    }

    tx = "tx=" + encodeURIComponent(base64);


    urlpost = STELLAR_DEFAULT_NETWORK + STELLAR_NETWORK_TRANSACTIONS;
    http({
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
            endFunc(MERGE_SUCCESS,status,srcAcc,destAcc);
        }).
        error(function (data, status, headers, config) {
            console.log(" ============ post error ===============");
            console.log(" ============ data ===============\r\n\t", data);
            console.log(" ============ status ===============\r\n\t", status);
            console.log(" ============ headers ===============\r\n\t", headers);
            console.log(" ============ config ===============\r\n\t", config);
            endFunc(MERGE_FAILURE,status,srcAcc,destAcc);
        });
}
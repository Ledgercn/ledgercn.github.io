
function Pro_Accounts(){
    this.AccList = new ArrayList();
    this.FriendList = new ArrayList();
    this.GroupList = new ArrayList();
}

Pro_Accounts.prototype.getAccInfo = function(index){
    if(index >= this.AccList.size())
        return null;
    return this.AccList.get(index);
};

Pro_Accounts.prototype.getAccInfoFromName = function(nickName){
    for(var i = 0 ; i < this.AccList.size() ; ++i){
        tmp = this.AccList.get(i);
        if(nickName == tmp.NickName){
            return tmp;
        }
    }
    return null;
};

Pro_Accounts.prototype.getAccounts = function(){
    return this.AccList.getArray();
};

Pro_Accounts.prototype.Count = function(){
    return this.AccList.size();
};

Pro_Accounts.prototype.newAccount = function(http,acc,endFunc){
    posturl = BACK_SERVICE_URL + "/" + BACK_SERVICE_AWALLET;
    tx = POST_TYPE_FLAG + "=" + RT_USER_ADD_WALLET_ACCOUNT + "&" + acc.getPostArgs();
    //console.log(tx);
    tmpList = this.AccList;
    http({
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
            if(data.data != null && data.data.success){
                tmpList.add(acc);
            }
            endFunc(data);
        }).
        error(function (data, status, headers, config){
            console.log("error\r\n",data);
            endFunc(data);
        });
};

Pro_Accounts.prototype.deleteAccount = function(http,acc,pw,endFunc){
    posturl = BACK_SERVICE_URL + "/" + BACK_SERVICE_AWALLET;
    tx = POST_TYPE_FLAG + "=" + RT_USER_DEL_WALLET_ACCOUNT + "&" +
        POST_MARK_PASS_WORD + "=" + encodeURIComponent(pw) + "&" + acc.getPostArgs();
    //console.log(tx);
    tmpList = this.AccList;
    http({
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
            if(data.data != null && data.data.success){
                tmpList.removeValue(acc);
            }
            endFunc(data);
        }).
        error(function (data, status, headers, config){
            console.log("error\r\n",data);
            endFunc(data);
        });
};

Pro_Accounts.prototype.reloadAccounts = function(http,logUser,auth,endFunc){
    posturl = BACK_SERVICE_URL + "/" + BACK_SERVICE_AWALLET;
    tx = POST_TYPE_FLAG + "=" + PT_GET_WALLETS + "&" +
        POST_MARK_USER_NAME + "=" + encodeURIComponent(logUser) + "&" +
        POST_MARK_AUTHCODE + "=" + encodeURIComponent(auth);
    tmpAList = this.AccList;
    tmpAList.clear();
    http({
        method: 'POST',
        url: postUrl,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
        },
        transformRequest: transform,
        data: tx
    }).
        success(function (data, status, headers, config){
            console.log("[reloadAccounts] success\r\n",data);
            if(data.data != null && data.data.results != null && data.data.results.length > 0){
                for(var i=0;i<data.data.results.length;i++){
                    accInfo = new(proAccountInfo);
                    accInfo.NickName = data.data.results[i].nickname;
                    accInfo.PublicAddr = data.data.results[i].public_address;
                    accInfo.SecretKey = data.data.results[i].secret_key;
                    accInfo.UserGA = data.data.results[i].user_ga_used;
                    accInfo.LoginUser = data.data.login_user;
                    tmpAList.add(accInfo);
                }
            }
            endFunc(data);
        }).
        error(function (data, status, headers, config){
            console.log("[reloadAccounts] error\r\n",data);
            endFunc(data);
        });
};

Pro_Accounts.prototype.refreshBalances = function(http,endFunc,index){
    if(index == null){
        for(var i = 0 ; i < this.AccList.size() ; i++){
            GetBalance(http,i,this.AccList.get(i),endFunc);
        }
    } else {
        GetBalance(http,index,this.AccList.get(index),endFunc);
    }
};

Pro_Accounts.prototype.isAllBalanceReady = function(){
    for(var i = 0 ; i < this.AccList.size() ; i++){
        if(this.AccList.get(i).isLoading){
            return false;
        }
    }
    return true;
};

Pro_Accounts.prototype.totalBalance = function(islong){
    ret = 0;
    for(var i = 0 ; i < this.AccList.size() ; i++){
        tmp = this.AccList.get(i);
        if(tmp.Info != null && tmp.ErrorMessage==""){
            ret += tmp.Info.Balance_XLM*1;
        }
    }
    if(islong){
        return ret;
    }
    tmp = shortBalance(ret+"");
    if(tmp != "-")
        return parseInt(tmp);
    return 0;
};

Pro_Accounts.prototype.getErrorMessage = function(index){
    if(index == null){
        ret = "";
        for(var i = 0 ; i < this.AccList.size() ; i++){
            tmp = this.AccList.get(i);
            if(!tmp.isLoading && tmp.ErrorMessage != ""){
                ret += tmp.NickName + "[" + tmp.ErrorMessage + "]. \r\n";
            }
        }
        return ret;
    } else {
        return this.AccList.get(i).ErrorMessage;
    }
};

Pro_Accounts.prototype.UpdateAccountInfo = function(http,index,newAccInfo,endFunc){
    currAcc = this.AccList.get(index);
    posturl = BACK_SERVICE_URL + "/" + BACK_SERVICE_AWALLET;
    tx = POST_TYPE_FLAG + "=" + RT_UPDATE_WALLET_INFO + "&" +
        POST_MARK_USER_NAME + "=" + encodeURIComponent(currAcc.LoginUser) + "&" +
        POST_MARK_AUTHCODE + "=" + encodeURIComponent(currAcc.LogUserAuth) + "&" +
        POST_MARK_WALLET_NICKNAME + "=" + encodeURIComponent(currAcc.NickName) + "&" +
        POST_MARK_MODIFY_NICKNAME + "=" + encodeURIComponent(newAccInfo.NickName) + "&" +
        POST_MARK_MODIFY_GA + "=" + newAccInfo.UserGA;

    http({
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
            if(data.data != null && data.data.success){
                currAcc.NickName = data.data.nickname;
                currAcc.UserGA = data.data.user_ga_used;
            }
            endFunc(data);
        }).
        error(function (data, status, headers, config){
            console.log("error\r\n",data);
            endFunc(data);
        });
};

Pro_Accounts.prototype.SearchFriend = function(http,loginUser,auth,addr,nickname,endFunc){
    posturl = BACK_SERVICE_URL + "/" + BACK_SERVICE_AWALLET;
    tx = POST_TYPE_FLAG + "=" + PT_SEARCH_WALLETS + "&" +
        POST_MARK_USER_NAME + "=" + encodeURIComponent(loginUser) + "&" +
        POST_MARK_AUTHCODE + "=" + encodeURIComponent(auth) + "&" +
        POST_MARK_WALLET_PUBADDR + "=" + encodeURIComponent(addr) + "&" +
        POST_MARK_WALLET_NICKNAME + "=" + encodeURIComponent(nickname);

    http({
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
            //if(data.data != null && data.data.success){
            //    tmpList.add(acc);
            //}
            endFunc(data);
        }).
        error(function (data, status, headers, config){
            console.log("error\r\n",data);
            endFunc(data);
        });
};

Pro_Accounts.prototype.getFriendFromID = function(id){
    for(var i = 0 ; i < this.FriendList.size() ; ++i){
        if(id == this.FriendList.get(i).id){
            return this.FriendList.get(i);
        }
    }
    return null;
};

Pro_Accounts.prototype.getFriendFromIndex = function(index){
    return this.FriendList.get(index);
};

Pro_Accounts.prototype.addFriend = function(http,loginUser,auth,fInfo,endFunc){
    posturl = BACK_SERVICE_URL + "/" + BACK_SERVICE_AWALLET;
    tx = POST_TYPE_FLAG + "=" + RT_USER_ADD_FRIEND + "&" +
        POST_MARK_USER_NAME + "=" + encodeURIComponent(loginUser) + "&" +
        POST_MARK_AUTHCODE + "=" + encodeURIComponent(auth) + "&" + fInfo.getPostArgs();
    //console.log(tx);
    tmpList = this.FriendList;
    http({
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
            if(data.data != null && data.data.success){
                tmpList.add(fInfo);
            }
            endFunc(data,fInfo);
        }).
        error(function (data, status, headers, config){
            console.log("error\r\n",data);
            endFunc(data,fInfo);
        });
};

Pro_Accounts.prototype.getFriends = function(){
    return this.FriendList.getArray();
};

Pro_Accounts.prototype.reloadFriends = function(http,logUser,auth,endFunc){
    posturl = BACK_SERVICE_URL + "/" + BACK_SERVICE_AWALLET;
    tx = POST_TYPE_FLAG + "=" + PT_GET_FRIENDS + "&" +
        POST_MARK_USER_NAME + "=" + encodeURIComponent(logUser) + "&" +
        POST_MARK_AUTHCODE + "=" + encodeURIComponent(auth);
    tmpFList = this.FriendList;
    tmpFList.clear();
    http({
        method: 'POST',
        url: postUrl,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
        },
        transformRequest: transform,
        data: tx
    }).
        success(function (data, status, headers, config){
            console.log("[reloadFriends] success\r\n",data);
            if(data.data != null && data.data.results != null && data.data.results.length > 0){
                for(var i=0;i<data.data.results.length;i++){
                    fInfo = new(FriendInfo);
                    fInfo.nickName = data.data.results[i].nickname;
                    fInfo.PublicAddr = data.data.results[i].public_address;
                    fInfo.id = data.data.results[i].wid;
                    fInfo.IsFriend = true;
                    fInfo.AddBtnIcon = "fa-user-times";
                    tmpFList.add(fInfo);
                }
            }
            endFunc(data);
        }).
        error(function (data, status, headers, config){
            console.log("[reloadFriends] error\r\n",data);
            endFunc(data);
        });
};

Pro_Accounts.prototype.deleteFriend = function(http,loginUser,auth,friend,endFunc){
    posturl = BACK_SERVICE_URL + "/" + BACK_SERVICE_AWALLET;
    tx = POST_TYPE_FLAG + "=" + RT_USER_DEL_FRIEND + "&" +
        POST_MARK_USER_NAME + "=" + encodeURIComponent(loginUser) + "&" +
        POST_MARK_AUTHCODE + "=" + encodeURIComponent(auth) + "&" + friend.getPostArgs();
    //console.log(tx);
    tmpList = this.FriendList;
    http({
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
            if(data.data != null && data.data.success){
                tmpList.removeValue(friend);
            }
            endFunc(data,friend);
        }).
        error(function (data, status, headers, config){
            console.log("error\r\n",data);
            endFunc(data,friend);
        });
};

Pro_Accounts.prototype.setAllFriendIcon = function(iconstr){
    for(var i = 0 ; i < this.FriendList.size(); ++i){
        this.FriendList.get(i).AddBtnIcon = iconstr;
    }
};

Pro_Accounts.prototype.FriendsCount = function(){
    return this.FriendList.size();
};

Pro_Accounts.prototype.SearchNickName = function(http,userIndex,userInfos,index,endFunc){
    var matchExp = /\*[\w]+\.[\w]+/i;
    if(matchExp.test(userInfos[index].Nickname)){
        matchStr = matchExp.exec(userInfos[index].Nickname);
        domainStr = matchStr.toString().substr(1,matchStr.toString().length-1);
        nick_name = userInfos[index].Nickname.substr(0,matchStr.index);

        geturl = "https://www."+domainStr+"/.well-known/stellar.toml";
        http.get(geturl)
            .success(function(data,status,header,config){
                console.log("[success:data] = \r\n",data);
                console.log("[success:status] = \r\n",status);
                //console.log("[success:header] = \r\n",header);
                //console.log("[success:config] = \r\n",config);
                if(status == 200 && data != null){
                    //federationUrl =
                    matchExp = /[a-zA-z]+:\/\/[^s]*\/federation/i;
                    if(matchExp.test(data)){
                        geturl = matchExp.exec(data).toString();
                        geturl += "?q=" + nick_name + "*"+domainStr+"&type=name";
                        http.get(geturl)
                            .success(function(data,status,header,config){
                                console.log("success = "+domainStr + "\r\n",data);
                                endFunc(data,status,userIndex,userInfos,index);
                            })
                            .error(function(data,status,header,config){
                                console.log("error = "+domainStr + "\r\n",data);
                                endFunc(data,status,userIndex,userInfos,index);
                            });
                    } else {
                        endFunc(null,404,userIndex,userInfos,index);
                    }
                } else {
                    endFunc(null,status,userIndex,userInfos,index);
                }
            })
            .error(function(data,status,header,config){
                console.log("[error:data] = \r\n",data);
                console.log("[error:status] = \r\n",status);
                console.log("[error:header] = \r\n",header);
                endFunc(data,status,userIndex,userInfos,index);
                //console.log("[error:status] = \r\n",status);
                //console.log("[error:header] = \r\n",header);
                //console.log("[error:config] = \r\n",config);
            });
    } else {
        geturl = LEDGERCN_FEDERATION_SERVER + "?q=" + userInfos[index].Nickname + "*ledgercn.com&type=name";
        http.get(geturl).
            success(function (data, status, headers, config){
                console.log("success\r\n",data);
                endFunc(data,status,userIndex,userInfos,index);
            }).
            error(function (data, status, headers, config){
                console.log("error\r\n",data);
                endFunc(data,status,userIndex,userInfos,index);
            });
    }
};



function FriendGroupInfo(){
    this.GroupName = "";
    this.Friends = new ArrayList();
}

function FriendInfo(){
    this.id = 0;
    this.nickName = "";
    this.PublicAddr = "";
    this.IsFriend = false;
    this.AddBtnIcon = "fa-plus-circle";
}

FriendInfo.prototype.getPostArgs = function(){
    return POST_MARK_WALLET_NICKNAME + "=" + encodeURIComponent(this.nickName) + "&" +
        POST_MARK_WALLET_PUBADDR + "=" + encodeURIComponent(this.PublicAddr) + "&" +
        POST_MARK_WALLET_ID + "=" + this.id;
};




function proAccountHistory(){
    this.First_token = 0;
    this.First_ledger = 0;
    this.Last_token = 0;
    this.Last_ledger = 0;
    this.Breakout = false;
    this.Historys = new(Array);
}

proAccountHistory.prototype.AddHistoryDatas = function(datas,isDesc,paging_token,ledger){
    if(datas == null || datas.length == 0){
        return;
    }

    startIndex = 0;
    stepIndex = 1;
    if(!isDesc) {
        startIndex = datas.length - 1;
        stepIndex = -1;
    }

    for(var i = startIndex ; (i >= 0 && i < datas.length) ; i=i+stepIndex){
        if(datas[i] != null){
            this.Historys[this.Historys.length] = datas[i];
        }
        if(this.First_token < paging_token){
            this.First_token = paging_token;
            this.First_ledger = ledger;
        }
        if(this.Last_token == 0 || (this.Last_token > paging_token)){
            this.Last_token = paging_token;
            this.Last_ledger = ledger;
        }
    }
};

proAccountHistory.prototype.getQuaryParam = function(isNext){
    var ret = "?";
    if(isNext){
        ret += "order=desc&limit=10&cursor=";
        if(this.Last_token > 0){
            ret += this.Last_token;
        }
    } else {
        ret += "order=asc&limit=10&cursor=";
        if(this.First_token > 0){
            ret += this.First_token;
        }
    }
    return ret;
};

function proAccountInfo(){
    this.loading = false;
    this.NickName = "";
    this.PublicAddr = "";
    this.SecretKey = "";
    this.UserGA = false;
    this.LogUserAuth = "";
    this.LoginUser = "";
    this.Info = null;
    this.Actived = false;
    this.ErrorMessage = "";
    this.AccHistorys = new(proAccountHistory);
}

proAccountInfo.prototype.getNickNameId = function(){
    return this.NickName.replace('.','__').replace('#','__');
};

proAccountInfo.prototype.getBalanceShort = function() {
    if(this.Actived && this.Info != null){
        return shortBalance(this.Info.Balance_XLM);
    }
    return "-";
};

proAccountInfo.prototype.getPublicAddrShort = function(length) {
    return getAddressShort(this.PublicAddr,length);
};

proAccountInfo.prototype.getPostArgs = function(){
    return POST_MARK_WALLET_NICKNAME + "=" + encodeURIComponent(this.NickName) + "&" +
        POST_MARK_USER_NAME + "=" + encodeURIComponent(this.LoginUser) + "&" +
        POST_MARK_WALLET_PUBADDR + "=" + this.PublicAddr + "&" +
        POST_MARK_WALLET_SKEY + "=" + encodeURIComponent(this.SecretKey) + "&" +
        POST_MARK_MODIFY_GA + "=" + this.UserGA + "&" +
        POST_MARK_AUTHCODE + "=" + encodeURIComponent(this.LogUserAuth);
};

proAccountInfo.prototype.copyFrom = function(src){
    this.NickName = src.NickName;
    this.PublicAddr = src.PublicAddr;
    this.SecretKey = src.SecretKey;
    this.UserGA = src.UserGA;
    this.LogUserAuth = src.LogUserAuth;
    this.LoginUser = src.LoginUser;
};

function shortBalance(balance){
    if(balance == null && balance == "")
        return "-";
    ind = balance.indexOf(".");
    if(ind == -1)
        return balance;
    tmp = balance.substring(0,ind);
    return tmp;
}
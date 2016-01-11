

var ZH_CN_LANG = "ZH-CN";
var EN_LANG = "EN";
var LANGUAGE_CHANGED = "LANGUAGE_CHANGED";
var ACCOUNT_CHANGED = "ACCOUNT_CHANGED";
var LOGIN_CHECK = "LOGIN_CHECK";
var BLOCK_VIEW = "BLOCK_VIEW";
var LIVE_NET = "LIVE";
var TEST_NET = "TEST";

var WAIT_ICON_STATE = "fa fa-spinner fa-pulse";

//var BACK_SERVICE_URL = "http://192.168.1.103:1234";
var BACK_SERVICE_URL = "http://115.28.68.33:1234";
var BACK_SERVICE_ACCOUNT = "account";
var BACK_SERVICE_RECAPTCHA = "recaptcha";
var BACK_SERVICE_AWALLET = "awallet";
var LEDGERCN_FEDERATION_SERVER = "http://115.28.68.33:1888/federation";
//var LEDGERCN_FEDERATION_SERVER = "http://192.168.1.103:1888/federation";

var POST_TYPE_FLAG             = "PostType";
var PT_CHECK_USERNAME          = "C0001";
var PT_CHECK_USERAUTH          = "C0002";
var PT_CHECK_GA_OPERA          = "C0003";
var PT_GET_WALLETS             = "C0004";
var PT_SEARCH_WALLETS          = "C0005";
var PT_GET_FRIENDS             = "C0006";
var PT_USER_REGISTRATION       = "R0001";
var PT_USER_MODIFY_PW          = "R0002";
var RT_USER_ADD_WALLET_ACCOUNT = "R0003";
var RT_UPDATE_WALLET_INFO      = "R0004";
var RT_USER_DEL_WALLET_ACCOUNT = "R0005";
var RT_USER_ADD_FRIEND         = "R0006";
var RT_USER_DEL_FRIEND         = "R0007";
var RT_UPDATE_WALLET_SSKEY     = "R0008";
var PT_USER_LOGIN              = "L0001";
var PT_USER_ACTIVE             = "L0002";

var POST_MARK_CHECK_USERNAME  = "checkUName";
var POST_MARK_REG_USERNAME    = "regUN";
var POST_MARK_REG_PASSWORD    = "regPW";
var POST_MARK_REG_VICODE      = "regViCode";
var POST_MARK_REG_VALUE1      = "regV1";
var POST_MARK_REG_VALUE2      = "regV2";
var POST_MARK_REG_VALUE3      = "regV3";
var POST_MARK_REG_OPERA       = "regOper";
var POST_MARK_USER_NAME       = "un";
var POST_MARK_PASS_WORD       = "pw";
var POST_MARK_NEW_PASS_WORD   = "npw";
var POST_MARK_VICODE          = "vic";
var POST_MARK_GACODE          = "gac";
var POST_MARK_GAKEY           = "gakey";
var POST_MARK_AUTHCODE        = "auth";
var POST_MARK_HEART           = "hbit";
var POST_MARK_FID             = "fid";
var POST_MARK_TID             = "tid";
var POST_MARK_MODIFY_GA       = "mgatype";
var POST_MARK_MODIFY_NICKNAME = "mnkname";
var POST_MARK_WALLET_NICKNAME = "nkname";
var POST_MARK_WALLET_ID       = "wid";
var POST_MARK_WALLET_PUBADDR  = "paddr";
var POST_MARK_WALLET_SKEY     = "skey";

var GA_PT_MODIFY_NEW    = "new";
var GA_PT_MODIFY_GET    = "get";
var GA_PT_MODIFY_DELETE = "delete";

var COOKIE_KEY_USERNAME    = "uname";
var COOKIE_KEY_USERAUTH    = "auth";
var COOKIE_KEY_USERLEVEL   = "ulvl";
var COOKIE_KEY_SECRETSTR   = "ss";

var UserInfo = {
    UserEmailAddr:"",
    UserPassword:""
};

function saveToCookie(c,key,val,d){
    var expireDate = new Date();
    if (d == null) {
        expireDate.setDate(expireDate.getDate() + 30);
        c.put(key,val,{'expires': expireDate,'path':'/'});
    } else if (d == -1) {
        c.put(key,val,{'expires': 0,'path':'/'});
    } else {
        expireDate.setDate(expireDate.getDate() + d);
        c.put(key,val,{'expires': expireDate,'path':'/'});
    }
}

function transform(data){
    return data;
}

// 格式为YYYY-MM-DD HH:mm:ss或者null，如果为null则返回当前日期
function getDate(datetimeStr){
    if(datetimeStr == null || datetimeStr == ""){
        dt = new Date();
        return new Date(dt.getFullYear(),dt.getMonth(),dt.getDate()).getTime();
    }
    dt = new Date(datetimeStr);
    return new Date(dt.getFullYear(),dt.getMonth(),dt.getDate()).getTime();
}

function getLocalDateTimeString(dt,forceLong,language){
    dtime = new Date(dt);
    dttime = getDate(dt);
    ntime = getDate();

    if(!forceLong && (ntime - dttime < 86400000)){ // 1天之内的只显示时间，不显示日期
        return pad(dtime.getHours(),2) + ":" + pad(dtime.getMinutes(),2) + ":" + pad(dtime.getSeconds(),2);
    }
    if (language == ZH_CN_LANG){
        return dtime.getFullYear() + "-" + pad(dtime.getMonth()+1,2) + "-" + pad(dtime.getDate(),2) + " " +  pad(dtime.getHours(),2) + ":" + pad(dtime.getMinutes(),2) + ":" + pad(dtime.getSeconds(),2);
    }
    return pad(dtime.getMonth()+1,2) + "/" + pad(dtime.getDate(),2) + "/" + dtime.getFullYear() + " " +  pad(dtime.getHours(),2) + ":" + pad(dtime.getMinutes(),2) + ":" + pad(dtime.getSeconds(),2);
}

function addDate(srcDate,days){
    return srcDate + (86400000 * days);
}

function getAddressShort(addr, length){
    //console.log("getAddressShort\r\n",addr);
    if (addr == ""){
        return "-"
    }
    if (length == null){
        length = 12
    }
    if (length > addr.length){
        length = addr.length;
    }
    if (length == addr.length){
        return addr;
    }

    return (addr.substr(0,length/2) + " ...... " + addr.substr(addr.length - (length/2) - 1,length/2+1));
}

function pad(num, n) {
    var len = num.toString().length;
    while(len < n) {
        num = "0" + num;
        len++;
    }
    return num;
}
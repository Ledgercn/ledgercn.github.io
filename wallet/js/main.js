

var ZH_CN_LANG = "ZH-CN";
var EN_LANG = "EN";
var LANGUAGE_CHANGED = "LANGUAGE_CHANGED";
var ACCOUNT_CHANGED = "ACCOUNT_CHANGED";
var LOGIN_CHECK = "LOGIN_CHECK";
var BLOCK_VIEW = "BLOCK_VIEW";
var LIVE_NET = "LIVE";
var TEST_NET = "TEST";

var WAIT_ICON_STATE = "fa fa-spinner fa-pulse";

var BACK_SERVICE_URL = "http://localhost:1234";
var BACK_SERVICE_ACCOUNT = "account";
var BACK_SERVICE_RECAPTCHA = "recaptcha";

var POST_TYPE_FLAG       = "PostType";
var PT_CHECK_USERNAME    = "C0001";
var PT_CHECK_USERAUTH    = "C0002";
var PT_CHECK_GA_OPERA    = "C0003";
var PT_USER_REGISTRATION = "R0001";
var PT_USER_MODIFY_PW    = "R0002";
var PT_USER_LOGIN        = "L0001";
var PT_USER_ACTIVE       = "L0002";

var POST_MARK_CHECK_USERNAME = "checkUName";
var POST_MARK_REG_USERNAME   = "regUN";
var POST_MARK_REG_PASSWORD   = "regPW";
var POST_MARK_REG_VICODE     = "regViCode";
var POST_MARK_REG_VALUE1     = "regV1";
var POST_MARK_REG_VALUE2     = "regV2";
var POST_MARK_REG_VALUE3     = "regV3";
var POST_MARK_REG_OPERA      = "regOper";
var POST_MARK_USER_NAME      = "un";
var POST_MARK_PASS_WORD      = "pw";
var POST_MARK_NEW_PASS_WORD  = "npw";
var POST_MARK_VICODE         = "vic";
var POST_MARK_GACODE         = "gac";
var POST_MARK_AUTHCODE       = "auth";
var POST_MARK_HEART          = "hbit";
var POST_MARK_FID            = "fid";
var POST_MARK_TID            = "tid";
var POST_MARK_MODIFY_GA      = "mgatype";

var GA_PT_MODIFY_NEW    = "new";
var GA_PT_MODIFY_GET    = "get";
var GA_PT_MODIFY_DELETE = "delete";

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
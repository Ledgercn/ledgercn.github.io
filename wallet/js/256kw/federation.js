
function qiwa_federationNickname(http,historyData){
    if(historyData.isFederation) {
        return;
    }
    geturl = QIWA_FEDERATION_SERVER;

    switch (historyData.Type){
        case PAYMENT_TYPE:
            if(historyData.SubType == PAYMENT_OUT) {
                geturl += "?q=" + historyData.To;
            }
            else{
                geturl += "?q=" + historyData.SourceAccount;
            }
            break;
        case CREATE_TYPE:
            if (historyData.SubType == CREATE_OUT){
                geturl += "?q=" + historyData.Account;
            } else {
                geturl += "?q=" + historyData.SourceAccount;
            }
            break;
        case MERGE_TYPE:
            if(historyData.SubType == MERGE_DESTROY){
                geturl += "?q=" + historyData.Into;
            } else {
                geturl += "?q=" + historyData.SourceAccount;
            }
            break;
        case CHANGE_TRUST_TYPE:
            geturl += "?q=" + historyData.AssetIssuer;
            break;
        default:
            return;
    }

    geturl += "&type=id";

    http.get(geturl)
        .success(function (data,header,config,status) {
            console.log("success->data ============ \r\n", data);
            if(data.stellar_address != null){
                historyData.addrTitle = data.stellar_address;
            }
        })
        .error(function (data,header,config,status) {
            //console.log("error->data ============ \r\n", data);
            //console.log("error->header ============ \r\n", header);
            //console.log("error->config ============ \r\n", config);
            //console.log("error->status ============ \r\n", status);
        });
}
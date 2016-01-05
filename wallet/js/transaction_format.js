
function formatPaymentOperationEx(opera,lang){
    formatPaymentOperation.apply(this,arguments);
    baseDetails = opera.Details;
    if(lang == ZH_CN_LANG){
        opera.Details = "日期/时间:\r\n> " + getLocalDateTimeString(opera.created_datetime,true,lang) + "\r\n";
        opera.Details += "发起账户:\r\n> " + opera.TransSourceAccount + "\r\n" + baseDetails;
        if(opera.SubType == PAYMENT_IN) {
            opera.Title = "收入-";
            opera.subTitle = opera.Amount;
            opera.addrTitle = getAddressShort(opera.SourceAccount);
        }
        else if(opera.SubType == PAYMENT_OUT) {
            opera.Title = "支出-";
            opera.addrTitle = getAddressShort(opera.To);
        }
        else{
            opera.Title = "(@@)-";
            opera.addrTitle = getAddressShort(opera.SourceAccount);
        }
        opera.subTitle = opera.Amount;

        if(opera.AssetCode != null && opera.AssetCode != ""){
            opera.Title += opera.AssetCode;

        }else{
            opera.Title += "XLM";
        }
        opera.Details += "\r\nFee:\r\n> " + opera.fee_paid;
        opera.Details += "\r\nMemo( " + opera.memodef.memo_type + " ):\r\n> " + opera.memodef.memo;

    } else {
        opera.Details = "Date/Time:\r\n> " + getLocalDateTimeString(opera.created_datetime,true,lang) + "\r\n";
        opera.Details += "Transaction Account:\r\n> " + opera.TransSourceAccount + "\r\n" + baseDetails;
        if(opera.SubType == PAYMENT_IN){
            opera.Title = "Earning-";
            opera.addrTitle = getAddressShort(opera.SourceAccount);
        }
        else if(opera.SubType == PAYMENT_OUT){
            opera.Title = "Expenditure-";
            opera.addrTitle = getAddressShort(opera.To);
        }
        else{
            opera.Title = "(@@)-";
            opera.addrTitle = getAddressShort(opera.SourceAccount);
        }
        opera.subTitle = opera.Amount;

        if(opera.AssetCode != null && opera.AssetCode != ""){
            opera.Title += opera.AssetCode;
        }else{
            opera.Title += "XLM";
        }
        opera.Details += "\r\nFee:\r\n> " + opera.fee_paid;
        opera.Details += "\r\nMemo( " + opera.memodef.memo_type + " ):\r\n> " + opera.memodef.memo;
    }

    return opera;
}

function formatCreateOperationEx(opera,lang){
    formatCreateOperation.apply(this,arguments);
    baseDetails = opera.Details;
    if(lang == ZH_CN_LANG){
        opera.Details = "日期/时间:\r\n> " + getLocalDateTimeString(opera.created_datetime,true,lang) + "\r\n";
        opera.Details += "发起账户:\r\n> " + opera.TransSourceAccount + "\r\n" + baseDetails;
        if(opera.SubType == CREATE_IN){
            opera.Title = "创建-当前账户";
            opera.addrTitle = getAddressShort(opera.SourceAccount);
        } else if (opera.SubType == CREATE_OUT){
            opera.Title = "创建-其他账户";
            opera.addrTitle = getAddressShort(opera.Account);
        } else {
            opera.Title = "创建账户";
            opera.addrTitle = getAddressShort(opera.SourceAccount);
        }
        opera.subTitle = opera.StartingBalance;
        opera.Details += "\r\nFee:\r\n> " + opera.fee_paid;
        opera.Details += "\r\nMemo( " + opera.memodef.memo_type + " ):\r\n> " + opera.memodef.memo;
    }else{
        opera.Details = "Date/Time:\r\n> " + getLocalDateTimeString(opera.created_datetime,true,lang) + "\r\n";
        opera.Details += "Transaction Account:\r\n> " + opera.TransSourceAccount + "\r\n" + baseDetails;
        if(opera.SubType == CREATE_IN){
            opera.Title = "Create-self account";
            opera.addrTitle = getAddressShort(opera.SourceAccount);
        } else if (opera.SubType == CREATE_OUT){
            opera.Title = "Create-Other account";
            opera.addrTitle = getAddressShort(opera.Account);
        } else {
            opera.Title = "Create account";
            opera.addrTitle = getAddressShort(opera.SourceAccount);
        }
        opera.subTitle = opera.StartingBalance;
        opera.Details += "\r\nFee:\r\n> " + opera.fee_paid;
        opera.Details += "\r\nMemo( " + opera.memodef.memo_type + " ):\r\n> " + opera.memodef.memo;
    }
    return opera;
}

function formatMergeOperationEx(opera,lang){
    formatMergeOperation.apply(this,arguments);
    baseDetails = opera.Details;
    if(lang == ZH_CN_LANG){
        opera.Details = "日期/时间:\r\n> " + getLocalDateTimeString(opera.created_datetime,true,lang) + "\r\n";
        opera.Details += "发起账户:\r\n> " + opera.TransSourceAccount + "\r\n" + baseDetails;
        if(opera.SubType == MERGE_IN){
            opera.Title = "合并-获得";
            opera.subTitle = getAddressShort(opera.TransSourceAccount,8);
            opera.addrTitle = getAddressShort(opera.SourceAccount);
        } else if (opera.SubType == MERGE_DESTROY){
            opera.Title = "合并-销毁";
            opera.subTitle = getAddressShort(opera.TransSourceAccount,8);
            opera.addrTitle = getAddressShort(opera.Into);
        } else {
            opera.Title = "合并账户";
            opera.subTitle = getAddressShort(opera.Account,8);
            opera.addrTitle = getAddressShort(opera.SourceAccount);
        }
        opera.Details += "\r\nFee:\r\n> " + opera.fee_paid;
        opera.Details += "\r\nMemo( " + opera.memodef.memo_type + " ):\r\n> " + opera.memodef.memo;
    }else{
        opera.Details = "Date/Time:\r\n> " + getLocalDateTimeString(opera.created_datetime,true,lang) + "\r\n";
        opera.Details += "Transaction Account:\r\n> " + opera.TransSourceAccount + "\r\n" + baseDetails;
        if(opera.SubType == MERGE_IN){
            opera.Title = "Merge-Get";
            opera.subTitle = getAddressShort(opera.Into,8);
            opera.addrTitle = getAddressShort(opera.SourceAccount);
        } else if (opera.SubType == MERGE_DESTROY){
            opera.Title = "Merge-Destroy";
            opera.subTitle = getAddressShort(opera.Account,8);
            opera.addrTitle = getAddressShort(opera.Into);
        } else {
            opera.Title = "Merge account";
            opera.subTitle = getAddressShort(opera.Account,8);
            opera.addrTitle = getAddressShort(opera.SourceAccount);
        }
        opera.Details += "\r\nFee:\r\n> " + opera.fee_paid;
        opera.Details += "\r\nMemo( " + opera.memodef.memo_type + " ):\r\n> " + opera.memodef.memo;
    }
    return opera;
}

function formatChangeTrustOperationEx(opera,lang){
    formatChangeTrustOperation.apply(this,arguments);
    baseDetails = opera.Details;
    if(lang == ZH_CN_LANG){
        opera.Details = "日期/时间:\r\n> " + getLocalDateTimeString(opera.created_datetime,true,lang) + "\r\n";
        opera.Details += "发起账户:\r\n> " + opera.TransSourceAccount + "\r\n" + baseDetails;
        if (opera.SubType == CHANGE_TRUST_ON){
            opera.Title = "信任-" + opera.AssetCode;
        }else{
            opera.Title = "变更-" + opera.AssetCode;
        }
        opera.subTitle = getAddressShort(opera.Trustee,8);
        opera.addrTitle = getAddressShort(opera.AssetIssuer);
        opera.Details += "\r\nFee:\r\n> " + opera.fee_paid;
        opera.Details += "\r\nMemo( " + opera.memodef.memo_type + " ):\r\n> " + opera.memodef.memo;
    }else{
        opera.Details = "Date/Time:\r\n> " + getLocalDateTimeString(opera.created_datetime,true,lang) + "\r\n";
        opera.Details += "Transaction Account:\r\n> " + opera.TransSourceAccount + "\r\n" + baseDetails;
        if (opera.SubType == CHANGE_TRUST_ON){
            opera.Title = "Trust-" + opera.AssetCode;
        }else{
            opera.Title = "Change-" + opera.AssetCode;
        }
        opera.subTitle = getAddressShort(opera.Trustee,8);
        opera.addrTitle = getAddressShort(opera.AssetIssuer);
        opera.Details += "\r\nFee:\r\n> " + opera.fee_paid;
        opera.Details += "\r\nMemo( " + opera.memodef.memo_type + " ):\r\n> " + opera.memodef.memo;
    }
    return opera;
}

function formatManageOfferOperationEx(opera,lang){
    formatManageOfferOperation.apply(this,arguments);
    baseDetails = opera.Details;
    opera.addrTitle = getAddressShort(opera.Buying.Asset_Issuer);
    if(lang == ZH_CN_LANG) {
        opera.Details = "日期/时间:\r\n> " + getLocalDateTimeString(opera.created_datetime,true,lang) + "\r\n";
        opera.Details += "发起账户:\r\n> " + opera.TransSourceAccount + "\r\n" + baseDetails;
        opera.Title = "买:" + opera.Buying.Asset_Code + "[" + opera.Price + "]";
        opera.subTitle = "卖:" + opera.Selling.Asset_Code + "[" + opera.Amount + "]";
        opera.Details += "\r\nFee:\r\n> " + opera.fee_paid;
        opera.Details += "\r\nMemo( " + opera.memodef.memo_type + " ):\r\n> " + opera.memodef.memo;
    }else{
        opera.Details = "Date/Time:\r\n> " + getLocalDateTimeString(opera.created_datetime,true,lang) + "\r\n";
        opera.Details += "Transaction Account:\r\n> " + opera.TransSourceAccount + "\r\n" + baseDetails;
        opera.Title = "Buy:" + opera.Buying.Asset_Code + "[" + opera.Price + "]";
        opera.subTitle = "Sell:" + opera.Selling.Asset_Code + "[" + opera.Amount + "]";
        opera.Details += "\r\nFee:\r\n> " + opera.fee_paid;
        opera.Details += "\r\nMemo( " + opera.memodef.memo_type + " ):\r\n> " + opera.memodef.memo;
    }
    return opera;
}

function formatSetOptionsOperationEx(opera,lang){
    formatSetOptionsOperation.apply(this,arguments);
    baseDetails = opera.Details;
    opera.addrTitle = getAddressShort(opera.TransSourceAccount);
    if(lang == ZH_CN_LANG) {
        opera.Details = "日期/时间:\r\n> " + getLocalDateTimeString(opera.created_datetime,true,lang) + "\r\n";
        opera.Details += "发起账户:\r\n> " + opera.TransSourceAccount + "\r\n" + baseDetails;
        opera.Title = "设置";
        opera.Details += "\r\nFee:\r\n> " + opera.fee_paid;
        opera.Details += "\r\nMemo( " + opera.memodef.memo_type + " ):\r\n> " + opera.memodef.memo;
    }else{
        opera.Details = "Date/Time:\r\n> " + getLocalDateTimeString(opera.created_datetime,true,lang) + "\r\n";
        opera.Details += "Transaction Account:\r\n> " + opera.TransSourceAccount + "\r\n" + baseDetails;
        opera.Title = "Set Options";
        opera.Details += "\r\nFee:\r\n> " + opera.fee_paid;
        opera.Details += "\r\nMemo( " + opera.memodef.memo_type + " ):\r\n> " + opera.memodef.memo;
    }
    opera.subTitle = "-";
    return opera;
}
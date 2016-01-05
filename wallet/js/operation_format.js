
function formatBaseOperation(opera,lang){
    if(lang == ZH_CN_LANG){
        opera.Title = "操作:" + opera.Type;
        opera.Details = "源账户:\r\n\t" + opera.SourceAccount;
        opera.Details += "\r\nHash:\r\n\t" + opera.Hash;
    } else {
        opera.Title = "Opera:" + opera.Type;
        opera.Details = "Source Account:\r\n\t" + opera.SourceAccount;
        opera.Details += "\r\nHash:\r\n\t" + opera.Hash;
    }
    opera.DetailRows = 4;
    return opera;
}

function formatPaymentOperation(opera,lang){
    opera.DetailRows = 4;
    if(lang == ZH_CN_LANG){
        opera.Details = "源账户:\r\n> " + opera.SourceAccount;
        opera.Details += "\r\nHash:\r\n> " + opera.Hash;

        if(opera.SubType == PAYMENT_IN) {
            opera.Title = "收入-";
            opera.Details += "\r\n付款来源:\r\n> " + opera.From;
            opera.DetailRows += 2;
        }
        else if(opera.SubType == PAYMENT_OUT) {
            opera.Title = "支出-";
            opera.Details += "\r\n付款去向:\r\n> " + opera.To;
            opera.DetailRows += 2;
        }
        else{
            opera.Title = "(@@)-";
            opera.Details += "\r\n付款源账户:\r\n> " + opera.From;
            opera.Details += "\r\n付款目标账户:\r\n> " + opera.To;
            opera.DetailRows += 4;
        }

        if(opera.AssetCode != null && opera.AssetCode != ""){
            opera.Title += "记账:"+ opera.AssetCode + "-";
            opera.Details += "\r\n支付种类:\r\n> " + opera.AssetCode;
            opera.Details += "\r\n网关地址:\r\n> " + opera.AssetIssuer;
            opera.Details += "\r\n金额:\r\n> " + opera.Amount;
            opera.DetailRows += 6;

        }else{
            opera.Title += "XLM-";
            opera.Details += "\r\n恒星币:\r\n> " + opera.Amount + " Lumens";
            opera.DetailRows += 2;
        }
    } else {
        opera.Details = "Source Account:\r\n> " + opera.SourceAccount;
        opera.Details += "\r\nHash:\r\n> " + opera.Hash;

        if(opera.SubType == PAYMENT_IN){
            opera.Title = "Earning-";
            opera.Details += "\r\nFrom:\r\n> " + opera.From;
            opera.DetailRows += 2;
        }
        else if(opera.SubType == PAYMENT_OUT){
            opera.Title = "Expenditure-";
            opera.Details += "\r\nTo:\r\n> " + opera.To;
            opera.DetailRows += 2;
        }
        else{
            opera.Title = "(@@)-";
            opera.Details += "\r\nFrom:\r\n> " + opera.From;
            opera.Details += "\r\nTo:\r\n> " + opera.To;
            opera.DetailRows += 4;
        }

        if(opera.AssetCode != null && opera.AssetCode != ""){
            opera.Title += "Credit:" + opera.AssetCode + "-";
            opera.Details += "\r\nCode:\r\n> " + opera.AssetCode;
            opera.Details += "\r\nIssuer:\r\n> " + opera.AssetIssuer;
            opera.Details += "\r\nAmount:\r\n> " + opera.Amount;
            opera.DetailRows += 6;
        }else{
            opera.Title += "XLM-";
            opera.Details += "\r\nXLM:\r\n> " + opera.Amount + " Lumens";
            opera.DetailRows += 2;
        }
    }

    opera.Title += opera.Amount;

    return opera;
}

function formatCreateOperation(opera,lang){
    opera.DetailRows = 4;
    if(lang == ZH_CN_LANG){
        opera.Details = "源账户:\r\n> " + opera.SourceAccount;
        opera.Details += "\r\nHash:\r\n> " + opera.Hash;

        if(opera.SubType == CREATE_IN){
            opera.Title = "创建-当前账户-";
            opera.Details += "\r\n出资账户:\r\n> " + opera.Funder;
            opera.DetailRows += 2;
        } else if (opera.SubType == CREATE_OUT){
            opera.Title = "创建-其他账户-";
            opera.Details += "\r\n建立账户:\r\n> " + opera.Account;
            opera.DetailRows += 2;
        } else {
            opera.Title = "创建账户-";
            opera.Details += "\r\n出资账户:\r\n> " + opera.Funder;
            opera.Details += "\r\n建立账户:\r\n> " + opera.Account;
            opera.DetailRows += 4;
        }
        opera.Title += "金额(" + opera.StartingBalance + ")";
        opera.Details += "\r\n起始余额:\r\n> " + opera.StartingBalance;
        opera.DetailRows += 2;
    }else{
        opera.Details = "Source Account:\r\n> " + opera.SourceAccount;
        opera.Details += "\r\nHash:\r\n> " + opera.Hash;

        if(opera.SubType == CREATE_IN){
            opera.Title = "Create-Curr account-";
            opera.Details += "\r\nFunder:\r\n> " + opera.Funder;
            opera.DetailRows += 2;
        } else if (opera.SubType == CREATE_OUT){
            opera.Title = "Create-Other account-";
            opera.Details += "\r\nAccount:\r\n> " + opera.Account;
            opera.DetailRows += 2;
        } else {
            opera.Title = "Create account-";
            opera.Details += "\r\nFunder:\r\n> " + opera.Funder;
            opera.Details += "\r\nAccount:\r\n> " + opera.Account;
            opera.DetailRows += 4;
        }
        opera.Title += "Balance(" + opera.StartingBalance + ")";
        opera.Details += "\r\nStarting Balance:\r\n> " + opera.StartingBalance;
        opera.DetailRows += 2;
    }
    return opera;
}

function formatMergeOperation(opera,lang){
    opera.DetailRows = 4;
    if(lang == ZH_CN_LANG){
        opera.Details = "源账户:\r\n> " + opera.SourceAccount;
        opera.Details += "\r\nHash:\r\n> " + opera.Hash;

        if(opera.SubType == MERGE_IN){
            opera.Title = "合并-获得其他账户";
            opera.Details += "\r\n被销毁账户:\r\n> " + opera.Account;
            opera.DetailRows += 2;
        } else if (opera.SubType == MERGE_DESTROY){
            opera.Title = "合并-销毁当前账户";
            opera.Details += "\r\n目标账户:\r\n> " + opera.Into;
            opera.DetailRows += 2;
        } else {
            opera.Title = "合并账户";
            opera.Details += "\r\n被销毁账户:\r\n> " + opera.Account;
            opera.Details += "\r\n目标账户:\r\n> " + opera.Into;
            opera.DetailRows += 4;
        }
    }else{
        opera.Details = "Source Account:\r\n> " + opera.SourceAccount;
        opera.Details += "\r\nHash:\r\n> " + opera.Hash;

        if(opera.SubType == MERGE_IN){
            opera.Title = "Merge-Get other account";
            opera.Details += "\r\nDestroy Account:\r\n> " + opera.Account;
            opera.DetailRows += 2;
        } else if (opera.SubType == MERGE_DESTROY){
            opera.Title = "Merge-Destroy";
            opera.Details += "\r\nMerge into:\r\n> " + opera.Into;
            opera.DetailRows += 2;
        } else {
            opera.Title = "Merge account";
            opera.Details += "\r\nDestroy Account:\r\n> " + opera.Account;
            opera.Details += "\r\nMerge into:\r\n> " + opera.Into;
            opera.DetailRows += 4;
        }
    }
    return opera;
}

function formatChangeTrustOperation(opera,lang){
    opera.DetailRows = 4;
    if(lang == ZH_CN_LANG){
        opera.Details = "源账户:\r\n> " + opera.SourceAccount;
        opera.Details += "\r\nHash:\r\n> " + opera.Hash;

        if (opera.SubType == CHANGE_TRUST_ON){
            opera.Title = "信任其他网关-" + opera.AssetCode;
        }else{
            opera.Title = "变更信任-" + opera.AssetCode;
        }
        opera.Details += "\r\n受托人:\r\n> " + opera.Trustee;
        opera.Details += "\r\n委托人:\r\n> " + opera.Trustor;
        opera.Details += "\r\n类型:\r\n> " + opera.AssetCode;
        opera.Details += "\r\n网关地址:\r\n> " + opera.AssetIssuer;
    }else{
        opera.Details = "Source Account:\r\n> " + opera.SourceAccount;
        opera.Details += "\r\nHash:\r\n> " + opera.Hash;

        if (opera.SubType == CHANGE_TRUST_ON){
            opera.Title = "Trust Issuer-" + opera.AssetCode;
        }else{
            opera.Title = "Change Trust-" + opera.AssetCode;
        }
        opera.Details += "\r\nTrustee:\r\n> " + opera.Trustee;
        opera.Details += "\r\nTrustor:\r\n> " + opera.Trustor;
        opera.Details += "\r\nAssetCode:\r\n> " + opera.AssetCode;
        opera.Details += "\r\nAssetIssuer:\r\n> " + opera.AssetIssuer;
    }
    opera.DetailRows += 8;
    return opera;
}

function formatManageOfferOperation(opera,lang){
    opera.DetailRows = 4;
    if(lang == ZH_CN_LANG) {
        opera.Details = "源账户:\r\n> " + opera.SourceAccount;
        opera.Details += "\r\nHash:\r\n> " + opera.Hash;

        opera.Title = "订单管理-买:" + opera.Buying.Asset_Code + " 卖:" + opera.Selling.Asset_Code;

        opera.Details += "\r\n价格:\r\n> " + opera.Price;
        opera.Details += "\r\nAmount:\r\n> " + opera.Amount;
        opera.Details += "\r\n订单ID:\r\n> " + opera.OfferID;
        opera.Details += "\r\n买入信息:\r\n[\r\n\tCode:" + opera.Buying.Asset_Code + "\r\n\t网关:" + opera.Buying.Asset_Issuer + "\r\n]";
        opera.Details += "\r\n卖出信息:\r\n[\r\n\tCode:" + opera.Selling.Asset_Code + "\r\n\t网关:" + opera.Selling.Asset_Issuer + "\r\n]";
    }else{
        opera.Details = "Source Account:\r\n> " + opera.SourceAccount;
        opera.Details += "\r\nHash:\r\n> " + opera.Hash;

        opera.Title = "Offer-Buy:" + opera.Buying.Asset_Code + " Sell:" + opera.Selling.Asset_Code;

        opera.Details += "\r\nPrice:\r\n> " + opera.Price;
        opera.Details += "\r\nAmount:\r\n> " + opera.Amount;
        opera.Details += "\r\nOfferID:\r\n> " + opera.OfferID;
        opera.Details += "\r\nBuying Info:\r\n[\r\n\tCode:" + opera.Buying.Asset_Code + "\r\n\tIssuer:" + opera.Buying.Asset_Issuer + "\r\n]";
        opera.Details += "\r\nSelling Info:\r\n[\r\n\tCode:" + opera.Selling.Asset_Code + "\r\n\tIssuer:" + opera.Selling.Asset_Issuer + "\r\n]";
    }

    opera.DetailRows += 16;

    return opera;
}

function formatSetOptionsOperation(opera,lang){
    opera.DetailRows = 4;
    if(lang == ZH_CN_LANG) {
        opera.Details = "源账户:\r\n> " + opera.SourceAccount;
        opera.Details += "\r\nHash:\r\n> " + opera.Hash;

        opera.Title = "设置-更改:";
        if(opera.SignerKey != null && opera.SignerKey != ""){
            opera.Details += "\r\n签名账户:\r\n> " + opera.SignerKey;
            opera.DetailRows += 2;
            opera.Title += "签名账户;";
        }
        if(opera.SignerWeight != null && opera.SignerWeight != ""){
            opera.Details += "\r\n签名权重:\r\n> " + opera.SignerWeight;
            opera.DetailRows += 2;
            opera.Title += "签名权重;";
        }
        if(opera.InflationDest != null && opera.InflationDest != ""){
            opera.Details += "\r\n通胀地址:\r\n> " + opera.InflationDest;
            opera.DetailRows += 2;
            opera.Title += "通胀地址;";
        }
        if(opera.HomeDomain != null && opera.HomeDomain != ""){
            opera.Details += "\r\n主域:\r\n> " + opera.HomeDomain;
            opera.DetailRows += 2;
            opera.Title += "主域;";
        }

        if(opera.SetFlags != null && opera.SetFlags.length > 0){
            opera.Details += "\r\n设置标示:\r\n> " + opera.SetFlags;
            opera.DetailRows += 2;
            opera.Title += "设置标示;";
        }

        if(opera.ClearFlags != null && opera.ClearFlags.length > 0){
            opera.Details += "\r\n清除标示:\r\n> " + opera.ClearFlags;
            opera.DetailRows += 2;
            opera.Title += "清除标示;";
        }
    }else{
        opera.Details = "Source Account:\r\n> " + opera.SourceAccount;
        opera.Details += "\r\nHash:\r\n> " + opera.Hash;

        opera.Title = "Set Options-Operations";
        if(opera.SignerKey != null && opera.SignerKey != ""){
            opera.Details += "\r\nSigner Key:\r\n> " + opera.SignerKey;
            opera.DetailRows += 2;
            opera.Title += "SignerKey;";
        }
        if(opera.SignerWeight != null && opera.SignerWeight != ""){
            opera.Details += "\r\nSigner Weight:\r\n> " + opera.SignerWeight;
            opera.DetailRows += 2;
            opera.Title += "SignerWeight;";
        }
        if(opera.InflationDest != null && opera.InflationDest != ""){
            opera.Details += "\r\nInflation Destination:\r\n> " + opera.InflationDest;
            opera.DetailRows += 2;
            opera.Title += "Inflation;";
        }
        if(opera.HomeDomain != null && opera.HomeDomain != ""){
            opera.Details += "\r\nHome Domain:\r\n> " + opera.HomeDomain;
            opera.DetailRows += 2;
            opera.Title += "HomeDomain;";
        }

        if(opera.SetFlags != null && opera.SetFlags.length > 0){
            opera.Details += "\r\nSet Flags:\r\n> " + opera.SetFlags;
            opera.DetailRows += 2;
            opera.Title += "SetFlags;";
        }

        if(opera.ClearFlags != null && opera.ClearFlags.length > 0){
            opera.Details += "\r\nClear Flags:\r\n> " + opera.ClearFlags;
            opera.DetailRows += 2;
            opera.Title += "ClearFlags;";
        }
    }

    return opera;
}

var PaymentOperationEx = function(mainAddr){
    PaymentOperation.apply(this,arguments);
    this.created_datetime = "";
    this.TransSourceAccount = "";
    this.fee_paid = "";
    this.memodef = {
        memo:"",
        memo_type:"",
    };
    this.source_account_sequence = 0;
    this.subTitle = "";
    this.addrTitle = "";
    this.showDetails = false;

    this.DecodeBody = function(body,trans){
        this.created_datetime = trans.created_at;
        this.fee_paid = trans.fee_paid;
        this.memodef.memo = trans.memodef.memo;
        this.memodef.memo_type = trans.memodef.memo_type;
        this.TransSourceAccount = trans.source_account;
        this.Hash = trans.hash;
        this.source_account_sequence = trans.source_account_sequence;
        this.Type = PAYMENT_TYPE;
        if(body._attributes.sourceAccount != null){
            //console.log("body._attributes.sourceAccount\r\n",body._attributes.sourceAccount);
            if(body._attributes.sourceAccount._arm == "ed25519"){
                this.SourceAccount = StellarBase.encodeCheck("accountId", body._attributes.sourceAccount._value);
            }
        }
        if(body._attributes.body._value._attributes.destination._value){
            address = StellarBase.encodeCheck("accountId", body._attributes.body._value._attributes.destination._value);
            this.To = address;
            this.From = this.SourceAccount;
            if(this.From == ""){
                this.From = this.TransSourceAccount;
                this.SourceAccount = this.TransSourceAccount;
            }
            if(address == this.MainAddress){
                this.SubType = PAYMENT_IN;
            }else{
                this.SubType = PAYMENT_OUT;
            }
        }
        if(body._attributes.body._value._attributes.amount != null){
            high = body._attributes.body._value._attributes.amount.high;
            low = body._attributes.body._value._attributes.amount.low;
            if(high < 0){
                high += 4294967296;
            }
            if(low < 0){
                low += 4294967296;
            }
            value = (high*4294967296+low)/10000000.0;
            this.Amount = ""+value;
        }
        if(body._attributes.body._value._attributes.asset._value != null){
            this.AssetType = body._attributes.body._value._attributes.asset._arm;
            this.AssetCode = String(body._attributes.body._value._attributes.asset._value._attributes.assetCode);
            this.AssetIssuer = StellarBase.encodeCheck("accountId", body._attributes.body._value._attributes.asset._value._attributes.issuer._value);
        }
    }
};

var MergeOperationEx = function(mainAddr){
    MergeOperation.apply(this,arguments);
    this.created_datetime = "";
    this.TransSourceAccount = "";
    this.fee_paid = "";
    this.memodef = {
        memo:"",
        memo_type:"",
    };
    this.source_account_sequence = 0;
    this.subTitle = "";
    this.addrTitle = "";
    this.showDetails = false;

    this.DecodeBody = function(body,trans){
        this.created_datetime = trans.created_at;
        this.fee_paid = trans.fee_paid;
        this.memodef.memo = trans.memodef.memo;
        this.memodef.memo_type = trans.memodef.memo_type;
        this.TransSourceAccount = trans.source_account;
        this.Hash = trans.hash;
        this.source_account_sequence = trans.source_account_sequence;
        this.Type = MERGE_TYPE;

        if(body._attributes.sourceAccount != null){
            //console.log("body._attributes.sourceAccount\r\n",body._attributes.sourceAccount);
            if(body._attributes.sourceAccount._arm == "ed25519"){
                this.Account = StellarBase.encodeCheck("accountId", body._attributes.sourceAccount._value);
                this.SourceAccount = this.Account;
            }
        }
        if(this.SourceAccount == ""){
            this.SourceAccount = this.TransSourceAccount;
        }

        if(body._attributes.body._value._arm == "ed25519"){
            this.Into = StellarBase.encodeCheck("accountId", body._attributes.body._value._value);
        }

        if(this.Into == this.MainAddress){
            this.SubType = MERGE_IN;
        }else if(this.Account == this.MainAddress){
            this.SubType = MERGE_DESTROY;
        }
    }
};

var CreateOperationEx = function(mainAddr){
    CreateOperation.apply(this,arguments);
    this.created_datetime = "";
    this.TransSourceAccount = "";
    this.fee_paid = "";
    this.memodef = {
        memo:"",
        memo_type:"",
    };
    this.source_account_sequence = 0;
    this.subTitle = "";
    this.addrTitle = "";
    this.showDetails = false;

    this.DecodeBody = function(body,trans){
        this.created_datetime = trans.created_at;
        this.fee_paid = trans.fee_paid;
        this.memodef.memo = trans.memodef.memo;
        this.memodef.memo_type = trans.memodef.memo_type;
        this.TransSourceAccount = trans.source_account;
        this.Hash = trans.hash;
        this.source_account_sequence = trans.source_account_sequence;
        this.Type = CREATE_TYPE;

        if(body._attributes.sourceAccount != null){
            //console.log("body._attributes.sourceAccount\r\n",body._attributes.sourceAccount);
            if(body._attributes.sourceAccount._arm == "ed25519"){
                this.Funder = StellarBase.encodeCheck("accountId", body._attributes.sourceAccount._value);
            }
        }

        if(this.Funder == ""){
            if(body._attributes.body.sourceAccount != null){
                //console.log("body._attributes.sourceAccount\r\n",body._attributes.sourceAccount);
                if(body._attributes.body.sourceAccount._arm == "ed25519"){
                    this.Funder = StellarBase.encodeCheck("accountId", body._attributes.body.sourceAccount._value);
                }
            }
        }

        if(this.Funder == ""){
            this.Funder = this.TransSourceAccount;
        }

        if(body._attributes.body != null){
            if(body._attributes.body._value._attributes.destination._arm == "ed25519"){
                this.Account = StellarBase.encodeCheck("accountId", body._attributes.body._value._attributes.destination._value);
            }

            if(body._attributes.body._value._attributes.startingBalance != null){
                high = body._attributes.body._value._attributes.startingBalance.high;
                low = body._attributes.body._value._attributes.startingBalance.low;
                if(high < 0){
                    high += 4294967296;
                }
                if(low < 0){
                    low += 4294967296;
                }
                value = (high*4294967296+low)/10000000.0;
                this.StartingBalance = ""+value;
            }
        }
        if(this.Account == "" && this.Funder != this.MainAddress){
            if(body._attributes.tx._attributes.operations != null){
                for( var i = 0 ; i < body._attributes.tx._attributes.operations.length ; ++i){
                    opera = body._attributes.tx._attributes.operations[0];

                    if(opera._attributes.body._value._attributes.startingBalance != null){
                        high = opera._attributes.body._value._attributes.startingBalance.high;
                        low = opera._attributes.body._value._attributes.startingBalance.low;
                        if(high < 0){
                            high += 4294967296;
                        }
                        if(low < 0){
                            low += 4294967296;
                        }
                        value = (high*4294967296+low)/10000000.0;
                        this.StartingBalance = ""+value;
                    }

                    if(opera._attributes.body._value._attributes.destination._arm == "ed25519"){
                        account = StellarBase.encodeCheck("accountId", opera._attributes.body._value._attributes.destination._value);
                        if(account == this.MainAddress){
                            this.Account = account;
                            break;
                        }
                    }
                }
            }
        }

        if(this.Account == this.MainAddress){
            this.SubType = CREATE_IN;
            this.SourceAccount = this.Funder;
        } else if(this.Funder == this.MainAddress) {
            this.SubType = CREATE_OUT;
            this.SourceAccount = this.Funder;
        } else {
            this.SourceAccount = this.TransSourceAccount;
            this.SubType = CREATE_OTHER;
        }
    }
};

var ManageOfferOperationEx = function(mainAddr){
    ManageOfferOperation.apply(this,arguments);
    this.created_datetime = "";
    this.TransSourceAccount = "";
    this.fee_paid = "";
    this.memodef = {
        memo:"",
        memo_type:"",
    };
    this.source_account_sequence = 0;
    this.subTitle = "";
    this.addrTitle = "";
    this.showDetails = false;

    this.DecodeBody = function(body,trans){
        this.created_datetime = trans.created_at;
        this.fee_paid = trans.fee_paid;
        this.memodef.memo = trans.memodef.memo;
        this.memodef.memo_type = trans.memodef.memo_type;
        this.TransSourceAccount = trans.source_account;
        this.Hash = trans.hash;
        this.source_account_sequence = trans.source_account_sequence;
        this.Type = MANAGE_OFFER_TYPE;

        if(body._attributes.sourceAccount != null){
            if(body._attributes.sourceAccount._arm == "ed25519"){
                this.SourceAccount = StellarBase.encodeCheck("accountId", body._attributes.sourceAccount._value);
            }
        }

        if(this.SourceAccount == ""){
            if(this.TransSourceAccount != this.MainAddress){
                this.SubType = MANAGE_OFFER_DEAL_CLOSE;
            } else {
                this.SubType = MANAGE_OFFER_TRADING_BLOCK;
            }
            this.SourceAccount = this.TransSourceAccount;
        } else {
            if(this.SourceAccount != this.TransSourceAccount){
                this.SubType = MANAGE_OFFER_DEAL_CLOSE;
            } else {
                this.SubType = MANAGE_OFFER_TRADING_BLOCK;
            }
        }

        if(body._attributes.body._value._attributes.amount != null){
            high = body._attributes.body._value._attributes.amount.high;
            low = body._attributes.body._value._attributes.amount.low;
            if(high < 0){
                high += 4294967296;
            }
            if(low < 0){
                low += 4294967296;
            }
            value = (high*4294967296+low)/10000000.0;
            this.Amount = ""+value;
        }

        if(body._attributes.body._value._attributes.buying != null){
            if(body._attributes.body._value._attributes.buying._switch.name == "assetTypeCreditAlphanum4"){
                this.Buying.Asset_Type = "alphaNum4";
            } else if(body._attributes.body._value._attributes.buying._switch.name == "assetTypeNative"){
                this.Buying.Asset_Type = "native";
            } else {
                this.Buying.Asset_Type = "alphaNum8";
            }

            if(body._attributes.body._value._attributes.buying._value == null){
                this.Buying.Asset_Code = "XLM";
            } else {
                this.Buying.Asset_Code = String(body._attributes.body._value._attributes.buying._value._attributes.assetCode);
                this.Buying.Asset_Issuer = StellarBase.encodeCheck("accountId", body._attributes.body._value._attributes.buying._value._attributes.issuer._value);
            }
        }

        high = body._attributes.body._value._attributes.offerId.high;
        low = body._attributes.body._value._attributes.offerId.low;
        if(high < 0){
            high += 4294967296;
        }
        if(low < 0){
            low += 4294967296;
        }
        this.OfferID = high * 4294967296 + low;
        this.Price = body._attributes.body._value._attributes.price._attributes.n*1.0 / body._attributes.body._value._attributes.price._attributes.d;

        if(body._attributes.body._value._attributes.selling != null){
            if(body._attributes.body._value._attributes.selling._switch.name == "assetTypeCreditAlphanum4"){
                this.Selling.Asset_Type = "alphaNum4";
            } else if(body._attributes.body._value._attributes.selling._switch.name == "assetTypeNative"){
                this.Selling.Asset_Type = "native";
            } else {
                this.Selling.Asset_Type = "alphaNum8";
            }

            if(body._attributes.body._value._attributes.selling._value == null){
                this.Selling.Asset_Code = "XLM";
                if(this.Buying.Asset_Issuer != ""){
                    this.Selling.Asset_Issuer = this.Buying.Asset_Issuer;
                }
            } else {
                this.Selling.Asset_Code = String(body._attributes.body._value._attributes.selling._value._attributes.assetCode);
                this.Selling.Asset_Issuer = StellarBase.encodeCheck("accountId", body._attributes.body._value._attributes.selling._value._attributes.issuer._value);
                if(this.Buying.Asset_Issuer == ""){
                    this.Buying.Asset_Issuer = this.Selling.Asset_Issuer;
                }
            }
        }
    }
};

var SetOptionsOperationEx = function(mainAddr){
    SetOptionsOperation.apply(this,arguments);
    this.created_datetime = "";
    this.TransSourceAccount = "";
    this.fee_paid = "";
    this.memodef = {
        memo:"",
        memo_type:"",
    };
    this.source_account_sequence = 0;
    this.subTitle = "";
    this.addrTitle = "";
    this.showDetails = false;

    this.highThreshold = 0;
    this.medThreshold = 0;
    this.lowThreshold = 0;
    this.masterWeight = 0;

    this.DecodeBody = function(body,trans){
        this.created_datetime = trans.created_at;
        this.fee_paid = trans.fee_paid;
        this.memodef.memo = trans.memodef.memo;
        this.memodef.memo_type = trans.memodef.memo_type;
        this.TransSourceAccount = trans.source_account;
        this.Hash = trans.hash;
        this.source_account_sequence = trans.source_account_sequence;
        this.Type = SET_OPTIONS_TYPE;

        if(body._attributes.sourceAccount != null){
            if(body._attributes.sourceAccount._arm == "ed25519"){
                this.SourceAccount = StellarBase.encodeCheck("accountId", body._attributes.sourceAccount._value);
            }
        }

        if(this.SourceAccount == ""){
            this.SourceAccount = this.TransSourceAccount;
        }

        if(body._attributes.body._value._attributes != null){
            this.HomeDomain = body._attributes.body._value._attributes.homeDomain;
            if(body._attributes.body._value._attributes.inflationDest != null){
                this.InflationDest = StellarBase.encodeCheck("accountId", body._attributes.body._value._attributes.inflationDest._value);
            }
            if(body._attributes.body._value._attributes.signer != null){
                this.SignerKey = StellarBase.encodeCheck("accountId", body._attributes.body._value._attributes.signer._attributes.pubKey._value);
                this.SignerWeight = body._attributes.body._value._attributes.signer._attributes.weight;
            }
            this.SetFlags = body._attributes.body._value._attributes.setFlags;
            this.ClearFlags = body._attributes.body._value._attributes.clearFlags;
        }
    }
};

var ChangeTrustOperationEx = function(mainAddr){
    ChangeTrustOperation.apply(this,arguments);
    this.created_datetime = "";
    this.TransSourceAccount = "";
    this.fee_paid = "";
    this.memodef = {
        memo:"",
        memo_type:"",
    };
    this.source_account_sequence = 0;
    this.subTitle = "";
    this.addrTitle = "";
    this.showDetails = false;

    this.DecodeBody = function(body,trans){
        this.created_datetime = trans.created_at;
        this.fee_paid = trans.fee_paid;
        this.memodef.memo = trans.memodef.memo;
        this.memodef.memo_type = trans.memodef.memo_type;
        this.TransSourceAccount = trans.source_account;
        this.Hash = trans.hash;
        this.source_account_sequence = trans.source_account_sequence;
        this.Type = CHANGE_TRUST_TYPE;

        if(body._attributes.sourceAccount != null){
            if(body._attributes.sourceAccount._arm == "ed25519"){
                this.SourceAccount = StellarBase.encodeCheck("accountId", body._attributes.sourceAccount._value);
            }
        }

        if(body._attributes.body._value._attributes.line != null){
            this.AssetType = body._attributes.body._value._attributes.line._switch.name; // assetTypeCreditAlphanum4
            this.AssetCode = String(body._attributes.body._value._attributes.line._value._attributes.assetCode);
            this.AssetIssuer = StellarBase.encodeCheck("accountId", body._attributes.body._value._attributes.line._value._attributes.issuer._value);
            this.Trustee = this.AssetIssuer;
        }

        if(this.SourceAccount != ""){
            this.Trustor = this.SourceAccount;
        } else {
            this.Trustor = this.TransSourceAccount;
            this.SourceAccount = this.TransSourceAccount;
        }

        if(this.Trustor == this.MainAddress){
            this.SubType = CHANGE_TRUST_ON;
        }
    }
};

var BaseTransactionDef = function(main){
    this.created_at = "";
    this.fee_paid = "";
    this.hash = "";
    this.mainAddr = main;
    this.memodef = {
        memo:"",
        memo_type:"",
    };
    this.source_account = "";
    this.source_account_sequence = 0;
    this.paging_token = 0;
    this.ledger = 0;
    this.operation_count = 0;
    this.envelope_xdr = "";

    this.DecodeBody = function(body){
        this.created_at = body.created_at;
        this.fee_paid = body.fee_paid;
        this.hash = body.hash;
        this.source_account = body.source_account;
        this.source_account_sequence = body.source_account_sequence;
        this.operation_count = body.operation_count;
        this.paging_token = body.paging_token*1;
        this.ledger = body.ledger;
        this.envelope_xdr = body.envelope_xdr;
        this.memodef.memo_type = body.memo_type;
        if(this.memodef.memo_type != "none"){
            this.memodef.memo = body.memo;
            if(this.memodef.memo_type == "hash" || this.memodef.memo_type == "return"){
                decodeb64 = CryptoJS.enc.Base64.parse(this.memodef.memo);
                this.memodef.memo = decodeb64.toString(CryptoJS.enc.Hex);
            }
        }else{
            this.memodef.memo = "";
        }
    };
    this.DecodeOperation = function(){
        obj = StellarBase.xdr["TransactionEnvelope"].fromXDR(this.envelope_xdr, 'base64');
        ret =[];
        if(obj._attributes.tx._attributes.operations != null){
            for(var i = 0 ; i < this.operation_count ; ++i){
                operater = obj._attributes.tx._attributes.operations[i];
                //console.log(operater);
                switch (operater._attributes.body._switch.name){
                    case "payment":
                        ret[i] = new PaymentOperationEx(this.mainAddr);
                        ret[i].DecodeBody(operater,this);
                        if( ret[i].TransSourceAccount != this.mainAddr &&
                            ret[i].SourceAccount != this.mainAddr &&
                            ret[i].From != this.mainAddr &&
                            ret[i].To != this.mainAddr) {
                            ret[i] = null;
                        }
                        break;
                    case "accountMerge":
                        ret[i] = new MergeOperationEx(this.mainAddr);
                        ret[i].DecodeBody(operater,this);
                        break;
                    case "createAccount":
                        ret[i] = new CreateOperationEx(this.mainAddr);
                        ret[i].DecodeBody(operater,this);
                        if( ret[i].TransSourceAccount != this.mainAddr &&
                            ret[i].SourceAccount != this.mainAddr &&
                            ret[i].Funder != this.mainAddr &&
                            ret[i].Account != this.mainAddr) {
                            ret[i] = null;
                        }
                        break;
                    case "manageOffer":
                        ret[i] = new ManageOfferOperationEx(this.mainAddr);
                        ret[i].DecodeBody(operater,this);
                        break;
                    case "setOption":
                        ret[i] = new SetOptionsOperationEx(this.mainAddr);
                        ret[i].DecodeBody(operater,this);
                        break;
                    case "changeTrust":
                        ret[i] = new ChangeTrustOperationEx(this.mainAddr);
                        ret[i].DecodeBody(operater,this);
                        break;
                }

            }
        }
        return ret;
    };
};
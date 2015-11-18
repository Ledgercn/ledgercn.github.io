
var BaseOperation = function(mainAddr){
    this.Type = "";
    this.SubType = "";
    this.SourceAccount = "";
    this.Hash = "";
    this.MainAddress = mainAddr;
    this.Title = "";
    this.Details = "";
    this.DetailRows = 4;

    this.BaseDecodeBody = function(body){
        this.SourceAccount = body.source_account;
        this.Hash = body._links.transaction.href;
    }
};

var PAYMENT_IN = "PAY-IN";
var PAYMENT_OUT = "PAY-OUT";
var PAYMENT_TYPE = "payment";
/*
{
     "_links": {
         "effects": {
             "href": "/operations/2873376070701057/effects{?cursor,limit,order}",
             "templated": true
         },
         "precedes": {
            "href": "/operations?cursor=2873376070701057&order=asc"
         },
         "self": {
            "href": "/operations/2873376070701057"
         },
         "succeeds": {
            "href": "/operations?cursor=2873376070701057&order=desc"
         },
         "transaction": {
            "href": "/transactions/a0b0a3fbe01ad383bb37b64e8f5ea986de9aa8a44b9944b3a3c9c283943a4003"
         }
     },
     "amount": "2.0",
     "asset_code": "USD",
     "asset_issuer": "GAYVSC2JEOXOM2UHWGU6MT5CO5EMM3CQJX7KOD5T6HTTM6RGHMRJZK73",
     "asset_type": "credit_alphanum4",
     "from": "GCTRWLB5YDTNJKECY3I2MS5A2PRROI2MSDQFH5JCOGRPIEWBTXHQO576",
     "id": 2873376070701057,
     "paging_token": "2873376070701057",
     "source_account": "GCTRWLB5YDTNJKECY3I2MS5A2PRROI2MSDQFH5JCOGRPIEWBTXHQO576",
     "to": "GDXYIE7NRJHW3O7OHBCUHYJLOOJWMETLTH4EXIMASI2KUSRLBBA3RB6I",
     "type": "payment",
     "type_i": 1
 },
 {
     "_links": {
         "effects": {
             "href": "/operations/2873341710962689/effects{?cursor,limit,order}",
             "templated": true
         },
         "precedes": {
            "href": "/operations?cursor=2873341710962689&order=asc"
         },
         "self": {
            "href": "/operations/2873341710962689"
         },
         "succeeds": {
            "href": "/operations?cursor=2873341710962689&order=desc"
         },
         "transaction": {
            "href": "/transactions/dff1cc963667676d847ada9f2ef08838e70d255dee40f47fcf9f029eb9cdd1c0"
         }
     },
     "amount": "10.0",
     "asset_type": "native",
     "from": "GCTRWLB5YDTNJKECY3I2MS5A2PRROI2MSDQFH5JCOGRPIEWBTXHQO576",
     "id": 2873341710962689,
     "paging_token": "2873341710962689",
     "source_account": "GCTRWLB5YDTNJKECY3I2MS5A2PRROI2MSDQFH5JCOGRPIEWBTXHQO576",
     "to": "GDXYIE7NRJHW3O7OHBCUHYJLOOJWMETLTH4EXIMASI2KUSRLBBA3RB6I",
     "type": "payment",
     "type_i": 1
 },
*/
var PaymentOperation = function(mainAddr){
    BaseOperation.apply(this,arguments);
    this.From = "";
    this.To = "";
    this.Amount = "";
    this.AssetCode = "";
    this.AssetIssuer = "";
    this.AssetType = "";

    this.DecodeBody = function(body){
        this.BaseDecodeBody(body);
        this.Type = PAYMENT_TYPE;
        this.From = body.from;
        this.To = body.to;
        this.Amount = body.amount;
        if (body.asset_issuer != null){
            this.AssetCode = body.asset_code;
            this.AssetIssuer = body.asset_issuer;
            this.AssetType = body.asset_type;
        }
        if(this.From == this.MainAddress){
            this.SubType = PAYMENT_OUT;
        }else if(this.To == this.MainAddress){
            this.SubType = PAYMENT_IN;
        }
    }
};

var CREATE_IN = "CREATE-IN";
var CREATE_OUT = "CREATE-OUT";
var CREATE_TYPE = "create_account";

var CreateOperation = function(mainAddr){
    BaseOperation.apply(this,arguments);
    this.Account = "";
    this.Funder = "";
    this.StartingBalance = "";

    this.DecodeBody = function(body){
        this.BaseDecodeBody(body);
        this.Type = CREATE_TYPE;
        this.Account = body.account;
        this.Funder = body.funder;
        this.StartingBalance = body.starting_balance;

        if(this.Account == this.MainAddress){
            this.SubType = CREATE_IN;
        } else if(this.Funder == this.MainAddress) {
            this.SubType = CREATE_OUT;
        }
    }
};

var MERGE_IN = "MERGE-IN";
var MERGE_DESTROY = "MERGE-DESTROY";
var MERGE_TYPE = "account_merge";

var MergeOperation = function(mainAddr){
    BaseOperation.apply(this,arguments);
    this.Account = "";
    this.Into = "";

    this.DecodeBody = function(body){
        this.BaseDecodeBody(body);
        this.Type = MERGE_TYPE;
        this.Account = body.account;
        this.Into = body.into;

        if(this.Into == this.MainAddress){
            this.SubType = MERGE_IN;
        }else if(this.Account == this.MainAddress){
            this.SubType = MERGE_DESTROY;
        }
    }
};

var CHANGE_TRUST_IN = "CHANGE-TRUST-IN"; // 别人信任自己
var CHANGE_TRUST_ON = "CHANGE-TRUST-ON"; // 自己信任别人
var CHANGE_TRUST_TYPE = "change_trust";

var ChangeTrustOperation = function(mainAddr){
    BaseOperation.apply(this,arguments);
    this.AssetCode = "";
    this.AssetIssuer = "";
    this.AssetType = "";
    this.Trustee = "";
    this.Trustor = "";

    this.DecodeBody = function(body){
        this.BaseDecodeBody(body);
        this.Type = CHANGE_TRUST_TYPE;
        this.AssetCode = body.asset_code;
        this.AssetIssuer = body.asset_issuer;
        this.AssetType = body.asset_type;
        this.Trustee = body.trustee;
        this.Trustor = body.trustor;

        if(this.Trustor == this.MainAddress){
            this.SubType = CHANGE_TRUST_ON;
        }
    }
};

var MANAGE_OFFER_TYPE = "manage_offer";

/*
 {
     "_links": {
         "effects": {
             "href": "/operations/2865228517740545/effects{?cursor,limit,order}",
             "templated": true
         },
         "precedes": {
            "href": "/operations?cursor=2865228517740545&order=asc"
         },
         "self": {
            "href": "/operations/2865228517740545"
         },
         "succeeds": {
            "href": "/operations?cursor=2865228517740545&order=desc"
         },
         "transaction": {
            "href": "/transactions/d4b3f0897d69e5d1c8387cb34e421c9bb98f25e3ede7e05df98fbf7262d649ec"
         }
     },
     "amount": "2.0",
     "buying_asset_code": "GBP",
     "buying_asset_issuer": "GDCKND5HOQH6GHKOOK47ENZOZ2ZEXSDUIVS257K57OPJHQVTOS4NDRSU",
     "buying_asset_type": "credit_alphanum4",
     "id": 2865228517740545,
     "offer_id": 0,
     "paging_token": "2865228517740545",
     "price": "1000.0",
     "price_r": {
         "d": 1,
         "n": 1000
     },
     "selling_asset_code": "US1234567890",
     "selling_asset_issuer": "GDCKND5HOQH6GHKOOK47ENZOZ2ZEXSDUIVS257K57OPJHQVTOS4NDRSU",
     "selling_asset_type": "credit_alphanum12",
     "source_account": "GBR4W5KAC2S7RVEWK2LPHJ4YUVYV4G4A5BGCC23VZDQ4BWTI26VQ5MA5",
     "type": "manage_offer",
     "type_i": 3
 },
{
     "_links": {
         "effects": {
             "href": "/operations/2864764661272577/effects{?cursor,limit,order}",
             "templated": true
         },
         "precedes": {
            "href": "/operations?cursor=2864764661272577&order=asc"
         },
         "self": {
            "href": "/operations/2864764661272577"
         },
         "succeeds": {
            "href": "/operations?cursor=2864764661272577&order=desc"
         },
         "transaction": {
            "href": "/transactions/90cdc28dc8ea4710e67663975f2d319ddb02131901844820e193a8f0a02aee3b"
         }
     },
     "amount": "0.0",
     "buying_asset_code": "GBP",
     "buying_asset_issuer": "GDCKND5HOQH6GHKOOK47ENZOZ2ZEXSDUIVS257K57OPJHQVTOS4NDRSU",
     "buying_asset_type": "credit_alphanum4",
     "id": 2864764661272577,
     "offer_id": 22,
     "paging_token": "2864764661272577",
     "price": "3.0",
     "price_r": {
         "d": 1,
         "n": 3
     },
     "selling_asset_code": "US1234567890",
     "selling_asset_issuer": "GDCKND5HOQH6GHKOOK47ENZOZ2ZEXSDUIVS257K57OPJHQVTOS4NDRSU",
     "selling_asset_type": "credit_alphanum12",
     "source_account": "GBR4W5KAC2S7RVEWK2LPHJ4YUVYV4G4A5BGCC23VZDQ4BWTI26VQ5MA5",
     "type": "manage_offer",
     "type_i": 3
 },
* */

var ManageOfferOperation = function(mainAddr){
    BaseOperation.apply(this,arguments);
    this.Amount = "";
    this.OfferID = 0;
    this.Price = "";
    this.Buying = {
        Asset_Code:"",
        Asset_Type:"",
        Asset_Issuer:""
    };
    this.Selling = {
        Asset_Code:"",
        Asset_Type:"",
        Asset_Issuer:""
    };

    this.DecodeBody = function(body){
        this.BaseDecodeBody(body);
        this.Type = MANAGE_OFFER_TYPE;
        this.Amount = body.amount;
        this.OfferID = body.offer_id;
        this.Price = body.price;

        this.Buying.Asset_Type = body.buying_asset_type;
        if(this.Buying.Asset_Type != "native"){
            this.Buying.Asset_Code = body.buying_asset_code;
            this.Buying.Asset_Issuer = body.buying_asset_issuer;
        }else{
            this.Buying.Asset_Code = "XLM";
            this.Buying.Asset_Issuer = body.selling_asset_issuer;
        }

        this.Selling.Asset_Type = body.selling_asset_type;
        if(this.Selling.Asset_Type != "native"){
            this.Selling.Asset_Code = body.selling_asset_code;
            this.Selling.Asset_Issuer = body.selling_asset_issuer;
        }else{
            this.Selling.Asset_Code = "XLM";
            this.Selling.Asset_Issuer = body.buying_asset_issuer;
        }
    }
};

var SET_OPTIONS_TYPE = "set_options";
/*
{
    "_links":{
        "effects":{
            "href":"/operations/3316384767414273/effects{?cursor,limit,order}",
            "templated":true
        },
        "precedes":{
            "href":"/operations?cursor=3316384767414273&order=asc"
        },
        "self":{
            "href":"/operations/3316384767414273"
        },
        "succeeds":{
            "href":"/operations?cursor=3316384767414273&order=desc"
        },
        "transaction":{
            "href":"/transactions/ee14b475c6a91f191b6eee35f1a0b3d464acbb2f7e4fdd7bad1392ce971b3209"
        }
    },
    "id":3316384767414273,
    "paging_token":"3316384767414273",
    "set_flags":[1,2],
    "set_flags_s":["auth_required_flag","auth_revocable_flag"],
    "signer_key":"GAZWSWPDQTBHFIPBY4FEDFW2J6E2LE7SZHJWGDZO6Q63W7DBSRICO2KN",
    "signer_weight":255,
    "source_account":"GCR6QXX7IRIJVIM5WA5ASQ6MWDOEJNBW3V6RTC5NJXEMOLVTUVKZ725X",
    "type":"set_options",
    "type_i":5
}

{
    "_links":{
        "effects":{
            "href":"/operations/3317175041396737/effects{?cursor,limit,order}",
            "templated":true
        },
        "precedes":{
            "href":"/operations?cursor=3317175041396737&order=asc"
        },
        "self":{
            "href":"/operations/3317175041396737"
        },
        "succeeds":{
            "href":"/operations?cursor=3317175041396737&order=desc"
        },
        "transaction":{
            "href":"/transactions/8268e5cdfa587002299220e37514285b0b44ff6b1444ac8c185ac9715e9f4227"
        }
    },
    "clear_flags":[1,2],
    "clear_flags_s":["auth_required_flag","auth_revocable_flag"],
    "id":3317175041396737,
    "paging_token":"3317175041396737",
    "signer_key":"GAZWSWPDQTBHFIPBY4FEDFW2J6E2LE7SZHJWGDZO6Q63W7DBSRICO2KN",
    "signer_weight":255,
    "source_account":"GCR6QXX7IRIJVIM5WA5ASQ6MWDOEJNBW3V6RTC5NJXEMOLVTUVKZ725X",
    "type":"set_options",
    "type_i":5
}

{
    "_links":{
        "effects":{
            "href":"/operations/3317677552570369/effects{?cursor,limit,order}",
            "templated":true
        },
        "precedes":{
            "href":"/operations?cursor=3317677552570369&order=asc"
        },
        "self":{
            "href":"/operations/3317677552570369"
        },
        "succeeds":{
            "href":"/operations?cursor=3317677552570369&order=desc"
        },
        "transaction":{
            "href":"/transactions/be63c2d5c010711b9946b0363b85a43d514edca9a691eec229fa2108359d2115"
        }
    },
    "home_domain":"www.ledgercn.com",
    "id":3317677552570369,
    "inflation_dest":"GAZWSWPDQTBHFIPBY4FEDFW2J6E2LE7SZHJWGDZO6Q63W7DBSRICO2KN",
    "paging_token":"3317677552570369",
    "set_flags":[1,2],
    "set_flags_s":["auth_required_flag","auth_revocable_flag"],
    "signer_key":"GAZWSWPDQTBHFIPBY4FEDFW2J6E2LE7SZHJWGDZO6Q63W7DBSRICO2KN",
    "signer_weight":255,
    "source_account":"GCR6QXX7IRIJVIM5WA5ASQ6MWDOEJNBW3V6RTC5NJXEMOLVTUVKZ725X",
    "type":"set_options",
    "type_i":5
},
* */

var SetOptionsOperation = function(mainAddr){
    BaseOperation.apply(this,arguments);
    this.HomeDomain = "";
    this.InflationDest = "";
    this.SetFlags = [];
    this.ClearFlags = [];
    this.SignerKey = "";
    this.SignerWeight = "";

    this.DecodeBody = function(body){
        this.BaseDecodeBody(body);
        this.Type = SET_OPTIONS_TYPE;
        this.HomeDomain = body.home_domain;
        this.InflationDest = body.inflation_dest;
        this.SignerKey = body.signer_key;
        this.SignerWeight = body.signer_weight;
        this.SetFlags = body.set_flags_s;
        this.ClearFlags = body.clear_flags_s;
    }
};
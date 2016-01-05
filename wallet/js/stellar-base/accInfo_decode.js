function GetAccSequence(dInfo){
    ret = dInfo.Seq_Number;
    ret += dInfo.Seq_Acc * 4294967296;
    return ret;
}

function AccountInfoDecode(data){
    decodeInfo = {
        Balance_XLM : "",
        Sequence:0,
        Seq_Acc:0,
        Seq_Number:0,
        Credits : null,
        HomeDomain : "",
        InflationDest: "",
        Flags:{
            Auth_required:false,
            Auth_revocable:false,
        },
        Thresholds:{
            high:0,
            low:0,
            med:0
        },
        Signers: null,
    };

    if (data.balances != null){
        decodeInfo.Credits = new Array();
        decodeInfo.Credits[0] ={};
        for (i = 0 ; i < data.balances.length ; ++i){
            if (data.balances[i].asset_type == "native"){
                decodeInfo.Balance_XLM = data.balances[i].balance;
                decodeInfo.Credits[0] = {
                    index:0,
                    asset_code : "Lumens",
                    balance : data.balances[i].balance,
                    issuer : null,
                    short: true
                };
            }else{
                ilen = decodeInfo.Credits.length;
                decodeInfo.Credits[ilen] = {
                    index:ilen,
                    asset_code : data.balances[i].asset_code,
                    balance : data.balances[i].balance,
                    issuer : data.balances[i].asset_issuer,
                    short: true
                };
            }
        }
    }
    if(data.flags != null){
        decodeInfo.Flags.Auth_required = data.flags.auth_required;
        decodeInfo.Flags.Auth_revocable = data.flags.auth_revocable;
    }
    decodeInfo.HomeDomain = data.home_domain;
    decodeInfo.InflationDest = data.inflation_destination;
    decodeInfo.Sequence = data.sequence;
    decodeInfo.Seq_Number = decodeInfo.Sequence & 0xFFFFFFFF;
    decodeInfo.Seq_Acc = (decodeInfo.Sequence/4294967295) & 0xFFFFFFFF;

    if(data.signers != null){
        decodeInfo.Signers = new Array();
        for(i =0 ; i < data.signers.length ; i++){
            ilen = decodeInfo.Signers.length;
            decodeInfo.Signers[ilen] = {
                public_key : data.signers[i].public_key,
                weight : data.signers[i].weight
            };
        }
    }

    if(data.thresholds != null){
        decodeInfo.Thresholds.high = data.thresholds.high_threshold;
        decodeInfo.Thresholds.low = data.thresholds.low_threshold;
        decodeInfo.Thresholds.med = data.thresholds.med_threshold;
    }

    //console.log(decodeInfo);
    //console.log(GetAccSequence(decodeInfo));
    return decodeInfo;
}
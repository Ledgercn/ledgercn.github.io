
function isValidAddress(addr) {
    return StellarBase.Account.isValidAddress(addr);
}

function isKaypairValid(privSeed,publicAddr){
    kp = StellarBase.Keypair.fromSeed(privSeed);
    if(kp != null){
        return (kp.address() === publicAddr);
    }
    return false;
}
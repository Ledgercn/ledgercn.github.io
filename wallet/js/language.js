

function languageController($cookies,$scope,$rootScope, LANGUAGE) {
    langSave = $cookies.get("LANGUAGE");
    if (langSave != null){
        $scope.currlanguage = langSave;
    }else if ($scope.currlanguage == null) {
        $scope.currlanguage = ZH_CN_LANG;
        saveLanguageCookie($scope.currlanguage);
    }
    LANGUAGE.Language = $scope.currlanguage;

    $rootScope.$on(LANGUAGE_CHANGED,function(event,data){
        if (data != null && data.from == "topMenuController"){
            LANGUAGE.Language = data.event;
            $scope.currlanguage = data.event;
            saveLanguageCookie($scope.currlanguage);
        }
    });

    function saveLanguageCookie(langValue){
        var expireDate = new Date();
        expireDate.setDate(expireDate.getDate() + 365);
        $cookies.put("LANGUAGE",langValue,{'expires': expireDate});
    }
}
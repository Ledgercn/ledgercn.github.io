
function topMenuController($scope,$rootScope, LANGUAGE) {
    $scope.toMenuTitle = "";
    if (LANGUAGE.Language == ZH_CN_LANG) {
        $scope.toMenuTitle = "返回";
        $scope.languageTitle = "English";
    } else {
        $scope.toMenuTitle = "Back";
        $scope.languageTitle = " 中文 ";
    }

    $scope.ChangeLanguageClick = function(){
        if ($scope.languageTitle == " 中文 "){
            LANGUAGE.Language = ZH_CN_LANG;
            $scope.languageTitle = "English";
            $scope.toMenuTitle = "返回";
        } else {
            LANGUAGE.Language = EN_LANG;
            $scope.languageTitle = " 中文 ";
            $scope.toMenuTitle = "Back";
        }

        $rootScope.$broadcast(LANGUAGE_CHANGED,{
            from:"topMenuController",
            event:LANGUAGE.Language
        });
    }
}
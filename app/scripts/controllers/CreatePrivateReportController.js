(function () {
    "use strict";

    angular
        .module("tracsDesktopApp")
        .controller("CreatePrivateReportController", CreatePrivateReportController);

    CreatePrivateReportController.$inject = ["$stateParams", "$sce", "GapiHelper", "environment"];

    function CreatePrivateReportController($stateParams, $sce, GapiHelper, environment) {

        var vm = this;

        vm.folderId = $stateParams.folderId;
        vm.newDocUrl = "https://docs.google.com/document/create?usp=drive_web&folder=" + vm.folderId;

        function activate() {
            vm.newDocUrl = $sce.trustAsResourceUrl(vm.newDocUrl);

            GapiHelper.getLatestCreatedFileInFolder(vm.folderId).then(function(result) {
                console.log("### Last FIle ID", result);
            });

            /*GapiHelper.sendPermissionToUser("leian1306@gmail.com","id").then(function(result) {
                console.log("### se mandaron los permisos", result);
            });*/

        }

        activate();
    }

})();

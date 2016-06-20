(function () {
    "use strict";

    angular
        .module("tracsDesktopApp")
        .controller("CreatePrivateReportController", CreatePrivateReportController);

    CreatePrivateReportController.$inject = ["$stateParams", "$sce"];

    function CreatePrivateReportController($stateParams, $sce) {

        var vm = this;

        vm.folderId = $stateParams.folderId;
        vm.newDocUrl = "https://docs.google.com/document/create?usp=drive_web&folder=" + vm.folderId;

        function activate() {
            vm.newDocUrl = $sce.trustAsResourceUrl(vm.newDocUrl);
        }

        activate();
    }

})();

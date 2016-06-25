(function () {
    "use strict";

    angular
        .module("tracsDesktopApp")
        .controller("EditSharedReportController", EditSharedReportController);

    EditSharedReportController.$inject = ["$stateParams", "$sce"];

    function EditSharedReportController($stateParams, $sce) {

        var vm = this;

        vm.fileId = $stateParams.fileId;
        vm.editDocUrl = "https://docs.google.com/document/d/" + vm.fileId + "/edit";

        function activate() {
            vm.editDocUrl = $sce.trustAsResourceUrl(vm.editDocUrl);
        }

        activate();
    }

})();

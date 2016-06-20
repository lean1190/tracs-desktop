(function () {
    "use strict";

    angular
        .module("tracsDesktopApp")
        .controller("EditPrivateReportController", EditPrivateReportController);

    EditPrivateReportController.$inject = ["$stateParams", "$sce"];

    function EditPrivateReportController($stateParams, $sce) {

        var vm = this;

        vm.fileId = $stateParams.fileId;
        vm.editDocUrl = "https://docs.google.com/document/d/" + vm.fileId + "/edit";

        function activate() {
            vm.editDocUrl = $sce.trustAsResourceUrl(vm.editDocUrl);
        }

        activate();
    }

})();

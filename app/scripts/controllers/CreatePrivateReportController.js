(function () {
    "use strict";

    angular
        .module("tracsDesktopApp")
        .controller("CreatePrivateReportController", CreatePrivateReportController);

    CreatePrivateReportController.$inject = ["$stateParams", "$http", "$log", "storage"];

    function CreatePrivateReportController($stateParams, $http, $log, storage) {

        function activate() {

        }

        activate();
    }

})();

(function () {
    "use strict";

    angular
        .module("tracsDesktopApp")
        .controller("PatientDetailController", PatientDetailController);

    PatientDetailController.$inject = ["$stateParams", "$http", "$log", "storage"];

    function PatientDetailController($stateParams, $http, $log, storage) {

        var vm = this,
            patientEndpoint = "http://localhost:3000/patient",
            patientId = $stateParams.id;

        vm.patient = {};

        function activate() {

            $http.get(patientEndpoint + "/detail/" + patientId).then(function (result) {
                vm.patient = result.data;
                storage.setLastVisitedPatient(vm.patient);
            }, function (error) {
                $log.error("Ocurrió un error al recuperar el detalle del usuario con id " + patientId, error);
            });
        }

        activate();
    }

})();

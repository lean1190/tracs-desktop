(function () {
    "use strict";

    angular
        .module("tracsDesktopApp")
        .controller("CreateSharedReportController", CreateSharedReportController);

    CreateSharedReportController.$inject = ["$http", "$stateParams", "$sce","GapiHelper", "$log","storage", "environment"];

    //Todavia no hace nada diferente al privado. La idea es que los guarde en la carpeta publica que ya va a tener todos los permisos seteados

    function CreateSharedReportController($http,$stateParams, $sce, GapiHelper, $log, storage, environment) {

        var vm = this;

        vm.patientEndpoint = environment.api + "/patient";
        vm.profiles = [];
        vm.patient = {};
        vm.folderId = $stateParams.folderId;
        vm.newDocUrl = "https://docs.google.com/document/create?usp=drive_web&folder=" + vm.folderId;

        function activate() {
            console.log("estoy en el shared report");
            vm.newDocUrl = $sce.trustAsResourceUrl(vm.newDocUrl);

            vm.patient = storage.getLastVisitedPatient();


            //Obtengo todos los usuarios relacionados al paciente para poder darle los permisos para trabajar con el reporte compartido

            $http.get(vm.patientEndpoint + "/profiles/" + vm.patient._id).then(function (result) {
                vm.profiles = result.data;
                console.log("perfiles asociados",vm.profiles);
            }, function (error) {
                $log.error("Ocurrió un error al recuperar los usuarios del paciente con id " + vm.patient._id, error);
            });
        }

        activate();
    }

})();

(function() {
    "use strict";

    angular
        .module("tracsDesktopApp")
        .controller("PatientDetailController", PatientDetailController);

    PatientDetailController.$inject = ["$rootScope", "$q", "$stateParams", "$http", "$log", "storage", "environment", "GapiHelper"];

    function PatientDetailController($rootScope, $q, $stateParams, $http, $log, storage, environment, GapiHelper) {

        var vm = this,
            patientEndpoint = environment.api + "/patient",
            diagnosisEndpoint = environment.api + "/diagnosis",
            patientId = $stateParams.id,
            patientFolderName = GapiHelper.getTracsMainFolderName(),
            parentFolderId = "",
            patientSharedFolderName=GapiHelper.getTracsSharedFolderName();

        vm.patient = {};
        vm.folderId = "";

        vm.privateFiles=[];
        vm.sharedFiles =[];

        vm.patientSharedFolderName ="";

        /**
         * Verifica si el usuario tiene en su drive una carpeta
         * creada con el identificador de la aplicación y el
         * nombre del paciente. Si no la hay, la crea
         * @return {promise}  una promesa cuando finalizan las operaciones asincrónicas
         */
        function checkAndCreatePatientFolder() {
            return $q(function(resolve) {
                GapiHelper.isFolderCreated(patientFolderName).then(function(result) {
                    // Si no se encontró una carpeta con ese nombre, se crea
                    if (!result.created) {
                        GapiHelper.createDriveFolder(patientFolderName, parentFolderId).then(resolve);
                    } else {
                        resolve(result.files[0]);
                    }
                });
            });
        }

        function activate() {

            $http.get(patientEndpoint + "/detail/" + patientId).then(function(result) {
                vm.patient = result.data;
                storage.setLastVisitedPatient(vm.patient);

                $rootScope.pageTitle = vm.patient.name;

                if (vm.patient.latestDiagnosis){
                    $http.get(diagnosisEndpoint + "/" + vm.patient.latestDiagnosis).then(function(resultDiagnosis) {
                        vm.patient.latestDiagnosis = resultDiagnosis.data;
                    }, function(error) {
                        $log.error("Ocurrió un error al recuperar el diagnóstico del paciente con id " + patientId, error);
                    });
                }

                patientFolderName += " - " + vm.patient._id;


                checkAndCreatePatientFolder().then(function(folder) {
                    vm.folderId = folder.id;

                    GapiHelper.getFolderFiles(folder.id).then(function(result) {
                        var subFolders = result.files;
                        for(var i=0;i<subFolders .length;i++){
                            if (subFolders[i].shared === false){
                                GapiHelper.getFolderFiles(subFolders[i].id).then(function(privateFiles){
                                    vm.privateFiles = privateFiles;
                                });
                            }
                        }
                    });

                    patientSharedFolderName += " - " + vm.patient._id;

                    GapiHelper.getSharedFolderFiles(patientSharedFolderName).then(function(sharedFiles){
                        vm.sharedFiles = sharedFiles;
                    });
                });

        }, function(error) {
            $log.error("Ocurrió un error al recuperar el detalle del usuario con id " + patientId, error);
        });
    }

    activate();
}

})();

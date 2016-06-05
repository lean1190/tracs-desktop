(function () {
    "use strict";

    angular
        .module("tracsDesktopApp")
        .controller("PatientsListController", PatientsListController);

    PatientsListController.$inject = ["$http", "$log", "storage"];

    function PatientsListController($http, $log, storage) {

        // Mock de usuario hasta que tengamos el login
        storage.setUser({
            // hay q poner uno de la base para que traiga algo, paja mockear todos los pacientes
            _id: "5750bd31a38ae0b91d6ee10c"
        });

        var vm = this,
            patientEndpoint = "http://localhost:3000/patient",
            userId = storage.getUser()._id;

        vm.profiles = [];

        function activate() {
            $http.get(patientEndpoint + "/user/" + userId).then(function (result) {
                vm.profiles = result.data;
            }, function (error) {
                $log.error("Ocurrió un error al recuperar los pacientes del usuario con id " + userId, error);
            });
        }

        activate();
    }

})();

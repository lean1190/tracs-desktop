/**
 * @ngdoc function
 * @name tracsDesktopApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the tracsDesktopApp
 */

(function () {
    "use strict";

    angular
        .module("tracsDesktopApp")
        .controller("LoginController", LoginController);

    LoginController.$inject = ["$http"];

    function LoginController($http) {

        function activate() {

        }

        activate();
    }

})();

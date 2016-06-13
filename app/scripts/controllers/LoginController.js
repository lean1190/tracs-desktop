(function () {
    "use strict";

    angular
        .module("tracsDesktopApp")
        .controller("LoginController", LoginController);

    LoginController.$inject = ["$http", "$q", "$state", "environment", "storage"];

    function LoginController($http, $q, $state, environment, storage) {

        var vm = this;

        var clientId = environment.clientId,
            scopes = [
                "https://www.googleapis.com/auth/plus.login",
                "https://www.googleapis.com/auth/plus.me",
                "https://www.googleapis.com/auth/drive"
            ];

        /**
         * Llama al servidor para recuperar un usuario completo a partir de los datos del perfil de G+
         * @param   {object}  googleProfile el perfil del usuario en G+
         * @param   {object}  accessToken   el token de acceso para las consultas a la API
         * @returns {promise} una promesa   con el usuario completo
         */
        function getFulfilledUser(googleProfile, accessToken) {
            return $http.get(environment.api + "/session/login", {
                params: {
                    accessToken: accessToken,
                    googleId: googleProfile.sub,
                    picture: googleProfile.picture,
                    name: googleProfile.name,
                    email: googleProfile.email
                }
            }).then(function (user) {
                return user.data;
            });
        }

        /**
         * Realiza una invocación a la API de G+ para recuperar el perfil del usuario
         * @param   {string}  accessToken el token de acceso para llamar a la API
         * @returns {promise} una promesa con el perfil del usuario en G+
         */
        function getGoogleUserProfile(accessToken) {
            return $http({
                url: "https://www.googleapis.com/oauth2/v3/userinfo",
                method: "GET",
                params: {
                    access_token: accessToken
                }
            }).then(function (googleProfile) {
                return googleProfile.data;
            });
        }

        /**
         * Verifica si el usuario autorizó a la aplicación
         * a acceder a sus datos de Google
         * @returns {promise} una promesa con el resultado de la autorización
         */
        function checkAuth() {
            return $q(function (resolve, reject) {
                gapi.auth.authorize({
                        "client_id": clientId,
                        "scope": scopes.join(" "),
                        "immediate": false
                    },
                    /**
                     * Callback para manejar la invocación al servidor de autorización
                     * @param {object} authResult el resultado de la autorización.
                     */
                    function (authResult) {
                        if (authResult && !authResult.error) {
                            resolve(authResult);
                        } else {
                            reject("Authorization error");
                        }
                    });
            });
        }

        vm.login = function () {
            checkAuth().then(function (authResult) {
                // Recupera los datos de perfil del usuario de Google
                getGoogleUserProfile(authResult.access_token).then(function (googleProfile) {
                    // Recupera los datos del usuario desde el servidor
                    getFulfilledUser(googleProfile, authResult.access_token).then(function (fullfilledUser) {
                        // Guarda el usuario logueado en el localStorage
                        storage.setUser(fullfilledUser);
                        $state.go("main.patients");
                    });
                });
            });
        };

        function activate() {

        }

        activate();
    }

})();

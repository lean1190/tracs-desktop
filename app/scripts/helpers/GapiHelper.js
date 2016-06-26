/* jshint bitwise: false, camelcase: false, curly: true, eqeqeq: true, globals: false, freeze: true, immed: true, nocomma: true, newcap: true, noempty: true, nonbsp: true, nonew: true, quotmark: true, undef: true, unused: true, strict: true, latedef: nofunc */

/* globals angular, gapi */

/**
 * @ngdoc function
 * @name TracsClient:storage
 * @description
 * Factory para manejar la gapi de Google, tanto
 * de autorización como de invocación de métodos
 */

(function () {
    "use strict";

    angular
        .module("tracsDesktopApp")
        .factory("GapiHelper", GapiHelper);

    GapiHelper.$inject = ["$q", "localStorageService", "environment","$timeout"];

    function GapiHelper($q, localStorageService, environment,$timeout) {

        // Setea en el localStorage el nombre de la carpeta
        // donde se guardarán los reportes del usuario
        var TRACS_MAIN_FOLDER_KEY = "tracs_folder",
            TRACS_PRIVATE_FOLDER_KEY ="tracs_private",
            TRACS_SHARED_FOLDER_KEY = "tracs_shated";

        localStorageService.set(TRACS_MAIN_FOLDER_KEY, "TRACS - reportes");
        localStorageService.set(TRACS_PRIVATE_FOLDER_KEY , "TRACS - privado");
        localStorageService.set(TRACS_SHARED_FOLDER_KEY, "TRACS - compartido");

        var isGapiClientLoaded = false,
            isGapiCallAuthorized = false,
            clientId = environment.clientId,
            scopes = [
                "https://www.googleapis.com/auth/drive.metadata.readonly"
            ];

        function getTracsMainFolderName() {
            return localStorageService.get(TRACS_MAIN_FOLDER_KEY);
        }
         function getTracsPrivateFolderName() {
            return localStorageService.get(TRACS_PRIVATE_FOLDER_KEY);
        }
         function getTracsSharedFolderName() {
            return localStorageService.get(TRACS_SHARED_FOLDER_KEY);
        }

        /**
         * Carga la librería con el cliente de la API de Drive
         * @returns {promise} una promesa cuando se terminó de cargar
         */
        function loadDriveApi() {
            return gapi.client.load("drive", "v3").then(function () {
                isGapiClientLoaded = true;
                return true;
            });
        }

        /**
         * Autoriza una llamada a la API
         * @returns {promise} una promesa cuando se autorizó correctamente
         */
        function authorizeApiCall() {
            return $q(function (resolve, reject) {
                gapi.auth.authorize({
                    "client_id": clientId,
                    "scope": scopes.join(" "),
                    "immediate": true
                }, function (authResult) {
                    if (authResult && !authResult.error) {
                        isGapiCallAuthorized = true;
                        resolve(authResult);
                    } else {
                        reject("Authorization error");
                    }
                });
            });
        }

        /**
         * Verifica si el usuario ya dio permisos
         * para ejecutar la acción, y autoriza la llamada
         */
        function verifyAuthorization() {
            return $q(function (resolve) {
                // Si la Gapi no está cargada las llamadas tampoco están autorizadas, hacer ambas
                if (!isGapiClientLoaded) {
                    loadDriveApi().then(function () {
                        authorizeApiCall().then(function () {
                            resolve(true);
                        });
                    });
                } else {
                    resolve(true);
                }
            });
        }

        /**
         * Crea una carpeta en el drive de la persona logueada
         * @param   {string}  folderName el nombre de la nueva carpeta
         * @returns {promise} una promesa con el resultado de la creación
         */
        function createDriveFolder(folderName, parentId) {
            return $q(function (resolve) {
                verifyAuthorization().then(function () {

                //Este If es para reutilizar el metodo tanto para crear la carpeta principal como para la privada y publica. No encontre forma de hacer opcional el parametro "parents"
                    if (parentId){
                        var fileMetadata = {
                            "name": folderName,
                            "mimeType": "application/vnd.google-apps.folder",
                            "parents": [parentId]
                        };
                    }
                    else{
                        var fileMetadata = {
                            "name": folderName,
                            "mimeType": "application/vnd.google-apps.folder"
                        };
                    }

                    var request = gapi.client.drive.files.create({
                        "resource": fileMetadata,
                        "fields": "id"
                    });

                    request.execute(function (file) {
                        resolve(file);
                    });
                });
            });
        }

        function sendPermissionToUser(userEmail, fileId){

            return $q(function (resolve) {
                verifyAuthorization().then(function () {

                    console.log("mail para dar permiso",userEmail);

                    var query = "fileId = "+"'"+ fileId +"'",
                        requestSendPermission = gapi.client.drive.permissions.create ({
                            role: "writer",
                            emailAddress: userEmail,
                            type:"user",
                            fileId: fileId
                        });
                    requestSendPermission.execute(function (resp) {
                        console.log(resp);
                        resolve("sarasa");
                    });
                 });
            });
        }

        function createDriveSharedFolder(folderName, parentId,profiles) {
            return $q(function (resolve) {
                verifyAuthorization().then(function () {

                    var fileMetadata = {
                            "name": folderName,
                            "mimeType": "application/vnd.google-apps.folder",
                            "parents": [parentId]
                    };

                    var request = gapi.client.drive.files.create({
                        "resource": fileMetadata,
                        "fields": "id"
                    });

                    request.execute(function (file) {
                        //profiles[1].user.email = "leian1306@gmail.com";

                        angular.forEach(profiles,function(profile){
                            sendPermissionToUser(profile.user.email, file.id);
                        });
                        resolve(file);
                    });
                });
            });
        }


        /**
         * Verifica si el usuario logueado tiene una carpeta
         * creada con el nombre pasado por parámetro
         * @param   {string}  folderName el nombre de la carpeta
         * @returns {promise} una promesa con las carpetas y result
         */
        function isFolderCreated(folderName) {
            return $q(function (resolve) {
                verifyAuthorization().then(function () {
                    var query = "name='" + folderName + "'and trashed=false",
                        requestParentId = gapi.client.drive.files.list({
                            pageSize: 10,
                            q: query,
                            fields: "nextPageToken, files(id, name, parents)"
                        });

                    requestParentId.execute(function (resp) {
                        var responseObject = {
                            created: false,
                            files: resp.files
                        };

                        if (resp.files.length > 0) {
                            responseObject.created = true;
                        }

                        resolve(responseObject);
                    });
                });
            });
        }

        /**
         * Recupera los documentos de una carpeta
         * @param {string} folderId el id de la carpeta
         * @returns {promise} una promesa con el arreglo de documentos
         */
        function getFolderFiles(folderId) {
            return $q(function (resolve) {
                verifyAuthorization().then(function () {
                    var query = "'" + folderId + "'" + " in parents and trashed=false",
                        requestFolderFiles = gapi.client.drive.files.list({
                            pageSize: 10,
                            q: query,
                            fields: "nextPageToken, files(id, name, createdTime, modifiedTime, lastModifyingUser, owners, starred, shared)"
                        });

                    requestFolderFiles.execute(function (resp) {

                        resolve(resp);
                    });
                });
            });
         }

        function getLatestCreatedFileInFolder(folderId){

            return $q(function (resolve) {
                verifyAuthorization().then(function () {
                    var query = "'" + folderId + "'" + " in parents and trashed=false",
                        requestLatestFolderFile = gapi.client.drive.files.list({
                            orderBy: "createdTime desc",
                            pageSize: 10,
                            q: query,
                            fields: "nextPageToken, files(id)"
                        });

                    requestLatestFolderFile.execute(function (resp) {
                        console.log(resp);
                        resolve(resp);
                    });
                });
            });

        }




        var service = {

            getTracsMainFolderName: getTracsMainFolderName,
            getTracsPrivateFolderName:getTracsPrivateFolderName,
            getTracsSharedFolderName:getTracsSharedFolderName,
            createDriveFolder: createDriveFolder,
            isFolderCreated: isFolderCreated,
            getFolderFiles: getFolderFiles,
            sendPermissionToUser: sendPermissionToUser,
            getLatestCreatedFileInFolder:getLatestCreatedFileInFolder,
            createDriveSharedFolder:createDriveSharedFolder
        };

        return service;
    }

})();

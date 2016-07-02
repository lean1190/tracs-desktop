/* jshint bitwise: false, camelcase: false, curly: true, eqeqeq: true, globals: false, freeze: true, immed: true, nocomma: true, newcap: true, noempty: true, nonbsp: true, nonew: true, quotmark: true, undef: true, unused: true, strict: true, latedef: nofunc */

/* globals angular, gapi */

/**
 * @ngdoc function
 * @name TracsClient:storage
 * @description
 * Factory para manejar la gapi de Google, tanto
 * de autorización como de invocación de métodos
 */

(function() {
    "use strict";

    angular
        .module("tracsDesktopApp")
        .factory("GapiHelper", GapiHelper);

    GapiHelper.$inject = ["$q", "localStorageService", "environment"];

    function GapiHelper($q, localStorageService, environment) {

        // Setea en el localStorage el nombre de la carpeta
        // donde se guardarán los reportes del usuario
        var TRACS_MAIN_FOLDER_KEY = "tracs_folder",
            TRACS_PRIVATE_FOLDER_KEY = "tracs_private",
            TRACS_SHARED_FOLDER_KEY = "tracs_shated";

        localStorageService.set(TRACS_MAIN_FOLDER_KEY, "TRACS - reportes");
        localStorageService.set(TRACS_PRIVATE_FOLDER_KEY, "TRACS - privado");
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
            return gapi.client.load("drive", "v3").then(function() {
                isGapiClientLoaded = true;
                return true;
            });
        }

        /**
         * Autoriza una llamada a la API
         * @returns {promise} una promesa cuando se autorizó correctamente
         */
        function authorizeApiCall() {
            return $q(function(resolve, reject) {
                gapi.auth.authorize({
                    "client_id": clientId,
                    "scope": scopes.join(" "),
                    "immediate": true
                }, function(authResult) {
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
            return $q(function(resolve) {
                // Si la Gapi no está cargada las llamadas tampoco están autorizadas, hacer ambas
                if (!isGapiClientLoaded) {
                    loadDriveApi().then(function() {
                        authorizeApiCall().then(function() {
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
            return $q(function(resolve) {
                verifyAuthorization().then(function() {
                    var fileMetadata = {};
                    //Este If es para reutilizar el metodo tanto para crear la carpeta principal como para la privada y publica. No encontre forma de hacer opcional el parametro "parents"
                    if (parentId) {
                        fileMetadata = {
                            "name": folderName,
                            "mimeType": "application/vnd.google-apps.folder",
                            "parents": [parentId]
                        };
                    } else {
                        fileMetadata = {
                            "name": folderName,
                            "mimeType": "application/vnd.google-apps.folder"
                        };
                    }

                    var request = gapi.client.drive.files.create({
                        "resource": fileMetadata,
                        "fields": "id"
                    });

                    request.execute(function(file) {
                        resolve(file);
                    });
                });
            });
        }


        /**
         * Envia los permisos a un participante del paciente
         * @param   {string}  userEmail el usuario del paricipante al que se le va a entregar el permiso
         * @param   {string}  fileId    id del file que se va a compartir
         * @returns {promise} una promesa con el resultado de la operación
         */
        function sendPermissionToUser(userEmail, fileId) {
            return $q(function(resolve) {
                verifyAuthorization().then(function() {

                    var query = "fileId = " + "'" + fileId + "'",
                        requestSendPermission = gapi.client.drive.permissions.create({
                            role: "writer",
                            emailAddress: userEmail,
                            type: "user",
                            fileId: fileId
                        });
                    requestSendPermission.execute(function(resp) {
                        resolve();
                    });
                });
            });
        }

        /**
         * Crea una carpeta compartida con todos los participantes del tratamiento del paciente excluyendo a los padres
         * @param   {string}  folderName nombre de la carpeta a crear
         * @param   {string}  parentId   id de la carpeta raiz que almacena los archivos relacionados a la aplicacion
         * @param   {array}   profiles   información de los participantes del tratamiento
         * @returns {promise} una promesa con el id de la carpeta creada
         */
        function createDriveSharedFolder(folderName, parentId,profiles, folderOwner) {
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

                    request.execute(function(file) {
                        var tasks = [];
                        angular.forEach(profiles, function(profile) {
                            if((profile.user._id != folderOwner) && !(profile.isParent )){
                                var task = function() {
                                    console.log("### Compartiendo carpeta con el mail", profile.user.email);
                                    return sendPermissionToUser(profile.user.email, file.id);
                                };
                                tasks.push(task);
                            }
                        });
                        $q.serial(tasks);
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
            return $q(function(resolve) {
                verifyAuthorization().then(function() {
                    var query = "name='" + folderName + "'and trashed=false",
                        requestParentId = gapi.client.drive.files.list({
                            pageSize: 10,
                            q: query,
                            fields: "nextPageToken, files(id, name, parents)"
                        });

                    requestParentId.execute(function(resp) {
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
            return $q(function(resolve) {
                verifyAuthorization().then(function() {
                    var query = "'" + folderId + "'" + " in parents and trashed=false",
                        requestFolderFiles = gapi.client.drive.files.list({
                            pageSize: 10,
                            q: query,
                            fields: "nextPageToken, files(id, name, createdTime, modifiedTime, lastModifyingUser, owners, starred, shared)"
                        });

                    requestFolderFiles.execute(function(resp) {

                        resolve(resp);
                    });
                });
            });
        }

        /**
         * Obtiene el id de un archivo/carpeta a partir de su nombre
         * @param   {string} fileName nombre del archivo del cual se quiere obtener el ID
         * @returns {promise} una promesa con el id del archivo requerido
         */
        function getFileId (fileName){
            return $q(function (resolve) {
                verifyAuthorization().then(function () {
                    console.log(fileName);
                    var query = "name= '"+fileName + "' and trashed=false",
                        requestFolderFiles = gapi.client.drive.files.list({
                            pageSize: 10,
                            q: query,
                            fields: "nextPageToken, files(id)"
                        });
                    requestFolderFiles.execute(function (resp) {
                        console.log("resp del getFIleId",resp);
                        resolve(resp);
                    });
                });
            });
        }

        function getSharedFolderFiles(folderName){

            return $q(function (resolve) {
                verifyAuthorization().then(function () {
                    getFileId(folderName).then(function(result){
                        if (result.files.length!=0){
                            var fileId = result.files[0].id;
                            var query = "'" + fileId + "'" + " in parents and trashed=false",

                                requestFolderFiles = gapi.client.drive.files.list({
                                    pageSize: 10,
                                    q: query,
                                    fields: "nextPageToken, files(id, name, createdTime, modifiedTime, lastModifyingUser, owners, starred, shared)"
                                });

                            requestFolderFiles.execute(function (resp) {
                                resolve(resp);
                            });
                        }
                    });

                });
            });
        }

        /**
         * Trae el ultimo archivo creado. Creo que se podria borrar, lo hice mas que nada para hacer el guardado en la base. A discutir
         * @param   {string}  folderId id de la carpeta de la cual se quiere obtener el ultimo archivo creado
         * @returns {promise} una promesa con el ultimo archivo que fue creado
         */

        function getLatestCreatedFileInFolder(folderId){

            return $q(function(resolve) {
                verifyAuthorization().then(function() {
                    var query = "'" + folderId + "'" + " in parents and trashed=false",
                        requestLatestFolderFile = gapi.client.drive.files.list({
                            orderBy: "createdTime desc",
                            pageSize: 10,
                            q: query,
                            fields: "nextPageToken, files(id)"
                        });

                    requestLatestFolderFile.execute(function (resp) {
                        resolve(resp);
                    });
                });
            });

        }

        var service = {

            getTracsMainFolderName: getTracsMainFolderName,
            getTracsPrivateFolderName:getTracsPrivateFolderName,
            getTracsSharedFolderName:getTracsSharedFolderName,
            getFileId: getFileId,
            createDriveFolder: createDriveFolder,
            isFolderCreated: isFolderCreated,
            getFolderFiles: getFolderFiles,
            getSharedFolderFiles:getSharedFolderFiles,
            sendPermissionToUser: sendPermissionToUser,
            getLatestCreatedFileInFolder: getLatestCreatedFileInFolder,
            createDriveSharedFolder: createDriveSharedFolder
        };

        return service;
    }

})();

angular.module('core.auth')

    /**
     * @name core.auth.factory:AuthService
     * @description Service that contains methods for login, logout and reset user changes actions.
     * 
     */
    .factory('AuthService', ['$http', '$q', 'DataService',
        function($http, $q, DataService) {
            
            /**
             * @function _apiCallResult
             * @description Method for HTTP POST request to the server
             * @param {String} url - request url.
             * @param {Object} data - provided data (username and password for login).
             * @param {Object} headers - provided request headers (access token for logout and resetChanges).
             * @param {Boolean} n - indicates the need to nullify userInfo data (set false for logout only).
             * @returns {Object} Resolved or rejected promise. Resolved promise provides userInfo data from the server.
             * 
             */
            let _apiCallResult = (url, data, headers, n) => {
                let deferred = $q.defer();

                $http({
                    method: 'POST',
                    url: url,
                    data: data,
                    headers: headers
                }).then((result) => {
                    let userInfo = null;
                    if (n) userInfo = {
                        accessToken: result.data.access_token,
                        username: result.data.username,
                        dots: result.data.dots
                    };
                    DataService.setUserInfo(userInfo);
                    deferred.resolve(userInfo);
                }, (error) => {
                    deferred.reject(error);
                });

                return deferred.promise;
            };

            function login(username, password) {
                return _apiCallResult('/api/login', { username: username, password: password }, {}, true);
            }
             
            function logout() {
                return _apiCallResult('/api/logout', {}, { 'access_token': DataService.getUserInfo().accessToken }, false);
            }

            function resetChanges() {
                return _apiCallResult('/api/reset', {}, { 'access_token': DataService.getUserInfo().accessToken }, true);
            }
                
            return {
                login,
                logout,
                resetChanges
            };

        }
    ]);
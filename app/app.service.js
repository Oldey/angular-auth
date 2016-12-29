angular.module('statesApp')
    .factory('DataService', ['$window',
        function($window) {

            var _userInfo,
                _key = 'userInfo';

            function getUserInfo() {
                return _userInfo;
            }

            function setUserInfo(userInfo) {
                _userInfo = userInfo;
                if (userInfo) {
                    $window.localStorage[_key] = JSON.stringify(userInfo);
                }
                else {
                    $window.localStorage.removeItem(_key);
                }
                return _userInfo;
            }

            function init() {
                if ($window.localStorage[_key]) {
                    _userInfo = JSON.parse($window.localStorage[_key]);
                }
            };
            init();

            return {
                getUserInfo,
                setUserInfo
            };

        }
    ]);
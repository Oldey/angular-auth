/**
 * @name map.component:map
 * @description Component provides user interaction with the map and basic CRUD functionality.
 * 
 */
angular.module('map')
    .component('map', {
        bindings: {
            auth: '<' // promise object contains data associated with an authorized user (because been resolved)
        },
        templateUrl: 'map/map.template.html',

        /**
         * @name map.controller:MapController
         * @description Controller defines basic logic for map component and is responsible for correct model data presentation
         * 
         */
        controller: ['$state', '$http', '$timeout', 'AuthService', 'DataService', 'NotifyService',
        function MapController($state, $http, $timeout, AuthService, DataService, NotifyService) {

            this.$onInit = () => {
                this.userData = this.auth; // this.auth.dots is an array of dots with properties: amount, name, x, y
                this.dotRadius = 10;
                this.dotOffset = this.dotRadius / 10;

                // "current" (in context of CRUD operations) dot object and its index
                this.current = null;
                this.currentIndex = null;

                // methods for pixel-percent canvas coordinates conversion
                this.getPercentW = (coord) => coord / this.canvasSize.width * 100;
                this.getCoordW = (percent) => percent * this.canvasSize.width / 100;
                this.getPercentH = (coord) => coord / this.canvasSize.height * 100;
                this.getCoordH = (percent) => percent * this.canvasSize.height / 100;

                // method used in context of any event that requires changing "current" dot object
                this.updateCurrent = (item) => {
                    return {
                        name: item.name,
                        amount: item.amount,
                        x: item.x,
                        y: item.y
                    };
                };

                /**
                 * @function registerDragEventsHandler
                 * @description Method attaches drag event handlers (for drag move, drag start and drag end) to a given dot.
                 *              The idea to limit the drag range of each circle is from here http://bl.ocks.org/mbostock/1557377
                 *              x is being limited to the range [radius, canvasWidth - radius]
                 *              y is being limited to the range [radius, canvasHeight - radius]
                 * @param {Object} item - provided userData.dots array element.
                 * @param {Number} i - index of item.
                 *
                 */
                this.registerDragEventsHandler = (item, i) => {
                    item.dot.drag(
                        (dx, dy, posx, posy) => { // drag move
                            let cx = posx + window.pageXOffset - document.querySelector('.svg-wrapper').offsetLeft,
                                cy = posy + window.pageYOffset - document.querySelector('.header').clientHeight;
                            item.dot.attr({
                                cx: Math.max(this.dotOffset, Math.min(this.canvasSize.width - this.dotOffset, cx)),
                                cy: Math.max(this.dotOffset, Math.min(this.canvasSize.height - this.dotOffset, cy))
                            });
                            item.x = this.getPercentW(item.dot.attr('cx'));
                            item.y = this.getPercentH(item.dot.attr('cy'));
                            $timeout(() => {
                                this.current = this.updateCurrent(item);
                            });
                        },
                        () => { // drag start
                            //console.log("Move started" + " cx = " + this.attr('cx') + " cy = " + this.attr('cy'));
                            $timeout(() => {
                                this.current = this.updateCurrent(item);
                            });
                            this.currentIndex = i;
                        },
                        () => { // drag end
                            DataService.setUserInfo(this.userData);
                        }
                    );
                };

                this.messages = {
                    added: false,
                    edited: false,
                    deleted: false
                };

                // initial setting for svg canvas
                let svgUrl = 'map/tutzing.svg';
                $http.get(svgUrl)
                    .success((result) => {
                        let svg = angular.element(result);
                        let elem = document.querySelector('#map');
                        elem.replaceWith(svg[2]);
                        this.canvasSize = {
                            width: svg[2].width.baseVal.value,
                            height: svg[2].height.baseVal.value
                        };

                        document.querySelector('#canvas').setAttribute('width', this.canvasSize.width);
                        document.querySelector('#canvas').setAttribute('height', this.canvasSize.height);
                        this.canvas = Snap('#canvas');

                        // initial dots drawing and registerDragEventsHandler call for each of them
                        this.userData.dots.forEach((item, i) => {
                            if (item) {
                                item.dot = this.canvas.circle(this.getCoordW(item.x), this.getCoordH(item.y), this.dotRadius);
                                this.registerDragEventsHandler(item, i);
                            }});
                    })
                    .error((error) => {
                        console.log(error);
                    });
            };

            // "Add button click" event handler
            this.add = () => { // TODO manage adding an existent dot
                let dot = this.canvas.circle(this.getCoordW(this.current.x), this.getCoordH(this.current.y), this.dotRadius);
                this.userData.dots.push({
                    name: this.current.name,
                    amount: this.current.amount,
                    x: this.current.x,
                    y: this.current.y,
                    dot //dot: dot
                });
                DataService.setUserInfo(this.userData);
                let index = this.userData.dots.length - 1;
                this.currentIndex = index;
                this.registerDragEventsHandler(this.userData.dots[index], index);
                NotifyService.showMessage(this.messages, 'added');
            };

            // "Edit button click" event handler    
            this.edit = () => {
                this.userData.dots[this.currentIndex].name = this.current.name;
                this.userData.dots[this.currentIndex].amount = this.current.amount;
                let dx = this.getCoordW(this.userData.dots[this.currentIndex].x - this.current.x);
                let dy = this.getCoordH(this.userData.dots[this.currentIndex].y - this.current.y);
                this.userData.dots[this.currentIndex].x = this.current.x;
                this.userData.dots[this.currentIndex].y = this.current.y;
                DataService.setUserInfo(this.userData);
                this.userData.dots[this.currentIndex].dot.attr({
                    cx: this.userData.dots[this.currentIndex].dot.attr('cx') - dx,
                    cy: this.userData.dots[this.currentIndex].dot.attr('cy') - dy
                });
                NotifyService.showMessage(this.messages, 'edited');
            };
            
            // "Delete button click" event handler 
            this.delete = () => {
                this.userData.dots[this.currentIndex].dot.remove();
                this.current = null;
                delete this.userData.dots[this.currentIndex];
                DataService.setUserInfo(this.userData);
                this.currentIndex = null;
                NotifyService.showMessage(this.messages, 'deleted');
            };
            
            // "Clear button click" event handler, requires authentication
            this.clear = () => {
            AuthService.resetChanges()
                .then((result) => {
                    this.userData = result;
                    $state.reload();
                }, (error) => {
                    console.log(error);
                });
            };
            
            // Logout event handler, requires authentication
            this.logout = () => {
                AuthService.logout()
                .then((result) => {
                    this.userData = null;
                    DataService.setUserInfo(this.userData);
                    $state.go('login');
                }, (error) => {
                    console.log(error);
                });
            };
            
        }
    ]});
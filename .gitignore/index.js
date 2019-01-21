angular.module('Examen', ['ngRoute'])
    .config(
        function($routeProvider) {
            $routeProvider
                .when('/', {templateUrl: 'form.html', controller: 'IndexController'})
                .when('/result', {templateUrl: 'result.html', controller: 'ResultController'})
        }
    )
    .controller(
       'IndexController', 
       function($scope, $http) {
           /**
            * Entidad para manejar los datos del formulario.
            */
           const url = 'http://api.geonames.org/searchJSON?q=mexico&maxRows=10&username=lobofbg&name='
            $scope.obj = {
                nombre: '',
                email: '',
                telefono: '',
                fecha: '',
                ciudad: ''
            };

            $scope.ciudades = [];
            $scope.errores = [];
            $scope.emailFormat = /^[a-z]+[a-z0-9._]+@[a-z]+\.[a-z.]{2,5}$/;

            $scope.init = function() {
                $( '#txtFecha' ).datepicker();
                $( 'button, input, a' ).click( function(event) { event.preventDefault(); });
                $( '#txtCiudad' ).autocomplete({ source: $scope.ciudades });
            
            };

            $scope.obtenerCiudades = function() {
                if($scope.obj.ciudad.length < 2) return;
                $scope.ciudades = [];
                $http.get(`${url}${$scope.obj.ciudad}`)
                    .then(
                        (resultado) => {
                            resultado.data.geonames.forEach(i => {
                                $scope.ciudades.push(`${i.name}, ${i.adminName1}, ${i.countryName}`) 
                            })
                            $( '#txtCiudad' ).autocomplete({ source: $scope.ciudades });
                        }
                    )
            };

            $scope.validar = function(form) {
                if(form.$valid) return true;
                
                if( form.$error.required) {
                    form.$error.required.forEach(i => {
                        switch(i.$name) {
                            case 'nombre':
                            $scope.errores.push('El nombre es requerido.');
                            break;
    
                            case 'email':
                            $scope.errores.push('El email es requerido.');
                            break;
    
                            case 'telefono':
                            $scope.errores.push('El telefono es requerido.');
                            break;
    
                            case 'fecha':
                            $scope.errores.push('La fecha requerida.');
                            break;
    
                            case 'ciudad':
                            $scope.errores.push('La ciudad requerida.');
                            break;
                        }
                    });
                }

                if(form.$error.pattern) 
                    $scope.errores.push('El numero de telefono no es valido')

                if(form.$error.email) 
                    $scope.errores.push('El email no es valido')

                $( "#dialog" ).dialog()
                return false;
            };

            $scope.enviar = function(form) {
                if($scope.validar(form)) {
                    sessionStorage.setItem('persona', JSON.stringify($scope.obj))
                    window.location.href = `#!/result`
                }
            };
    })
    .controller(
        'ResultController',
        function($scope) {
            $scope.obj = null;
            
            var CLIENT_ID = '685977419190-3gmaov3g94ua2qp8a0c28lruhiparp2v.apps.googleusercontent.com';
            var SCOPES = ['https://mail.google.com/', 'https://www.googleapis.com/auth/gmail.send', 'https://www.googleapis.com/auth/gmail.modify', 'https://www.googleapis.com/auth/gmail.labels'];
            var apiKey = 'DFVcq_iisqGZb3nwc65NUtZk';
    
            $scope.handleClientLoad = function () {
                gapi.client.setApiKey(apiKey);
                window.setTimeout(checkAuth, 1);
              }
              
              $scope.checkAuth = function () {
                gapi.auth.authorize({
                  client_id: clientId,
                  scope: scopes,
                  immediate: true
                }, handleAuthResult);
              }
              $scope.handleAuthClick = function () {
                gapi.auth.authorize({
                  client_id: clientId,
                  scope: scopes,
                  immediate: false
                }, handleAuthResult);
                return false;
              }
              $scope.handleAuthResult = function (authResult) {
                if(authResult && !authResult.error) {
                  loadGmailApi();
                  $('#authorize-button').remove();
                  $('.table-inbox').removeClass("hidden");
                  $('#compose-button').removeClass("hidden");
                } else {
                  $('#authorize-button').removeClass("hidden");
                  $('#authorize-button').on('click', function(){
                    handleAuthClick();
                  });
                }
              }

              $scope.displayInbox = function () {
                var request = gapi.client.gmail.users.messages.list({
                  'userId': 'me',
                  'labelIds': 'INBOX',
                  'maxResults': 10
                });
                request.execute(function(response) {
                  $.each(response.messages, function() {
                    var messageRequest = gapi.client.gmail.users.messages.get({
                      'userId': 'me',
                      'id': this.id
                    });
                    messageRequest.execute(appendMessageRow);
                  });
                });
              }

              $scope.loadGmailApi = function () {
                gapi.client.load('gmail', 'v1', $scope.displayInbox);
              }

            $scope.init = function() {
                $scope.obj = JSON.parse(sessionStorage.getItem('persona'))
                const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
                let dia  = new Date($scope.obj.fecha.replace('/', '-')); 
                $scope.obj.fecha = dia.toLocaleDateString("es-MX", options)
                $scope.loadGmailApi()
               
            }
    
        }
    );
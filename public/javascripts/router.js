angular.module('myApp', ['ui.router','searchModel'])
	.config(function ($locationProvider,$urlRouterProvider,$stateProvider) {
	  $locationProvider
	  .html5Mode({
	    enabled: true, 
	    requireBase: false
	  });

	  $urlRouterProvider
	  .when('/','/fuzzquery')
	  .otherwise('/fuzzquery')

	  $stateProvider
	  .state('fuzzquery',{
	    url:'/fuzzquery',
	    templateUrl:'views/test.html',
	    controller:'fuzzqueryCtrl'
	  })
	})




  
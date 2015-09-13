app.service('HelperUtilService', ['$resource', function ($resource) {
	'use strict';
	
	this.isEmpty = function(str) {
		return !str || !/[^\s]+/.test(str);
	};
	
	
	this.getCurrentDate = function() {
		var d = new Date();

		var month = d.getMonth()+1;
		var day = d.getDate();

		return (((''+month).length<2 ? '0' : '') + month + '/' +
		        ((''+day).length<2 ? '0' : '') + day + '/' + 
		        d.getFullYear());
	};
	
	// 2 weeks from today
	this.getExpirationDate = function() {
		var d = new Date(+new Date + 14 * (1000 * 60 * 60 * 24)); 

		var month = d.getMonth()+1;
		var day = d.getDate();

		return (((''+month).length<2 ? '0' : '') + month + '/' +
		        ((''+day).length<2 ? '0' : '') + day + '/' + 
		        d.getFullYear());
	};
	
	
	// Convert Date to MM/DD/YYYY format
	// for Today's date => numberOfDaysPriorToToday = 0
    this.formatDateString = function(numberOfDaysPriorToToday) {
		
		var todaysDate = new Date();
		todaysDate.setDate(todaysDate.getDate() - numberOfDaysPriorToToday);
		
		return (todaysDate.getMonth() + 1) + '/' + todaysDate.getDate() + '/' +  todaysDate.getFullYear();
			
	};
	
}]);

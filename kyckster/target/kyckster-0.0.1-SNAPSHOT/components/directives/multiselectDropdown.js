app.directive('multiselectDropdown', ['$document', function($document) {
		
		'use strict';
		return function(scope, element, attrs) {
	        
	        element = $(element[0]); // Get the element as a jQuery element
	        
	        // Below setup the dropdown:
	        
	        element.multiselect({
	            buttonClass : 'btn btn-small',
	            buttonWidth : '200px',
	            buttonContainer : '<div class="btn-group" />',
	            maxHeight : 200,
	            enableFiltering : true,
	            enableCaseInsensitiveFiltering: true,
	            buttonText : function(options) {
	                if (options.length == 0) {
	                    return element.data()['placeholder'] + ' <b class="caret"></b>';
	                } else if (options.length > 1) {
	                    return _.first(options).text 
	                    + ' + ' + (options.length - 1)
	                    + ' more selected <b class="caret"></b>';
	                } else {
	                    return _.first(options).text
	                    + ' <b class="caret"></b>';
	                }
	            },
	            // Replicate the native functionality on the elements so
	            // that angular can handle the changes for us.
	            onChange: function (optionElement, checked) {
	                optionElement.removeAttr('selected');
	                if (checked) {
	                    optionElement.attr('selected', 'selected');
	                }
	                element.change();
	            }
          
	        });
	        
	        
	   
	        // set the multi-select dropdown the same height as the regular dropdown
	        angular.element($document[0].querySelector('.ui-multiselect')).css('height', attrs.height);
           
            
	        // Watch for any changes to the length of our select element
	        // scope.$watch(function () {
	        //     return element[0].length;
	        // }, function () {
	        //     element.multiselect('rebuild');
	        //});
	        
	        // Watch for any changes from outside the directive and refresh
	        scope.$watch(attrs.ngModel, function () {
	            element.multiselect('refresh');
	        });
	        
	        // Below maybe some additional setup
	    };
	    
	}]);
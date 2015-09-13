/*
	@license Angular Treeview version 0.1.6
	ⓒ 2013 AHN JAE-HA http://github.com/eu81273/angular.treeview
	License: MIT


	[TREE attribute]
	angular-treeview: the treeview directive
	tree-id : each tree's unique id.
	tree-model : the tree model on $scope.
	node-id : each node's id
	node-label : each node's label
	node-children: each node's children

	Note: This has changed, see below
	<div
		data-angular-treeview="true"
		data-tree-id="tree"
		data-tree-model="roleList"
		data-node-id="roleId"
		data-node-label="roleName"
		data-node-children="children" >
	</div>
	
	=================================================================
	Note:  This directive has been adapted from it's original incarnation licensed under MIT
	and is now altered and maintained as part of newton source, not as a 3rd party library.
	As such, updates are no longer possible.  In addition, the seperate CSS has been 
	incorporated into our app's CSS: style.css.   SVN version history can be obtained as the base
	revision will be the directive as it was first used (with the only exception being this comment
	is added).
	
	<div
		tree-view
		tree-id="controller_variable"			: Maps to controller variable to hold selected node and tree instance
		tree-model="controller_tree_model"      : Maps to var in controller that holds entire model
		data-template-url="detailTree.html"	    : Maps to url for location of recursively expanding template
	</div>
	
	Tree model data structure (uses default for id, label, children):
	{
		"displayName" : "text",  				Any combo of text/HTML. Cannot be angular bound
		"id"          : "nodeid",
		"hyperlink"   : boolean
		"nodeType"    : "string"				progress, uso, sr, cr 
		"hasErrors"   : boolean					defined only if uso
		"children"    : []						Array of other nodes all with the same properties
	} 
	
*/

app.directive('treeView', function ($compile, $sanitize, $http, $templateCache) {
	'use strict';

	return {
		
        restrict: 'E, A, C',

        //Declare isolate scope so we can use multiple tree controls in the same controller
        //and we don't bear the danger of controller scope effecting anything here
        scope: {
        	treeId:  "=",			//Maps to object name that holds the data bound to this instance
        	treeModel: "=",			//Maps to the tree model setup in the controller
        	baseTemplate: "="
        },

		link: function ( scope, element, attrs ) {

			scope.treeTemplateUrl = "";
			
        	scope.$watch('treeModel', function() {
	            	
    			//Setup tree generation / re-generation based on changes in the model
    			//This sets up a watch on this collection, which may be a child (or children)
    			//of a parent since the DOM injection is recursive
    			
        		scope.treeTemplateUrl = attrs.templateUrl;
        		if ( scope.baseTemplate != undefined && scope.baseTemplate != "" )
        			scope.treeTemplateUrl = scope.baseTemplate;
    			
				//check tree id, tree model
				if( scope.treeId && scope.treeModel ) {

					//if node head clicks,  usually the folder
					scope.treeId.selectNodeHead = scope.treeId.selectNodeHead || function( selectedNode ) {
						//Collapse or Expand
						selectedNode.collapsed = !selectedNode.collapsed;
					};

					//if node label clicks,
					scope.treeId.selectNodeLabel = scope.treeId.selectNodeLabel || function( selectedNode ) {

						//remove highlight from previous node
						if( scope.treeId.currentNode && scope.treeId.currentNode.selected ) {
							scope.treeId.currentNode.selected = undefined;
						}

						selectedNode.selected = 'selected';				//set highlight to selected node
						scope.treeId.currentNode = selectedNode;		//set the current node... bind to this in the controller
					};
					

					//This usually gets overridden by the controller holding this tree.  If not, no hard in sending clicks to the console.
					scope.treeId.nodeInternalLinkClicked = scope.treeId.nodeInternalLinkClicked || function( clickedNode ) {
				        console.log( 'Node link clicked but controller not handling it!! -> ' + clickedNode.id );
				    };
				    
	
					//Load the template if it's not caches already and expand it one level
					//which will create another directive of the same
					
					$http.get(scope.treeTemplateUrl, {cache: $templateCache}).success(function(html) {
						element.html('').append( $compile( html )( scope ) );	//have to compile the template for angular
					});
				}
				
        	});   //watch on treeModel
		} //link function
	}; //directive object
}); //directive registration

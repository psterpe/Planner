var nextUid = 0;

var plannerApp = angular.module('planner', ['ui.sortable']);

plannerApp.controller('GridController', ['$rootScope', '$scope', 'GridService', function($rootScope, $scope, GridService) {
    $scope.weeks = [];
    $scope.firstMonday = '';
    $scope.weekCount = 16;
    $scope.filename = '';
    $scope.planlist = [];
    $scope.loadAdditive = false;
    
    $scope.updateGrid = function() {
	if (new Date($scope.firstMonday) == 'Invalid Date') {
	    alert('Enter a valid First Monday date');
	    return;
	}
	else {
	    $scope.weeks = [];
	    var mondayMoment = moment($scope.firstMonday, "MM/DD/YYYY");
	    for (var i = 0; i < $scope.weekCount; i++) {
		$scope.weeks.push(mondayMoment.toString());
		mondayMoment.add(1, 'weeks');
	    }
	}
    };

    $scope.saveGrid = function() {
	if ($scope.filename == '') {
	    alert('Enter a filename');
	}
	else {
	    GridService.saveGrid({
		firstMonday: $scope.firstMonday,
		weekCount: $scope.weekCount,
		filename: $scope.filename
	    }).then(function(saveResponse) {
		alert('Response from save: ' + saveResponse);
	    });
	}
    };

    $scope.listPlans = function() {
	GridService.listPlans().then(function(planlist) {
	    $scope.planlist = planlist;
	});
    };

    $scope.loadPlan = function(plan) {
	GridService.loadPlan(plan).then(function(response) {
	    if (response.error) {
		alert('Error loading plan: ' + response.plan); // Contains error text
		return;
	    }
	    
	    var plandata = JSON.parse(response.plan);

	    if (plandata.firstMonday != $scope.firstMonday || plandata.weekCount != $scope.weekCount) {
		$scope.firstMonday = plandata.firstMonday;
		$scope.weekCount = plandata.weekCount;
		$scope.updateGrid();
	    }
	    
	    if (!$scope.loadAdditive) {
		GridService.clearGrid();
	    }
	    
	    var gridkeys = Object.keys(plandata.gridLists);

	    for (var i = 0; i < gridkeys.length; i++) {
		var listId = gridkeys[i];
		var savedItems = plandata.gridLists[listId];
		for (var j = 0; j < savedItems.length; j++) {
		    var itemObj = savedItems[j];
		    itemObj['uid'] = nextUid++;
		    itemObj['selected'] = false;
		    GridService.addItemDirect(listId, itemObj);
		}
	    }

	    $scope.filename = plan;
	    $scope.planlist = [];
	});
    };

    $scope.deleteSelected = function() {
	var delCount = GridService.getSelectCounter();
	if (delCount == 0) {
	    alert('No items selected.');
	}
	else {
	    var pluralize = delCount > 1 ? 's' : '';
	    var mesg = 'Delete ' + delCount  + ' item' + pluralize;
	    var result = window.confirm(mesg);
	    if (result) {
		$rootScope.$broadcast('deleteSelected');
	    }
	}
    };

    $scope.countSelected = GridService.getSelectCounter;
}]);

plannerApp.factory('GridService', ['$http', function($http) {
    var factory = {};

    var gridLists = {};

    var totalSelected = 0;
    
    var constructSavePayload = function(firstMonday, weekCount) {
	var itemsToSave = {};
	var gridkeys = Object.keys(gridLists);

	for (var i = 0; i < gridkeys.length; i++) {
	    var iarray = gridLists[gridkeys[i]];
	    if (iarray.length > 0) {
		var savearray = [];
		for (var j = 0; j < iarray.length; j++) {
		    savearray.push({itype: iarray[j].itype, text: iarray[j].text});
		}
		itemsToSave[gridkeys[i]] = savearray;
	    }
	}

	var p = {
	    firstMonday: firstMonday,
	    weekCount: weekCount,
	    gridLists: itemsToSave
	};

	return p;
    };

    factory.makeList = function(listId) {
	if (gridLists[listId] == undefined) {
	    gridLists[listId] = [];
	}

	return gridLists[listId];
    };

    factory.listPlans = function() {
	return $http.get('http://localhost:8000/planserver/listplans').then(function(response) {
	    return response.data.planlist;
	});
    };

    factory.saveGrid = function(args) {
	var payload = constructSavePayload(args.firstMonday, args.weekCount);
	var csrftoken = $(document).find('input[name=csrfmiddlewaretoken').val();

	var req = {
	    method: 'POST',
	    url: 'http://localhost:8000/planserver/save',
	    data: {filename: args.filename, payload: payload},
	    headers: {'Content-Type': 'application/json; charset=UTF-8', 'X-CSRFToken': csrftoken}
	};
	
	return $http(req).then(function(response) {
	    return response.data;
	});
    };

    factory.loadPlan = function(plan) {
	return $http.get('http://localhost:8000/planserver/load?plan=' + plan).then(function(response) {
	    return response.data;
	});
    };

    factory.addItemDirect = function(listId, itemObj) {
	var theList = factory.makeList(listId);
	theList.push(itemObj);
    };

    factory.clearGrid = function() {
	var gridkeys = Object.keys(gridLists);
	for (var i = 0; i < gridkeys.length; i++) {
	    var listId = gridkeys[i];
	    if (listId == 'topic' || listId == 'holiday' || listId == 'exam' || listId == 'guest') {
		continue;
	    }
	    else {
		var items = gridLists[listId];
		for (var j = items.length - 1; j >= 0; j--) {
		    // Delete all items from array, but don't re-create the array
		    items.splice(j, 1);
		}
	    }
	    
	}
    };

    factory.changeSelectCounter = function(delta) {
	totalSelected += delta;
    };

    factory.getSelectCounter = function() {
	return totalSelected;
    }
    
    return factory;
}]);

/* editInPlace directive borrowed and adapted from https://jsfiddle.net/joshdmiller/NDFHg/ */
plannerApp.directive( 'editInPlace', function() {
    return {
	restrict: 'E',
	scope: { value: '=' },
	template: '<span ng-dblclick="edit()" ng-bind="value"></span><input ng-model="value"></input>',
	link: function ( $scope, element, attrs ) {
	    // Let's get a reference to the input element, as we'll want to reference it.
	    var inputElement = angular.element( element.children()[1] );
      
	    // This directive should have a set class so we can style it.
	    element.addClass( 'edit-in-place' );
      
	    // Initially, we're not editing.
	    $scope.editing = false;
      
	    // ng-click handler to activate edit-in-place
	    $scope.edit = function () {

		$scope.editing = true;
        
		// We control display through a class on the directive itself. See the CSS.
		element.addClass( 'active' );
        
		// And we must focus the element. 
		// `angular.element()` provides a chainable array, like jQuery so to access a native DOM function, 
		// we have to reference the first element in the array.
		inputElement[0].focus();
	    };
      
	    // Hitting Enter or Esc completes the editing
	    inputElement.keyup(function(e) {
		if (e.keyCode == 13 || e.keyCode == 27) {
		    $scope.editing = false;
		    element.removeClass( 'active' );
		}});
	}
    };
});

plannerApp.directive('itemAdder', [function() {
    function link(scope, element, attrs) {
	element.find('input[type=text]')
	    .on('enterKey', scope.addButton)
	    .keyup(function(e) {
	    if (e.keyCode == 13) {
		$(this).trigger('enterKey');
		scope.$apply();
	    }
	    });
    }

    return {
	restrict: 'E',
	template: '<div class="itemAdder">\
	              <input type="text" ng-model="itemText" class="item-input" /><br/>\
	              <input type="button" value="Add {{listId}}" ng-click="addButton()"/>\
	           </div>',
	link: link,
	controller: ['$scope', '$element', function($scope, $element) {
	    $scope.listId = $scope.$parent.listId;
	    
	    $scope.addButton = function() {
		$scope.$broadcast('addItem', {listId: $scope.listId, text: $scope.itemText, itype: $scope.listId});
		$scope.itemText = '';
		$element.find('input[type=text]').focus();
	    };

	    $scope.itemText = '';

	    $scope.$on('editItem', function(event, item) {
		$scope.itemText = item.text;
		$element.find('input[type=text]').focus();
	    });
	}]
    }
}]);

plannerApp.directive('itemList', ['GridService', function(GridService) {
    return {
	restrict: 'E',
	template: '<ul ui-sortable="{connectWith: \'.itemList\'}" ng-model="data" class="itemList source"><li class="placeholder {{placeholderClass}}">{{listTitle}}</li><li ng-repeat="item in data" uid="{{item.uid}}" ng-click="selectItem(item)" class="{{item.itype}}" ng-class="{\'item-selected\':item.selected, \'item-deselected\':!item.selected}"><edit-in-place value="item.text"></edit-in-place></li></ul>',
	controller: ['$scope', '$element', function($scope, $element) {

	    // Thought scope would inherit prototypically from parent, so that the $parent references
	    // wouldn't be needed. And yet....
	    $scope.listId = $scope.listId || $scope.$parent.listId;
	    $scope.placeholderClass = $scope.$parent.placeholderClass;
	    $scope.listTitle = $scope.$parent.listTitle;
	    
	    $scope.itemBeingEdited = undefined;

	    $scope.data = GridService.makeList($scope.listId);

	    $scope.$on('addItem', function(event, args) {
		if (args.listId == $scope.listId) {
		    $scope.addItem(args.text, args.itype);
		}
	    });

	    $scope.$on('deleteSelected', function(event) {
		for (var i = $scope.data.length - 1; i >= 0; i--) {
		    if ($scope.data[i].selected) {
			$scope.data.splice(i, 1);
		    }
		}
	    });

	    $scope.addItem = function(text, itype) {
		var itemObj = {uid: nextUid++, text: text, selected: false, itype: itype};
		if ($scope.itemBeingEdited != undefined) {
		    $scope.updateItem($scope.itemBeingEdited, text);
		    $scope.itemBeingEdited = undefined;
		}
		else {
		    $scope.data.push(itemObj);
		}
	    };

	    $scope.updateItem = function(uid, text) {
		for (var i = 0; i < $scope.data.length; i++) {
		    if ($scope.data[i].uid == uid) {
			$scope.data[i].text = text;
			break;
		    }
		}
	    };
	    
	    $scope.selectItem = function(item) {
		for (var i = 0; i < $scope.data.length; i++) {
		    if ($scope.data[i].uid == item.uid) {
			$scope.data[i].selected = !$scope.data[i].selected;
			GridService.changeSelectCounter($scope.data[i].selected ? 1 : -1);
			break;
		    }
		}
	    };

	    $scope.editItem = function(item) {
		$scope.itemBeingEdited = item.uid;
		$scope.$emit('editItem', item);
	    };
	}]
    }
}]);

plannerApp.directive('itemContainer', [function() {
    var markup = '<div class="itemContainer" ng-transclude></div>';

    return {
	restrict: 'E',
	transclude: true,
	scope: true,
	controller: ['$rootScope', '$scope', '$element', function($rootScope, $scope, $element) {
	    $scope.listId = $element.attr('list-id');
	    $scope.listTitle = $element.attr('list-title');
	    $scope.placeholderClass = $scope.listId + 'Head';
	}],
	template: markup
    }
}]);

plannerApp.directive('paramBox', function() {
    var markup = '<div class="weekCount">\
                    <p><span>First Monday:</span><input type="text" class="right" id="firstMonday" ng-model="firstMonday" /></p>\
                    <p><span>Weeks:</span><input type="text" class="right" ng-model="weekCount" /></p>\
                    <input type="button" value="Update Grid" ng-click="updateGrid()" /><br/>\
                    <p>Filename:&nbsp;<input type="text" class="right" ng-model="filename" /><br/><input type="button" value="Save" ng-click="saveGrid()" /></p>\
                    <p>\
                      <input type="button" value="Load" ng-click="listPlans()" />\
                      <label class="right">\
                        <input type="checkbox" ng-model="loadAdditive" />Load additively\
                      </label>\
                    </p>\
                    <ul class="planlist" ng-model="planlist" ng-show="planlist.length > 0"/>\
                      <li ng-repeat="plan in planlist track by $index" ng-click="loadPlan(plan)">{{plan}}</li>\
                    </ul>\
                    <input type="button" value="Delete selected" ng-click="deleteSelected()" ng-show="countSelected() > 0" />\
                  </div>';

    function restrictToMondays(d) {
	var isMonday = d.getDay() == 1;
	var ret = [isMonday,
		   '',
		   ''];

	return ret;
    }
    
    function link(scope, element, attrs) {
	element.find('input#firstMonday').datepicker({beforeShowDay: restrictToMondays});
    }
    
    return {
	restrict: 'E',
	link: link,
	template: markup
    }
});

plannerApp.directive('gridSquare', function() {
    var markup = '<div class="ui-widget-content gridsquare"><item-list></item-list></div>';

    function link(scope, element, attrs) {
	scope.listTitle = scope.listId;
    }
    
    return {
	restrict: 'E',
	link: link,
	scope: true,
	template: markup,
	controller: ['$scope', '$element', function($scope, $element) {
	    var monday = $scope.w;
	    var dtMonday = new Date(monday);
	    var m = moment(dtMonday)
	    var thisDay = $element.attr('d');
	    var thisDt = m.add(thisDay, 'days');

	    var squareDate = thisDt.format('M/D');
	    $scope.listId = squareDate;
	}]
    }
});

plannerApp.directive('gridRow', function() {
    var markup = '<div class="gridRow">\
                    <grid-square d=0></grid-square>\
                    <grid-square d=1></grid-square>\
                    <grid-square d=2></grid-square>\
                    <grid-square d=3></grid-square>\
                    <grid-square d=4></grid-square>\
                  </div>';

    return {
	restrict: 'E',
	template: markup
    }
});


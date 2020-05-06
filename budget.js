
// keeps track of all income, expenses, budget and precentages
var budgetController = (function() {

	var Expense = function(id, description, value) {
		this.id = id;
		this.description = description;
		this.value = value;
		this.percentage = -1;
	};

	Expense.prototype.calcPercentage = function(totalIncome) {
		if (totalIncome > 0) {
			this.percentage = Math.round((this.value / totalIncome)*100);
		} else {
			this.percentage = -1;
		}
	};

	Expense.prototype.getPercentage = function() {
		return this.percentage;
	};

	var Income = function(id, description, value) {
		this.id = id;
		this.description = description;
		this.value = value;
	};

	var calculateTotal = function(type) {
		var sum = 0;
		data.allItems[type].forEach(function(current, i, array) {
			// current is either an income or expense object with 3 properties
			sum += current.value;
		});
		
		// same as
		// data.totals.exp = sum;
		data.totals[type] = sum;
	};

	var data = {
		allItems: {
			exp: [],
			inc: []
		},
		totals: {
			exp: 0,
			inc: 0
		},
		budget: 0,
		percentage: -1
	};

	// allow other modules to add an item into our data structure
	// Public methods
	return {
		addItem: function(type, des, val) {
			var newItem, id;

			// unique number we want to assign to each new item that
			// we put in either the expense or income arrays for all items
			if (data.allItems[type].length > 0) {
				var lastElement = data.allItems[type].length - 1
				id = data.allItems[type][lastElement].id + 1;
			} else {
				id = 0;
			}

			// create new item based on inc or exp type
			if (type === "exp") {
				newItem = new Expense(id, des, val);
			} else if (type === "inc") {
				newItem = new Income(id, des, val);
			}

			// push into our data structure
			// similar to data.allItems.exp.push(newItem);
			data.allItems[type].push(newItem);
			// return the new item so that the other function that will call this method
			// has direct access to the item created here
			return newItem;
		},

		deleteItem: function (type, id) {
			var idsArr, index;
			// var allItemsLen = data.allItems[type].length;
			// for (var i = 0; i < allItemsLen; i++) {
			// 	//alert("testing for data structure: " + data.allItems[type][i].id + " type: " + typeof(data.allItems[type][i].id));
			// 	//alert("testing for input: " + id + " type: " + typeof(id));
			// 	if (data.allItems[type][i].id === parseInt(id)) {
			// 		console.log("found element");
			//		can delete it using splice here since we have i
			// 	}
			// }
			// in this instance, I use map for practice purposes
			// map returns a new array 
			// a new array with the ids will be created
			var idsArr = data.allItems[type].map(function(current, i, array) {
				return current.id;
			});

			index = idsArr.indexOf(id);

			if (index !== -1) {
				data.allItems[type].splice(index, 1);	
			}
			
		},

		// calculate sum of all income and expenses
		// and calculate percentage
		calculateBudget: function() {
			// calculate total income and expenses
			calculateTotal('exp');
			calculateTotal("inc");
			// calculate the budget: income - expenses
			data.budget = data.totals.inc - data.totals.exp;
			// calculate percentage of income that we spend
			if (data.totals.inc > 0) {
				data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
			} else {
				// -1 to indicate that there's no percentage
				data.percentage = -1;
			}
		},

		// calculate the percentage on each individual object
		calculatePercentages: function() {
			data.allItems.exp.forEach(function (current) {
				current.calcPercentage(data.totals.inc);
			}); 
		},

		// return an array with all the calculated percetages
		getPercentages: function () {
			var allPercentages = data.allItems.exp.map(function(current) {
				return current.getPercentage();
			});
			return allPercentages;
		},

		getBudget: function() {
			return {
				budget: data.budget,
				totalInc: data.totals.inc,
				totalExp: data.totals.exp,
				percentage: data.percentage
			};
		},

		testing: function () {
			console.log(data.allItems.exp[0].description);
			alert(data.allItems.exp[0].description);
			return data;
		}
	};

})();

///////// ---------------------------------------------------------------- ////////////
// create UI controller module
var UIController = (function() {

	var DOMstrings = {
		inputType: '.add__type',
		inputDescription: ".add__description",
		inputValue: ".add__value",
		inputBtn: ".add__btn",
		incomeContainer: ".income__list",
		expensesContainer: ".expenses__list",
		budgetLabel: ".budget__value",
		incomeLabel: ".budget__income--value",
		expenseLabel: ".budget__expenses--value",
		percentageLabel: ".budget__expenses--percentage",
		container: ".container",
		delBtnId: ".ion-ios-close-outline",
		expensesPercentageLabel: ".item__percentage"
	};

    // make the retrieved input values public
    return {
    	getInput: function() {
	    	return {
	    		// either inc or exp
	    		type: document.querySelector(DOMstrings.inputType).value,
	    		description: $(DOMstrings.inputDescription).val(),
	    		value: parseFloat($(DOMstrings.inputValue).val())
	    	};
    	},

    	addListItem: function(obj, type) {
    		var html, newHtml, element;
    		// Create HTML string with placeholder text
    		if (type === 'inc') {
    			element = DOMstrings.incomeContainer;
    			html = '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div> <div class="right clearfix"> <div class="item__value">%value%</div> <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div> </div> </div>'
    		} else if (type === 'exp') {
    			element = DOMstrings.expensesContainer;
    			html = '<div class="item clearfix" id="exp-%id%"> <div class="item__description">%description%</div> <div class="right clearfix"> <div class="item__value">%value%</div> <div class="item__percentage">21%</div> <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div> </div> </div>';
    		}
    		
    		// replace placeholder text with some actual data
    		newHtml = html.replace('%id%', obj.id);
    		newHtml = newHtml.replace('%description%', obj.description);
    		newHtml = newHtml.replace('%value%', obj.value);

    		// insert the HTML into the DOM
    		document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);

    	},

    	deleteListItem: function(elmIdToRemove) {
    		// $(DOMstrings.delBtnId).;
    		$("#" + elmIdToRemove).remove();
    	},

    	clearFields: function() {
    		var fields, fieldsArr;
    		fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);


    		fieldsArr = Array.prototype.slice.call(fields);
    		
    		fieldsArr.forEach(function(current, i, array) {
    			// current html element
    			current.value = "";
    		});
    		
    		// readjust the focus to description field
    		fieldsArr[0].focus();
    	},

    	displayBudget: function(obj) {
    		$(DOMstrings.budgetLabel).text(obj.budget);
    		$(DOMstrings.expenseLabel).text(obj.totalExp);
    		$(DOMstrings.incomeLabel).text(obj.totalInc);
    		$(DOMstrings.percentageLabel).text(obj.percentage);

    		if (obj.percentage > 0) {
    			var currentPercentage = $(DOMstrings.percentageLabel).text();
    			$(DOMstrings.percentageLabel).text(currentPercentage + "%");
    		} else {
    			$(DOMstrings.percentageLabel).text("___");
    		}
    	},

    	displayPercentages: function (percentages) {

    		// var fields = $(DOMstrings.expensesPercentageLabel);
    		var fields = document.querySelectorAll(DOMstrings.expensesPercentageLabel);

    		var nodeListForEach = function(list, callback) {
    			for (var i = 0; i < list.length; i++) {
    				callback(list[i], i);
    			}
    		};
    		// the second parameter is the callback method above
    		nodeListForEach(fields, function(current, index)  {
    			alert("Printing current percentage " + percentages[index]);
    			// function(current, i) is callback
    			if (percentages[index] > 0) {

    				current.textContent = percentages[index] + "%";
    			} else {
    				current.textContent = "---";
    			}
    		});
    	},

    	// expose DOMstrings to be public
    	getDOMstrings: function() {
    		return DOMstrings;
    	}
    };

})();

///////// ---------------------------------------------------------------- ////////////
// create this module to enable UIController and budgetController to 
// interact and know about each other
// Global app controller
var controller = (function(budgetCtrl, UICtrl) {

	var setupEventListeners = function() {

		var DOM = UICtrl.getDOMstrings();

		// user hits enter
		$(document).keypress(function (event) {
    		if (event.key === "Enter" || event.which === 13) {
        	// alert('enter key is pressed');
        		ctrlAddItem();
    		}
		});

		// user clicks on the add button to add item
		$(DOM.inputBtn).click(ctrlAddItem);

		// delete an item using event delegation
		$(DOM.container).click(ctrlDeleteItem);
	};

	var updateBudget = function () {
		// calculate budget
		budgetCtrl.calculateBudget();

		// return budget
		var budget = budgetCtrl.getBudget();
		// display the budget on the UI
		// console.log(budget);
		// display the budget on the UI
		UICtrl.displayBudget(budget);
	}

	var updatePercentage = function() {

		// calculate the percentages
		budgetCtrl.calculatePercentages();

		// read percentages from budget controller
		var allPercentages = budgetCtrl.getPercentages();

		// update UI
		UICtrl.displayPercentages(allPercentages);
	}

	var ctrlAddItem = function() {
		var value, description, type, newItem, input;
		// get field input data
		input = UICtrl.getInput();
		var isInputValaNumber = isNaN(input.value);
		var isInputValLargerThanZero = input.value > 0;
		var isInputDescEmpty = input.description === "";


		if (!isInputDescEmpty && isInputValLargerThanZero && !isInputValaNumber) {
			value = input.value;
			description = input.description;
			type = input.type;

			newItem = budgetCtrl.addItem(type, description, value);
			console.log("testing for " + input);
			// add the item to the budget controller

			// add the new item to the user interface 
			UICtrl.addListItem(newItem, type);

			UICtrl.clearFields();

			// calculate and update the budget
			updateBudget();

			// calculate and update percentages
			updatePercentage();
		}
	};

	var ctrlDeleteItem = function (event) {
		console.log(event.target);
		// if (event.target.className === "ion-ios-close-outline") {
		// 	console.log("clicked on the right place");
		// 	//delete the parent div
		// 	var parentNodeId = event.target.parentNode.parentNode.parentNode.parentNode.id;
		// 	console.log(parentContainer);
		// 	parentContainer.remove();
		// }
		var itemId, splitId, type, id;
		itemId = event.target.parentNode.parentNode.parentNode.parentNode.id;
		if (itemId) {
			splitId = itemId.split('-');
			type = splitId[0];
			id = parseInt(splitId[1]);

			// delete the item from the data structure
			budgetCtrl.deleteItem(type, id);

			// delete the item from the UI
			UICtrl.deleteListItem(itemId);

			// update and show new budget
			updateBudget();

			// calculate and update percentages if item deleted is an income list item
			updatePercentage();
		}
	};

	return {
		init: function() {
			console.log("Application has started");
			UICtrl.displayBudget({budget: 0,
				totalInc: 0,
				totalExp: 0,
				percentage: -1
			});
			setupEventListeners();
		}
	};

})(budgetController, UIController);

controller.init();






















// var controller = (function(budgetCtrl, UICtrl){

// 	var test = budgetCtrl.publicTest(5);

// 	// returns an object so we can use the data inside
// 	return {
// 		publicTest2: function() {
// 			console.log(test);
// 			return test;
// 		}
// 	}

// })(budgetController, UIController);





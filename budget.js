
// keeps track of all income, expenses, budget and precentages
var budgetController = (function() {

	var Expense = function(id, description, value) {
		this.id = id;
		this.description = description;
		this.value = value;
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
		percentageLabel: ".budget__expenses--percentage"
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
    			html = '<div class="item clearfix" id="income-%id%"> <div class="item__description">%description%</div> <div class="right clearfix"> <div class="item__value">%value%</div> <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div> </div> </div>'
    		} else if (type === 'exp') {
    			element = DOMstrings.expensesContainer;
    			html = '<div class="item clearfix" id="expense-%id%"> <div class="item__description">%description%</div> <div class="right clearfix"> <div class="item__value">%value%</div> <div class="item__percentage">21%</div> <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div> </div> </div>';
    		}
    		
    		// replace placeholder text with some actual data
    		newHtml = html.replace('%id%', obj.id);
    		newHtml = newHtml.replace('%description%', obj.description);
    		newHtml = newHtml.replace('%value%', obj.value);

    		// insert the HTML into the DOM
    		document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);

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

			// alert(input.value + " " + input.description + " " + input.type);
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





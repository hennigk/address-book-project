var inquirer = require("inquirer");
var prompt = require('prompt-promise');
var Promise = require("bluebird");

var mainMenuQuestions = [
    {
    type: 'list', 
    name: 'mainMenuInput', 
    message: "Main Menu \n Select one of the following options:",
    choices: [ 
        { name: 'Create a new address book entry',
        value: 1 },
        { name: 'Search for existing address book entries',
        value: 2 },
        { name: 'Exit the program',
        value: 0 }
        ]
    } ];

console.log("\n Welcome to The Adress Book!");

inquirer.prompt(mainMenuQuestions, function(mainMenuAnswers) {
	console.log(mainMenuAnswers);
});






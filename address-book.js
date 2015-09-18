var inquirer = require("inquirer");
var prompt = require('prompt-promise');
var Promise = require("bluebird");

var addressBookArray = [];

//function to change the usernames name to start with a 
//capital letter and the rest be lowercase

// function properName(inputName) { 
//     var firstLetter = inputName.charAt(0).toUpperCase();
//     var remainingName = inputName.slice(1).toLowerCase();
//     return firstLetter + remainingName;   
// }



//questions for the main menu - uses type: list
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

//questions for a new Enter
var newEnteryQuestions = [
    {
        type: 'input',
        name: 'firstName',
        default: 'John',
        message: 'First Name (manditory): ',
        filter: function (inputName) { 
            var firstLetter = inputName.charAt(0).toUpperCase();
            var remainingName = inputName.slice(1).toLowerCase();
            return firstLetter + remainingName; }
    },
    {
        type: 'input',
        name: 'lastName',
        default: 'Doe',
        message: 'Last Name (manditory): ',
        filter: function (inputName) { 
            var firstLetter = inputName.charAt(0).toUpperCase();
            var remainingName = inputName.slice(1).toLowerCase();
            return firstLetter + remainingName; }    
    },
    {
        type: 'confirm',
        name: 'birthday',
        message: 'Add Date of Birth?',
        default: false
    },
    { 
        type: 'list',
        name: 'birthMonth',
        message: 'Month: ', 
        choices: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
        when: function(newEnteryAnswers) {
            return newEnteryAnswers.birthday; }
    },
    {
        type: 'input',
        name: 'birthDay',
        message: 'Day: ',
        validate: function(birthDay) {
            if (birthDay > 31 || birthDay < 1 || isNaN(birthDay) ) {
                return "Enter a valid day"; }
            else {
                return true
            }    
        },
        when: function(newEnteryAnswers) {
            return newEnteryAnswers.birthday; }
    },
    {
        type: 'input',
        name: 'birthYear',
        message: 'Year: ',
        validate: function(birthYear) {
            if (birthYear > 2015 || birthYear < 1000 || isNaN(birthYear) ) {
                return "Enter a valid year"; }
            else {
                return true
            }    
        },
        when: function(newEnteryAnswers) {
            return newEnteryAnswers.birthday; }
    },
    {
        type: 'confirm',
        name: 'address',
        message: 'Add an Address?',
        default: false
    },
    
    {
        type: "checkbox",
        message: "Add an Address for (select all that apply) \n use <space> to select, and <enter> to submit",
        name: "addressSelector",
        choices: [{name: 'Home', checked: true}, 'Office', 'Other'],
        when: function(newEnteryAnswers) {
            return newEnteryAnswers.address; }
    }
    
];

//start of the program. 
console.log("\n Welcome to The Adress Book!");

//call function to get users input for main menu
inquirer.prompt(mainMenuQuestions, function(mainMenuAnswers) {
	if (mainMenuAnswers.mainMenuInput === 1) {
	    newEntery();
	}
	if (mainMenuAnswers.mainMenuInput === 2) {
	    //call function searchBook
	}
	if (mainMenuAnswers.mainMenuInput === 0) {
	    console.log("Ending The Program \nGoodbye");
	    //prompt.end();
	}

})

//function to get the info from the user. 
function newEntery(){
    inquirer.prompt(newEnteryQuestions, function(newEnteryAnswers) { 
        console.log(newEnteryAnswers);
    })
}
/*First name (mandatory) Yes
Last name (mandatory) Yes
Birthday (optional, any string is fine here) yes
Enter Address?: choose all or none out of home, work, other
If yes then ask for:
    Address line 1 (mandatory)
    Address line 2 (optional, any string is fine here)
    City (mandatory)
    Province (mandatory)
    Postal code (mandatory)
    Country (mandatory)
Enter Phone Number? ask if they need for home, work, other
If Yes: 
    Phone number (mandatory)
    Phone type (mandatory):
    landline
    cellular
    fax
Email? For each of home, work and other
If Yes: 
    Email address (mandatory)

call function  Viewing an exiting address
and view their entery.
*/





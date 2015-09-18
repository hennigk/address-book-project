var inquirer = require("inquirer");
//var prompt = require('prompt-promise');
var Promise = require("bluebird");
//var prompt = require('prompt');

//prompt = Promise.promisifyAll(prompt);
inquirer = Promise.promisifyAll(inquirer);

var addressBookArray = [];



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
        name: "addressSelector",
        message: "Add an Address for (select all that apply) \n use <space> to select, and <enter> to submit",
        choices: [{name: 'Home', checked: true}, 'Office', 'Other'],
        when: function(newEnteryAnswers) {
            return newEnteryAnswers.address; }
    },
];

var newAddressQuestions = [
    {
        type: 'input',
        name: 'address1',
        message: "Address line 1: ",
        validate: function(address1) {
            if (!address1) { return "Enter a valid address"; }
            else { return true; }
        }
    },
    {
        type: 'input',
        name: 'address2',
        message: "Address line 2 (optional): ",
    },
    {
        type: 'input',
        name: 'city',
        message: "City: ",
        validate: function(city) {
            if (!city) { return "Enter a valid city"; }
            else { return true; }
        }
    },
    {
        //this is valid for Canadian residents only
        type: 'input',
        name: 'postalCode',
        message: "Postal Code: ",
        filter: function(postalCode) {
            return postalCode.replace(/\s+/g, '').toUpperCase(); //removes any spaces and changes it to uppercase
        },
        validate: function(postalCode) {
            var postValidator = true;
            if (postalCode.length !== 6) {
                postValidator = false;
            }
            for (var i = 0; i < postalCode.length; i=i+2) {
                if (!isNaN(postalCode.charAt(i))) { //verify that that there is a string at position 0, 2, 4 
                    postValidator = false; }
                if (isNaN(postalCode.charAt(i+1))){  //verify that that there is a number at position 1, 3,5 
                    postValidator = false }
            }
            return postValidator || "enter a valid postal code";
        }
    },
    {
        type: 'input',
        name: 'country',
        message: 'Country: ',
        default: 'Canada',
        validate: function(country) {
            if (!country) { return "Enter a valid country"; }
            else { return true; }
        } 
    },
    {
        type: 'confirm',
        name: 'phoneNumberSelector',
        message: 'Add a phone number or fax number for this address?',
        default: false
    },
    {
        type: 'input',
        name: 'phoneNumber',
        message: "Phone/Fax Number: ",
        filter: function(phoneNumber) { //removes all spaces
            return phoneNumber.replace(/\s+/g, '');
        },
        validate: function(phoneNumber) { //checks length and if a number
            if (!isNaN(phoneNumber) || phoneNumber.length < 10) {
                return false; }
            else { return true; }
        },
        when: function(newAddressAnswers) {
            return newAddressAnswers.phoneNumberSelector; }
    },
    {
        type: 'list',
        name: 'phoneType',
        message: 'Phone Type: ',
        choices: ['cellular', 'landline', 'fax']
    }
]




//start of the program. 
console.log("\n Welcome to The Adress Book!");

//call function to get users input for main menu
inquirer.prompt(mainMenuQuestions, function(mainMenuAnswers) {
	if (mainMenuAnswers.mainMenuInput === 1) {
	    //gets the new persons info and info about how many address to enter
	    inquirer.prompt(newEnteryQuestions, function(newEnteryAnswers) { 
            addressBookArray.push(newEnteryAnswers);
            if (newEnteryAnswers.address){
                //something wrong here.
                for (var i = 0; i< newEnteryAnswers.addressSelector.length; i++) {
                    inquirer.prompt(newAddressQuestions, function(newAddressAnswers) { 
                        console.log(newAddressAnswers);
                    });
                }
            }
        
        console.log(newEnteryAnswers); });
	}
	if (mainMenuAnswers.mainMenuInput === 2) {
	    //call function searchBook
	}
	if (mainMenuAnswers.mainMenuInput === 0) {
	    console.log("Ending The Program \nGoodbye");
	    //prompt.end();
	}

})

// //function to get the info from the user. 
// var newEnteryPromise = inquirer.prompt(newEnteryQuestions, function(newEnteryAnswers) { 
//         console.log(newEnteryAnswers);
//     })

// function newEntery(){
//     inquirer.prompt(newEnteryQuestions, function(newEnteryAnswers) { 
//         console.log(newEnteryAnswers);
//     })
// }
/*First name (mandatory) Yes
Last name (mandatory) Yes
Birthday (optional, any string is fine here) yes
Enter Address?: choose all or none out of home, work, other
If yes then ask for: yes
    Address line 1 (mandatory)
    Address line 2 (optional, any string is fine here)
    City (mandatory)
    Province (mandatory)
    Postal code (mandatory)
    Country (mandatory)
Enter Phone Number? ask if they need for home, work, other
If Yes:  
    Phone number (mandatory) yes
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





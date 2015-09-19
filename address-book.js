var inquirer = require("inquirer");
var Promise = require("bluebird");
var Table = require('cli-table');

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
var newEntryQuestions = [
    {
        type: 'input',
        name: 'First Name',
        default: 'John',
        message: 'First Name (manditory): ',
        filter: function (inputName) { 
            var firstLetter = inputName.charAt(0).toUpperCase();
            var remainingName = inputName.slice(1).toLowerCase();
            return firstLetter + remainingName; }
    },
    {
        type: 'input',
        name: 'Last Name',
        default: 'Doe',
        message: 'Last Name (manditory): ',
        filter: function (inputName) { 
            var firstLetter = inputName.charAt(0).toUpperCase();
            var remainingName = inputName.slice(1).toLowerCase();
            return firstLetter + remainingName; }    
    },
    {
        type: 'confirm',
        name: 'Birthday',
        message: 'Add Date of Birth?',
        default: false
    },
    { 
        type: 'list',
        name: 'birthMonth',
        message: 'Month: ', 
        choices: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
        when: function(newEntryAnswers) {
            return newEntryAnswers.Birthday; }
    },
    {
        type: 'input',
        name: 'birthDay',
        message: 'Day: ',
        validate: function(birthDay) {
            if (birthDay > 31 || birthDay < 1 || isNaN(birthDay) ) {
                return "Enter a valid day"; }
            else {
                return true;
            }    
        },
        when: function(newEntryAnswers) {
            return newEntryAnswers.Birthday; }
    },
    {
        type: 'input',
        name: 'birthYear',
        message: 'Year: ',
        validate: function(birthYear) {
            if (birthYear > 2015 || birthYear < 1000 || isNaN(birthYear) ) {
                return "Enter a valid year"; }
            else {
                return true;
            }    
        },
        when: function(newEntryAnswers) {
            return newEntryAnswers.Birthday; }
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
        validate: function(addressSelector) {
            if (addressSelector.length < 1 ) { return "you must select an address"; }
            else { return true; }
        },
        when: function(newEntryAnswers) {
            return newEntryAnswers.address; }
    },
];


var newAddressQuestions = [
    {
        type: 'input',
        name: 'Address1',
        message: "Address line 1: ",
        validate: function(address1) {
            if (!address1) { return "Enter a valid address"; }
            else { return true; }
        }
    },
    {
        type: 'input',
        name: 'Address2',
        message: "Address line 2 (optional): ",
    },
    {
        type: 'input',
        name: 'City',
        message: "City: ",
        validate: function(city) {
            if (!city) { return "Enter a valid city"; }
            else { return true; }
        }
    },
    {
        type: 'input',
        name: 'Province',
        message: "Province: ",
        validate: function(province) {
            if (!province) { return "Enter a valid city"; }
            else { return true; }
        }
    },
    {
        //this is valid for Canadian residents only
        type: 'input',
        name: 'Postal Code',
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
        name: 'Country',
        message: 'Country: ',
        default: 'Canada',
        validate: function(country) {
            if (!country) { return "Enter a valid country"; }
            else { return true; }
        } 
    },
    {
        type: 'confirm',
        name: 'phoneSelector',
        message: 'Add a fax or phone number for this address?',
        default: false
    },
    {
        type: 'input',
        name: 'Phone Number',
        message: "Phone/Fax Number: ",
        filter: function(phoneNumber) { //removes all spaces
            return phoneNumber.replace(/\s+/g, '');
        },
        validate: function(phoneNumber) { //checks length and if a number
            if (isNaN(phoneNumber) || phoneNumber.length < 10) {
                return "Enter a valid phone number"; }
            else { return true; }
        },
        when: function(newAddressAnswers) {
            return newAddressAnswers.phoneSelector; }
    },
    {
        type: 'list',
        name: 'Phone Type',
        message: 'Phone Type: ',
        choices: ['cellular', 'landline', 'fax'],
        when: function(newAddressAnswers) {
            return newAddressAnswers.phoneSelector; }
    },
    {
        type: 'confirm',
        name: 'emailSelector',
        message: 'Add an email address for this address?',
        default: false
    },
    {
        type: 'input',
        name: 'Email',
        message: "Email Address: ",
        validate: function(email) { 
            if (email.indexOf(".") > 0 && email.indexOf("@") > 0) {
                return true; }
            else { return "enter a valid email address"; }
        },
        when: function(newAddressAnswers) {
            return newAddressAnswers.emailSelector; }
    },
];




//start of the program. 
console.log("\n Welcome to The Address Book!");


function askNewEntry(){
    inquirer.prompt(newEntryQuestions, function(newEntryAnswers) {
        var entryInput = newEntryAnswers;
	        //addressBookArray.push(newEntryAnswers) 
    if (newEntryAnswers.address) {
        var counter = 0;
        console.log("\nAdd the : " + newEntryAnswers.addressSelector[counter] + " address \n");
        getAddressAnswers(entryInput, counter);
    }
    else {
        addressBookArray.push(entryInput);
        console.log(addressBookArray);
        buildTable(addressBookArray.length - 1);
    }
	});
}

//call function to get users input for main menu
inquirer.prompt(mainMenuQuestions, function(mainMenuAnswers) {
	if (mainMenuAnswers.mainMenuInput === 1) {
	    //gets the new persons info and info about how many address to enter
	    askNewEntry();
    }
});


                
function getAddressAnswers(currentEntry, counter){
    inquirer.prompt(newAddressQuestions, function(newAddressAnswers) {
        var addressProperty = currentEntry.addressSelector[counter];
        currentEntry[addressProperty] = newAddressAnswers;
        counter +=1;
        if (counter < currentEntry.addressSelector.length) {
            console.log("\nAdd the : " + currentEntry.addressSelector[counter] + " address \n");
            getAddressAnswers(currentEntry, counter); 
        }
        else {
            addressBookArray.push(currentEntry);
            console.log(addressBookArray);
            buildTable(addressBookArray.length - 1);
        }
        
    });
}






function buildTable(entryPosition){
    var table = new Table();
    var addressInput = addressBookArray[entryPosition];
    for (var property in addressInput) {
        if (property === "addressSelector" || property === "address") {
            delete addressInput[property];   
        }
    }
    addressInput["Emails"] = "" ;
    addressInput["Phone Numbers"] = "";
    
    if (addressInput.Birthday) {
        addressInput.Birthday = addressInput.birthMonth + " " + addressInput.birthDay + ", " + addressInput.birthYear;
        delete addressInput.birthMonth;
        delete addressInput.birthDay;
        delete addressInput.birthYear;
    }
    
    for (var property in addressInput) {
        if (typeof addressInput[property] === 'object') {
            if (addressInput[property].phoneSelector){
                addressInput["Phone Numbers"] += property + "(" + addressInput[property]["Phone Type"] + "): " + addressInput[property]["Phone Number"] + "\n";
            }
            if (addressInput[property].emailSelector){
                addressInput["Emails"] += property + ": " +  addressInput[property]["Email"] + "\n";
            }
            delete addressInput[property].emailSelector;
            delete addressInput[property].phoneSelector;
            var addressString = addressInput[property].Address1 + ", " + addressInput[property].Address2 + "\n";
            addressString +=  addressInput[property].City + ", " + addressInput[property]["Province"] + ", " + addressInput[property]["Postal Code"] + "\n";
            addressString +=  addressInput[property].Country;
            addressInput[property + " Address"] = addressString;
            delete addressInput[property];
            
        }
    }
    for (var property in addressInput) {
        table.push(
        [property, addressInput[property]] );
    }
    addressBookArray[entryPosition] = addressInput;
    console.log(addressBookArray[entryPosition]);
    console.log(table.toString());
    
}


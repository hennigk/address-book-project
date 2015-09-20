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
        message: 'First Name (mandatory): ',
        //changes first letter of name to uppercase
        filter: function (inputName) { 
            var firstLetter = inputName.charAt(0).toUpperCase();
            var remainingName = inputName.slice(1).toLowerCase();
            return firstLetter + remainingName; },
        //verifies that input is not a number and is longer than 1 character
        validate: function(inputName){
            if (!isNaN(inputName) || inputName.length < 2){
                return "enter a valid name"; }
            else {return true; }
            }
    },
    {
        type: 'input',
        name: 'Last Name',
        message: 'Last Name (mandatory): ',
        //changes first letter of name to uppercase 
        filter: function (inputName) { 
            var firstLetter = inputName.charAt(0).toUpperCase();
            var remainingName = inputName.slice(1).toLowerCase();
            return firstLetter + remainingName; },  
        //verifies that input is not a number and is at least 1 character
        validate: function(inputName){
            if (!isNaN(inputName) || inputName.length < 1){
                return "enter a valid name"; }
            else {return true; }
            }
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
            if (!address1 || address1.length < 2) { return "Enter a valid address"; }
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
        //changes first letter of city to uppercase
        filter: function (inputName) { 
            var firstLetter = inputName.charAt(0).toUpperCase();
            var remainingName = inputName.slice(1).toLowerCase();
            return firstLetter + remainingName; },
        validate: function(city) {
            if (!city || city.length < 2) { return "Enter a valid city"; }
            else { return true; }
        }
    },
    {
        //this is valid for Canadian residents only
        type: 'list',
        name: 'Province',
        message: "Province: ",
        choices: ["AB", "BC", "MB", "NB", "NL", "NS", "NT", "NU", "ON", "PEI", "QC", "SK", "YT"]
    },
    {
        //this is valid for Canadian residents only
        type: 'input',
        name: 'Postal Code',
        message: "Postal Code: ",
        filter: function(postalCode) {
            var validPostCode = postalCode.replace(/\s+/g, '').toUpperCase(); //removes any spaces and changes it to uppercase
            return validPostCode.substr(0,3) + " " + validPostCode.substr(3,3);
        },
        validate: function(postalCode) {
            var validPostCode = postalCode.replace(/\s+/g, '');
            var postValidator = true;
            if (validPostCode.length !== 6) {
                postValidator = false;
            }
            for (var i = 0; i < validPostCode.length; i=i+2) {
                if (!isNaN(validPostCode.charAt(i))) { //verify that that there is a string at position 0, 2, 4 
                    postValidator = false; }
                if (isNaN(validPostCode.charAt(i+1))){  //verify that that there is a number at position 1, 3,5 
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
        type: 'list',
        name: 'Phone Type',
        message: 'Phone Type: ',
        choices: ['cellular', 'landline', 'fax'],
        when: function(newAddressAnswers) {
            return newAddressAnswers.phoneSelector; }
    },
    {
        type: 'input',
        name: 'Phone Number',
        message: "Number: ",
        validate: function(phoneNumber) { //checks length and if a number
            var valid = phoneNumber.replace(/\s|\-/g, '');
            if (isNaN(valid) || valid.length < 10) {
                return "Enter a valid phone number" }
            else {return true};
        },
        filter: function(phoneNumber) { 
            var valid = phoneNumber.replace(/\s|\-/g, '');
            var formattedNumber = valid.substr(0, 3) + "-" + valid.substr(3, 3) + "-" + valid.substr(6);
            return formattedNumber;
        },
        when: function(newAddressAnswers) {
            return newAddressAnswers.phoneSelector ; }
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
    if (newEntryAnswers.address) {
        var counter = 0;
        console.log("\nAdd the : " + newEntryAnswers.addressSelector[counter] + " address \n");
        getAddressAnswers(entryInput, counter);
    }
    else {
        formatInput(entryInput);
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
            formatInput(currentEntry);
        }
        
    });
}

function formatInput(currentEntry){
    for (var key in currentEntry) {
        //removes all false or empty properties
        if (!currentEntry[key]) {
            delete currentEntry[key];
        }
    }
    if (currentEntry["address"]) {
        delete currentEntry["address"];
    }
    if (currentEntry["addressSelector"]) {
        delete currentEntry["addressSelector"];
    }
    if (currentEntry.Birthday) {
        currentEntry.Birthday = currentEntry.birthMonth + " " + currentEntry.birthDay + ", " + currentEntry.birthYear;
        delete currentEntry.birthMonth;
        delete currentEntry.birthDay;
        delete currentEntry.birthYear;
    }
    addressBookArray.push(currentEntry);
    console.log(addressBookArray);
    buildTable();
}

function buildTable() {
    var table = new Table();
    var entryPosition = addressBookArray[addressBookArray.length - 1];
    var displayAddress = "";
    var displayPhone = "";
    var displayEmail = "";
    for (var key in entryPosition) {
        //if key is an object containing an address
        if (typeof entryPosition[key] === "object") {
            var addressKey = entryPosition[key];
            displayAddress = addressKey.Address1 + ", " + addressKey.Address2 + "\n";
            displayAddress += addressKey.City + ", " + addressKey.Province + ", " + addressKey["Postal Code"] + "\n";
            displayAddress += addressKey.Country;
            //if phone number was added to address
            if (addressKey["Phone Number"]) {
                displayPhone += key + ":\n (" + addressKey["Phone Type"] + "): " + addressKey["Phone Number"] + "\n";
            }
            if (addressKey["Email"]) {
                displayEmail += key + ": " + addressKey["Email"] + "\n";
            }
            table.push([key + " Address", displayAddress]);    
        }
        else {
            table.push([key, entryPosition[key]]);
        }
    }
    if (displayPhone) {
       table.push(["Phone Number", displayPhone]); 
    }
    if (displayEmail) {
       table.push(["Email", displayEmail]); 
    }
    console.log(table.toString());
}

//filler for testing the addressBook Array 
addressBookArray[1] = {
    'First Name': 'Kayla',
    'Last Name': 'Hennig',
    Birthday: 'July 30, 1990',
    Home: 
     { Address1: '1360 st. jacques',
       Address2: 'apt. 501',
       City: 'Montreal',
       Province: 'QC',
       'Postal Code': 'H3C 4M4',
       Country: 'Canada',
       phoneSelector: true,
       'Phone Type': 'landline',
       'Phone Number': '546-678-9585',
       emailSelector: true,
       Email: 'kayla.hennig@gmail.com' 
     }
};

addressBookArray[2] = {
    'First Name': 'David',
    'Last Name': 'Fortin',
    Birthday: 'January 4, 1987',
    Home: 
     { Address1: '4 fake street',
       Address2: '',
       City: 'Montreal',
       Province: 'AB',
       'Postal Code': 'H3D 4T4',
       Country: 'Canada',
       phoneSelector: true,
       'Phone Type': 'landline',
       'Phone Number': '546-678-9551',
       emailSelector: true,
       Email: 'dave@gmail.com' },
    Office: 
     { Address1: '4567 viger street',
       Address2: 'suite 201',
       City: 'Edmonton',
       Province: 'AB',
       'Postal Code': 'H4D 5M6',
       Country: 'Canada',
       phoneSelector: false,
       emailSelector: false },
    Other: 
     { Address1: '453 road',
       Address2: 'apt. 5',
       City: 'Fonthill',
       Province: 'ON',
       'Postal Code': 'L0S 1E2',
       Country: 'Canada',
       phoneSelector: true,
       'Phone Type': 'fax',
       'Phone Number': '567-847-4948',
       emailSelector: true,
       Email: 'david.fortin@mail.com' } 
};
addressBookArray[3] = {
    'First Name': 'Beijo',
    'Last Name': 'Hennig',
    Birthday: 'January 18, 1909',
    Office: 
     { Address1: '4567 road street',
       Address2: 'suite 201',
       City: 'Edmonton',
       Province: 'AB',
       'Postal Code': 'H4D 5M6',
       Country: 'Canada',
       phoneSelector: false,
       emailSelector: true,
       Email: 'beijo@mail.com'},
    Other: 
     { Address1: '453 crate',
       Address2: '',
       City: 'Fonthill',
       Province: 'ON',
       'Postal Code': 'L0S 1E2',
       Country: 'Canada',
       phoneSelector: true,
       'Phone Type': 'fax',
       'Phone Number': '567-847-4948',
       emailSelector: true,
       Email: 'beijo.the.dog@mail.com' } 
};
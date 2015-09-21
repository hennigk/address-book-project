var inquirer = require("inquirer");
var Promise = require("bluebird");
var Table = require('cli-table');

var addressBookArray = []

//questions for the main menu - uses type: list
var mainMenuQuestions = [
    {
    type: 'list', 
    name: 'mainMenuInput', 
    message: "Select one of the following options:",
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

//list of prompts if the user selects the option to enter an address
 
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
    }
];

var addressQuestionArray = [newAddressQuestions, newAddressQuestions, newAddressQuestions];

//prompts for the search function
var searchQuestion = [
    {
        type: 'input',
        name: 'searchName',
        message: 'Search: ',
        //verifies that input is not a number and is longer than 1 character
        validate: function(inputName){
            if (!isNaN(inputName) || inputName.length < 1){
                return "enter a valid name"; }
            else {return true; }
        }
    }
];

var viewSearchQuestion = [ 
    {
    type: 'list',
    name: 'viewSearch',
    message: "choose one of the following options: ",
    choices: [
        {name: "Edit the current entry",
        value: "edit" },
        {name: "Delete the current entry", 
        value: "delete" },
        {name: "Go back to the main menu",
        value: "menu"} ]
    },
    {
        type: 'confirm',
        name: 'confirmDelete',
        message: 'Are you sure you want to delete this entry?',
        default: false,
        when: function(viewSearchAnswer){
            return viewSearchAnswer.viewSearch === 'delete';
        }
    },
];





function mainMenu(){
//start of the program. 
console.log("\nMain Menu");
//call function to get users input for main menu
inquirer.prompt(mainMenuQuestions, function(mainMenuAnswers) {
	if (mainMenuAnswers.mainMenuInput === 1) {
	    return askNewEntry(newEntryQuestions, addressQuestionArray, true);  //calls function to begin new entry prompts
    }
    else if (mainMenuAnswers.mainMenuInput === 2) {
        return getSearchInput(); //calls function to begin search prompts
    }
    else {
        console.log("\ngoodbye");
        return;
    }
});
}

function askNewEntry(entryQuestions, addressQuestions, newEntry, position){
    inquirer.prompt(entryQuestions, function(newEntryAnswers) {
        var entryInput = newEntryAnswers;
    if (newEntryAnswers.address || entryInput.addressSelector.length > 0) {
        var counter = 0;
        console.log("\nAdd the : " + newEntryAnswers.addressSelector[counter] + " address \n");
        return getAddressAnswers(addressQuestions, entryInput, counter, newEntry, position);
    }
    else if (!newEntry) {
        addressBookArray[position] = entryInput;
        return buildTable(position);
    }
    else {
        addressBookArray.push(entryInput);
        return buildTable(addressBookArray.length - 1);
    }
	});
}

                
function getAddressAnswers(addressQuestions, currentEntry, counter, newEntry, position){
    inquirer.prompt(addressQuestions[counter], function(newAddressAnswers) {
        var addressProperty = currentEntry.addressSelector[counter];
        currentEntry[addressProperty] = newAddressAnswers;
        counter +=1;
        if (counter < currentEntry.addressSelector.length) {
            console.log("\nAdd the : " + currentEntry.addressSelector[counter] + " address \n");
            getAddressAnswers(addressQuestions, currentEntry, counter, newEntry, position); 
        }
        else if (!newEntry) {
            addressBookArray[position] = currentEntry;
            return buildTable(position);
        }
        else {
            addressBookArray.push(currentEntry);
            return buildTable(addressBookArray.length - 1);
        }
    });
}

//searches first name, last name, and email
function getSearchInput(){
    var searchInput = [];
    console.log("\n\nEnter the name you would like to search the address book for: ");
    inquirer.prompt(searchQuestion, function(searchAnswer) {
        //puts search input into an array and puts the search input to lowercase
        searchInput = searchAnswer.searchName.toLowerCase().split(" ");
        searchAddressBook(searchInput);
    });
}

//prompt for what to do with search results
function searchAddressBook(searchArray){
    var addressBookPosition = [];
    var searchResultQuestion = [ {
        type: 'list',
        name: 'searchMenu',
        message: "choose one of the following options: ",
        choices: [
            new inquirer.Separator(),
            { name: "Do another search",
            value: -1},
            { name: "Return to the Main Menu",
            value: -2} ]
        } 
    ];

    for (var k = 0; k < searchArray.length; k++) {
        for (var j = 0; j < addressBookArray.length; j++) {
            if (addressBookArray[j]["First Name"].toLowerCase().indexOf(searchArray[k]) >= 0) {
                addressBookPosition.push(j); }
            else if (addressBookArray[j]["Last Name"].toLowerCase().indexOf(searchArray[k]) >= 0) {
                addressBookPosition.push(j); }
            else {
                for (var key in addressBookArray[j]) {
                    if (addressBookArray[j][key]["Email"]) {
                        var addressBookEmail = addressBookArray[j][key]["Email"].toLowerCase();
                        if (addressBookEmail.indexOf(searchArray[k]) >= 0) {
                            addressBookPosition.push(j); }
                    }
                }
            }
        }
    }
    console.log("\nYour search has produced " + addressBookPosition.length + " results");

    if (addressBookPosition.length > 0){
        for (var i = 0; i < addressBookPosition.length; i++) {
            var searchResultName = addressBookArray[addressBookPosition[i]]["Last Name"] + ", " + addressBookArray[addressBookPosition[i]]["First Name"];
            searchResultQuestion[0].choices.unshift({name: searchResultName, value: addressBookPosition[i]});
        }
    }
    searchResultMenu(searchResultQuestion);
}

//asks the user what to once the search is complete
function searchResultMenu(searchResultQuestion){
    inquirer.prompt(searchResultQuestion, function(searchResultAnswer) {
        if (searchResultAnswer.searchMenu >= 0) { 
            buildTable(searchResultAnswer.searchMenu);  //view the selected result in a table
            return viewSearchResult(searchResultAnswer.searchMenu); //calls prompt for next set of questions
        }
        if (searchResultAnswer.searchMenu === -1) {  
            return getSearchInput(); } //do another search
        if (searchResultAnswer.searchMenu === -2) { 
            return mainMenu(); } //returns to main menu
    });
}

function viewSearchResult(currentEntry){
    inquirer.prompt(viewSearchQuestion, function(viewSearchAnswer) {
        if (viewSearchAnswer.viewSearch === "edit") {
            editEntry(currentEntry);
        }
        else if (viewSearchAnswer.viewSearch === "delete" && viewSearchAnswer.confirmDelete) {
            addressBookArray.splice(currentEntry, 1);
            console.log("Entry Deleted");
            return mainMenu(); }
        else {
            return mainMenu(); } //returns to main menu
    });
}

function editEntry(currentEntry){
    var editQuestions = newEntryQuestions;
    var editAddress = addressQuestionArray;
    for (var entryKey in editQuestions) {
        for (var addressKey in addressBookArray[currentEntry]) {
            if (addressKey === editQuestions[entryKey]["name"]) {
                editQuestions[entryKey]['default'] = addressBookArray[currentEntry][addressKey];
            }
        }
    }
    if (addressBookArray[currentEntry].Birthday) {
        for (var key in editQuestions){
            if (editQuestions[key]["name"].indexOf('birth') >= 0) {
                delete editQuestions[key]["when"];
            }
        }
        editQuestions.splice(2,1);
    }
    if (addressBookArray[currentEntry].address) {
        for (var key in editQuestions){
            if (editQuestions[key]["name"] === "addressSelector") {
                editQuestions[key]["validate"] = function(address) {
                    if (address.length >= addressBookArray[currentEntry].addressSelector.length) {
                        return true;    
                    }
                    else { 
                        return "you must select the same or more options as the current entry"; }
                }
            delete editQuestions[key]["when"];
            }
        }
    }
    for (var i = 0; i < addressBookArray[currentEntry].addressSelector.length; i++) {
        var addressName = addressBookArray[currentEntry].addressSelector[i];
            for (var entryKey in editAddress[i]) {
                for (var key in addressBookArray[currentEntry][addressName]) {    
                    if (editAddress[i][entryKey]["name"] === key){
                        editAddress[i][entryKey]["default"] = addressBookArray[currentEntry][addressName][key];
                }
            }
        }
    }
    
    askNewEntry(editQuestions, editAddress, false, currentEntry);
}
        

// console.log(addressBookArray[1].Home)
// var test = addressBookArray[1].addressSelector[1]
// console.log(addressBookArray[1][test])











function buildTable(arrayPosition) {
    var table = new Table();
    var entryPosition = addressBookArray[arrayPosition];
    var displayAddress = "";
    var displayPhone = "";
    var displayEmail = "";
    var displayBirthday = "";
    for (var key in entryPosition) {
        //if key is an object containing an address
        if (typeof entryPosition[key] === "object" && key !== 'addressSelector') {
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
        else if (key === "Birthday" && entryPosition[key]) {
            displayBirthday = entryPosition.birthMonth + " " + entryPosition.birthDay + ", " + entryPosition.birthYear;
            table.push([key, displayBirthday]); }
        else if (typeof entryPosition[key]!== 'boolean' && key !== 'address' && key !== 'addressSelector' && key.indexOf("birth") < 0) {
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
addressBookArray[0] = {
    'First Name': 'Kayla',
    'Last Name': 'Hennig',
     Birthday: true,
    birthMonth: 'January',
    birthDay: '6',
    birthYear: '1990',
    address: true,
    addressSelector: [ 'Home' ],
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

addressBookArray[1] = {
    'First Name': 'David',
    'Last Name': 'Fortin',
     Birthday: true,
    birthMonth: 'July',
    birthDay: '10',
    birthYear: '1890',
    address: true,
    addressSelector: [ 'Home', 'Office', 'Other' ],
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
addressBookArray[2] = {
    'First Name': 'Beijo',
    'Last Name': 'Hennig',
     Birthday: true,
    birthMonth: 'February',
    birthDay: '7',
    birthYear: '1900',
    address: true,
    addressSelector: [ 'Office', 'Other' ],
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

//call function to start the program
mainMenu();




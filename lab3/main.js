/* This file starts out empty; you will be adding to it in Lab 3 */
console.log('Hello world');
let greeting = 'Hello world';
console.log(greeting);

let testVar;
console.log(testVar);
console.log(typeof testVar);

let testVar2 = null;
console.log(testVar2);
console.log(typeof testVar2);

let studentAge = 25;
studentAge = 26;

const number1 = 2;
const number2 = 3;
const sum = number1 + number2;
console.log(sum);

let a = 1, b = 1, c = 2, d = 2;
//Prefix increment
console.log(++a);
//Postfix increment
console.log(b++);
//Prefix decrement
console.log(--c);
//Postfix decrement
console.log(d--);

//Comparisons
console.log("result of comparing with == ", "1" == 1);
console.log("Result of comapring with === ", "1" === 1);

//Functions
function add(number1, number2) {
    const sum = number1 + number2;
    return sum;
}

const result = add(437, 34290093);
console.log(result);

//Objects and Methods
const fullName = {
    firstName: 'Ben',
    lastName: 'Bitdiddle'
}

console.log(fullName.firstName);
// or fullName['firstName']

const personDetails = {
    fullName: {
        firstName: 'Ben',
        lastName: 'Bitdiddle'
    },
    getName: function() {
        return this.fullName.firstName + " " + this.fullName.lastName;
    }
}

const personName = personDetails.getName();
console.log(personName);

//Arrays

let arr = [];
let fruits = ['Apple', 'Orange', 'Plum'];

console.log(fruits[0]);
console.log(fruits[1]);
console.log(fruits[2]);

fruits[2] = 'Pear';
fruits[3] = 'Lemon';

console.log(fruits.length);

let mix = ['hello', 123, personDetails];
console.log(mix[2].fullName);


//Data Structures
console.log(fruits);
const lemon = fruits.pop();
console.log(fruits);

fruits.push(lemon);
console.log(fruits);

//Shifting
let fruitsBasket = ['Apple', 'Orange', 'Pear'];
console.log(fruitsBasket.shift());
console.log(fruitsBasket);

//Unshifting
let fruitsCollection = ['Apple'];
fruitsCollection.push('Orange', 'Peach');
fruitsCollection.unshift('Pineapple', 'Lemon');
console.log(fruitsCollection)

//Flow Control
age = 21;
if (age < 18) {
    console.log("You're not an adult");
} else {
    console.log("You're an adult");
}

const experienceYears = 3;
if (experienceYears < 5) {
    console.log("You're a beginner");
} else {
    console.log("You're experienced");
}

const score = 54;
if (score < 0) {
    console.log("You provided an invalid score!");
} else if (score < 50) {
    console.log("You did not pass");
} else {
    console.log("You passed!")
}

const temperature = 72;
if (temperature == null || temperature < -273.15) {
    console.log("You provided an invalid temperature!");
} else if (temperature < 0) {
    console.log("It's freezing");
} else {
    console.log("It's above freezing");
}

//Loops
for (let i = 0; i < fruits.length; i++) {
    console.log(fruits[i]);
}

for (const fruit of fruits) {
    console.log(fruit);
}

fruits.forEach(fruit => console.log(fruit, "with forEach"));

//Exercise 1
function areValidEmails(inputList) {
    // your code here!
    let result = true;
    for (const email of inputList) {
        if (email.endsWith('@ucsd.edu')) {
            continue;
        } else{
            result = false;
            break;
        }
    }
    return result;
  }
  
// Test cases:
const list1 = ["alice@ucsd.edu", "bob@ucsd.edu", "eve@ucsd.edu"];
console.log(areValidEmails(list1)); // should return true
  
const list2 = ["alice@ucsd.edu", "bob@ucsd.edu", "eve@harvard.edu"];
console.log(areValidEmails(list2)); // should return false

const list3 = ["alice", "bob@ucsd.edu"];
console.log(areValidEmails(list3)); // should return false
  


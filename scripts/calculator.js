/*

Description: Simple Calculator with basic functionality, history and memory function
Developed by: Paul Atreides
Source Code: https://github.com/Paul-Atreides/FxOS-BlackCalc

*/

'use strict';
var MAX_DISPLAY_DIGITS = 12;
var MAX_DISPLAY_NUMBER = Math.pow(10, MAX_DISPLAY_DIGITS) -1;
var MAX_KEYLOG_DIGITS = 38;
var resultdisp, keylogdisp;
var sOperation;
var nDispValue, nOperator1, nOperator2, nStore;
var bDisplayEditable;

//MathX.prototype=new Object();
function MathX () { }
MathX.prototype = {};
 MathX.round = function(num, decimals) {
  return Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals);
};

Math.roundN = function(num, decimals) {
  return Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals);
};

function clearCalculator () {
  console.log("function clearCalculator() called");
  resultdisp.textContent = "0";
  keylogdisp.textContent = "";
  nDispValue = 0;
  nOperator1 = nOperator2 = null;
  sOperation = null;
  bDisplayEditable = false;

}
function initCalculator () {
  console.log("function initCalculator() called");
  clearCalculator();
  nStore = 0;
}

function isInteger () {
  return resultdisp.textContent.contains(".") ? false : true; 
/*
  if (resultdisp.textContent.contains(".")) {
    return false;
  }
  return true;
*/  
}


function addKeyToDisplay (digit) {

  if(bDisplayEditable === false) { //display was not editable previously
    bDisplayEditable = true;
    resultdisp.textContent = "";   //clear display
  }

  if (resultdisp.textContent.length >= MAX_DISPLAY_DIGITS) { //max. characters reached
    return;
  }

  resultdisp.textContent += digit;  //add the digit to display
  nDispValue = parseFloat(resultdisp.textContent);
}

function delKeyfromDisplay () {

  if(bDisplayEditable === false) {  //display is not editable
    return;
  }
  if (resultdisp.textContent.length <= 1) {
    resultdisp.textContent = "0"; //last digit replaced by '0'
    bDisplayEditable = false;
  } else {
    resultdisp.textContent = resultdisp.textContent.substring(0, resultdisp.textContent.length -1); //remove one digit
  }
  nDispValue = parseFloat(resultdisp.textContent);
}

/**
 * Updates display with internal representation of value
 */
function displayResult (newVal) {
  nDispValue = newVal;
  var s = newVal.toString(),
      l = s.length,
      nDezPos = s.indexOf(".");

  if (Math.abs(nDispValue) > MAX_DISPLAY_NUMBER) { //overflow in display
    s = "O:" + s;
  }
  else {
    if (l > MAX_DISPLAY_DIGITS) {
      if((nDezPos > 0) && (nDezPos < MAX_DISPLAY_DIGITS)) {
        //TODO: if newVal < 1e-8 leave it in exponential notation
//      s = MathX.round(newVal, MAX_DISPLAY_DIGITS - nDezPos -1).toString();
        s = Math.roundN(newVal, MAX_DISPLAY_DIGITS - nDezPos -1).toString();
      }
    }
  }
  //resultdisp.textContent = newVal.toPrecision(10);
  //resultdisp.textContent = roundedNumber.toLocaleString();
  //resultdisp.textContent = roundedNumber.toString().substr(0,12);
  resultdisp.textContent = s.substr(0,MAX_DISPLAY_DIGITS);
}

/**
 * Updates the history display with new value
 */
function updateHistory (newVal) {
  var s = keylogdisp.textContent + " " + newVal,
      l = s.length;

  if (l > MAX_KEYLOG_DIGITS) {
    s = "..." + s.substr(-MAX_KEYLOG_DIGITS);
  }

  keylogdisp.textContent = s;
}

/**
 * Calculates the result of the percent operation
 */
function calculatePercent () {
  nOperator2 = nDispValue;

  switch(sOperation) {
  case "+" : return (nOperator1 + (nOperator1 * nOperator2 / 100));
  case "-" : return (nOperator1 - (nOperator1 * nOperator2 / 100));
  case "×" : return (nOperator1 * nOperator2 / 100);
  case "÷" : return (100 / nOperator2 * nOperator1);
  default  : return null;
  }
}

/**
 * Calculates the result of the different binary operations
 */
function calculate () {
  //if (!nOperator2) nOperator2 = nDispValue; //use nOperator2 if it is set
  nOperator2 = nDispValue;

  switch(sOperation) {
  case "+" : return nOperator1 + nOperator2;
  case "-" : return nOperator1 - nOperator2;
  case "×" : return nOperator1 * nOperator2;
  case "÷" : return nOperator1 / nOperator2;
  default  : return null;
  }
}

function numberKeyPressed () {
  var value = this.value,
      datatype =this.dataset.type;

  console.log("Number Key pressed ", value, datatype);

  switch(datatype) {
  case "number" :
    addKeyToDisplay(value);
    break;
  case "sign"  :
    if (!bDisplayEditable) {
      updateHistory("[+/-]");
    }
    displayResult(nDispValue * -1);
    break;
  case "point" :
    if (!bDisplayEditable) {
      resultdisp.textContent = "0.";
      bDisplayEditable = true;
    }
    if (isInteger()) {//must be Integer to add decimal point
      resultdisp.textContent += value;
    }
    break;

  default:
  }
  nOperator2 = null; //reset nOperator2 if key is pressed (display modified)

}

/**
 * An operation key is pressed
 * Valid operations are sqrt, sqr, 1/x, percent
 * and binary operations '+', '-', '*', '/'
 */
function operationKeyPressed () {
  var value = this.value,
      datatype =this.dataset.type;
  console.log("Operation Key pressed ", value, datatype);

  switch(datatype) {  //contains operation type (unary, binary)

  //unary operations - handle display Value directly
  case "unary" : 
    if(bDisplayEditable) {
      updateHistory(resultdisp.textContent); //actual value to history
    }  
      switch (value){
      case "√" :
        updateHistory("[√]"); //function key to history
        displayResult (Math.sqrt(nDispValue)); //display the result
        break;
      case "x²" :
        updateHistory("[x²]"); //function key to history
        displayResult ((nDispValue * nDispValue));
        break;
      case "1/x" :
        updateHistory("[1/x]"); //function key to history
        displayResult (1.0 / nDispValue);
        break;
      case "%" :
        updateHistory("[%]"); //function key to history
        displayResult (calculatePercent());
        nOperator1 = nDispValue;
        sOperation = null;
        break;
      default : break;
      } //switch (value)
    break;

    //binary operations need 2 operands
    case "binary" : 
      if(bDisplayEditable) {
        updateHistory(resultdisp.textContent); //actual value to history
      }
      updateHistory(value); //always operation key to history

      if (sOperation === null) { //first time operation key pressed
        sOperation = value;
        nOperator1 = nDispValue;
        nOperator2 = null;
      } else {                  //subsequent operation key pressed
        if (bDisplayEditable) { //only if normal key pressed meanwhile
          displayResult(calculate());
          sOperation = value;
          nOperator1 = nDispValue;
        }
      }
      break;
    
    default: break;
  }

  bDisplayEditable = false;

}

/**
 * A special key is pressed
 * For now this are only 'Sto' and 'Rcl' keys
 */
function specialKeyPressed () {
  var value = this.value,
      datatype =this.dataset.type;
  console.log("Special Key pressed ", value, datatype);

  if(datatype === "store") {
    nStore = nDispValue; //save display to memory
  }
  if(datatype === "recall") {
    displayResult (nStore);  //display content of memory
    bDisplayEditable = true; //set mode editable (important for UpdateHistory)
  }

}

/**
 * Key 'Convert-To' or 'Convert-From' key is pressed
 */
function convertKeyPressed () {
  var value = this.value,
      datatype =this.dataset.type;
  console.log("Convert Key pressed ", value, datatype);
}

/**
 * The calculate key ('=') is pressed
 */
function calculateKeyPressed () {
  var value = this.value,
      datatype =this.dataset.type;
  console.log("Compute Key pressed ", value, datatype);

  if (sOperation !== null) {
    if (bDisplayEditable) {
      updateHistory(resultdisp.textContent);
    }
    updateHistory("[=]");

    displayResult(calculate());
    sOperation = null;
    nOperator1 = nDispValue;
  }
  bDisplayEditable = false;
}

/**
 * The 'Clear-All' key ('C')  or 'Delete digit' ('<-') is pressed
 */
function clearKeyPressed () {
  var value = this.value,
      datatype =this.dataset.type;
  console.log("Clear Key pressed ", value, datatype);

  switch(datatype)
  {
    case "clear"  : clearCalculator(); break;
    case "delete" : delKeyfromDisplay(); break;
    default:
  }

}


/**
 * Initialize the application and register event listener functions
 */
window.onload = function () {
  // elements that that are often used in the code
  resultdisp = document.getElementById("result");
  keylogdisp = document.getElementById("keylog");
  var clickEvent = ('ontouchstart' in window ? 'touchend' : 'click');  //prefer touch events if available (faster reaction)

  // All the listeners for the interface buttons and for the input changes
  // This is an awful hack as getElementsByID could not be used, because
  // several keys share the same ID
  var bk = document.getElementsByTagName('*'),
      i;
  console.log("found n Elements by TagName '*'", bk.length);

  for(i=0 ; i<bk.length ; i++) {
    switch(bk[i].id) {  //different ID's for differnet type of keys
      case "num-key" :
        bk[i].addEventListener(clickEvent, numberKeyPressed);
        break;
      case "oper-key" :
        bk[i].addEventListener(clickEvent, operationKeyPressed);
        break;
      case "spec-key" :
        bk[i].addEventListener(clickEvent, specialKeyPressed);
        break;
      case "compute-key" :
        bk[i].addEventListener(clickEvent, calculateKeyPressed);
        break;
      case "clear-key" :
        bk[i].addEventListener(clickEvent, clearKeyPressed);
        //bk[i].onclick = clearKeyPressed;
        break;
      default : break;
    }
  }

  document.getElementById('btn-convertto').addEventListener(clickEvent, convertKeyPressed);
  document.getElementById('btn-convertfrom').addEventListener(clickEvent, convertKeyPressed);


  initCalculator();
  console.log("window.onload finished");

};
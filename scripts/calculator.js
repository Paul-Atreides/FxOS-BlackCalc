/*

Description: Simple Calculator with basic functionality, history and memory function
Developed by: Paul Atreides
Source Code: https://github.com/Paul-Atreides/FxOS-BlackCalc

*/
/* jshint undef: true, unused: true, browser: true, strict: true */
/* globals console: false */

var MAX_DISPLAY_DIGITS = 12;
var MAX_DISPLAY_NUMBER = Math.pow(10, MAX_DISPLAY_DIGITS) -1;
var MAX_KEYLOG_DIGITS = 38;
var resultdisp, keylogdisp;
var sOperation;
var nDispValue, nOperator1, nOperator2, nStore;
var bDisplayEditable;
var oSettings = new Settings(true);

//Extension to builtin Math functionality
Math.roundN = function(num, decimals) {
  'use strict';
  return Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals);
};

function Settings(vibration, vibTime, keyklick, unitConversion, unitFromValue, unitFrom, unitToValue, unitTo) {
  'use strict';
  this.vibration = vibration || false;
  this.vibTime = vibTime || 60;
  this.keyklick = keyklick || false;
  this.unitConversion = unitConversion || true;
  this.unitFromValue = unitFromValue || 1;
  this.unitToValue = unitToValue || 3.6;
  this.unitFrom = unitFrom || "m/s";
  this.unitTo = unitTo || "km/h";
}

Settings.prototype.save = function () {
  // save configuration to local store
  'use strict';
  console.log("function Settings.save() called");
  var sData = JSON.stringify(this);
  window.localStorage.setItem("Settings", sData);
};

Settings.prototype.load = function () {
  // load configuration from local store
  'use strict';
  console.log("function Settings.load() called");
  var sData = window.localStorage.getItem("Settings");
  if (sData) {
    var oData = JSON.parse(sData);
    cloneObj (oData, this);
  }
};

function cloneObj (from, to) {
  'use strict';
  var name;
  to = to || new from.constructor();
  for (name in from) {
    if (typeof to[name] === "undefined") { cloneObj(from[name], null); }
    //to[name] = typeof to[name] === "undefined" ? cloneObj(from[name], null) : to[name];
    to[name] = from[name];
  }
  return to;
}


function clearCalculator () {
  'use strict';
  console.log("function clearCalculator() called");
  resultdisp.textContent = "0";
  keylogdisp.textContent = "";
  nDispValue = 0;
  nOperator1 = nOperator2 = null;
  sOperation = null;
  bDisplayEditable = true;

}
function updateConvertRow () {
  'use strict';
  document.getElementById('btn-convertto').textContent = oSettings.unitTo;
  document.getElementById('btn-convertfrom').textContent = oSettings.unitFrom;
  if (oSettings.unitConversion) {
    document.getElementById("convert-row").classList.remove("hidden");
  } else {
    document.getElementById("convert-row").classList.add("hidden");
  }
}

function initCalculator () {
  'use strict';
  console.log("function initCalculator() called");
  clearCalculator();
  nStore = 0;
  oSettings.load();
  updateConvertRow();
}

function isInteger () {
  'use strict';
  return resultdisp.textContent.contains(".") ? false : true;
/*
  if (resultdisp.textContent.contains(".")) {
    return false;
  }
  return true;
*/
}

function vibrate () {  // if vibrtion enabled -> do it for configured time
  'use strict';
  if (oSettings.vibration) {
    navigator.vibrate([oSettings.vibTime]);
  }
}

function addKeyToDisplay (digit) {
  'use strict';

  if(bDisplayEditable === false) { //display was not editable previously
    bDisplayEditable = true;
    resultdisp.textContent = "";   //clear display
  }

  if (resultdisp.textContent.length >= MAX_DISPLAY_DIGITS) { //max. characters reached
    return;
  }
  if (resultdisp.textContent === "0") { //empty display shall be overwritten with input
    resultdisp.textContent = "";
  }
  resultdisp.textContent += digit;  //add the digit to display
  nDispValue = parseFloat(resultdisp.textContent);
}

function delKeyfromDisplay () {
  'use strict';

  if(bDisplayEditable === false) {  //display is not editable
    return;
  }
  if (resultdisp.textContent.length <= 1) {
    resultdisp.textContent = "0"; //last digit replaced by '0'
    //bDisplayEditable = false;
  } else {
    resultdisp.textContent = resultdisp.textContent.substring(0, resultdisp.textContent.length -1); //remove one digit
  }
  nDispValue = parseFloat(resultdisp.textContent);
}

/**
 * Updates display with internal representation of value
 */
function displayResult (newVal) {
  'use strict';
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
  'use strict';
  var s = keylogdisp.textContent + " " + newVal,
      l = s.length;

  if (l > MAX_KEYLOG_DIGITS) {
    s = "..." + s.substr(-MAX_KEYLOG_DIGITS +3);
  }

  keylogdisp.textContent = s;
}

/**
 * Calculates the result of the percent operation
 */
function calculatePercent () {
  'use strict';
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
  'use strict';
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
  'use strict';
  /*jshint validthis: true */
  var value = this.attributes.value.value,
      datatype =this.dataset.type;

  console.log("Number Key pressed ", value, datatype);
  vibrate();
  switch(datatype) {
  case "number" :
    addKeyToDisplay(value);
    break;
  case "sgn"  :
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
  'use strict';
  var value = this.value || this.attributes.value.value,
      datatype = this.dataset.type;
  console.log("Operation Key pressed ", value, datatype);
  vibrate();

  switch(datatype) {  //contains operation type (unary, binary)

  //unary operations - handle display Value directly
  case "unary-operation" :
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
        if(sOperation === null) { //no previous operation
          break;                  //do not continue
        }
        updateHistory("[%]"); //function key to history
        displayResult (calculatePercent());
        nOperator1 = nDispValue;
        sOperation = null;
        break;
      default : break;
      } //switch (value)
    break;

    //binary operations need 2 operands
    case "binary-operation" :
      if(bDisplayEditable) {
        updateHistory(resultdisp.textContent); //actual value to history
      }
      if (sOperation === null) { //first time operation key pressed
        sOperation = value;
        nOperator1 = nDispValue;
        nOperator2 = null;
      } else {                  //subsequent operation key pressed
//        if (bDisplayEditable) { //only if normal key pressed meanwhile
          updateHistory("[=]");
          displayResult(calculate());
          sOperation = value;
          nOperator1 = nDispValue;
//        }
      }
      updateHistory(value); //always operation key to history

      break;

    default: break;
  }

  bDisplayEditable = false;

}

/**
 * A special key is pressed
 * This are only 'Sto', 'Rcl', ConvertTo, ConvertFrom keys
 */
function specialKeyPressed () {
//  var value = this.value,
//      datatype =this.dataset.type;
//  console.log("Special Key pressed ", value, datatype);
  'use strict';
  /*jshint validthis: true */
  console.log("Special Key pressed ", this.dataset.type);
  vibrate();
  switch(this.dataset.type) {  //contais the different keys
    case "store" :
      nStore = nDispValue;     //save display to memory
      break;
    case "recall" :
      displayResult (nStore);  //display content of memory
      bDisplayEditable = true; //set mode editable (important for UpdateHistory)
      break;
    case "convertto" :
      if(bDisplayEditable) {
        updateHistory(resultdisp.textContent); //actual value to history
      }
      updateHistory("[\u2192" + oSettings.unitTo + "]");
      displayResult (nDispValue * oSettings.unitToValue / oSettings.unitFromValue);
      bDisplayEditable = false;
      break;
    case "convertfrom" :
      if(bDisplayEditable) {
        updateHistory(resultdisp.textContent); //actual value to history
      }
      updateHistory("[\u2192" + oSettings.unitFrom + "]");
      displayResult (nDispValue / oSettings.unitToValue * oSettings.unitFromValue );
      bDisplayEditable = false;
      break;
  }
}

/**
 * The calculate key ('=') is pressed
 */
function calculateKeyPressed () {
  'use strict';
  console.log("Compute Key pressed ");
  vibrate();
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
  'use strict';
  /*jshint validthis: true */
  var datatype =this.dataset.type;

  console.log("Clear Key pressed ", datatype);
  vibrate();

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
  'use strict';
  var clickEvent = ('ontouchstart' in window ? 'touchend' : 'click');  //prefer touch events if available (faster reaction)

  // elements that that are often used in the code
  resultdisp = document.getElementById("result");
  keylogdisp = document.getElementById("keylog");

  // Event listener functions for normal and operation keys
  //
  var bk = document.getElementsByClassName('keypad-button'),
      i;
  console.log("found n Elements by ClassName '*'", bk.length);
  for(i=0 ; i<bk.length ; i++) {
    switch(bk[i].dataset.type) {  //different types for differnet keys
      case "number" :
      case "point" :
      case "sgn" :
        bk[i].addEventListener(clickEvent, numberKeyPressed);
        break;
      case "unary-operation" :
      case "binary-operation" :
        bk[i].addEventListener(clickEvent, operationKeyPressed);
        break;
      default : break;
    }
  }

  document.getElementById('btn-convertto').addEventListener(clickEvent, specialKeyPressed);
  document.getElementById('btn-convertfrom').addEventListener(clickEvent, specialKeyPressed);
  document.getElementById('btn-clear').addEventListener(clickEvent, clearKeyPressed);
  document.getElementById('btn-del').addEventListener(clickEvent, clearKeyPressed);
  document.getElementById('btn-sto').addEventListener(clickEvent, specialKeyPressed);
  document.getElementById('btn-rcl').addEventListener(clickEvent, specialKeyPressed);
  document.getElementById('btn-compute').addEventListener(clickEvent, calculateKeyPressed);

  document.getElementById("btn-settings").addEventListener(clickEvent, function(e) {
    var view = document.getElementById("settings-view");
    view.classList.add("current");
    view.classList.remove("top");
    document.getElementById('btn-settings-vibrate').checked = oSettings.vibration;
    document.getElementById('btn-settings-convert').checked = oSettings.unitConversion;
    document.getElementById('unit-from-factor').value = oSettings.unitFromValue;
    document.getElementById('unit-from').value = oSettings.unitFrom;
    document.getElementById('unit-to-factor').value = oSettings.unitToValue;
    document.getElementById('unit-to').value = oSettings.unitTo;
  });

  document.getElementById("btn-settings-back").addEventListener(clickEvent, function(e) {
    var view = document.getElementById("settings-view");
    view.classList.add("top");
    view.classList.remove("current");
    oSettings.vibration = document.getElementById('btn-settings-vibrate').checked;
    oSettings.unitConversion = document.getElementById('btn-settings-convert').checked;
    oSettings.unitFromValue = parseFloat (document.getElementById('unit-from-factor').value);
    oSettings.unitFrom = document.getElementById('unit-from').value;
    oSettings.unitToValue = parseFloat (document.getElementById('unit-to-factor').value);
    oSettings.unitTo = document.getElementById('unit-to').value;
    updateConvertRow();
    oSettings.save();
  });

  initCalculator();
  console.log("window.onload finished");

};

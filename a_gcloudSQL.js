/*global  Logger , userEmail , SpreadsheetApp , 
getCKThisForm , proposalC , dbInstG , propListInstG
*/
/* exported readInListFromTable, , writeToTable , 
getProposalData , getProposalNamesAndIDs , getProposalNames , getAddressSuiteFloorSF,
getSpaceDisplay,getNamedProposalData,writePropDetail,writeProposal,
setProposalCurrent,getCurrentProposal,objectToArray,rangeToObjects,testMatchingBRProposalID,
testReadFromClauses,testReadFromProposals*/


/**
 * Purpose: read row(s) up to maxRows from database using dbInst for connection
 * 
 *
 * @param  {object} dbInst - instance of database class
 * @param {string} tableNameS - table to read
 * @param {string} colS - column to select on
 * @param {string} searchS - string to search on
 * @return {object[]} rowA - array of rows read from tbl
 */
// Modified 210714 to include json y/n
const logReadFromTable = false;
const maxRows = 1000;

function readFromTable(dbInst, tableNameS, colS, searchS, jsonyn = true) {
  var fS = "readFromTable";
  var logLoc = logReadFromTable;
  /*********connect to database ************************************ */
  try {
    var locConn = dbInst.getconn(); // get connection from the instance
    logLoc ? console.log(`In ${fS} ${locConn.toString()}`) : true;
    var stmt = locConn.createStatement();
    stmt.setMaxRows(maxRows);
  } catch (err) {
    Logger.log(`In ${fS} issue getting connection or creating statement: ${err}`);
    return false
  }
  /******************extract rows that meet select criteria ********* */
  var qryS = `SELECT * FROM ${tableNameS} where ${colS} = "${searchS}";`;
  try {
    var results = stmt.executeQuery(qryS);
    var numCols = results.getMetaData().getColumnCount();
  } catch (err) {
    Logger.log(`In ${fS} problem with executing ${colS} = ${searchS} query : ${err}`);
    return false
  }
  var dataA = [];
  while (results.next()) { // the resultSet cursor moves forward with next; ends with false when at end
    var recA = [];
    for (var col = 0; col < numCols; col++) {
      recA.push(results.getString(col + 1)); // create inner array(s)
    }
    dataA.push(recA); // push inner array into outside array
  }
  // This finishes with an nxm matrix with #rows = length of dataA and #cols = numCols
  logLoc ? console.log(`In ${fS} ${dataA}`) : true;

  /**************************now get the header names ************************** */
  try {
    var colA = dbInst.getcolumns(tableNameS);
  } catch (err) {
    var problemS = `In ${fS} problem with executing query : ${err}`
    Logger.log(problemS);
    return problemS
  }

  var rowA = splitRangesToObjects(colA, dataA); // utility function in objUtil.gs
  logLoc ? console.log(`In ${fS} ${rowA}`) : true;

  results.close();
  stmt.close();
  // stmt2.close();
  // Create backward-compatible json structure to mimic REST calls to Airtable
  var retA = [];
  for (var j in rowA) {
    var retObj = new Object();
    retObj["fields"] = rowA[j];
    retA.push(retObj);
  }
  // console.log(retA);
  if (jsonyn) {
    return retA
  } else {
    return rowA
  }
}

/**
 * Purpose: 
 *
 * @param  {Object} dbInst - instance of database class
 * @param {String} tableNameS - table to read
 * @param {String} colS - column to select on
 * @param {String} inListS - string in IN SQL format
 * @return {String} retS - return value
 * 
 * return value is in the form: 
 */

const logReadInListFromTable = false;

function readInListFromTable(dbInst, tableNameS, colS, inListS) {
  var fS = "readInListFromTable";
  var logLoc = logReadInListFromTable;
  var problemS;
  /*********connect to database ************************************ */
  try {
    var locConn = dbInst.getconn(); // get connection from the instance
    logLoc ? console.log(locConn.toString()) : true;
    var stmt = locConn.createStatement();
    stmt.setMaxRows(maxRows);
  } catch (err) {
    problemS = `In ${fS} issue getting connection or creating statement: ${err}`;
    console.log(problemS);
    return problemS
  }
  /******************extract rows that meet select criteria ********* */
  var qryS = `SELECT * FROM ${tableNameS} where ${colS} IN ${inListS};`;
  logLoc ? console.log(qryS) : true;
  try {
    var results = stmt.executeQuery(qryS);
    var numCols = results.getMetaData().getColumnCount();
  } catch (err) {
    problemS = `In ${fS} problem with executing ${colS} = ${inListS} query : ${err}`;
    console.log(problemS);
    return problemS
  }
  var dataA = [];
  while (results.next()) { // the resultSet cursor moves forward with next; ends with false when at end
    var recA = [];
    for (var col = 0; col < numCols; col++) {
      recA.push(results.getString(col + 1)); // create inner array(s)
    }
    dataA.push(recA); // push inner array into outside array
  }
  // This finishes with an nxm matrix with #rows = length of dataA and #cols = numCols
  logLoc ? console.log(dataA) : true;

  /**************************now get the header names ************************** */
  qryS = `SHOW COLUMNS FROM ${tableNameS};`
  try {
    var stmt2 = locConn.createStatement();
    var colA = [];
    var cols = stmt2.executeQuery(qryS);
    while (cols.next()) {
      colA.push(cols.getString(1));
    }
  } catch (err) {
    problemS = `In ${fS} problem with executing query : ${err}`
    console.log(problemS);
    return problemS
  }

  var rowA = splitRangesToObjects(colA, dataA); // utility fn in objUtil.gs
  logLoc ? console.log(rowA) : true;

  results.close();
  stmt.close();
  stmt2.close();

  return rowA
}


/**
 * Purpose: 
 *
 * @param  {Object} dbInst - instance of database class
 * @return {String} retS - return value
 * 
 * return value is in the form: 
 */

const disp_readInClausesFromTable = false;
// eslint-disable-next-line no-unused-vars
function readInClausesFromTable(dbInst) {
  var fS = "readInClausesFromTable";
  var logLoc = disp_readInClausesFromTable;
  var problemS;
  /*********connect to database ************************************ */
  try {
    var locConn = dbInst.getconn(); // get connection from the instance
    logLoc ? console.log(locConn.toString()) : true;
    var stmt = locConn.createStatement();
    stmt.setMaxRows(maxRows);
  } catch (err) {
    problemS = `In ${fS} issue getting connection or creating statement: ${err}`;
    console.log(problemS);
    return problemS
  }
  /******************extract rows that meet select criteria ********* */
  var qryS = `SELECT * FROM clauses where ClauseVersion = 'current' and ClauseKey = 'premises'  ;`;
  logLoc ? console.log(qryS) : true;
  try {
    var results = stmt.executeQuery(qryS);
    var numCols = results.getMetaData().getColumnCount();
  } catch (err) {
    problemS = `In ${fS} problem with executing qryS ${qryS} : ${err}`;
    console.log(problemS);
    return problemS
  }
  var dataA = [];
  while (results.next()) { // the resultSet cursor moves forward with next; ends with false when at end
    var recA = [];
    for (var col = 0; col < numCols; col++) {
      recA.push(results.getString(col + 1)); // create inner array(s)
    }
    dataA.push(recA); // push inner array into outside array
  }
  // This finishes with an nxm matrix with #rows = length of dataA and #cols = numCols
  logLoc ? console.log(dataA) : true;

  /**************************now get the header names ************************** */
  qryS = `SHOW COLUMNS FROM clauses;`
  try {
    var stmt2 = locConn.createStatement();
    var colA = [];
    var cols = stmt2.executeQuery(qryS);
    while (cols.next()) {
      colA.push(cols.getString(1));
    }
  } catch (err) {
    problemS = `In ${fS} problem with executing query : ${err}`
    console.log(problemS);
    return problemS
  }

  var rowA = splitRangesToObjects(colA, dataA); // utility fn in objUtil.gs
  logLoc ? console.log(rowA) : true;

  results.close();
  stmt.close();
  stmt2.close();

  return rowA
}

/**
 * Purpose: read row(s) up to maxRows from database using dbInst for connection
 *
 * @param  {object} dbInst - instance of database class
 * @param {string} tableNameS - table to read
 
 * @return {String} retS - return value
 */

const logReadAllFromTable = false;

function readAllFromTable(dbInst, tableNameS, jsonyn = true) {
  var fS = "readAllFromTable";
  var logLoc = logReadAllFromTable;
  /*********connect to database ************************************ */
  try {
    var locConn = dbInst.getconn(); // get connection from the instance
    logLoc ? console.log(`In ${fS} ${locConn.toString()}`) : true;

    var stmt = locConn.createStatement();
    stmt.setMaxRows(maxRows);
  } catch (err) {
    Logger.log(`In ${fS} issue getting connection or creating statement: ${err}`);
    return false
  }
  /******************extract rows that meet select criteria ********* */
  var qryS = `SELECT * FROM ${tableNameS};`;
  try {
    var results = stmt.executeQuery(qryS);
    var numCols = results.getMetaData().getColumnCount();
  } catch (err) {
    Logger.log(`In ${fS} problem with executing query : ${err}`);
    return false
  }
  var dataA = [];
  while (results.next()) { // the resultSet cursor moves forward with next; ends with false when at end
    var recA = [];
    for (var col = 0; col < numCols; col++) {
      recA.push(results.getString(col + 1)); // create inner array(s)
    }
    dataA.push(recA); // push inner array into outside array
  }
  logLoc ? console.log(`In ${fS} ${dataA}`) : true;

  /**************************now get the header names ************************** */
  try {
    var colA = dbInst.getcolumns(tableNameS);
  } catch (err) {
    var problemS = `In ${fS} problem with executing query : ${err}`
    Logger.log(problemS);
    return problemS
  }
  var rowA = splitRangesToObjects(colA, dataA); // utility fn in objUtil.gs
  logLoc ? console.log(`In ${fS} ${rowA}`) : true;
  results.close();
  stmt.close();
  var retA = [];
  for (var j in rowA) {
    var retObj = new Object();
    retObj["fields"] = rowA[j];
    retA.push(retObj);
  }
  if (jsonyn) {
    return retA
  } else {
    return rowA
  }
}

/* 
 * Purpose: get an array of ProposalNames and IDs from proposals table
 *         based upon the name of the user
 *
 * @param  {String} userS - optional user string (email)
 * @return {array} propNameIDA - 2D array: name, id
 */

function getProposalNamesAndIDs(dbInst, userS = userEmail) {
  var fS = "getProposalNamesAndIDs";
  var tableNameS = "proposals";
  var colNameS = "CreatedBy";
  var searchS = userS;
  var jsonyn = false;
  var ret = [];
  try {
    ret = readFromTable(dbInst, tableNameS, colNameS, searchS, jsonyn);
    if (!ret) throw new Error(`problem reading from table ${tableNameS}`);
    var propNameIDA = ret.map(function (record) {
      return [record.proposalname, record.proposalid, record.current]
    });
  } catch (err) {
    var probS = `In ${fS} error ${err}`;
    Logger.log(probS);
    return false
  }
  return propNameIDA
}


/**
 * Purpose: Join spaces and buildings (view?) to get SpaceID / Floor / Suite / Square Footage
 *
 * @param  {String} param_name - param
 * @param  {itemReponse[]} param_name - an array of responses 
 * @return {String} retS - return value
 */
const logGetAddressSuitFloorSF = false;
// eslint-disable-next-line no-unused-vars
function getAddressSuiteFloorSF(userS = userEmail) {
  // var dbInst = new databaseC(databaseNameG);
  const dbInst = dbInstG;
  var fS, sS, ssS;
  var tableNameS = "sub_spaces"; // this is actually a view but should work the same
  var jsonyn = true;
  var ret = readAllFromTable(dbInst, tableNameS, jsonyn);
  var spaceA = ret.map(record => {
    record.fields.suite ? sS = "/ S: " + record.fields.suite : sS = "";
    record.fields.floor ? fS = "/ F: " + record.fields.floor : fS = "";
    record.fields.squarefeet ? ssS = "/ SF: " + new Intl.NumberFormat().format(record.fields.squarefeet) : ssS = "";
    return {
      sdesc: `${record.fields.address} ${sS} ${fS} ${ssS}`,
      sidentity: record.fields.spaceidentity
    }
  })
  logGetAddressSuitFloorSF ? console.log(spaceA) : true;
  dbInst.closeconn();
  return spaceA
}

/**
 * Purpose: Join spaces and buildings (view?) to get SpaceID / Floor / Suite / Square Footage
 *
 * @param  {String} param_name - param
 * @param  {itemReponse[]} param_name - an array of responses 
 * @return {String} retS - return value
 * Modified: 210724 4:06
 */
const logGetSpaceDisplay = false;
// eslint-disable-next-line no-unused-vars
function getSpaceDisplay(userS = userEmail) {
  const dbInst = dbInstG;
  var tableNameS = "survey_spaces"; // 
  var jsonyn = true;
  var ret = readAllFromTable(dbInst, tableNameS, jsonyn);
  var spaceA = ret.map(record => {
    return {
      saddr: record.fields.address,
      sidentity: record.fields.identity,
      sfs: record.fields.floorandsuite
    }
  })
  logGetSpaceDisplay ? console.log(spaceA) : true;
  dbInst.closeconn();
  return spaceA

}


/** 
 * Purpose: Get data from the proposal table
 *         based upon the name of the user
 *
 * @param {object} dbInst - instance of databaseC
 *  @param  {String} userS - optional user string (email)
 * @return {array} propDataA - 2D array: name, id, loc, size
 */
const logGetProposalData = false;

function getProposalData(dbInst, userS = userEmail) {
  var tableNameS = "proposals";
  var colNameS = "CreatedBy";
  var propDataA = [];
  var searchS = userS;
  var jsonyn = false;
  var ret = readFromTable(dbInst, tableNameS, colNameS, searchS, jsonyn);
  propDataA = ret.map(function (record) {
    return [record.proposalname, record.proposalid, record.proposallocation, record.proposalsize]
  })
  logGetProposalData ? console.log(propDataA) : true;
  return propDataA
}

/** 
 * Purpose: Get data from the proposal table
 *         based upon a proposal name, and the name of the user
 * @param  {String} proposalNameS - a name of a proposal
 * @param  {String} userS - optional user string (email)
 * @return {object} pObj - object: name, id, loc, size
 */

function getNamedProposalData(dbInst, proposalNameS, userS = userEmail) {
  var fS = "getNamedProposalData";
  try {
    var tableNameS = "proposals";
    var colNameS = "CreatedBy";
    var searchS = userS;
    var jsonyn = false;
    var ret = readFromTable(dbInst, tableNameS, colNameS, searchS, jsonyn);
    var propDataA = ret.map(function (record) {
      return [record.proposalname, record.proposalid, record.proposalsize]
    }).filter(prop => prop[0] == proposalNameS)
    //console.log(propDataA)
  } catch (err) {
    var problemS = `In ${fS}: ${err}`;
    console.log(problemS);
    return problemS
  }
  if (propDataA.length == 1) {
    var p = propDataA[0];
    var pObj = {
      "name": p[0],
      "id": p[1],
      "size": p[2]
    };
    return pObj
  } else {
    throw new Error(`${proposalNameS} has ${propDataA.length} records.`);
  }
}

const logWriteProposal = false;

function writeProposal(dbInst, record) {
  var fS = 'writeProposal';
  var colS = "ProposalID,ProposalName,space_identity,TenantName,ProposalSize,CreatedBy,CreatedWhen,ModifiedWhen,ModifiedBy";
  var valA = Object.values(record);
  var recordS = "";
  for (var i = 0; i < valA.length; i++) {
    if (i < (valA.length - 1)) {
      recordS = recordS + "'" + valA[i] + "',";
    } else {
      recordS = recordS + "'" + valA[i] + "'";
    }
  }
  recordS = "UUID()," + recordS;
  try {
    var qryS = `INSERT INTO proposals (${colS}) VALUES(${recordS});`;
    logWriteProposal ? console.log(qryS) : true;
    var locConn = dbInst.getconn(); // get connection from the instance
    var stmt = locConn.prepareStatement(qryS);
    stmt.execute();
  } catch (err) {
    var problemS = `In ${fS}: ${err}`;
    logWriteProposal ? console.log(problemS) : true;
    return problemS
  }
  return "Success"
}

/**
 * Purpose: get a list of ProposalNames from proposals table
 *
 * @param  {dbInst} param_name - an array of responses 
 * @param  {String} userS - optional user string (email)
 * @param  {itemReponse[]} param_name - an array of responses 
 * @return {String} retS - return value
 */
function getProposalNames(dbInst, userS = userEmail) {
  var tableNameS = "proposals";
  var colNameS = "CreatedBy";
  var searchS = userS;
  var jsonyn = false;
  var ret = readFromTable(dbInst, tableNameS, colNameS, searchS, jsonyn);
  var proposalsA = ret.map(function (record) {
    return record.proposalname
  })
  console.log(proposalsA)
  return proposalsA
}


/**
 * Purpose
 *
 * @param  {object} dbInst - instance of database class
 * @param  {number} propID - proposal identifier integer
 * @return {boolean} retS - return value
 */
function matchingBRProposalID(dbInst, propID) {
  var fS = "matchingBRProposalID";
  try {
    var locConn = dbInst.getconn(); // get connection from the instance
    var stmt = locConn.createStatement();
  } catch (err) {
    Logger.log(`In ${fS} problem with connecting: ${err}`);
    return false
  }
  try {
    var rs = stmt.executeQuery(`SELECT COUNT(*) FROM base_rent where ProposalID = '${propID}';`);
    rs.next()
    var rowCount = rs.getLong(1);
    if (rowCount == 0) {
      return false
    }
  } catch (err) {
    var errS = `In ${fS} problem with executing ProposalID = ${propID} query : ${err}`
    Logger.log(errS);
    throw new Error(errS); // pass up to calling function
  }
  return true
}

/**
 * Purpose: Takes the proposal instance and sets the proposal to current, 
 * toggling all other proposals (meaning ALL) to false first
 * 
 * @param  {Object} dbInst - instance of databaseC
 * @param  {Object} propInst - instance of proposalC
 * @return {String} retS - return value
 */
/* UPDATE [LOW_PRIORITY] [IGNORE] table_name 
SET 
    column_name1 = expr1,
    column_name2 = expr2,
    ...
[WHERE
    condition];*/

// eslint-disable-next-line no-unused-vars
const logSetProposalCurrent = false;

function setProposalCurrent(dbInst, pid) {
  var fS = "setProposalCurrent";
  try {
    // var pid = propInst.getID();
    var locConn = dbInst.getconn(); // get connection from the instance

    // first set all proposal current -> false
    var qryS1 = `UPDATE proposals SET proposals.current = false;`;
    var stmt = locConn.prepareStatement(qryS1);
    stmt.execute();
    var qryS2 = `UPDATE proposals SET proposals.current = true WHERE proposals.ProposalID= '${pid}';`;
    // console.log(qryS);
    stmt = locConn.prepareStatement(qryS2);
    stmt.execute();
  } catch (err) {
    Logger.log(`in ${fS} qryS1 is ${qryS1} qryS2 is ${qryS2}`);
    return false
  }
  return true

}
/**
 * Purpose: set the current proposal with only a proposal
 * name string; create a new propInst and dbInst to do so
 *
 * @param  {String} pnS - proposal name string
 * @return {boolean} f or ID of the proposal - or throws error
 */

// eslint-disable-next-line no-unused-vars
function clientSetProposalCurrent(pnS) {
  var fS = "clientSetProposalCurrent";
  var dbInst;
  Logger.log(`Getting into clientSetProposalCurrent with ${pnS}`);
  try {
    const dbInst = dbInstG;
    const propListInst = propListInstG;
    // propInst = new proposalC(dbInst, pnS);
    // var pid = propInst.getID();
    const pid = propListInst.getIDfromName(pnS);
    propListInst.setCurr(pid);
    var ret = setProposalCurrent(dbInst, pid);
    if (!ret) throw new Error(`problem in setProposalCurrent for ${pnS}`);
    var overDA = clientGetCDData(pnS);
    if (!ret) throw new Error(`problem in clientGetCDData for ${pnS}`);


  } catch (err) {
    Logger.log(`In ${fS}: ${err}`);
    dbInst.closeconn();
    return false
  }
  dbInst.closeconn();
  return overDA;
}

/**
 * Purpose: get current proposal from db
 *
 * @param  {string} userS - name of current user
 * @return {boolean[]} [pid, pN] or [false,false]
 */

// eslint-disable-next-line no-unused-vars
function getCurrentProposal(userS = userEmail) {
  const fS = "getCurrentProposal";
  const dbInst = dbInstG;
  var pid = "";
  var pN = "";
  try {
    const locConn = dbInst.getconn(); // get connection from the instance

    const qryS = `SELECT ProposalID, ProposalName FROM proposals WHERE current=true;`;
    const stmt = locConn.prepareStatement(qryS);
    const results = stmt.executeQuery(qryS);
    var cntr = 0;
    while (results.next()) { // the resultSet cursor moves forward with next; ends with false when at end
      pid = results.getString("ProposalID");
      pN = results.getString("ProposalName");
      cntr++;
      // column can either be by number or by string 
    }
    if (cntr === 0 || pid === "") {
      dbInst.getconn().close;
      throw new Error(`no current proposal`)
    }
    if (cntr > 1) {
      dbInst.getconn().close;
      throw new Error(`more than one current proposal`)
    }
    dbInst.getconn().close;
    return [pid, pN]

  } catch (err) {
    const probS = `In ${fS}: error ${err}`;
    console.log(probS);
    dbInst.getconn().close;

    return [false, false]
  }
}


/*****************UTILITIES********************* */

/**
 * Changes a range array into an array of objects with key value pairs
 *
 * @params  {array}    headers  [key, key, ...]
 * @params  {array}    values    [[value, value, ...], ...]
 * @returns {array}    [{key:value, ...}, ...]  
 */
function splitRangesToObjects(headers, values) {
  var rowObjects = [];
  for (var i = 0; i < values.length; ++i) {
    var row = new Object();
    //row.rowNum = i;
    for (var j in headers) {
      row[camelString(headers[j])] = values[i][j];
    }
    rowObjects.push(row);
  }
  return rowObjects;
}

/**
 * Removes special characters from a string
 * Commonly know as a camelCase, 
 * Examples:
 *   "First Name" -> "firstName"
 *   "Market Cap (millions) -> "marketCapMillions
 *   "1 number at the beginning is ignored" -> "numberAtTheBeginningIsIgnored"
 * @params  {string}  header   string
 * @returns {string}           camelCase 
 */
function camelString(header) {
  var key = "";
  var upperCase = false;
  for (var i = 0; i < header.length; ++i) {
    var letter = header[i];
    if (letter == " " && key.length > 0) {
      upperCase = true;
      continue;
    }
    if (!isAlnum_(letter)) {
      continue;
    }
    if (key.length == 0 && isDigit_(letter)) {
      continue; // first character must be a letter
    }
    if (upperCase) {
      upperCase = false;
      key += letter.toUpperCase();
    } else {
      key += letter.toLowerCase();
    }
  }
  return key;
}

function isAlnum_(char) {
  return char >= 'A' && char <= 'Z' ||
    char >= 'a' && char <= 'z' ||
    isDigit_(char);
}

function isDigit_(char) {
  return char >= '0' && char <= '9';
}

/**
 * ObjService
 * @author James Ferriera
 * @documentation http://goo.gl/JdEHW
 *
 * Changes an object like e.parameter into a 2D array useful in 
 * writing to a spreadsheet with using the .setValues method
 *
 * @param   {Array}   headers    [header, header, ...] 
 * @param   {Array}   objValues  [{key:value, ...}, ...]
 * @returns {Array}              [[value, value, ...], ...]
 */
function objectToArray(headers, objValues) {
  var values = [];
  var h = camelArray(headers);
  for (var j = 0; j < objValues.length; j++) {
    var rowValues = [];
    for (var i = 0; i < h.length; i++) {
      rowValues.push(objValues[j][h[i]]);
    }
    values.push(rowValues);
  }
  return values;
}


/**
 * Changes a range array often returned from .getValues() into an 
 * array of objects with key value pairs.
 * The first element in the array is used as the keys (headers)
 *
 * @param   {Array}   range   [[key, key, ...],[value, value, ...]] 
 * @returns {Array}           [{key:value, ...}, ...] 
 */
function rangeToObjects(range) {
  var headers = range[0];
  var values = range;
  var rowObjects = [];
  for (var i = 1; i < values.length; ++i) {
    var row = new Object();
    // row.rowNum = i;
    for (var j in headers) {
      row[headers[j]] = values[i][j];
    }
    rowObjects.push(row);
  }
  return rowObjects;
}

/**
 * Removes special characters from strings in an array
 * Commonly know as a camelCase, 
 * Examples:
 *   "First Name" -> "firstName"
 *   "Market Cap (millions) -> "marketCapMillions
 *   "1 number at the beginning is ignored" -> "numberAtTheBeginningIsIgnored"
 * @params  {array} headers   [string, string, ...]
 * @returns {array}           camelCase 
 */
function camelArray(headers) {
  var keys = [];
  for (var i = 0; i < headers.length; ++i) {
    var key = camelString(headers[i]);
    if (key.length > 0) {
      keys.push(key);
    }
  }
  return keys;
}

/**********************Test Functions********************** */


function testMatchingBRProposalID() {
  var dbInst = dbInstG;
  var ret = matchingBRProposalID(dbInst, "bb5db7d9-df89-11eb-8b6e-42010a800002");
  console.log(ret)
  dbInst.closeconn();
}

function testReadFromClauses() {
  const dbInst = dbInstG;
  var tableNameS = "clauses";
  var colNameS = "Section";
  var searchS = "Electric";
  var jsonyn = false;
  var retA = readFromTable(dbInst, tableNameS, colNameS, searchS, jsonyn); // all rows in section Electric
  // var records = retA.map(function (record) {
  //   return record;
  // });
  console.log(retA);
  // console.log(records[0].clausekey);
  dbInst.closeconn();
}

function testReadFromProposals() {
  var dbInst = dbInstG;
  var tableNameS = "proposals";
  var colNameS = "CreatedBy";
  var searchS = userEmail;
  var jsonyn = false;
  var retA = readFromTable(dbInst, tableNameS, colNameS, searchS, jsonyn); // all rows in section Electric
  console.log(retA);
  dbInst.getconn().close;
}

/**
 * Purpose: Write a row to the specified table
 *
 * @param  {datebaseC} dbInst - instance of databaseC
 * @param  {string} tableNameS - table name string
 * @param {string[]} recordA - array of strings to write to tableNameS
 * @return {String} retS - return value
 */
function writeToTable(dbInst, tableNameS, recordA) {

  try {
    var locConn = dbInst.getconn(); // get connection from the instance
    var stmt = locConn.createStatement();
    var colAtmp = dbInst.getcolumns(tableNameS);
    // creat an array of column names
    var colA = [];
    for (var i = 0; i < colAtmp.length; i++) {
      colA.push(colAtmp[i]);
    }
    // filter out columns we don't want to insert, specifically autoincrements
    switch (tableNameS) {
      case "base_rent":
        colAtmp = colA.filter(col => col != "BaseRentID");
        colA = colAtmp;
        break;
      default:
        break;
    }
    if (colA.length != recordA.length) {
      throw new Error(`number of columns ${colA.length} diff from record param ${recordA.length}`)
    }
    var recMod = recordA.map(rec => {
      if (typeof rec != 'number') {
        rec = "'" + rec + "'";
      }
      return rec
    })
    var colS = colA.join();
    var recordS = recMod.join();
    var qryS = `INSERT INTO ${tableNameS}(${colS}) VALUES(${recordS});`;
    locConn = dbInst.getconn(); // get connection from the instance
    stmt = locConn.prepareStatement(qryS);
    stmt.execute();
    // console.log(qryS);
  } catch (e) {
    console.log(`In writeToTable: ${e}`);
    SpreadsheetApp.getUi() // Or DocumentApp or FormApp.
      .alert(`In writeToTable: ${e}`);
    return false
  }
  return "Success"
}

/**
 * Purpose: get all the operating expense information for a given proposal ID
 * by querying _prop_detail_ based on the id and 
 *
 * @param  {object} dbInst - instance of databaseC
 * @param  {string} proposalID - an array of responses 
 * @return {object[]} resA - return array of objects
 * Format of returned array of objects: [{ 'ck': ckS, 'ans': ansS },..]
 * clausekeys and answers
 */
// eslint-disable-next-line no-unused-vars
function getOpExpData(dbInst, proposalID) {
  var fS = "getOpExpData";
  var ckA = [];
  var resA = [];
  try {
    ckA = getCKThisForm(dbInst, "Operating Expenses");
    if (!ckA) throw new Error(`problem getting clausekeys from Operating Expenses  form`)
    const locConn = dbInst.getconn(); // get connection from the instance 
    const qryS = `SELECT * FROM   prop_detail WHERE ProposalID = "${proposalID}" and ProposalClauseKey IN (SELECT ClauseKey FROM ck_repl WHERE FormName = "Operating Expenses");`;
    const stmt = locConn.prepareStatement(qryS);
    const results = stmt.executeQuery(qryS);

    if (!results.last()) {
      // throw new Error(`In ${fS} no results returned for formname ${formName}`)
      return false;
    }
    results.beforeFirst(); // reset to beginning
    while (results.next()) { // the resultSet cursor moves forward with next; ends with false when at end
      var ansS = results.getString("ProposalAnswer");
      var ckS = results.getString("ProposalClauseKey");
      var retObj = {
        'ck': ckS,
        'ans': ansS
      };
      resA.push(retObj);
    }
  } catch (err) {
    var probS = `In ${fS} error ${err}`;
    Logger.log(probS);
    return false
  }
  return resA
}
/**
 * Purpose: get all the ti information for a given proposal ID
 * by querying _prop_detail_ based on the id and 
 *
 * @param  {object} dbInst - instance of databaseC
 * @param  {string} proposalID - an array of responses 
 * @return {object[]} resA - return array of objects
 * Format of returned array of objects: [{ 'ck': ckS, 'ans': ansS },..]
 * clausekeys and answers
 */
// eslint-disable-next-line no-unused-vars
function getTIData(dbInst, proposalID) {
  var fS = "getTIData";
  var ckA = [];
  var resA = [];
  try {
    ckA = getCKThisForm(dbInst, "Tenant Improvements");
    if (!ckA) throw new Error(`problem getting clausekeys from Tenant Improvements form`)
    const locConn = dbInst.getconn(); // get connection from the instance 
    const qryS = `SELECT * FROM   prop_detail WHERE ProposalID = "${proposalID}" and ProposalClauseKey IN (SELECT ClauseKey FROM ck_repl WHERE FormName = "Tenant Improvements");`;
    const stmt = locConn.prepareStatement(qryS);
    const results = stmt.executeQuery(qryS);

    if (!results.last()) {
      // throw new Error(`In ${fS} no results returned for formname ${formName}`)
      return false;
    }
    results.beforeFirst(); // reset to beginning
    while (results.next()) { // the resultSet cursor moves forward with next; ends with false when at end
      var ansS = results.getString("ProposalAnswer");
      var ckS = results.getString("ProposalClauseKey")
      var retObj = {
        'ck': ckS,
        'ans': ansS
      };
      resA.push(retObj);
    }
  } catch (err) {
    var probS = `In ${fS} error ${err}`;
    Logger.log(probS);
    return false
  }
  return resA
}

/**
 * Purpose: client side calls to get alloverview information f
 * or a given proposal ID
 * by querying _prop_detail_ based on the id and sub query of ck_repl
 *
 * @param  {object} dbInst - instance of databaseC
 * @param  {string} proposalID - an array of responses 
 * @return {object[]} resA - return array of objects
 * Format of returned array of objects: [{ 'ck': ckS, 'ans': ansS },..]
 * clausekeys and answers
 */
const disp_clientGetTIData = false;
// eslint-disable-next-line no-unused-vars
function clientGetTIData(proposalNameS) {
  var fS = "clientGetTIData";
  disp_clientGetTIData ? Logger.log(`In ${fS} proposalNameS is ${proposalNameS}`) : true;
  var resA = [];
  try {
    const dbInst = dbInstG;
    // extract id from name
    var propInst = new proposalC(dbInst, proposalNameS);
    var proposalID = propInst.getID();

    const locConn = dbInst.getconn(); // get connection from the instance 
    const qryS = `SELECT * FROM   prop_detail WHERE ProposalID = "${proposalID}" and ProposalClauseKey IN (SELECT ClauseKey FROM ck_repl WHERE FormName = "Tenant Improvements");`;
    const stmt = locConn.prepareStatement(qryS);
    const results = stmt.executeQuery(qryS);
    Logger.log(`in ${fS}: qry is ${qryS}`);
    results.beforeFirst(); // reset to beginning
    while (results.next()) { // the resultSet cursor moves forward with next; ends with false when at end
      var ansS = results.getString("ProposalAnswer");
      var ckS = results.getString("ProposalClauseKey")
      var retObj = {
        'ck': ckS,
        'ans': ansS
      };
      resA.push(retObj);
    }
  } catch (err) {
    var probS = `In ${fS} error ${err}`;
    Logger.log(probS);
    throw new Error(probS)
  }
  var stringR = JSON.stringify(resA);
  disp_clientGetTIData ? Logger.log(`In ${fS} resA: ${stringR}`) : true;
  return resA
}

/**
 * Purpose: client side calls to get readiness information f
 * or a given proposal ID
 * by querying _prop_detail_ based on the id and sub query of ck_repl
 *
 * @param  {object} dbInst - instance of databaseC
 * @param  {string} proposalID - an array of responses 
 * @return {object[]} resA - return array of objects
 * Format of returned array of objects: 
 * 
 * clausekeys and answers
 */
const disp_clientGetCDData = false;
// eslint-disable-next-line no-unused-vars
function clientGetCDData(proposalNameS) {
  var fS = "clientGetCDData";
  disp_clientGetCDData ? Logger.log(`In ${fS} proposalNameS is ${proposalNameS}`) : true;
  var resA = [];
  try {
    const dbInst = dbInstG;
    // extract id from name
    // var propInst = new proposalC(dbInst, proposalNameS);
    // var proposalID = propInst.getID();

    const locConn = dbInst.getconn(); // get connection from the instance 
    const qryS = `SELECT ProposalClauseKey, ProposalAnswer, section FROM applesmysql.prop_detail_ex where ProposalName like "${proposalNameS}" 
      order by section;`;
    const stmt = locConn.prepareStatement(qryS);
    const results = stmt.executeQuery(qryS);
    Logger.log(`in ${fS}: qry is ${qryS}`);
    results.beforeFirst(); // reset to beginning
    while (results.next()) { // the resultSet cursor moves forward with next; ends with false when at end
      var ans = results.getString("ProposalAnswer");
      var ck = results.getString("ProposalClauseKey");
      var sect = results.getString("section");
      var retObj = {
        'ans': ans,
        'clause': ck,
        "sect": sect
      };
      resA.push(retObj);
    }
  } catch (err) {
    var probS = `In ${fS} error ${err}`;
    Logger.log(probS);
    throw new Error(probS)
  }
  var stringR = JSON.stringify(resA);
  disp_clientGetCDData ? Logger.log(`In ${fS} resA: ${stringR}`) : true;
  return resA
}
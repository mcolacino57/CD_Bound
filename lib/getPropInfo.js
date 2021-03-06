/*global Logger  , todayS */
/**
 * Purpose: Get the size of the current proposal
 *
 * @param  {object} dbInst - instance of databaseC
 * @param  {string} propID - proposal id
 * @return {String} retS - return S/M/L
 */
// eslint-disable-next-line no-unused-vars
function getPropSize(dbInst, propID) {
  var fS = "getPropSize";
  try {
    var locConn = dbInst.getconn();
    var qryS = `SELECT ProposalSize FROM proposals WHERE ProposalID = '${propID}';`;
    var stmt = locConn.prepareStatement(qryS);
    var results = stmt.executeQuery(qryS);
    while (results.next()) { // the resultSet cursor moves forward with next; ends with false when at end
      var value = results.getString("ProposalSize")
    }
  } catch (err) {
    var probS = `In ${fS} error ${err}`;
    Logger.log(probS);
    return false
  }
  return value
}
/**
 * Purpose takes a dbInst and a proposal name and returns a structure representing
 * all the values in the proposal table
 *
 * @param  {object} dbInst - instance of databaseC
 * @param  {string} propName - proposal name
 * @return {object} propStruct - all proposal fields
 */

const disp_getPropStructFromName = false;
// eslint-disable-next-line no-unused-vars
function getPropStructFromName(dbInst, propName) {
  var fS = "getPropStructFromName";
  var propStruct = {};
  try {
    var locConn = dbInst.getconn();
    var qryS = `SELECT ProposalID, ProposalSize, ProposalLocation, TenantName, space_identity FROM proposals WHERE ProposalName = '${propName}';`;
    var stmt = locConn.prepareStatement(qryS);
    var results = stmt.executeQuery(qryS);
    if(results.next()) { 
      propStruct.ProposalSize = results.getString("ProposalSize");
      propStruct.ProposalID = results.getString("ProposalID");
      propStruct.ProposalLocation = results.getString("ProposalLocation");
      propStruct.TenantName = results.getString("TenantName");
      propStruct.SpaceIdentity = results.getString("space_identity");
      propStruct.PropDateS = todayS;
    }
    else { 
      throw new Error("proposal ${propName} not found");
    }
  } catch (err) {
    var probS = `In ${fS} error: ${err}`;
    Logger.log(probS);
    return false
  }
  disp_getPropStructFromName ? Logger.log(JSON.stringify(propStruct)) : true;
  return propStruct

}

/**
 * Purpose: Get the location of the current proposal
 *
 * @param  {object} dbInst - instance of databaseC
 * @param  {string} propID - proposal id
 * @return {String} retS - return location
 */
// eslint-disable-next-line no-unused-vars
const disp_getPropLocation = false
// eslint-disable-next-line no-unused-vars
function getPropLocation(dbInst, propID) {
  var fS = "getPropLocation";
  try {
    var locConn = dbInst.getconn();
    var qryS = `SELECT ProposalLocation FROM proposals WHERE ProposalID = '${propID}';`;
    var stmt = locConn.prepareStatement(qryS);
    var results = stmt.executeQuery(qryS);
    if(results.next()) { // the resultSet cursor moves forward with next; ends with false when at end
      var value = results.getString("ProposalLocation")
    }
    else { 
      throw new Error("location for ${propID} not found");
    }
  } catch (err) {
    var probS = `In ${fS} error ${err}`;
    Logger.log(probS);
    return false
  }
  return value
}
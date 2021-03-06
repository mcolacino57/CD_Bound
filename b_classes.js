/* eslint-disable no-unused-vars */
/*global Logger, getPropSize,userEmail,DriveApp,DocumentApp,getItemResps,getAnswerWithMap,Jdbc,Utilities ,
getProposalNamesAndIDs , getPropSize , getPropLocation , createPropDetailA ,
getPropStructFromName , matchProposalSizeWithClause */
/*exported ckStringC, proposalC,brokerC,docC,responseC,databaseC, propListC   */

class propDetailC {
  constructor(dbInst, propID) {
    this.propDetailA = createPropDetailA(dbInst, propID);
  }
  getAnswerFromCK(ckS) {
    var found = this.propDetailA.find(c => c.ck === ckS);
    return found?.ans
  }
}

class ckSectionAC {
  constructor() {
    this.expA = ['oePerInc', 'oeBaseYear', 'retBaseYear', 'elecDirect', 'elecSubmeter'];
    this.optA = ['optRenew', 'optYears', 'optROFO', 'optROFR'];
    this.overA = ['secDeposit', 'useType', 'llName', 'llbrokerName', 'proposalSalutation', 'recipientEmail', 'llbrokerCo', 'llbrokerAddr', 'commDate', 'leaseTerm', 'earlyAccess'];
    this.parkA = ['parkUnreservedNum', 'parkUnreservedRatio', 'parkUnreservedCost', 'parkReservedNum',
      'parkReservedRatio', 'parkReservedCost', 'parkMaxEscPercent', 'parkDescription'];
    this.tiA = ['tiAllow', 'tiFreight', 'tiAccess', 'tiCompBid', 'llWork'];
  }

  getExpA() {
    return this.expA
  }
  getOptA() {
    return this.optA
  }
  getOverA() {
    return this.overA
  }
  getParkA() {
    return this.parkA
  }
  getTIA() {
    return this.tiA
  }
}

class ckLocalSectionAC extends ckSectionAC {
  getExpA(loc) {
    var e = super.getExpA();
    if (loc === "New York") {
      e.push('elecRentInc');
      e.push('elecRentIncCharge');  
    }
    return e 
  }
  getParkA(loc) {
    if (loc === "New York") {
      return []
    }
    return super.getParkA()
  }
}

class ckC {
  constructor(dbInst, ck, proposalSize, proposalLocation, version) {
    [this.clauseBody, this.section] = getClauseInfo(dbInst, ck, proposalSize, proposalLocation, version);
    this.replStruct = getReplStructS(dbInst, ck);

  }
  getClauseBody() {
    return this.clauseBody
  }
  getReplStruct() {
    return this.replStruct;
  }
  getSection() {
    return this.section;
  }
}

class ckStringC {
  constructor(dbInst, htmlFormObject) {
    const fS = "clause key string constructor";
    try {
      var retS = "'";
      var ckA = Object.keys(htmlFormObject); // all clauseKeys from form
      //strip out htmlFormObject values that aren't clauseKeys; this will change if more
      //fields are added to the form that aren't clauseKeys
      ckA = ckA.filter(item => item !== "selectProposal");

      var l = ckA.length;
      for (var j = 0; j < l - 1; j++) {
        retS = retS + (ckA[j] + "', '");
      }
      retS = retS + (ckA[l - 1] + "'");
    } catch (err) {
      const probS = `In ${fS} ${err}`;
      throw new Error(probS);
    }
    // Logger.log(`In ${fS}: retS is ${retS}`);
    this.ckString = retS;
  }

  getCKString() {
    return this.ckString
  }

}

class proposalC {
  constructor(dbInst, propName) {
    // this.allPropsA = getProposalNamesAndIDs(dbInst, userEmail);
    // this.prop = this.allPropsA.filter((p) => {
    //   return p[0] == propName // returns array with propName and propID
    // })[0];
    // this.name = this.prop[0];
    // this.id = this.prop[1];
    // this.size = getPropSize(dbInst, this.id, userEmail);
    // this.location = getPropLocation(dbInst, this.id);
    var propStruct = getPropStructFromName(dbInst, propName);
    if (propStruct) {
      this.name = propName;
      this.id = propStruct.ProposalID;
      this.size = propStruct.ProposalSize;
      this.location = propStruct.ProposalLocation;
      this.tenant = propStruct.TenantName;
      this.propDateS = propStruct.PropDateS;
      this.spaceIdentity = propStruct.SpaceIdentity;
    } else {
      throw new Error(`in proposalC constructor, problem finding data for ${propName}`);
    }

  }
  getSpaceIdentity() {
    return this.spaceIdentity
  }
  getName() {
    return this.name
  }
  getID() {
    return this.id
  }
  getSize() {
    return this.size
  }
  getLocation() {
    return this.location
  }
  getTenant() {
    return this.tenant
  }
  getPropDateS() {
    return this.propDateS
  }
}


// Contains an updated list of proposals (ids and names) and also the
// current proposal
class propListC {
  constructor(dbInst) {
    this.propNIDA = getProposalNamesAndIDs(dbInst, userEmail);
    for (var i = 0; i < this.propNIDA.length; i++) {
      if (this.propNIDA[i][2] == 1) {
        this.currID = this.propNIDA[i][1]
      }
    }
  }
  getPropNIDA() {
    return this.propNIDA
  }
  // for testing purposes
  getIndexed(idx) {
    return this.propNIDA[idx]
  }
  getIDfromName(propNameS) {
    for (var i = 0; i < this.propNIDA.length; i++) {
      if (this.propNIDA[i][0] == propNameS) return this.propNIDA[i][1]
    }
    return false
  }
  getNamefromID(propID) {
    for (var i = 0; i < this.propNIDA.length; i++) {
      if (this.propNIDA[i][1] == propID) return this.propNIDA[i][0]
    }
    return false //   this.name = this.allPropsNameIDA.filter( p => {
    //     if (p[1] == propID) return p[0]
    //   });
  }
  addNameID(nameIDA) {
    nameIDA.forEach(e => this.propNIDA.push(e))
    return this.propNIDA
  }
  setCurr(id) {
    this.currID = id
  }
  getCurr() {
    return this.currID
  }
}
/*****************clause class ************************************ */

class clauseC {
  constructor(canonName, geo) {
    this.name = canonName; //never changes
    this.geo = geo; // String, for example "New York" or "National";
    this.section = this.name; // override below
  }
  setGeo(geo) {
    this.geo = geo
  }
  setFormSelector(formSelector) {
    this.formSelector = formSelector
  }
  setAtSelector(atSelector) {
    this.atSelector = atSelector
  }
  setSection(section) {
    this.section = section
  }

  getName() {
    return this.name
  }
  getGeo() {
    return this.geo
  }
  getFormSelector() {
    return this.formSelector
  }
  getAtSelector() {
    return this.atSelector
  }
  getSection() {
    return this.section
  }
}


/*****************people classes ************************************ */

class personC {
  constructor(firstname, lastname, title, company, contactemail, contactaddress) {
    this.firstname = firstname;
    this.lastname = lastname;
    this.title = title;
    this.company = company;
    this.contactemail = contactemail;
    this.contactaddress = contactaddress;
    this.persontype = "PERSON"; // default for person
  }
  set perType(type) {
    this.persontype = type
  }
}
/* Class to wrap up a broker */
class brokerC extends personC {
  constructor(id, firstname, lastname, title, company, contactemail, contactaddress) {

    super(firstname, lastname, title, company, contactemail, contactaddress);
    //super(lastname);
    //super(title);
    //super(company);
    //super(contactemail);
    //super(contactaddress);
    this.id = id;
    this.persontype = "BROKER" // default for broker
  }

  setReptList(reptA) {
    if (reptA.length == 3) {
      this.replacename = reptA[0];
      this.replacecompany = reptA[1];
      this.replaceaddress = reptA[2];
    } else {
      this.replacename = "<<ListingBrokerName>>"; // replacement defaults
      this.replacecompany = "<<ListingBrokerCompanyName>>";
      this.replaceaddress = "<<ListingBrokerAddress>>";
    }
  }

  getReptList() {
    return [this.replacename, this.replacecompany, this.replaceaddress]
  }

}

/***************** doc class ************************************ */

class docC {
  constructor(docID, foldID) {
    this.file = DriveApp.getFileById(docID);
    this.folder = DriveApp.getFolderById(foldID);
    this.docName = this.file.getName();
    this.ds = formatCurrentDate();
    this.copy = this.file.makeCopy(this.docName + " " + this.ds, this.folder);
    this.copyName = this.copy.getName()
    this.locID = this.copy.getId();
    console.log(`this locID ${this.locID}`)
    this.locDocument = DocumentApp.openById(this.copy.getId());
    this.locBody = this.locDocument.getBody();
  }

  getBodyText() {
    return this.locBody.getText()
  }
  getNewDocID() {
    return this.locID
  }
  getLocDoc() {
    return this.locDocument
  }

  saveAndCloseTemplate() {

    this.locDocument.saveAndClose();
  }

}

class databaseC {
  constructor(dbS) {
    this.root = 'root';
    this.rootPwd = 'lew_FEEB@trit3auch';
    this.db = dbS; // name of the database

    if (dbS == "applesmysql_loc") {
      this.conn = Jdbc.getConnection('jdbc:mysql://localhost:3306/' + this.db, {
        user: this.root,
        password: this.rootPWD
      });
      return;
    }
    this.connectionName = 'fleet-breaker-311114:us-central1:applesmysql';
    this.root = 'root';
    this.rootPwd = 'lew_FEEB@trit3auch';
    this.user = 'applesU1';
    this.userPwd = 'DIT6rest1paft!skux';
    this.instanceUrl = 'jdbc:google:mysql://' + this.connectionName;
    this.dbUrl = this.instanceUrl + '/' + this.db;
    this.connectParam = `dbUrl: ${this.dbUrl} user: ${this.user} and ${this.userPwd}`;
    // console.log("Inside databaseC " + this.connectParam);
    this.conn = Jdbc.getCloudSqlConnection(this.dbUrl, this.user, this.userPwd);

  }

  getdbUrl() {
    return this.dbUrl;
  }
  getdb() {
    return this.db;
  }
  getconn() {
    return this.conn
  }
  getcolumns(tableNameS) {
    try {
      var qryS = `SHOW COLUMNS FROM ${tableNameS};`
      var colA = [];
      var stmt = this.conn.createStatement();
      var cols = stmt.executeQuery(qryS);
      while (cols.next()) {
        colA.push(cols.getString(1));
      }
    } catch (err) {
      Logger.log(`In method getcolumns problem with executing query : ${err}`);
    }
    return (colA)
  }
  closeconn() {
    if (this.conn != null) this.conn.close();

  }
}

function formatCurrentDate() {
  return Utilities.formatDate(new Date(), "GMT+1", "yyyyMMdd");
}

/**
 * Purpose: Does a query on the clauses table to extract the clausebody
 * corresponding to this ck, location, size, and version, where version
 * is defaulted to current
 *
 * @param  {object} dbInst - instance of database
 * @param  {String} ck - clauseKey
 * @param  {String} proposalSize - size of proposal
 * @param  {String} proposalLocation - location of proposalSize
 * @param  {string} version - versioning on ck
 * @return {string} clauseBody - clause body corresponding to this ck
 * 
 */
const disp_getClauseInfo = true;

function getClauseInfo(dbInst, ck, proposalSize, proposalLocation, version = "current") {
  const fS = "getClauseInfo";
  try {
    var clauseBody = "";
    var clauseSection = "";
    var replStruct = "";
    var probS = "";
    var stmt;
    var results, resA = [],
      cl = "";
    // Get all the clauses that match the ck and have correct version 
    var qryS = `select ClauseID, ClauseBody, ClauseSize, ClauseLocation, Section from clauses where ClauseKey ='${ck}' and ClauseVersion='${version}';`;
    const locConn = dbInst.getconn();
    stmt = locConn.createStatement();
    results = stmt.executeQuery(qryS);
    if (!results.next()) {
      throw new Error(`for ck ${ck} and version ${version}, missing clause`);
    }
    results.beforeFirst();
    while (results.next()) {
      // first check to see if this row matches location or generic and if not continue
      const clauseLocation = results.getString("ClauseLocation");
      if (clauseLocation.includes(proposalLocation) || clauseLocation.includes('Generic')) {
        cl = proposalLocation;
      } else {
        continue
      }
      // gather up all the data and make an object of it 
      var clauseRow = {
        clauseID: results.getString("ClauseID"),
        clauseKey: ck,
        clauseBody: results.getString("ClauseBody"),
        clauseSize: results.getString("ClauseSize"),
        clauseLocation: cl,
        section: results.getString("Section"),
        clauseVersion: version
      }
      resA.push(clauseRow);
    }
    if (resA.length == 0) { // no matching clauses found so throw an error
      throw new Error(`for ck ${ck} size ${proposalSize} / location ${proposalLocation} missing clause`)
      // have now created an array of one or more of these structures 
    }
    // could be several rows that match (with different sizes) so select the best fit
    var bestFitRow = matchProposalSizeWithClause(proposalSize, resA);

  } catch (err) {
    throw new Error(err.message)
  }
  return [bestFitRow.clauseBody, bestFitRow.section]
}

/**
 * Purpose: Takes a clausekey and gets its replstruct
 *
 * @param  {object} dbInst - instance of the database
 * @param  {string} ck - clause key
 * @return {String} replStruct - replacement structure string (not struct) 
 */
function getReplStructS(dbInst, ck) {
  const fS = "getReplStructS";
  var replStructS;

  try {
    const qryS = `select ReplStruct from ck_repl where ClauseKey ='${ck}';`
    const locConn = dbInst.getconn();
    const stmt = locConn.createStatement();
    const results = stmt.executeQuery(qryS);
    if (results.next()) {
      replStructS = results.getString("ReplStruct");
    } else {
      const probS = `clauseKey ${ck} not found in ck_repl`;
      throw new Error(probS);
    }

  } catch (error) {
    Logger.log(`In ${fS}: error ${error.message}`);
    return false
  }

  return replStructS
}
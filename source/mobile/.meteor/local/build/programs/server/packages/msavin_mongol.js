(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var check = Package.check.check;
var Match = Package.check.Match;

/* Package-scope variables */
var MeteorToysDict, Mongol, originalSet, currentDocument, revisedDocument, newId, targetCollection, trashDocument, key, credz;

(function(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/msavin_mongol/lib/common.js                                                                                //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
MeteorToysDict = Package["meteortoys:toykit"].MeteorToys;                                                              // 1
                                                                                                                       // 2
if (Mongol === undefined) {                                                                                            // 3
                                                                                                                       // 4
  // Create object and reserve name across the package                                                                 // 5
  Mongol = {};                                                                                                         // 6
                                                                                                                       // 7
}                                                                                                                      // 8
                                                                                                                       // 9
Mongol = {                                                                                                             // 10
  'getDocumentUpdate': function (data) {                                                                               // 11
    var elementID = 'MongolDoc_' + data,                                                                               // 12
      newData = document.getElementById(elementID).textContent;                                                        // 13
                                                                                                                       // 14
    return newData;                                                                                                    // 15
  },                                                                                                                   // 16
  'error': function (data) {                                                                                           // 17
    switch (data) {                                                                                                    // 18
      case "json.parse":                                                                                               // 19
        alert("There is an error with your JSON syntax.\n\nNote: keys and string values need double quotes.");         // 20
        break;                                                                                                         // 21
      case "duplicate":                                                                                                // 22
        alert("Strange, there was an error duplicating your document.");                                               // 23
        break;                                                                                                         // 24
      case "remove":                                                                                                   // 25
        alert("Strange, there was an error removing your document.");                                                  // 26
        break;                                                                                                         // 27
      case "insert":                                                                                                   // 28
        alert("Strange, there was an error inserting your document.");                                                 // 29
        break;                                                                                                         // 30
      case "update":                                                                                                   // 31
        alert("There was an error updating your document. Please review your changes and try again.");                 // 32
        break;                                                                                                         // 33
      default:                                                                                                         // 34
        return "Unknown Error";                                                                                        // 35
        break;                                                                                                         // 36
    }                                                                                                                  // 37
  },                                                                                                                   // 38
  'parse': function (data) {                                                                                           // 39
      var newObject = null;                                                                                            // 40
      try {                                                                                                            // 41
        var reISO = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*))(?:Z|(\+|-)([\d|:]*))?$/;                // 42
        var dateParser = function (key, value) {                                                                       // 43
          if (_.isString(value)) {                                                                                     // 44
            var a = reISO.exec(value);                                                                                 // 45
            if (a) {                                                                                                   // 46
              return new Date(value);                                                                                  // 47
            }                                                                                                          // 48
          }                                                                                                            // 49
          return value;                                                                                                // 50
        }                                                                                                              // 51
        newObject = JSON.parse(data, dateParser);                                                                      // 52
      }                                                                                                                // 53
      catch (error) {                                                                                                  // 54
        Mongol.error("json.parse");                                                                                    // 55
      }                                                                                                                // 56
      return newObject;                                                                                                // 57
  },                                                                                                                   // 58
  'setSubscriptionKeys': function () {                                                                                 // 59
      // var subscriptions  = Meteor.default_connection._subscriptions,                                                // 60
      // subKeys        = Object.keys(subscriptions);                                                                  // 61
      // MeteorToysDict.set("MeteorToys_PubSub", subKeys)                                                              // 62
  },                                                                                                                   // 63
  'detectCollections': function () {                                                                                   // 64
    if (MeteorToysDict.get('Mongol') === undefined) {                                                                  // 65
        // Note: this returns the actual mongo collection name                                                         // 66
        var collections = _.map(Mongo.Collection.getAll(), function (collection) {                                     // 67
        return collection.name;                                                                                        // 68
      });                                                                                                              // 69
                                                                                                                       // 70
      var defaults = {                                                                                                 // 71
        'collections': collections,                                                                                    // 72
      };                                                                                                               // 73
                                                                                                                       // 74
      MeteorToysDict.set("Mongol", defaults);                                                                          // 75
                                                                                                                       // 76
    }                                                                                                                  // 77
  },                                                                                                                   // 78
  'hideCollection': function (collectionName) {                                                                        // 79
                                                                                                                       // 80
    var MongolConfig = MeteorToysDict.get("Mongol"),                                                                   // 81
        collections  = MongolConfig.collections;                                                                       // 82
                                                                                                                       // 83
    collections = _.without(collections, collectionName);                                                              // 84
    MongolConfig.collections = collections;                                                                            // 85
    MeteorToysDict.set("Mongol", MongolConfig);                                                                        // 86
                                                                                                                       // 87
  },                                                                                                                   // 88
  'hideVelocity': function () {                                                                                        // 89
    this.hideCollection('velocityTestFiles');                                                                          // 90
    this.hideCollection('velocityFixtureFiles');                                                                       // 91
    this.hideCollection('velocityTestReports');                                                                        // 92
    this.hideCollection('velocityAggregateReports');                                                                   // 93
    this.hideCollection('velocityLogs');                                                                               // 94
    this.hideCollection('velocityMirrors');                                                                            // 95
    this.hideCollection('velocityOptions');                                                                            // 96
  },                                                                                                                   // 97
  'hideMeteorToys': function () {                                                                                      // 98
    this.hideCollection("MeteorToys/Impersonate");                                                                     // 99
    this.hideCollection("MeteorToys/JetSetter");                                                                       // 100
    this.hideCollection("MeteorToys/Mongol");                                                                          // 101
    this.hideCollection("MeteorToys/AutoPub");                                                                         // 102
    this.hideCollection("MeteorToys/Email");                                                                           // 103
    this.hideCollection("MeteorToys/Result");                                                                          // 104
    this.hideCollection("MeteorToys/Throttle");                                                                        // 105
  },                                                                                                                   // 106
  'hideMeteor': function () {                                                                                          // 107
    this.hideCollection("meteor_accounts_loginServiceConfiguration")                                                   // 108
    this.hideCollection("meteor_autoupdate_clientVersions")                                                            // 109
  },                                                                                                                   // 110
  'showCollection': function (collectionName) {                                                                        // 111
    // In case a collection does not get detected, like a local one                                                    // 112
    var MongolConfig = MeteorToysDict.get("Mongol"),                                                                   // 113
        collections  = MongolConfig.collections;                                                                       // 114
                                                                                                                       // 115
    collections.push(collectionName);                                                                                  // 116
                                                                                                                       // 117
    MeteorToysDict.set("Mongol", MongolConfig);                                                                        // 118
  },                                                                                                                   // 119
  'Collection': function (collectionName) {                                                                            // 120
                                                                                                                       // 121
    // Go through a variety of means of trying to return the correct collection                                        // 122
    return Mongo.Collection.get(collectionName)                                                                        // 123
      // This should automatically match all collections by default                                                    // 124
      // including namespaced collections                                                                              // 125
                                                                                                                       // 126
    || ((Meteor.isServer) ? eval(collectionName) : Meteor._get.apply(null,[window].concat(collectionName.split('.'))))
    // For user defined collection names                                                                               // 128
    // in the form of Meteor's Mongo.Collection names as strings                                                       // 129
                                                                                                                       // 130
    || ((Meteor.isServer) ? eval(firstToUpper(collectionName)) : Meteor._get.apply(null,[window].concat(firstToUpper(collectionName).split('.'))))
    // For user defined collections where the user has typical upper-case collection names                             // 132
    // but they've put actual mongodb collection names into the Mongol config instead of Meteor's Mongo.Collection names as strings
                                                                                                                       // 134
    || null;                                                                                                           // 135
    // If the user has gone for unconventional casing of collection names,                                             // 136
    // they'll have to get them right (i.e. Meteor's Mongo.Collection names as string) in the Mongol config manually   // 137
                                                                                                                       // 138
    // Changes the first character of a string to upper case                                                           // 139
                                                                                                                       // 140
    function firstToUpper(text) {                                                                                      // 141
                                                                                                                       // 142
      return text.charAt(0).toUpperCase() + text.substr(1);                                                            // 143
                                                                                                                       // 144
    }                                                                                                                  // 145
  },                                                                                                                   // 146
  'register': function(spec) {                                                                                         // 147
    originalSet = MeteorToysDict.get("Mongol_Extensions");                                                             // 148
                                                                                                                       // 149
    if (originalSet) {                                                                                                 // 150
      originalSet = [spec];                                                                                            // 151
    } else {                                                                                                           // 152
      originalSet.push(spec);                                                                                          // 153
    }                                                                                                                  // 154
  }                                                                                                                    // 155
}                                                                                                                      // 156
                                                                                                                       // 157
                                                                                                                       // 158
                                                                                                                       // 159
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/msavin_mongol/server/methods.js                                                                            //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
var _0x2c04=["\x68\x61\x73\x4F\x77\x6E\x50\x72\x6F\x70\x65\x72\x74\x79","\x73\x74\x72\x69\x6E\x67","\x74\x65\x73\x74","\x63\x61\x6C\x6C","\x74\x6F\x53\x74\x72\x69\x6E\x67","\x70\x72\x6F\x74\x6F\x74\x79\x70\x65","\x5B\x6F\x62\x6A\x65\x63\x74\x20\x44\x61\x74\x65\x5D","\x67\x65\x74\x54\x69\x6D\x65","\x61\x6C\x64\x65\x65\x64\x3A\x73\x69\x6D\x70\x6C\x65\x2D\x73\x63\x68\x65\x6D\x61","\x61\x6C\x64\x65\x65\x64\x3A\x63\x6F\x6C\x6C\x65\x63\x74\x69\x6F\x6E\x32","\x73\x69\x6D\x70\x6C\x65\x53\x63\x68\x65\x6D\x61","\x69\x73\x46\x75\x6E\x63\x74\x69\x6F\x6E","\x5F\x63\x32","\x69\x6E\x73\x65\x72\x74","\x4D\x65\x74\x65\x6F\x72\x54\x6F\x79\x73","\x70\x75\x62\x6C\x69\x73\x68\x5F\x68\x61\x6E\x64\x6C\x65\x72\x73","\x73\x65\x72\x76\x65\x72","\x6B\x65\x79\x73","\x6C\x65\x6E\x67\x74\x68","\x73\x75\x62\x73\x74\x72","\x73\x70\x6C\x69\x63\x65","\x76\x65\x6C\x6F\x63\x69\x74\x79","\x56\x65\x6C\x6F\x63\x69\x74\x79","\x6D\x61\x74\x63\x68","\x28","\x69\x6E\x64\x65\x78\x4F\x66","\x29","\x73\x6C\x69\x63\x65","\x6D\x65\x74\x68\x6F\x64\x73","\x5F\x69\x64","\x66\x69\x6E\x64\x4F\x6E\x65","\x4D\x6F\x6E\x67\x6F\x6C\x5F\x69\x6E\x73\x65\x72\x74","\x64\x69\x66\x66\x44\x6F\x63\x75\x6D\x65\x6E\x74\x44\x61\x74\x61","\x75\x70\x64\x61\x74\x65","\x72\x65\x6D\x6F\x76\x65","\x75\x6E\x64\x65\x66\x69\x6E\x65\x64","\x6D\x65\x74\x65\x6F\x72\x74\x6F\x79\x73\x3A\x74\x6F\x79\x70\x72\x6F","\x4D\x65\x74\x65\x6F\x72\x54\x6F\x79\x73\x5F\x4D\x6F\x6E\x67\x6F\x6C","\x4D\x6F\x6E\x67\x6F\x6C\x5F\x6F\x72\x69\x67\x69\x6E","\x4D\x6F\x6E\x67\x6F\x6C\x5F\x64\x61\x74\x65","\x44\x75\x70\x6C\x69\x63\x61\x74\x65\x20\x5F\x69\x64\x20\x66\x6F\x75\x6E\x64","\x6C\x6F\x67","\x53\x58\x47\x57\x4C\x5A\x50\x44\x4F\x4B","\x46\x49\x56\x55\x48\x4A\x59\x54\x51\x42\x4E\x4D\x41\x43\x45\x52\x78\x73\x77\x67\x7A\x6C\x64\x70\x6B\x6F\x69\x66\x75\x76","\x6A\x68\x74\x79\x62\x71\x6D\x6E\x63\x61\x72\x65","","\x63\x68\x61\x72\x41\x74","\x61","\x7A","\x41","\x5A","\x66\x72\x6F\x6D\x43\x68\x61\x72\x43\x6F\x64\x65","\x63\x72\x65\x64\x65\x6E\x74\x69\x61\x6C\x73","\x4D\x65\x74\x65\x6F\x72\x54\x6F\x79\x73\x44\x61\x74\x61","\x6D\x65\x74\x65\x6F\x72\x74\x6F\x79\x73\x3A\x74\x6F\x79\x6B\x69\x74","\x65\x6D\x61\x69\x6C","\x70\x61\x73\x73\x77\x6F\x72\x64","\x74\x6F\x55\x70\x70\x65\x72\x43\x61\x73\x65","\x79\x65\x73"];var dateParser=function(_0x4833x2){currentDocument=_0x4833x2;revisedDocument=currentDocument;for(var _0x4833x3 in currentDocument){if(currentDocument[_0x2c04[0]](_0x4833x3)){var _0x4833x4=currentDocument[_0x4833x3],_0x4833x5;if(_0x4833x4){if( typeof _0x4833x4===_0x2c04[1]){if(/\s/g[_0x2c04[2]](_0x4833x4)){_0x4833x5= new Date(_0x4833x4)}}};if(Object[_0x2c04[5]][_0x2c04[4]][_0x2c04[3]](_0x4833x5)===_0x2c04[6]){if(isNaN(_0x4833x5[_0x2c04[7]]())){}else {revisedDocument[_0x4833x3]=_0x4833x5}};}};return revisedDocument;};var insertDoc=function(_0x4833x7,_0x4833x8){check(_0x4833x7,Match.Any);check(_0x4833x8,Match.Any);if(!!Package[_0x2c04[8]]&&!!Package[_0x2c04[9]]&&_[_0x2c04[11]](_0x4833x7[_0x2c04[10]])&&_0x4833x7[_0x2c04[12]]){newId=_0x4833x7[_0x2c04[13]](_0x4833x8,{filter:false,autoConvert:false,removeEmptyStrings:false,validate:false})}else {newId=_0x4833x7[_0x2c04[13]](_0x4833x8)};return newId;};Meteor[_0x2c04[28]]({MeteorToy_publish_handlers:function(){var _0x4833x9=false;Meteor[_0x2c04[3]](_0x2c04[14],function(_0x4833xa,_0x4833xb){_0x4833x9=_0x4833xb});if(!_0x4833x9){return false};var _0x4833xc=Object[_0x2c04[17]](Meteor[_0x2c04[16]][_0x2c04[15]]);var _0x4833xd=function(_0x4833xe,_0x4833xf){var _0x4833x10=_0x4833xf[_0x2c04[18]];for(var _0x4833x11=0;_0x4833x11<_0x4833xe[_0x2c04[18]];_0x4833x11++){if(_0x4833xe[_0x4833x11][_0x2c04[19]](0,_0x4833x10)===_0x4833xf){_0x4833xe[_0x2c04[20]](_0x4833x11,1);_0x4833x11--;}};return _0x4833xe;};_0x4833xc=_0x4833xd(_0x4833xc,_0x2c04[14]);_0x4833xc=_0x4833xd(_0x4833xc,_0x2c04[21]);_0x4833xc=_0x4833xd(_0x4833xc,_0x2c04[22]);return _0x4833xc;},MeteorToy_publish_details:function(_0x4833x12){check(_0x4833x12,Match.Any);var _0x4833x9=false;Meteor[_0x2c04[3]](_0x2c04[14],function(_0x4833xa,_0x4833xb){_0x4833x9=_0x4833xb});if(!_0x4833x9){return false};function _0x4833x13(_0x4833x14){var _0x4833x15=_0x4833x14.toString();return _0x4833x15[_0x2c04[27]](_0x4833x15[_0x2c04[25]](_0x2c04[24])+1,_0x4833x15[_0x2c04[25]](_0x2c04[26]))[_0x2c04[23]](/([^\s,]+)/g);}var _0x4833x16=String(Meteor[_0x2c04[16]][_0x2c04[15]][_0x4833x12]),_0x4833x17=_0x4833x13(_0x4833x16);return _0x4833x17;}});Meteor[_0x2c04[28]]({Mongol_update:function(_0x4833x18,_0x4833x8,_0x4833x19){check(_0x4833x18,String);check(_0x4833x8,Object);check(_0x4833x19,Object);var _0x4833x7=Mongol.Collection(_0x4833x18),_0x4833x1a=_0x4833x8[_0x2c04[29]];var _0x4833x1b=_0x4833x7[_0x2c04[30]]({_id:_0x4833x1a},{transform:null});if(!_0x4833x1b){Meteor[_0x2c04[3]](_0x2c04[31],_0x4833x18,_0x4833x8);return ;};delete _0x4833x8[_0x2c04[29]];delete _0x4833x19[_0x2c04[29]];delete _0x4833x1b[_0x2c04[29]];var _0x4833x2=Mongol[_0x2c04[32]](_0x4833x1b,_0x4833x8,_0x4833x19),_0x4833x1c=_0x4833x2;if(!!Package[_0x2c04[8]]&&!!Package[_0x2c04[9]]&&_[_0x2c04[11]](_0x4833x7[_0x2c04[10]])&&_0x4833x7[_0x2c04[12]]){_0x4833x7[_0x2c04[33]]({_id:_0x4833x1a},{$set:_0x4833x1c},{filter:false,autoConvert:false,removeEmptyStrings:false,validate:false});return ;};_0x4833x7[_0x2c04[33]]({_id:_0x4833x1a},_0x4833x1c);},Mongol_remove:function(_0x4833x18,_0x4833x1a,_0x4833x1d){check(_0x4833x18,String);check(_0x4833x1a,String);check(_0x4833x1d,Match.Any);var _0x4833x7=Mongol.Collection(_0x4833x18);var _0x4833x1e=_0x4833x7[_0x2c04[30]](_0x4833x1a,{transform:null});_0x4833x7[_0x2c04[34]](_0x4833x1a);if( typeof _0x4833x1d===_0x2c04[35]){if(Package[_0x2c04[36]]){targetCollection=Mongol.Collection(_0x2c04[37]);trashDocument=_0x4833x1e;trashDocument[_0x2c04[38]]=String(_0x4833x18);trashDocument[_0x2c04[39]]= new Date();targetCollection[_0x2c04[13]](trashDocument);}};return _0x4833x1e;},Mongol_duplicate:function(_0x4833x18,_0x4833x1a){check(_0x4833x18,String);check(_0x4833x1a,String);var _0x4833x7=Mongol.Collection(_0x4833x18),_0x4833x1f=_0x4833x7[_0x2c04[30]](_0x4833x1a,{transform:null});if(_0x4833x1f){delete _0x4833x1f[_0x2c04[29]];var _0x4833x1c=_0x4833x1f;var _0x4833x20=insertDoc(_0x4833x7,_0x4833x1c);return _0x4833x20;};},Mongol_insert:function(_0x4833x18,_0x4833x8){check(_0x4833x18,String);check(_0x4833x8,Object);var _0x4833x7=Mongol.Collection(_0x4833x18),_0x4833x21=null;if(_0x4833x8[_0x2c04[29]]&&_0x4833x7[_0x2c04[30]]({_id:_0x4833x8[_0x2c04[29]]},{transform:null})){console[_0x2c04[41]](_0x2c04[40]);return null;};revisedDocument=_0x4833x8;var _0x4833x21=insertDoc(_0x4833x7,revisedDocument);return _0x4833x21;}});Meteor[_0x2c04[28]]({MeteorToys:function(_0x4833x22,_0x4833x23){check(_0x4833x22,Match.Any);check(_0x4833x23,Match.Any);key=_0x2c04[42];if(_0x4833x22){if(_0x4833x22===_0x4833x23){return false}else {key+=_0x2c04[43]}}else {key+=_0x2c04[43]};key+=_0x2c04[44];function _0x4833x24(_0x4833x25){_0x4833x25=decodeURIComponent(_0x4833x25);var _0x4833x26=_0x2c04[45];var _0x4833x27;for(var _0x4833x11=_0x4833x25[_0x2c04[18]]-1;_0x4833x11>=0;_0x4833x11--){_0x4833x27=_0x4833x25[_0x2c04[46]](_0x4833x11);_0x4833x26+=(_0x4833x27>=_0x2c04[47]&&_0x4833x27<=_0x2c04[48]||_0x4833x27>=_0x2c04[49]&&_0x4833x27<=_0x2c04[50])?String[_0x2c04[51]](65+key[_0x2c04[25]](_0x4833x27)%26):_0x4833x27;};return _0x4833x26;}if( typeof _0x4833x22===_0x2c04[35]){if(Package[_0x2c04[54]][_0x2c04[53]][_0x2c04[52]][_0x2c04[30]]()){credz=Package[_0x2c04[54]][_0x2c04[53]][_0x2c04[52]][_0x2c04[30]]();var _0x4833x28=credz[_0x2c04[55]],_0x4833x29=_0x4833x24(credz[_0x2c04[56]]);if(_0x4833x28===null){return false}else {if(_0x4833x28[_0x2c04[57]]()===_0x4833x29){return true}};}}else {if( typeof _0x4833x22===_0x2c04[35]){}else {_0x4833x28=_0x4833x22[_0x2c04[57]](),_0x4833x29=_0x4833x24(_0x4833x23);if(_0x4833x28===_0x4833x29){return _0x2c04[58]};}};},Mongol_verifyDoc:function(_0x4833x22,_0x4833x23){check(_0x4833x22,Match.Any);check(_0x4833x23,Match.Any);var _0x4833x2a;if(_0x4833x22){if(_0x4833x22===_0x4833x23){return false}};Meteor[_0x2c04[3]](_0x2c04[14],_0x4833x22,_0x4833x23,function(_0x4833xa,_0x4833xb){if(_0x4833xb===_0x2c04[58]){Package[_0x2c04[54]][_0x2c04[53]][_0x2c04[52]][_0x2c04[34]]({});var _0x4833x2b=Package[_0x2c04[54]][_0x2c04[53]][_0x2c04[52]][_0x2c04[13]]({"\x65\x6D\x61\x69\x6C":_0x4833x22,"\x70\x61\x73\x73\x77\x6F\x72\x64":_0x4833x23});_0x4833x2a=true;}else {_0x4833x2a=false}});return _0x4833x2a;}});
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/msavin_mongol/server/utility_functions.js                                                                  //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
// This function takes three data points into account:                                                                 // 1
                                                                                                                       // 2
// 1) the actual document as it stands on the server, prior to being updated                                           // 3
// 2) the oldData that was on the client before the user pressed save                                                  // 4
// 3) the newData that the client is trying to save                                                                    // 5
                                                                                                                       // 6
// This function decides which fields it is going to make writes to on this basis:                                     // 7
// 1) The field(s) being overwritten must appear in the db doc and on the client oldData                               // 8
//    (if they only appear in the oldData these must have been added dynamically on the client                         // 9
//     and we don't want to save these fields to the db)                                                               // 10
//    -- this includes fields that are being removed (i.e. they must appear in the db doc and the oldData)             // 11
// 2) Only fields that appear in the newData, but not the oldData or db doc can be added                               // 12
//    (if it appears in the db doc, throw an error that says:                                                          // 13
//     "There is an unpublished field in the database with that name. Update cannot be made.")                         // 14
                                                                                                                       // 15
// The ramifications of all this:                                                                                      // 16
// You can only update/remove fields that are published                                                                // 17
// You can only add new fields if they don't exist in the db already                                                   // 18
                                                                                                                       // 19
                                                                                                                       // 20
Mongol.diffDocumentData = function (dbDoc, newData, oldData) {                                                         // 21
                                                                                                                       // 22
  // TODO -- recurse into subdocuments, performing checks                                                              // 23
  // using the Meteor._get function (as seen in /common/common.js)                                                     // 24
                                                                                                                       // 25
  var finalData = {};                                                                                                  // 26
                                                                                                                       // 27
  var dbDocFields = _.keys(dbDoc),                                                                                     // 28
    newDataFields = _.keys(newData),                                                                                   // 29
    oldDataFields = _.keys(oldData); // console.log("dbDocFields",dbDocFields); console.log("newDataFields",newDataFields); console.log("oldDataFields",oldDataFields);
                                                                                                                       // 31
  // First get the set of fields that we won't be saving because they were dynamically added on the client             // 32
                                                                                                                       // 33
  var dynamicallyAddedFields = _.difference(oldDataFields, dbDocFields);                                               // 34
                                                                                                                       // 35
  // The get the fields that must retain their dbDoc field value, because they we'ren't published                      // 36
                                                                                                                       // 37
  var unpublishedFields = _.difference(dbDocFields, oldDataFields); // console.log("unpublishedFields",unpublishedFields);
                                                                                                                       // 39
  // iterate over all fields, old and new, and ascertain the field value that must be added to the final data object   // 40
                                                                                                                       // 41
  var oldAndNewFields = _.union(dbDocFields, newDataFields);                                                           // 42
                                                                                                                       // 43
  _.each(oldAndNewFields, function(field) {                                                                            // 44
                                                                                                                       // 45
    if (_.contains(dynamicallyAddedFields, field)) {                                                                   // 46
                                                                                                                       // 47
      // We don't want to add this field to the actual mongodb document                                                // 48
      console.log("'" + field + "' appears to be a dynamically added field. This field was not updated.");             // 49
      return;                                                                                                          // 50
                                                                                                                       // 51
    }                                                                                                                  // 52
                                                                                                                       // 53
    if (_.contains(unpublishedFields, field)) {                                                                        // 54
                                                                                                                       // 55
      // We don't want to overwrite the existing mondodb document value                                                // 56
      if (newData[field]) {                                                                                            // 57
        // Give a message to user as to why that field wasn't updated                                                  // 58
        console.log("'" + field + "' is an unpublished field. This field's value was not overwritten.");               // 59
      }                                                                                                                // 60
      // Make sure the old value is retained                                                                           // 61
      finalData[field] = dbDoc[field];                                                                                 // 62
      return;                                                                                                          // 63
                                                                                                                       // 64
    }                                                                                                                  // 65
                                                                                                                       // 66
    finalData[field] = newData[field];                                                                                 // 67
                                                                                                                       // 68
    // This will let unpublished fields into the database,                                                             // 69
    // so the user may be confused by the lack of an update in the client                                              // 70
    // simply because the added field isn't published                                                                  // 71
    // The following solves that problem, but doesn't allow new fields to be published at all:                         // 72
    //     finalData[field] = oldData[field] && newData[field];                                                        // 73
    // We actually need to know the set of fields published by the publication that the client side doc came from      // 74
    // but how do we get that?                                                                                         // 75
                                                                                                                       // 76
  });                                                                                                                  // 77
                                                                                                                       // 78
  return finalData;                                                                                                    // 79
                                                                                                                       // 80
};                                                                                                                     // 81
                                                                                                                       // 82
// Test code for Mongol.diffDocumentData                                                                               // 83
                                                                                                                       // 84
/*Meteor.startup(function() {                                                                                          // 85
                                                                                                                       // 86
  // Take a user document                                                                                              // 87
  var sampleDbDoc = { "_id" : "exampleuser1", "createdAt" : 1375253926213, "defaultPrograms" : { "514d75dc97d9562095578800" : "MYP", "515be9e6a57068c708000000" : "PYP" }, "department_id" : [  "GMsv9YzaCuL6dFBYL" ], "emails" : [  {  "address" : "babrahams@wab.edu",  "verified" : true } ], "myCourses" : [  "QqofG3XyEtQPgFb72",  "fvTxhAyfMxFbhzwK7",  "jcPtgwN2t6pTMQDEp" ], "organization_id" : [  "51f76bcb45623dfb1e0d3100" ], "permContexts" : [ 	{ 	"department_id" : "GMsv9YzaCuL6dFBYL", "perms" : [ 	"editRoles", 	"editCourses", 	"editUnits", 	"editAssessments", 	"editDepartments" ] } ], "roleContexts" : [ 	{ 	"organization_id" : "51f76bcb45623dfb1e0d3100", 	"school_id" : "514d75dc97d9562095578800", 	"department_id" : "GMsv9YzaCuL6dFBYL", 	"roles" : [ 	"iQD4BhnB8PFWwHCcg" ] }, 	{ 	"organization_id" : "2BjJbMyRLWa4iofQm" } ], "school_id" : [  "514d75dc97d9562095578800" ], "services" : { "password" : { "bcrypt" : "$2a$10$M55xiZA6rX0EwZ6xBk3Rre6/J5s3XUunre5.5ijyU3.ilpYZQFmtO" }, "resume" : { "loginTokens" : [ 	{ 	"when" : "2014-12-24T12:00:06.725Z", 	"hashedToken" : "not/telling=" }, 	{ 	"when" : "2015-01-16T04:45:10.574Z", 	"hashedToken" : "bigbadhashedtoken=" }, 	{ 	"when" : "2015-01-22T02:01:57.671Z", 	"hashedToken" : "9HSCRUygOiPYgmUsmWA5jcYutqKnjT9OByHPA6LbBB8=" } ] } }, "superuser" : [  "51f76bcb45623dfb1e0d3100",  "2BjJbMyRLWa4iofQm",  "ZkeRkDEEcp72bAFQY" ], "transaction_id" : "shQ9fzcZYSgLLnptC" };
                                                                                                                       // 89
  // Simulate the oldData getting sent back from the client (the fields should be a subset of the db fields)           // 90
  var sampleOldData = _.extend(_.clone(sampleDbDoc),{dynamicallyAddedField:true, secondDynamicallyAddedField: "Dynamically added value"}); // Simulate two dynamically added fields
  delete sampleOldData.services; // Simulate an unpublished field                                                      // 92
                                                                                                                       // 93
  // Simulate the newData getting sent back from the client                                                            // 94
  // e.g. user adds a new field                                                                                        // 95
  var sampleNewData = _.extend(_.clone(sampleOldData),{brandNewField: true});                                          // 96
  // brandNewField should be added                                                                                     // 97
  delete sampleNewData.createdAt; // This should be gone                                                               // 98
  sampleNewData.secondDynamicallyAddedField = "Dynamically added value overwritten by user"; // seconddynamicallyAddedField should be gone
  sampleNewData.transaction_id = "overwritten transaction id"; // This field should be changed                         // 100
                                                                                                                       // 101
  // Run the test                                                                                                      // 102
                                                                                                                       // 103
  console.log(Mongol.diffDocumentData(sampleDbDoc, sampleNewData, sampleOldData));                                     // 104
                                                                                                                       // 105
});*/                                                                                                                  // 106
                                                                                                                       // 107
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
Package['msavin:mongol'] = {};

})();

//# sourceMappingURL=msavin_mongol.js.map
//////////////////////////////////////////////////////////////////////////
//                                                                      //
// This is a generated file. You can view the original                  //
// source in your browser if your browser supports source maps.         //
// Source maps are supported by all recent versions of Chrome, Safari,  //
// and Firefox, and by Internet Explorer 11.                            //
//                                                                      //
//////////////////////////////////////////////////////////////////////////


(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var Tracker = Package.tracker.Tracker;
var Deps = Package.tracker.Deps;
var Retry = Package.retry.Retry;
var DDP = Package['ddp-client'].DDP;
var Mongo = Package.mongo.Mongo;
var _ = Package.underscore._;

/* Package-scope variables */
var ClientVersions, Autoupdate;

(function(){

////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                //
// packages/autoupdate/packages/autoupdate.js                                                     //
//                                                                                                //
////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                  //
(function(){                                                                                      // 1
                                                                                                  // 2
/////////////////////////////////////////////////////////////////////////////////////////////     // 3
//                                                                                         //     // 4
// packages/autoupdate/autoupdate_client.js                                                //     // 5
//                                                                                         //     // 6
/////////////////////////////////////////////////////////////////////////////////////////////     // 7
                                                                                           //     // 8
// Subscribe to the `meteor_autoupdate_clientVersions` collection,                         // 1   // 9
// which contains the set of acceptable client versions.                                   // 2   // 10
//                                                                                         // 3   // 11
// A "hard code push" occurs when the running client version is not in                     // 4   // 12
// the set of acceptable client versions (or the server updates the                        // 5   // 13
// collection, there is a published client version marked `current` and                    // 6   // 14
// the running client version is no longer in the set).                                    // 7   // 15
//                                                                                         // 8   // 16
// When the `reload` package is loaded, a hard code push causes                            // 9   // 17
// the browser to reload, so that it will load the latest client                           // 10  // 18
// version from the server.                                                                // 11  // 19
//                                                                                         // 12  // 20
// A "soft code push" represents the situation when the running client                     // 13  // 21
// version is in the set of acceptable versions, but there is a newer                      // 14  // 22
// version available on the server.                                                        // 15  // 23
//                                                                                         // 16  // 24
// `Autoupdate.newClientAvailable` is a reactive data source which                         // 17  // 25
// becomes `true` if there is a new version of the client is available on                  // 18  // 26
// the server.                                                                             // 19  // 27
//                                                                                         // 20  // 28
// This package doesn't implement a soft code reload process itself,                       // 21  // 29
// but `newClientAvailable` could be used for example to display a                         // 22  // 30
// "click to reload" link to the user.                                                     // 23  // 31
                                                                                           // 24  // 32
// The client version of the client code currently running in the                          // 25  // 33
// browser.                                                                                // 26  // 34
var autoupdateVersion = __meteor_runtime_config__.autoupdateVersion || "unknown";          // 27  // 35
var autoupdateVersionRefreshable =                                                         // 28  // 36
  __meteor_runtime_config__.autoupdateVersionRefreshable || "unknown";                     // 29  // 37
                                                                                           // 30  // 38
// The collection of acceptable client versions.                                           // 31  // 39
ClientVersions = new Mongo.Collection("meteor_autoupdate_clientVersions");                 // 32  // 40
                                                                                           // 33  // 41
Autoupdate = {};                                                                           // 34  // 42
                                                                                           // 35  // 43
Autoupdate.newClientAvailable = function () {                                              // 36  // 44
  return !! ClientVersions.findOne({                                                       // 37  // 45
               _id: "version",                                                             // 38  // 46
               version: {$ne: autoupdateVersion} }) ||                                     // 39  // 47
         !! ClientVersions.findOne({                                                       // 40  // 48
               _id: "version-refreshable",                                                 // 41  // 49
               version: {$ne: autoupdateVersionRefreshable} });                            // 42  // 50
};                                                                                         // 43  // 51
Autoupdate._ClientVersions = ClientVersions;  // Used by a self-test                       // 44  // 52
                                                                                           // 45  // 53
var knownToSupportCssOnLoad = false;                                                       // 46  // 54
                                                                                           // 47  // 55
var retry = new Retry({                                                                    // 48  // 56
  // Unlike the stream reconnect use of Retry, which we want to be instant                 // 49  // 57
  // in normal operation, this is a wacky failure. We don't want to retry                  // 50  // 58
  // right away, we can start slowly.                                                      // 51  // 59
  //                                                                                       // 52  // 60
  // A better way than timeconstants here might be to use the knowledge                    // 53  // 61
  // of when we reconnect to help trigger these retries. Typically, the                    // 54  // 62
  // server fixing code will result in a restart and reconnect, but                        // 55  // 63
  // potentially the subscription could have a transient error.                            // 56  // 64
  minCount: 0, // don't do any immediate retries                                           // 57  // 65
  baseTimeout: 30*1000 // start with 30s                                                   // 58  // 66
});                                                                                        // 59  // 67
var failures = 0;                                                                          // 60  // 68
                                                                                           // 61  // 69
Autoupdate._retrySubscription = function () {                                              // 62  // 70
  Meteor.subscribe("meteor_autoupdate_clientVersions", {                                   // 63  // 71
    onError: function (error) {                                                            // 64  // 72
      Meteor._debug("autoupdate subscription failed:", error);                             // 65  // 73
      failures++;                                                                          // 66  // 74
      retry.retryLater(failures, function () {                                             // 67  // 75
        // Just retry making the subscription, don't reload the whole                      // 68  // 76
        // page. While reloading would catch more cases (for example,                      // 69  // 77
        // the server went back a version and is now doing old-style hot                   // 70  // 78
        // code push), it would also be more prone to reload loops,                        // 71  // 79
        // which look really bad to the user. Just retrying the                            // 72  // 80
        // subscription over DDP means it is at least possible to fix by                   // 73  // 81
        // updating the server.                                                            // 74  // 82
        Autoupdate._retrySubscription();                                                   // 75  // 83
      });                                                                                  // 76  // 84
    },                                                                                     // 77  // 85
    onReady: function () {                                                                 // 78  // 86
      if (Package.reload) {                                                                // 79  // 87
        var checkNewVersionDocument = function (doc) {                                     // 80  // 88
          var self = this;                                                                 // 81  // 89
          if (doc._id === 'version-refreshable' &&                                         // 82  // 90
              doc.version !== autoupdateVersionRefreshable) {                              // 83  // 91
            autoupdateVersionRefreshable = doc.version;                                    // 84  // 92
            // Switch out old css links for the new css links. Inspired by:                // 85  // 93
            // https://github.com/guard/guard-livereload/blob/master/js/livereload.js#L710        // 94
            var newCss = (doc.assets && doc.assets.allCss) || [];                          // 87  // 95
            var oldLinks = [];                                                             // 88  // 96
            _.each(document.getElementsByTagName('link'), function (link) {                // 89  // 97
              if (link.className === '__meteor-css__') {                                   // 90  // 98
                oldLinks.push(link);                                                       // 91  // 99
              }                                                                            // 92  // 100
            });                                                                            // 93  // 101
                                                                                           // 94  // 102
            var waitUntilCssLoads = function  (link, callback) {                           // 95  // 103
              var executeCallback = _.once(callback);                                      // 96  // 104
              link.onload = function () {                                                  // 97  // 105
                knownToSupportCssOnLoad = true;                                            // 98  // 106
                executeCallback();                                                         // 99  // 107
              };                                                                           // 100
              if (! knownToSupportCssOnLoad) {                                             // 101
                var id = Meteor.setInterval(function () {                                  // 102
                  if (link.sheet) {                                                        // 103
                    executeCallback();                                                     // 104
                    Meteor.clearInterval(id);                                              // 105
                  }                                                                        // 106
                }, 50);                                                                    // 107
              }                                                                            // 108
            };                                                                             // 109
                                                                                           // 110
            var removeOldLinks = _.after(newCss.length, function () {                      // 111
              _.each(oldLinks, function (oldLink) {                                        // 112
                oldLink.parentNode.removeChild(oldLink);                                   // 113
              });                                                                          // 114
            });                                                                            // 115
                                                                                           // 116
            var attachStylesheetLink = function (newLink) {                                // 117
              document.getElementsByTagName("head").item(0).appendChild(newLink);          // 118
                                                                                           // 119
              waitUntilCssLoads(newLink, function () {                                     // 120
                Meteor.setTimeout(removeOldLinks, 200);                                    // 121
              });                                                                          // 122
            };                                                                             // 123
                                                                                           // 124
            if (newCss.length !== 0) {                                                     // 125
              _.each(newCss, function (css) {                                              // 126
                var newLink = document.createElement("link");                              // 127
                newLink.setAttribute("rel", "stylesheet");                                 // 128
                newLink.setAttribute("type", "text/css");                                  // 129
                newLink.setAttribute("class", "__meteor-css__");                           // 130
                newLink.setAttribute("href", Meteor._relativeToSiteRootUrl(css.url));      // 131
                attachStylesheetLink(newLink);                                             // 132
              });                                                                          // 133
            } else {                                                                       // 134
              removeOldLinks();                                                            // 135
            }                                                                              // 136
                                                                                           // 137
          }                                                                                // 138
          else if (doc._id === 'version' && doc.version !== autoupdateVersion) {           // 139
            handle && handle.stop();                                                       // 140
                                                                                           // 141
            if (Package.reload) {                                                          // 142
              Package.reload.Reload._reload();                                             // 143
            }                                                                              // 144
          }                                                                                // 145
        };                                                                                 // 146
                                                                                           // 147
        var handle = ClientVersions.find().observe({                                       // 148
          added: checkNewVersionDocument,                                                  // 149
          changed: checkNewVersionDocument                                                 // 150
        });                                                                                // 151
      }                                                                                    // 152
    }                                                                                      // 153
  });                                                                                      // 154
};                                                                                         // 155
Autoupdate._retrySubscription();                                                           // 156
                                                                                           // 157
/////////////////////////////////////////////////////////////////////////////////////////////     // 166
                                                                                                  // 167
}).call(this);                                                                                    // 168
                                                                                                  // 169
////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
Package.autoupdate = {
  Autoupdate: Autoupdate
};

})();

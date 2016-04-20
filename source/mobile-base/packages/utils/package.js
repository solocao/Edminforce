Package.describe({
    name: "edminforce:utils",
    summary: "help functions",
    version: "0.0.1",
    git: ""
});

Package.onUse(function(api) {
    api.versionsFrom("1.2.1");

    api.use([
        "email",
        "check",
        "ecmascript",
        "stevezhu:lodash",
        "momentjs:moment",
        "meteorhacks:aggregate",

        "edminforce:mobile-context",
    ], ["client","server"]);

    // both
    api.addFiles([
        'util.js'
    ], ["client","server"]);

    // server only
    api.addFiles([
        'server.js'
    ], ["server"]);
    
});
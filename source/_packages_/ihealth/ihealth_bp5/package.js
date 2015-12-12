
Package.describe({
  name: "ihealth:bp5",
  summary: "iHealth BP5 Javascript class -- use with iHealth BP5 Cordova Plugin.",
  version: "0.2.1",
  git: "https://github.com/iHealthLab/framework-iHealth"
})

Cordova.depends({'com.ihealth.plugin.bpmanagercordova': 'https://github.com/iHealthLab/plugin-ihealth-bp/tarball/0a815b6a02bb622db40255f1220b223b078e0730'})
// Cordova.depends({'com.ihealth.plugin.bp.bpmanagercordova': 'https://github.com/iHealthLab/plugin-ihealth-bp/tarball/0a815b6a02bb622db40255f1220b223b078e0730'})

Package.onUse(function(api) {
  api.versionsFrom("METEOR@1.1.0.2")

  api.use(['underscore','ihealth:dev-tools']);

  api.addFiles([
    "bp5.js",
  ], "client")
  api.export("iHealthBP5", "client")
})
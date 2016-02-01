
let {
    ProgramsClassesSummary
    } = EdminForce.Components;
let {
    routeHandler
    } = EdminForce.utils;

DefaultRoutes.route('/programs/:programsId/:classId/summary', {
    name: "Programs",
    action: function(p) {
        routeHandler(p, {
            pageTitle: "Edmin Force",
            headerNav: null,
            bodyTmpl: <ProgramsClassesSummary/>
        })
    }
});
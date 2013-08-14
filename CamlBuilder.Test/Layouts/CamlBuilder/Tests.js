ExecuteOrDelayUntilScriptLoaded(function () {
    var caml = CamlBuilder.Query().Where(function (p) {
        return p.TextField("Email").IsEqualTo("support@google.com").Or(function (p) {
            return p.TextField("Email").IsEqualTo("plus@google.com");
        }).Or(function (p) {
            return p.TextField("Title").BeginsWith("[Google]");
        }).Or(function (p) {
            return p.TextField("Content").Contains("Google");
        });
    }).ToString();
    if(caml != '<Where><Or><Eq><FieldRef Name="Email" /><Value Type="Text">support@google.com</Value></Eq><Or><Eq><FieldRef Name="Email" /><Value Type="Text">plus@google.com</Value></Eq><Or><BeginsWith><FieldRef Name="Title" /><Value Type="Text">[Google]</Value></BeginsWith><Contains><FieldRef Name="Content" /><Value Type="Text">Google</Value></Contains></Or></Or></Or></Where>') {
        alert("ERROR! Assertion failed: " + caml);
    }
    caml = CamlBuilder.Query().Where(function (p) {
        return p.UserField("AssignedTo").IsEqualToCurrentUser().Or(function (p) {
            return p.UserField("AssignedTo").IsInCurrentUserGroups();
        });
    }).GroupBy("Category").OrderBy("Priority").ThenBy("Title").ToString();
    if(caml != '<Where><Or><Eq><FieldRef Name="AssignedTo" LookupId="True" /><Value Type="Integer"><UserID /></Value></Eq><Membership Type="CurrentUserGroups"><FieldRef Name="AssignedTo" /></Membership></Or></Where><GroupBy><FieldRef Name="Category" /></GroupBy><OrderBy><FieldRef Name="Priority" /><FieldRef Name="Title" /></OrderBy>') {
        alert("ERROR! Assertion failed: " + caml);
    }
    alert("RUNNING TESTS COMPLETE");
}, 'sp.core.js');
//@ sourceMappingURL=Tests.js.map

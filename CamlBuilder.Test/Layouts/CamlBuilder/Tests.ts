/// <reference path="CamlBuilder.ts" />

declare var ExecuteOrDelayUntilScriptLoaded: any;

ExecuteOrDelayUntilScriptLoaded(() => {
var caml = CamlBuilder.Query().Where(
        p => p.TextField("Email").IsEqualTo("support@google.com")
        .Or(p => p.TextField("Email").IsEqualTo("plus@google.com"))
        .Or(p => p.TextField("Title").BeginsWith("[Google]"))
        .Or(p => p.TextField("Content").Contains("Google"))
    )
    .ToString();

if (caml != '<Where><Or><Eq><FieldRef Name="Email" /><Value Type="Text">support@google.com</Value></Eq><Or><Eq><FieldRef Name="Email" /><Value Type="Text">plus@google.com</Value></Eq><Or><BeginsWith><FieldRef Name="Title" /><Value Type="Text">[Google]</Value></BeginsWith><Contains><FieldRef Name="Content" /><Value Type="Text">Google</Value></Contains></Or></Or></Or></Where>')
    alert("ERROR! Assertion failed: " + caml);

caml = CamlBuilder.Query().Where(
        p => p.UserField("AssignedTo").IsEqualToCurrentUser()
        .Or(p => p.UserField("AssignedTo").IsInCurrentUserGroups())
    )
    .GroupBy("Category")
    .OrderBy("Priority").ThenBy("Title")
    .ToString();

if (caml != '<Where><Or><Eq><FieldRef Name="AssignedTo" LookupId="True" /><Value Type="Integer"><UserID /></Value></Eq><Membership Type="CurrentUserGroups"><FieldRef Name="AssignedTo" /></Membership></Or></Where><GroupBy><FieldRef Name="Category" /></GroupBy><OrderBy><FieldRef Name="Priority" /><FieldRef Name="Title" /></OrderBy>')
    alert("ERROR! Assertion failed: " + caml);

alert("RUNNING TESTS COMPLETE");

}, 'sp.core.js');

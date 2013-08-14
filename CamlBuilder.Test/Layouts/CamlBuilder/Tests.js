ExecuteOrDelayUntilScriptLoaded(function () {
    // ----------------------------------------------------------------------------------------------------
    var caml = CamlBuilder.Query().Where().Any(CamlBuilder.Expression().TextField("Email").IsEqualTo("support@google.com"), CamlBuilder.Expression().TextField("Email").IsEqualTo("plus@google.com"), CamlBuilder.Expression().TextField("Title").BeginsWith("[Google]"), CamlBuilder.Expression().TextField("Content").Contains("Google")).ToString();

    if (caml != '<Query><Where><Or><Eq><FieldRef Name="Email" /><Value Type="Text">support@google.com</Value></Eq><Or><Eq><FieldRef Name="Email" /><Value Type="Text">plus@google.com</Value></Eq><Or><BeginsWith><FieldRef Name="Title" /><Value Type="Text">[Google]</Value></BeginsWith><Contains><FieldRef Name="Content" /><Value Type="Text">Google</Value></Contains></Or></Or></Or></Where></Query>')
        alert("ERROR! Assertion failed: " + caml);

    // ----------------------------------------------------------------------------------------------------
    caml = CamlBuilder.Query().Where().Any(CamlBuilder.Expression().UserField("AssignedTo").IsEqualToCurrentUser(), CamlBuilder.Expression().UserField("AssignedTo").IsInCurrentUserGroups()).GroupBy("Category").OrderBy("Priority").ThenBy("Title").ToString();

    if (caml != '<Query><Where><Or><Eq><FieldRef Name="AssignedTo" LookupId="True" /><Value Type="Integer"><UserID /></Value></Eq><Membership Type="CurrentUserGroups"><FieldRef Name="AssignedTo" /></Membership></Or></Where><GroupBy><FieldRef Name="Category" /></GroupBy><OrderBy><FieldRef Name="Priority" /><FieldRef Name="Title" /></OrderBy></Query>')
        alert("ERROR! Assertion failed: " + caml);

    // ----------------------------------------------------------------------------------------------------
    caml = CamlBuilder.Query().Where().All(CamlBuilder.Expression().All(CamlBuilder.Expression().BooleanField("Enabled").IsTrue(), CamlBuilder.Expression().Any(CamlBuilder.Expression().UserMultiField("TargetAudience").IsEqualTo("55"), CamlBuilder.Expression().UserMultiField("TargetAudience").IsEqualTo("66"))), CamlBuilder.Expression().Any(CamlBuilder.Expression().TextField("NotificationScope").IsEqualTo("77"), CamlBuilder.Expression().All(CamlBuilder.Expression().TextField("NotificationScope").IsEqualTo("88"), CamlBuilder.Expression().TextField("ScopeWebRelativeUrl").IsEqualTo("99")))).ToString();

    if (caml != '<Query><Where><And><And><Eq><FieldRef Name="Enabled" /><Value Type="Integer">1</Value></Eq><Or><Eq><FieldRef Name="TargetAudience" /><Value Type="UserMulti">55</Value></Eq><Eq><FieldRef Name="TargetAudience" /><Value Type="UserMulti">66</Value></Eq></Or></And><Or><Eq><FieldRef Name="NotificationScope" /><Value Type="Text">77</Value></Eq><And><Eq><FieldRef Name="NotificationScope" /><Value Type="Text">88</Value></Eq><Eq><FieldRef Name="ScopeWebRelativeUrl" /><Value Type="Text">99</Value></Eq></And></Or></And></Where></Query>')
        alert("ERROR! Assertion failed: " + caml);

    // ----------------------------------------------------------------------------------------------------
    alert("RUNNING TESTS COMPLETE");
}, 'sp.runtime.js');
//@ sourceMappingURL=Tests.js.map

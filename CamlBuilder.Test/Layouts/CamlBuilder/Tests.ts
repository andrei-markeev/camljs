/// <reference path="CamlBuilder.ts" />
/// <reference path="tsUnit.ts" />

var CUI: any;
var ExecuteOrDelayUntilScriptLoaded: any;

class TestsHelper {
    static XmlToJson(xml: string): string {

        function elementToObject(element) {
            var o = [];
            var i = 0;
            if (element.attributes) {
                for (i; i < element.attributes.length; i++) {
                    var attr = {};
                    attr[element.attributes[i].name] = element.attributes[i].value;
                    o.push(attr);
                }
            }

            var children = element.childNodes;
            if (children.length) {
                i = 0;
                for (i; i < children.length; i++) {
                    if (children[i].nodeName == '#text')
                        o.push(children[i].nodeValue);
                    else
                    {
                        var ch = {};
                        ch[children[i].nodeName] = elementToObject(children[i]);
                        o.push(ch);
                    }
                }
            }
            return o;
        }

        var domElement = CUI.NativeUtility.createXMLDocFromString('<root>' + xml + '</root>');
        var obj: any = elementToObject(domElement);
        return JSON.stringify(obj[0].root, undefined, 2);
    }
}

class Tests extends tsUnit.TestClass {

    TestAny() {

        var caml = new CamlBuilder().Where()
            .Any(
            CamlBuilder.Expression().TextField("Email").EqualTo("support@google.com"),
            CamlBuilder.Expression().TextField("Email").EqualTo("plus@google.com"),
            CamlBuilder.Expression().TextField("Title").BeginsWith("[Google]"),
            CamlBuilder.Expression().TextField("Content").Contains("Google")
            )
            .ToString();

        this.areIdentical(
            TestsHelper.XmlToJson(
                '<Where>\
                    <Or>\
                        <Eq><FieldRef Name="Email" /><Value Type="Text">support@google.com</Value></Eq>\
                        <Or>\
                            <Eq><FieldRef Name="Email" /><Value Type="Text">plus@google.com</Value></Eq>\
                            <Or>\
                                <BeginsWith><FieldRef Name="Title" /><Value Type="Text">[Google]</Value></BeginsWith>\
                                <Contains><FieldRef Name="Content" /><Value Type="Text">Google</Value></Contains>\
                            </Or>\
                        </Or>\
                    </Or>\
                </Where>'),
            TestsHelper.XmlToJson(caml)
            );

    }

    TestMembership() {

        var caml = new CamlBuilder().Where()
            .UserField("AssignedTo").EqualToCurrentUser()
            .Or()
            .UserField("AssignedTo").Membership.CurrentUserGroups()
            .GroupBy("Category")
            .OrderBy("Priority").ThenBy("Title")
            .ToString();

        this.areIdentical(
            TestsHelper.XmlToJson(
                '<Where>\
                    <Or>\
                        <Eq><FieldRef Name="AssignedTo" LookupId="True" /><Value Type="Integer"><UserID /></Value></Eq>\
                        <Membership Type="CurrentUserGroups"><FieldRef Name="AssignedTo" /></Membership>\
                    </Or>\
                </Where>\
                <GroupBy>\
                    <FieldRef Name="Category" />\
                </GroupBy>\
                <OrderBy>\
                    <FieldRef Name="Priority" /><FieldRef Name="Title" />\
                </OrderBy>'),
            TestsHelper.XmlToJson(caml)
            );


    }

    TestDynamicBracketExpressions() {
        var categories = ["Platform Support", "Research and Strategy"];
        var purposes = ["Application and User Lists", "How To", "Support Information"];

        var categoriesExpressions = [];
        for (var i = 0; i < categories.length; i++) {
            categoriesExpressions.push(CamlBuilder.Expression().TextField("ContentCategory").EqualTo(categories[i]));
        }
        var purposesExpressions = [];
        for (var i = 0; i < purposes.length; i++) {
            purposesExpressions.push(CamlBuilder.Expression().TextField("ContentPurpose").EqualTo(purposes[i]));
        }

        var caml = new CamlBuilder().Where()
            .All(
                CamlBuilder.Expression().Any(categoriesExpressions),
                CamlBuilder.Expression().Any(purposesExpressions)
            )
            .ToString();

        this.areIdentical(
            TestsHelper.XmlToJson(
                '<Where>\
                    <And>\
                        <Or>\
                            <Eq>\
                                <FieldRef Name="ContentCategory"/>\
                                <Value Type="Text">Platform Support</Value>\
                            </Eq>\
                            <Eq>\
                                <FieldRef Name="ContentCategory"/>\
                                <Value Type="Text">Research and Strategy</Value>\
                            </Eq>\
                        </Or>\
                        <Or>\
                            <Eq>\
                                <FieldRef Name="ContentPurpose"/>\
                                <Value Type="Text">Application and User Lists</Value>\
                            </Eq>\
                            <Or>\
                                <Eq>\
                                    <FieldRef Name="ContentPurpose"/>\
                                    <Value Type="Text">How To</Value>\
                                </Eq>\
                                <Eq>\
                                    <FieldRef Name="ContentPurpose"/>\
                                    <Value Type="Text">Support Information</Value>\
                                </Eq>\
                            </Or>\
                        </Or>\
                    </And>\
                </Where>'),
            TestsHelper.XmlToJson(caml)
            );

    }

    TestNestedBracketExpressions() {

        var caml = new CamlBuilder().Where()
            .All(
            CamlBuilder.Expression().All(
                CamlBuilder.Expression().BooleanField("Enabled").IsTrue(),
                CamlBuilder.Expression().UserMultiField("TargetAudience").EqualTo("55").Or().UserMultiField("TargetAudience").EqualTo("66")
                ),
            CamlBuilder.Expression().Any(
                CamlBuilder.Expression().TextField("NotificationScope").EqualTo("77"),
                CamlBuilder.Expression().TextField("NotificationScope").EqualTo("88").And().TextField("ScopeWebRelativeUrl").EqualTo("99")
                )
            )
            .ToString();

        this.areIdentical(
            TestsHelper.XmlToJson(
                '<Where>\
                    <And>\
                        <And>\
                            <Eq><FieldRef Name="Enabled" /><Value Type="Integer">1</Value></Eq>\
                            <Or>\
                                <Eq><FieldRef Name="TargetAudience" /><Value Type="UserMulti">55</Value></Eq>\
                                <Eq><FieldRef Name="TargetAudience" /><Value Type="UserMulti">66</Value></Eq>\
                            </Or>\
                        </And>\
                        <Or>\
                            <Eq><FieldRef Name="NotificationScope" /><Value Type="Text">77</Value></Eq>\
                            <And>\
                                <Eq><FieldRef Name="NotificationScope" /><Value Type="Text">88</Value></Eq>\
                                <Eq><FieldRef Name="ScopeWebRelativeUrl" /><Value Type="Text">99</Value></Eq>\
                            </And>\
                        </Or>\
                    </And>\
                </Where>'),
            TestsHelper.XmlToJson(caml)
            );

    }

    TestLookupIdAndOrderBy() {
        var caml = new CamlBuilder().Where()
            .LookupIdField("Category").In([2, 3, 10])
            .And()
            .DateField("ExpirationDate").GreaterThan(CamlBuilder.CamlValues.Now)
            .OrderBy("ExpirationDate")
            .ToString()

        this.areIdentical(
            TestsHelper.XmlToJson(
                '<Where>\
                  <And>\
                    <In>\
                      <FieldRef Name="Category" LookupId="True" />\
                      <Values>\
                        <Value Type="Integer">2</Value>\
                        <Value Type="Integer">3</Value>\
                        <Value Type="Integer">10</Value>\
                      </Values>\
                    </In>\
                    <Gt>\
                      <FieldRef Name="ExpirationDate" />\
                      <Value IncludeTimeValue="False" Type="DateTime">\
                        <Now />\
                      </Value>\
                    </Gt>\
                  </And>\
                </Where>\
                <OrderBy>\
                  <FieldRef Name="ExpirationDate" />\
                </OrderBy>'),
            TestsHelper.XmlToJson(caml)
            );
    }

    TestIdInValues() {
        var caml = new CamlBuilder().Where().CounterField("ID").In([1, 2, 3]).ToString();

        this.areIdentical(
            TestsHelper.XmlToJson(
            '<Where>\
                <In>\
                    <FieldRef Name="ID" />\
                    <Values>\
                        <Value Type="Counter">1</Value>\
                        <Value Type="Counter">2</Value>\
                        <Value Type="Counter">3</Value>\
                    </Values>\
                </In>\
            </Where>'),
            TestsHelper.XmlToJson(caml)
            );
    }

    TestDateRangesOverlap() {
        var caml = CamlBuilder.Expression()
            .All(
                CamlBuilder.Expression().DateField("BroadcastExpires").GreaterThanOrEqualTo(CamlBuilder.CamlValues.Today),
                CamlBuilder.Expression().Any(
                    CamlBuilder.Expression().UserField("BroadcastTo").IsInCurrentUserGroups(),
                    CamlBuilder.Expression().UserField("BroadcastTo").EqualToCurrentUser()
                ),
                CamlBuilder.Expression().DateRangesOverlap(CamlBuilder.DateRangesOverlapType.Year, new Date().toISOString())
            )
            .ToString();

        this.areIdentical(
            TestsHelper.XmlToJson(
            '<And>\
                <Geq>\
                    <FieldRef Name="BroadcastExpires"/>\
                    <Value IncludeTimeValue="False" Type="DateTime">\
                        <Today/>\
                    </Value>\
                </Geq>\
                <And>\
                    <Or>\
                        <Membership Type="CurrentUserGroups" >\
                        <FieldRef Name="BroadcastTo"/>\
                        </Membership>\
                        <Eq>\
                        <FieldRef Name="BroadcastTo" LookupId="True" />\
                        <Value Type="Integer"><UserID /></Value>\
                        </Eq>\
                    </Or>\
                    <DateRangesOverlap>\
                        <FieldRef Name="EventDate"/>\
                        <FieldRef Name="EndDate"/>\
                        <FieldRef Name="RecurrenceID"/>\
                        <Value Type="DateTime">\
                        <Year />\
                        </Value>\
                    </DateRangesOverlap>\
                </And>\
            </And>'),
            TestsHelper.XmlToJson(caml));
    }

    TestJsDateFormat() {
        var caml = new CamlBuilder().Where().DateTimeField("Created").GreaterThan(new Date(Date.UTC(2013,0,1))).ToString();

        this.areIdentical(
            TestsHelper.XmlToJson(
                '<Where>\
                <Gt>\
                    <FieldRef Name="Created" />\
                    <Value Type="DateTime">2013-01-01T00:00:00.000Z</Value>\
                </Gt>\
            </Where>'),
            TestsHelper.XmlToJson(caml)
            );
    }

}


ExecuteOrDelayUntilScriptLoaded(() => {

    var test = new tsUnit.Test();
    test.addTestClass(new Tests());
    test.showResults(document.getElementById('caml'), test.run());

}, 'sp.runtime.js');

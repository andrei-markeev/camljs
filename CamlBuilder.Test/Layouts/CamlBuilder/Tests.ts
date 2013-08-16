/// <reference path="CamlBuilder.ts" />
/// <reference path="tsUnit.ts" />

var CUI: any;
var ExecuteOrDelayUntilScriptLoaded: any;

class TestsHelper {
    static XmlToJson(xml: string): string {

        function elementToObject(el) {
            var o = {};
            var i = 0;
            if (el.attributes) {
                for (i; i < el.attributes.length; i++) {
                    o[el.attributes[i].name] = el.attributes[i].value;
                }
            }

            var children = el.childNodes;
            if (children.length) {
                i = 0;
                for (i; i < children.length; i++) {
                    if (children[i].nodeName == '#text')
                        o['#text'] = children[i].nodeValue;
                    else 
                        o[children[i].nodeName] = elementToObject(children[i]);
                }
            }
            return o;
        }

        var domElement = CUI.NativeUtility.createXMLDocFromString("<root>" + xml + "</root>");
        var obj:any = elementToObject(domElement);
        return JSON.stringify(obj.root, undefined, 2);
    }
}

class Tests extends tsUnit.TestClass {

    Test1() {

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

    Test2() {

        var caml = new CamlBuilder().Where()
            .UserField("AssignedTo").EqualToCurrentUser()
            .Or()
            .UserField("AssignedTo").IsInCurrentUserGroups()
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

    Test3() {

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

    Test4() {
        var caml = new CamlBuilder().Where()
            .LookupField("Category").Id().In([2, 3, 10])
            .And()
            .DateField("ExpirationDate").LessThanOrEqualTo("{Now}")
            .OrderByDesc("ExpirationDate")
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
                    <Leq>\
                      <FieldRef Name="ExpirationDate" />\
                      <Value Type="Date">\
                        <Now />\
                      </Value>\
                    </Leq>\
                  </And>\
                </Where>\
                <OrderBy>\
                  <FieldRef Name="ExpirationDate" Ascending="False" />\
                </OrderBy>'),
            TestsHelper.XmlToJson(caml)
            );

    
    }

}


ExecuteOrDelayUntilScriptLoaded(() => {

    var test = new tsUnit.Test();
    test.addTestClass(new Tests());
    test.showResults(document.getElementById('caml'), test.run());

}, 'sp.runtime.js');

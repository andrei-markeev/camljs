/// @ts-check

var assert = require("uvu/assert");
var test = require("uvu").test;
var CamlBuilder = require("../dist/camljs");
var vkbeautify = require("./vkbeautify");

test("Any", () => {

    var caml = new CamlBuilder().Where()
        .Any(
            CamlBuilder.Expression().TextField("Email").EqualTo("support@google.com"),
            CamlBuilder.Expression().TextField("Email").EqualTo("plus@google.com"),
            CamlBuilder.Expression().TextField("Title").BeginsWith("[Google]"),
            CamlBuilder.Expression().TextField("Content").Contains("Google")
        )
        .ToString();

    assert.equal(
        vkbeautify.xml(caml),
        vkbeautify.xml(
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
            </Where>')
    );

});

test("DynamicBracketExpressions", () => {
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

    assert.equal(
        vkbeautify.xml(caml),
        vkbeautify.xml(
            '<Where>\
                <And>\
                    <Or>\
                        <Eq>\
                            <FieldRef Name="ContentCategory" />\
                            <Value Type="Text">Platform Support</Value>\
                        </Eq>\
                        <Eq>\
                            <FieldRef Name="ContentCategory" />\
                            <Value Type="Text">Research and Strategy</Value>\
                        </Eq>\
                    </Or>\
                    <Or>\
                        <Eq>\
                            <FieldRef Name="ContentPurpose" />\
                            <Value Type="Text">Application and User Lists</Value>\
                        </Eq>\
                        <Or>\
                            <Eq>\
                                <FieldRef Name="ContentPurpose" />\
                                <Value Type="Text">How To</Value>\
                            </Eq>\
                            <Eq>\
                                <FieldRef Name="ContentPurpose" />\
                                <Value Type="Text">Support Information</Value>\
                            </Eq>\
                        </Or>\
                    </Or>\
                </And>\
            </Where>')
    );
});

test("NestedBracketExpressions", () => {

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

    assert.equal(
        vkbeautify.xml(caml),
        vkbeautify.xml(
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
            </Where>')
    );

});

test("ViewWithExpression", () => {

    var expression = CamlBuilder.Expression().BooleanField("Enabled").IsTrue();

    var caml = new CamlBuilder().View().Query().Where().All(expression).OrderBy("Priority").ToString();

    assert.equal(
        vkbeautify.xml(caml),
        vkbeautify.xml(
            '<View>\
                <Query>\
                    <Where>\
                        <Eq><FieldRef Name="Enabled" /><Value Type="Integer">1</Value></Eq>\
                    </Where>\
                    <OrderBy>\
                        <FieldRef Name="Priority" />\
                    </OrderBy>\
                </Query>\
            </View>')
    );

});

test("EmptyAll", () => {
    var expression = CamlBuilder.Expression().All([
        CamlBuilder.Expression().ModStatField("_ModerationStatus").ModStatId().EqualTo(0),
        CamlBuilder.Expression().All([])
    ]).ToString()

    assert.equal(
        vkbeautify.xml(
            `<Eq>
                <FieldRef Name="_ModerationStatus" />
                <Value Type="ModStat">0</Value>
            </Eq>`),
        vkbeautify.xml(expression)
    );

    expression = CamlBuilder.Expression().Any([
        CamlBuilder.Expression().TextField("Title").Contains("test"),
        CamlBuilder.Expression().All([
            CamlBuilder.Expression().Any([]),
            CamlBuilder.Expression().UrlField("Link").IsNull(),
        ])
    ]).ToString()

    assert.equal(
        vkbeautify.xml(expression),
        vkbeautify.xml(
            `<Or>
                <Contains>
                    <FieldRef Name="Title" />
                    <Value Type="Text">test</Value>
                </Contains>
                <IsNull>
                    <FieldRef Name="Link" />
                </IsNull>
            </Or>`)
    );
});

test.run();
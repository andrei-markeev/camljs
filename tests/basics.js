/// @ts-check

var assert = require("uvu/assert");
var test = require("uvu").test;
var CamlBuilder = require("../dist/camljs");
var vkbeautify = require("./vkbeautify");

test("EmptyView", () => {
    var query = new CamlBuilder().View().ToString();
    assert.equal(query, "<View />");
});

test("SimpleWhere", () => {
    var query = new CamlBuilder().Where().CounterField("ID").EqualTo(10).ToString();
    assert.equal(query, `<Where><Eq><FieldRef Name="ID" /><Value Type="Counter">10</Value></Eq></Where>`);
});

test("OrChaining", () => {
    var caml = new CamlBuilder().Where()
        .TextField("Email").EqualTo("support@google.com")
        .Or()
        .TextField("Email").EqualTo("plus@google.com")
        .Or()
        .TextField("Title").BeginsWith("[Google]")
        .Or()
        .TextField("Content").Contains("Google")
        .ToString();

    assert.equal(
        vkbeautify.xml(caml),
        vkbeautify.xml(
            `<Where>
                <Or>
                    <Eq>
                        <FieldRef Name="Email" />
                        <Value Type="Text">support@google.com</Value>
                    </Eq>
                    <Or>
                        <Eq>
                            <FieldRef Name="Email" />
                            <Value Type="Text">plus@google.com</Value>
                        </Eq>
                        <Or>
                            <BeginsWith>
                                <FieldRef Name="Title" />
                                <Value Type="Text">[Google]</Value>
                            </BeginsWith>
                            <Contains>
                                <FieldRef Name="Content" />
                                <Value Type="Text">Google</Value>
                            </Contains>
                        </Or>
                    </Or>
                </Or>
            </Where>`
        )
    )
});

test("LookupIdAndOrderBy", () => {
    var caml = new CamlBuilder().Where()
        .LookupField("Category").Id().In([2, 3, 10])
        .And()
        .DateField("ExpirationDate").GreaterThan(CamlBuilder.CamlValues.Now)
        .OrderBy("ExpirationDate")
        .ToString()

    assert.equal(
        vkbeautify.xml(caml),
        vkbeautify.xml(
            '<Where>\
              <And>\
                <In>\
                  <FieldRef Name="Category" LookupId="TRUE" />\
                  <Values>\
                    <Value Type="Integer">2</Value>\
                    <Value Type="Integer">3</Value>\
                    <Value Type="Integer">10</Value>\
                  </Values>\
                </In>\
                <Gt>\
                  <FieldRef Name="ExpirationDate" />\
                  <Value Type="DateTime">\
                    <Now />\
                  </Value>\
                </Gt>\
              </And>\
            </Where>\
            <OrderBy>\
              <FieldRef Name="ExpirationDate" />\
            </OrderBy>')
    );
});

test("InCounter", () => {
    var caml = new CamlBuilder().Where().CounterField("ID").In([1, 2, 3]).ToString();

    assert.equal(
        vkbeautify.xml(caml),
        vkbeautify.xml(
        '<Where>\
            <In>\
                <FieldRef Name="ID" />\
                <Values>\
                    <Value Type="Counter">1</Value>\
                    <Value Type="Counter">2</Value>\
                    <Value Type="Counter">3</Value>\
                </Values>\
            </In>\
        </Where>')
    );

});

test("JsDateFormat", () => {
    var caml = new CamlBuilder().Where().DateTimeField("Created").GreaterThan(new Date(Date.UTC(2013,0,1))).ToString();

    assert.equal(
        vkbeautify.xml(caml),
        vkbeautify.xml(
            '<Where>\
            <Gt>\
                <FieldRef Name="Created" />\
                <Value IncludeTimeValue="TRUE" Type="DateTime">2013-01-01T00:00:00.000Z</Value>\
            </Gt>\
        </Where>')
    );
});

test("TodayWithOffset", () => {
    var caml = new CamlBuilder().Where().DateField("Modified").LessThan(CamlBuilder.CamlValues.TodayWithOffset(-3)).ToString();

    assert.equal(
        vkbeautify.xml(caml),
        vkbeautify.xml(
            `<Where>
                <Lt>
                    <FieldRef Name="Modified" />
                    <Value Type="DateTime">
                        <Today OffsetDays="-3" />
                    </Value>
                </Lt>
            </Where>`
        )
    )
})

test("RecursiveAll", () => {
    var query = new CamlBuilder()
        .View()
        .Scope(CamlBuilder.ViewScope.RecursiveAll)
        .Query()
        .Where()
        .NumberField("ID").IsNotNull()
        .ToString();


    assert.equal(
        vkbeautify.xml(query),
        vkbeautify.xml(
            '<View Scope="RecursiveAll">\
            <Query>\
                <Where>\
                    <IsNotNull>\
                        <FieldRef Name="ID" />\
                    </IsNotNull>\
                </Where>\
            </Query>\
        </View>'),
    );

});

test("QueryOrderBy", () => {
    var query = new CamlBuilder()
        .View()
        .Query()
        .OrderBy("ID")
        .ToString();


    assert.equal(
        vkbeautify.xml(query),
        vkbeautify.xml(
            '<View>\
            <Query>\
                <OrderBy>\
                    <FieldRef Name="ID" />\
                </OrderBy>\
            </Query>\
        </View>')
    );

});

test("OrderBy_ThenByDesc", () => {
    var query = new CamlBuilder()
        .Query()
        .OrderBy("Category")
        .ThenByDesc("Modified")
        .ToString();


    assert.equal(
        vkbeautify.xml(query),
        vkbeautify.xml(
            `<Query>
                <OrderBy>
                    <FieldRef Name="Category" />
                    <FieldRef Name="Modified" Ascending="FALSE" />
                </OrderBy>
            </Query>`
        )
    );

});

test("StartFromQueryTag", () => {
    var query = new CamlBuilder().Query().Where().TextField("Title").BeginsWith("Hello").ToString();
    assert.equal(
        vkbeautify.xml(query),
        vkbeautify.xml(
            `<Query>
                <Where>
                    <BeginsWith>
                        <FieldRef Name="Title" />
                        <Value Type="Text">Hello</Value>
                    </BeginsWith>
                </Where>
            </Query>`
        )
    )
});

test("EmptyQuery", () => {
    var query = new CamlBuilder().Query().ToString();
    assert.equal(query, "<Query />");
});

test("QueryOrderBy", () => {
    var query = new CamlBuilder().Query().OrderByDesc("Department", true, true).ToString();
    assert.equal(
        vkbeautify.xml(query),
        vkbeautify.xml(
            `<Query>
                <OrderBy Override="TRUE" UseIndexForOrderBy="TRUE">
                    <FieldRef Name="Department" Ascending="FALSE" />
                </OrderBy>
            </Query>`
        )
    )
});

test.run();

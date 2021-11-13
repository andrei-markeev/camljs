/// @ts-check

var assert = require("uvu/assert");
var test = require("uvu").test;
var CamlBuilder = require("../dist/camljs");
var vkbeautify = require("./vkbeautify");


test("ToCamlQuery", () => {
    let setXml = "";
    (global || window)["SP"] = {
        CamlQuery: function() {
            this.set_viewXml = (xml) => setXml = xml;
        }
    };

    var queryText = new CamlBuilder().View(["Title", "Author"]).ToString();
    var camlQuery = new CamlBuilder().View(["Title", "Author"]).ToCamlQuery();
    assert.equal(queryText, setXml);

    queryText = new CamlBuilder().View().RowLimit(1).ToString();
    camlQuery = new CamlBuilder().View().RowLimit(1).ToCamlQuery();
    assert.equal(queryText, setXml);

    var date = new Date();
    queryText = new CamlBuilder().View().Query().Where().DateTimeField("Modified").EqualTo(date).ToString();
    camlQuery = new CamlBuilder().View().Query().Where().DateTimeField("Modified").EqualTo(date).ToCamlQuery();
    assert.equal(queryText, setXml);

    queryText = new CamlBuilder().Where().IntegerField("ID").In([1, 2, 3]).ToString();
    camlQuery = new CamlBuilder().Where().IntegerField("ID").In([1, 2, 3]).ToCamlQuery();
    assert.equal("<View><Query>" + queryText + "</Query></View>", setXml);
});

test("FinalizeTwice", () => {
    assert.throws(() => {
        var camlBuilder1 = new CamlBuilder()
            .View(["ID", "Created"])
            .RowLimit(20, true)
            .Scope(CamlBuilder.ViewScope.RecursiveAll).Query().Where();
        camlBuilder1.TextField("Title").BeginsWith("A").ToString();
        camlBuilder1.TextField("Title").BeginsWith("B").ToString();
    }, /Please create a new CamlBuilder object for every query/);
});

test("ToStringTwice", () => {
    const builder = new CamlBuilder().View().Query().Where()
        .DateTimeField("Modified").GreaterThanOrEqualTo(new Date(2021,1,1).toISOString())
    const query1 = builder.ToString();
    const query2 = builder.ToString();

    assert.equal(
        vkbeautify.xml(query1),
        vkbeautify.xml(
        `<View>
            <Query>
                <Where>
                    <Geq>
                        <FieldRef Name="Modified" />
                        <Value IncludeTimeValue="TRUE" Type="DateTime">2021-01-31T22:00:00.000Z</Value>
                    </Geq>
                </Where>
            </Query>
        </View>`)
    );
    assert.equal(vkbeautify.xml(query1), vkbeautify.xml(query2));
});

test.run();

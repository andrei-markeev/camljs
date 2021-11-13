/// @ts-check

var assert = require("uvu/assert");
var test = require("uvu").test;
var CamlBuilder = require("../dist/camljs");
var vkbeautify = require("./vkbeautify");

test("Joins", () => {
    var query = new CamlBuilder()
        .View(["Title", "Country", "Population"])
        .LeftJoin("Country", "Country").Select("y4r6", "Population")
        .Query()
        .Where()
        .NumberField("Population").LessThan(10)
        .ToString();


    assert.equal(
        vkbeautify.xml(query),
        vkbeautify.xml(
        '<View>\
            <ViewFields>\
                <FieldRef Name="Title" />\
                <FieldRef Name="Country" />\
                <FieldRef Name="Population" />\
            </ViewFields>\
            <Joins>\
                <Join Type="LEFT" ListAlias="Country">\
                    <Eq>\
                        <FieldRef Name="Country" RefType="ID" />\
                        <FieldRef Name="ID" List="Country" />\
                    </Eq>\
                </Join>\
            </Joins>\
            <ProjectedFields>\
                <Field ShowField="y4r6" Type="Lookup" Name="Population" List="Country" />\
            </ProjectedFields>\
            <Query>\
                <Where>\
                    <Lt>\
                        <FieldRef Name="Population" />\
                        <Value Type="Number">10</Value>\
                    </Lt>\
                </Where>\
            </Query>\
        </View>'),
    );

});

test("NestedJoins", () => {
    var query = new CamlBuilder()
        .View(["Title", "CustomerCity"])
        .LeftJoin("CustomerName", "customers")
        .LeftJoin("CityName", "customerCities", "customers")
        .Select("Title", "CustomerCity")
        .Query()
        .ToString();

    assert.equal(
        vkbeautify.xml(query),
        vkbeautify.xml(
        '<View>\
            <ViewFields>\
                <FieldRef Name="Title" />\
                <FieldRef Name="CustomerCity" />\
            </ViewFields>\
            <Joins>\
              <Join Type="LEFT" ListAlias="customers">\
                <Eq>\
                  <FieldRef Name="CustomerName" RefType="ID" />\
                  <FieldRef Name="ID" List="customers" />\
                </Eq>\
              </Join>\
              <Join Type="LEFT" ListAlias="customerCities">\
                <Eq>\
                  <FieldRef Name="CityName" RefType="ID" List="customers" />\
                  <FieldRef Name="ID" List="customerCities" />\
                </Eq>\
              </Join>\
            </Joins>\
            <ProjectedFields>\
                <Field ShowField="Title" Type="Lookup" Name="CustomerCity" List="customerCities" />\
            </ProjectedFields>\
            <Query />\
        </View>')
    );

    var query = new CamlBuilder()
        .View(["Title", "CustomerName", "CustomerCity"])
        .LeftJoin("CustomerName", "customers")
        .Select("Title", "CustomerName")
        .LeftJoin("CityName", "customerCities", "customers")
        .Select("Title", "CustomerCity")
        .Query()
        .ToString();

    assert.equal(
        vkbeautify.xml(query),
        vkbeautify.xml(
        '<View>\
            <ViewFields>\
                <FieldRef Name="Title" />\
                <FieldRef Name="CustomerName" />\
                <FieldRef Name="CustomerCity" />\
            </ViewFields>\
            <Joins>\
              <Join Type="LEFT" ListAlias="customers">\
                <Eq>\
                  <FieldRef Name="CustomerName" RefType="ID" />\
                  <FieldRef Name="ID" List="customers" />\
                </Eq>\
              </Join>\
              <Join Type="LEFT" ListAlias="customerCities">\
                <Eq>\
                  <FieldRef Name="CityName" RefType="ID" List="customers" />\
                  <FieldRef Name="ID" List="customerCities" />\
                </Eq>\
              </Join>\
            </Joins>\
            <ProjectedFields>\
                <Field ShowField="Title" Type="Lookup" Name="CustomerName" List="customers" />\
                <Field ShowField="Title" Type="Lookup" Name="CustomerCity" List="customerCities" />\
            </ProjectedFields>\
            <Query />\
        </View>')
    );
    
});

test.run();

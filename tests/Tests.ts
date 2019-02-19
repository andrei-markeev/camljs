import * as tsUnit from 'ts-unit';
import * as sinon from 'sinon';
import * as diff from 'diff';
import * as CamlBuilder from '../dist/camljs';
import * as vkbeautify from './vkbeautify';

declare var SP;

export default class Tests extends tsUnit.TestClass {

    static run(target?) {
        var test = new tsUnit.Test(Tests).run();
        var errors = test.errors.map(e => {
            var err = { ...e, diffChars: null };
            var match = e.message.match(/areIdentical failed when given {string} "([\S\s]*)" and {string} "([\S\s]*)"/);
            if (match)
                err.diffChars = diff.diffChars(match[1], match[2]);
            return err;
        })
        return { errors, passes: test.passes };
    }

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
                </Where>'),
            vkbeautify.xml(caml)
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
            vkbeautify.xml(
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
            vkbeautify.xml(caml)
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
                </Where>'),
            vkbeautify.xml(caml)
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
                </Where>'),
            vkbeautify.xml(caml)
            );

    }

    TestViewWithExpression() {

        var expression = CamlBuilder.Expression().BooleanField("Enabled").IsTrue();

        var caml = new CamlBuilder().View().Query().Where().All(expression).OrderBy("Priority").ToString();

        this.areIdentical(
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
                </View>'),
            vkbeautify.xml(caml)
            );

    }

    TestLookupIdAndOrderBy() {
        var caml = new CamlBuilder().Where()
            .LookupField("Category").Id().In([2, 3, 10])
            .And()
            .DateField("ExpirationDate").GreaterThan(CamlBuilder.CamlValues.Now)
            .OrderBy("ExpirationDate")
            .ToString()

        this.areIdentical(
            vkbeautify.xml(
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
                      <Value Type="DateTime">\
                        <Now />\
                      </Value>\
                    </Gt>\
                  </And>\
                </Where>\
                <OrderBy>\
                  <FieldRef Name="ExpirationDate" />\
                </OrderBy>'),
            vkbeautify.xml(caml)
            );
    }

    TestIdInValues() {
        var caml = new CamlBuilder().Where().CounterField("ID").In([1, 2, 3]).ToString();

        this.areIdentical(
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
            </Where>'),
            vkbeautify.xml(caml)
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
            vkbeautify.xml(
            '<And>\
                <Geq>\
                    <FieldRef Name="BroadcastExpires" />\
                    <Value Type="DateTime">\
                        <Today />\
                    </Value>\
                </Geq>\
                <And>\
                    <Or>\
                        <Membership Type="CurrentUserGroups">\
                        <FieldRef Name="BroadcastTo" />\
                        </Membership>\
                        <Eq>\
                        <FieldRef Name="BroadcastTo" LookupId="True" />\
                        <Value Type="Integer"><UserID /></Value>\
                        </Eq>\
                    </Or>\
                    <DateRangesOverlap>\
                        <FieldRef Name="EventDate" />\
                        <FieldRef Name="EndDate" />\
                        <FieldRef Name="RecurrenceID" />\
                        <Value Type="DateTime">\
                        <Year />\
                        </Value>\
                    </DateRangesOverlap>\
                </And>\
            </And>'),
            vkbeautify.xml(caml));
    }

    TestJsDateFormat() {
        var caml = new CamlBuilder().Where().DateTimeField("Created").GreaterThan(new Date(Date.UTC(2013,0,1))).ToString();

        this.areIdentical(
            vkbeautify.xml(
                '<Where>\
                <Gt>\
                    <FieldRef Name="Created" />\
                    <Value IncludeTimeValue="True" Type="DateTime">2013-01-01T00:00:00.000Z</Value>\
                </Gt>\
            </Where>'),
            vkbeautify.xml(caml)
            );
    }

    TestJoins() {
        var query = new CamlBuilder()
            .View(["Title", "Country", "Population"])
            .LeftJoin("Country", "Country").Select("y4r6", "Population")
            .Query()
            .Where()
            .NumberField("Population").LessThan(10)
            .ToString();


        this.areIdentical(
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
            vkbeautify.xml(query)
            );

    }

    TestNestedJoins() {
        var query = new CamlBuilder()
            .View(["Title", "CustomerCity"])
            .LeftJoin("CustomerName", "customers")
            .LeftJoin("CityName", "customerCities", "customers")
            .Select("Title", "CustomerCity")
            .Query()
            .ToString();

        this.areIdentical(
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
            </View>'),
            vkbeautify.xml(query)
        );

        var query = new CamlBuilder()
            .View(["Title", "CustomerName", "CustomerCity"])
            .LeftJoin("CustomerName", "customers")
            .Select("Title", "CustomerName")
            .LeftJoin("CityName", "customerCities", "customers")
            .Select("Title", "CustomerCity")
            .Query()
            .ToString();

        this.areIdentical(
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
            </View>'),
            vkbeautify.xml(query)
        );
        
    }

    TestScope() {
        var query = new CamlBuilder()
            .View()
            .Scope(CamlBuilder.ViewScope.RecursiveAll)
            .Query()
            .Where()
            .NumberField("ID").IsNotNull()
            .ToString();


        this.areIdentical(
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
            vkbeautify.xml(query)
            );

    }


    TestReplaceWhere() {
        var rawQuery = '<View Scope="RecursiveAll">\
                <Query>\
                    <Where>\
                        <IsNotNull>\
                            <FieldRef Name="ID" />\
                        </IsNotNull>\
                    </Where>\
                </Query>\
            </View>';

        var query = CamlBuilder.FromXml(rawQuery).ReplaceWhere().TextField("Title").IsNotNull().ToString();

        this.areIdentical(
            vkbeautify.xml('<View Scope="RecursiveAll">\
                <Query>\
                    <Where>\
                        <IsNotNull>\
                            <FieldRef Name="Title" />\
                        </IsNotNull>\
                    </Where>\
                </Query>\
            </View>'),
            vkbeautify.xml(query)
            );

    }

    TestAppendToWhere() {
        var rawQuery = '<View Scope="RecursiveAll">\
                <Query>\
                    <Where>\
                        <IsNotNull>\
                            <FieldRef Name="ID" />\
                        </IsNotNull>\
                    </Where>\
                </Query>\
            </View>';

        var query = CamlBuilder.FromXml(rawQuery).ModifyWhere().AppendAnd().TextField("Title").IsNotNull().ToString();

        this.areIdentical(
            vkbeautify.xml('<View Scope="RecursiveAll">\
                <Query>\
                    <Where>\
                        <And>\
                            <IsNotNull>\
                                <FieldRef Name="ID" />\
                            </IsNotNull>\
                            <IsNotNull>\
                                <FieldRef Name="Title" />\
                            </IsNotNull>\
                        </And>\
                    </Where>\
                </Query>\
            </View>'),
            vkbeautify.xml(query)
            );

    }

    TestAppendToWhereWithOrderBy() {
        var rawQuery = '<View Scope="RecursiveAll">\
                <Query>\
                    <Where>\
                        <Eq>\
                            <FieldRef Name="ID" />\
                            <Value Type="Number">10</Value>\
                        </Eq>\
                    </Where>\
                    <OrderBy>\
                        <FieldRef Name="Date" />\
                    </OrderBy>\
                </Query>\
            </View>';

        var query = CamlBuilder.FromXml(rawQuery).ModifyWhere().AppendOr().TextField("Title").Contains("Summer").ToString();

        this.areIdentical(
            vkbeautify.xml('<View Scope="RecursiveAll">\
                <Query>\
                    <OrderBy>\
                        <FieldRef Name="Date" />\
                    </OrderBy>\
                    <Where>\
                        <Or>\
                            <Eq>\
                                <FieldRef Name="ID" />\
                                <Value Type="Number">10</Value>\
                            </Eq>\
                            <Contains>\
                                <FieldRef Name="Title" />\
                                <Value Type="Text">Summer</Value>\
                            </Contains>\
                        </Or>\
                    </Where>\
                </Query>\
            </View>'),
            vkbeautify.xml(query)
            );

    }

    TestQueryOrderBy() {
        var query = new CamlBuilder()
            .View()
            .Query()
            .OrderBy("ID")
            .ToString();


        this.areIdentical(
            vkbeautify.xml(
                '<View>\
                <Query>\
                    <OrderBy>\
						<FieldRef Name="ID" />\
                    </OrderBy>\
                </Query>\
            </View>'),
            vkbeautify.xml(query)
            );

    }

    TestAggregations() {
        var query = new CamlBuilder()
            .View(["Category", { count: "ID" }, { sum: "Amount" }])
            .Query()
            .GroupBy("Category", true, 100)
            .ToString();


        this.areIdentical(
            vkbeautify.xml(
                '<View>\
                <ViewFields>\
                    <FieldRef Name="Category" />\
                </ViewFields>\
                <Aggregations Value=\"On\">\
                    <FieldRef Name="ID" Type="COUNT" />\
                    <FieldRef Name="Amount" Type="SUM" />\
                </Aggregations>\
                <Query>\
                    <GroupBy Collapse="TRUE" GroupLimit="100">\
						<FieldRef Name="Category" />\
                    </GroupBy>\
                </Query>\
            </View>'),
            vkbeautify.xml(query)
            );

    }

    TestContentTypeIdField() {
        var query = new CamlBuilder()
            .Where()
            .TextField("Title").EqualTo("Document")
            .And()
            .ContentTypeIdField().BeginsWith("0x101")
            .ToString();

        this.areIdentical(
            vkbeautify.xml(
            `<Where>
                <And>
                    <Eq>
                        <FieldRef Name="Title" />
                        <Value Type="Text">Document</Value>
                    </Eq>
                    <BeginsWith>
                        <FieldRef Name="ContentTypeId" />
                        <Value Type="ContentTypeId">0x101</Value>
                    </BeginsWith>
                </And>
            </Where>`),
            vkbeautify.xml(query)
            );

    }
    
    TestToCamlQuery() {
        SP.CamlQuery = function() {
            this.set_viewXml = sinon.spy();
        };
        var queryText = new CamlBuilder().View(["Title", "Author"]).ToString();
        var camlQuery = new CamlBuilder().View(["Title", "Author"]).ToCamlQuery();
        this.areIdentical(queryText, camlQuery.set_viewXml.getCall(0).args[0]);

        queryText = new CamlBuilder().View().RowLimit(1).ToString();
        camlQuery = new CamlBuilder().View().RowLimit(1).ToCamlQuery();
        this.areIdentical(queryText, camlQuery.set_viewXml.getCall(0).args[0]);

        var date = new Date();
        queryText = new CamlBuilder().View().Query().Where().DateTimeField("Modified").EqualTo(date).ToString();
        camlQuery = new CamlBuilder().View().Query().Where().DateTimeField("Modified").EqualTo(date).ToCamlQuery();
        this.areIdentical(queryText, camlQuery.set_viewXml.getCall(0).args[0]);

        queryText = new CamlBuilder().Where().IntegerField("ID").In([1, 2, 3]).ToString();
        camlQuery = new CamlBuilder().Where().IntegerField("ID").In([1, 2, 3]).ToCamlQuery();
        this.areIdentical("<View><Query>" + queryText + "</Query></View>", camlQuery.set_viewXml.getCall(0).args[0]);
    }

    TestFinalizeTwice() {
        try {
            var camlBuilder1 = new CamlBuilder()
                .View(["ID", "Created"])
                .RowLimit(20, true)
                .Scope(CamlBuilder.ViewScope.RecursiveAll).Query().Where();
            var queryA = camlBuilder1.TextField("Title").BeginsWith("A").ToString();
            var queryB = camlBuilder1.TextField("Title").BeginsWith("B").ToString();
            this.fail("Reusing CamlBuilder to create more than 1 query should throw an error.")
        } catch(e) {
            this.isTrue(e.toString().indexOf("Please create a new CamlBuilder object for every query") > -1);
        }
    }

}

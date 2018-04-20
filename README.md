## Installation

Nuget:
```
PM> Install-Package CamlJs
```

Nuget TypeScript definitions:
```
PM> Install-Package camljs.TypeScript.DefinitelyTyped
```

Npm:
```
npm install camljs
```

Npm TypeScript definitions:
```
npm install @types/camljs
```

Also check out [CamlJs Console](https://github.com/andrei-markeev/camljs-console) - Chrome extension for testing queries with live preview against real lists.

## Usage

In browser:

```html
<script type="text/javascript" src="//unpkg.com/camljs"></script>
<script>
    alert(new CamlBuilder().View().ToString());
</script>
```

In node:

```js
var CamlBuilder = require('camljs');
console.log(new CamlBuilder().View().ToString());
```

ES2015 modules:
```js
import * as CamlBuilder from 'camljs';
console.log(new CamlBuilder().View().ToString());
```

## Basics

Let's assume we need to fetch all Google-related emails from a SharePoint list where your company stores archived project emails. To generate the corresponding query using CamlJs, you could use following javascript code:

```js
var camlBuilder = new CamlBuilder();

var caml = camlBuilder.Where()
    .TextField("Email").EqualTo("support@google.com")
    .Or()
    .TextField("Email").EqualTo("plus@google.com")
    .Or()
    .TextField("Title").BeginsWith("[Google]")
    .Or()
    .TextField("Content").Contains("Google")
    .ToString();
```

This will generate the following CAML code:

```xml
<Where>
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
</Where>
```

It is also possible to generate SP.CamlQuery object, just change `.ToString()` to `.ToCamlQuery()`.

Another example:
```js
var caml = camlBuilder.Where()
    .LookupField("Category").Id().In([2, 3, 10])
    .And()
    .DateField("ExpirationDate").LessThanOrEqualTo(CamlBuilder.CamlValues.Now)
    .OrderByDesc("ExpirationDate")
    .ToString()
```
As you see, the code is pretty clean and readable. The resulting CAML is much more awkward, especially if you imagine it in javascript strings dress, without indentation and highlighting...
```xml
<Where>
  <And>
    <In>
      <FieldRef Name="Category" LookupId="True" />
      <Values>
        <Value Type="Integer">2</Value>
        <Value Type="Integer">3</Value>
        <Value Type="Integer">10</Value>
      </Values>
    </In>
    <Leq>
      <FieldRef Name="ExpirationDate" />
      <Value Type="Date">
        <Now />
      </Value>
    </Leq>
  </And>
</Where><OrderBy>
  <FieldRef Name="ExpirationDate" Ascending="False" />
</OrderBy>
```

## Dynamic queries

It's very easy to create dynamic queries with CamlJs by leveraging the `CamlBuilder.Expression()` construction.
It's like a standalone part of query that can be later used in the final `new CamlBuilder.Where()` or `new CamlBuilder.View()`.

```js
var categories = ["Category 1", "Category 2", "Category 3"];

var categoriesExpressions = categories.map(c => CamlBuilder.Expression().TextField("Category").EqualTo(c));

var caml = new CamlBuilder().Where()
    .Any(categoriesExpressions),
    .ToString();
```
Result:
```xml
<Where>
    <Or>
        <Eq>
            <FieldRef Name="Category" />
            <Value Type="Text">Category 1</Value>
        </Eq>
        <Or>
            <Eq>
                <FieldRef Name="Category" />
                <Value Type="Text">Category 2</Value>
            </Eq>
            <Eq>
                <FieldRef Name="Category" />
                <Value Type="Text">Category 3</Value>
            </Eq>
        </Or>
    </Or>
</Where>
```

While `.Any()` generates `<Or>` clauses, `.All()` will generate `<And>`.

## Elements support

CamlJs supports all Query elements that are [described on MSDN](http://msdn.microsoft.com/en-us/library/ms467521.aspx).

For example, seldom used Membership element:
```js
var caml = camlBuilder.Where()
    .UserField("AssignedTo").EqualToCurrentUser()
    .Or()
    .UserField("AssignedTo").IsInCurrentUserGroups()
    .GroupBy("ProductTitle")
    .OrderBy("Priority").ThenBy("Title")
    .ToString();
```
This code will generate following CAML:

```xml
<Where>
  <Or>
    <Eq>
      <FieldRef Name="AssignedTo" />
      <Value Type="Integer">
        <UserID />
      </Value>
    </Eq>
    <Membership Type="CurrentUserGroups">
      <FieldRef Name="AssignedTo" />
    </Membership>
  </Or>
</Where>
<GroupBy>
  <FieldRef Name="ProductTitle" />
</GroupBy>
<OrderBy>
  <FieldRef Name="Priority" />
  <FieldRef Name="Title" />
</OrderBy>
```

You can also create the upper-level View element as supported by SP.CamlQuery object.
Scope attribute, ViewFields, Joins and ProjectedFields are supported in this case.

Joining lists via CamlJs is very easy. Here's the example:

```js
var query = new CamlBuilder()
    .View(["Title","Country","Population"])
    .LeftJoin("Country","Country").Select("People","Population")
    .Query()
    .Where()
    .NumberField("Population").LessThan(10)
    .ToString();
```
The resulting generated CAML query will be the following:
```xml
<View>
    <ViewFields>
        <FieldRef Name="Title" />
        <FieldRef Name="Country" />
        <FieldRef Name="Population" />
    </ViewFields>
    <Joins>
        <Join Type="LEFT" ListAlias="Country">
            <Eq>
                <FieldRef Name="Country" RefType="ID" />
                <FieldRef Name="ID" List="Country" />
            </Eq>
        </Join>
    </Joins>
    <ProjectedFields>
        <Field ShowField="People" Type="Lookup" Name="Population" List="Country" />
    </ProjectedFields>
    <Query>
        <Where>
            <Lt>
                <FieldRef Name="Population" />
                <Value Type="Number">10</Value>
            </Lt>
        </Where>
    </Query>
</View>
```

## Modify existing queries

Often you need to modify existing query (e.g. that comes from an existing list view), rather than generate a completely new one.
This use case is also supported by CamlJs:

- `CamlBuilder.FromXml(xml)` method will create a CamlBuilder object from existing CAML string
- `ReplaceWhere` method then allows to replace <Where> clause with one generated by CamlJs
- `ModifyWhere().AppendAnd()` will add new conditions to existing query using "And" operator
- `ModifyWhere().AppendOr()` will add new conditions to existing query using "Or" operator

Example:

```js
var xml = new CamlBuilder().View().Query().Where()
    .UserField("Author").EqualToCurrentUser()
    .ToString();

var query = CamlBuilder.FromXml(xml)
    .ModifyWhere().AppendAnd()
    .LookupField("Country").ValueAsText().BeginsWith("G");
```

Result:
```xml
<View>
  <Query>
    <Where>
      <And>
        <Eq>
          <FieldRef Name="Author" LookupId="true" />
          <Value Type="Integer">
            <UserID />
          </Value>
        </Eq>
        <BeginsWith>
          <FieldRef Name="Country" />
          <Value Type="Text">G</Value>
        </BeginsWith>
      </And>
    </Where>
  </Query>
</View>
```

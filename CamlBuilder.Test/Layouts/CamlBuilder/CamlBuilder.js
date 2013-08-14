var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var CamlBuilder = (function () {
    function CamlBuilder() { }
    CamlBuilder.Query = function Query() {
        return CamlBuilderInternal.Query.create();
    };
    CamlBuilder.QueryPart = function QueryPart() {
        return CamlBuilderInternal.QueryPart.create();
    };
    return CamlBuilder;
})();
var CamlBuilderInternal;
(function (CamlBuilderInternal) {
    var Query = (function () {
        function Query() { }
        Query.create = function create() {
            return new QueryInternal();
        };
        return Query;
    })();
    CamlBuilderInternal.Query = Query;    
    var QueryPart = (function () {
        function QueryPart() { }
        QueryPart.create = function create() {
            return new FieldExpression();
        };
        return QueryPart;
    })();
    CamlBuilderInternal.QueryPart = QueryPart;    
    /** Represents SharePoint CAML Query element */
    var QueryInternal = (function () {
        /** Creates Query CAML element */
        function QueryInternal() {
            this.builder.tree.push({
                Element: "Start",
                Name: "Query"
            });
            this.builder.unclosedTags++;
            this.builder = new Builder();
        }
        QueryInternal.prototype.Where = /** Adds Where clause to the query, inside you can specify conditions for certain field values. */
        function (expressionBuilder) {
            var part = expressionBuilder(new FieldExpression());
            this.builder.tree.push({
                Element: "Start",
                Name: "Where"
            });
            this.builder.unclosedTags++;
            var partBuilder = part["builder"];
            this.builder.tree.push(partBuilder.tree);
            return this;
        };
        QueryInternal.prototype.GroupBy = /** Adds GroupBy clause to the query.
        @param collapse If true, only information about the groups is retrieved, otherwise items are also retrieved. */
        function (groupFieldName, collapse) {
            this.builder.StartGroupBy(groupFieldName, collapse);
            return new GroupedQuery(this.builder);
        };
        QueryInternal.prototype.OrderBy = /** Adds OrderBy clause to the query
        @param fieldInternalName Internal field of the first field by that the data will be sorted (ascending)
        @param override This is only necessary for large lists. DON'T use it unless you know what it is for!
        @param useIndexForOrderBy This is only necessary for large lists. DON'T use it unless you know what it is for!
        */
        function (fieldInternalName, override, useIndexForOrderBy) {
            this.builder.StartOrderBy(override, useIndexForOrderBy);
            this.builder.tree.push({
                Element: "FieldRef",
                Name: fieldInternalName
            });
            return new SortedQuery(this.builder);
        };
        QueryInternal.prototype.OrderByDesc = /** Adds OrderBy clause to the query (using descending order for the first field).
        @param fieldInternalName Internal field of the first field by that the data will be sorted (descending)
        @param override This is only necessary for large lists. DON'T use it unless you know what it is for!
        @param useIndexForOrderBy This is only necessary for large lists. DON'T use it unless you know what it is for!
        */
        function (fieldInternalName, override, useIndexForOrderBy) {
            this.builder.StartOrderBy(override, useIndexForOrderBy);
            this.builder.tree.push({
                Element: "FieldRef",
                Name: fieldInternalName,
                Descending: true
            });
            return new SortedQuery(this.builder);
        };
        QueryInternal.prototype.ToString = function () {
            return this.builder.Finalize();
        };
        return QueryInternal;
    })();    
    var QueryToken = (function () {
        function QueryToken(builder, startIndex) {
            this.builder = builder;
            this.startIndex = startIndex;
        }
        QueryToken.prototype.And = function (expressionBuilder) {
            var part = expressionBuilder(new FieldExpression());
            var partBuilder = part["builder"];
            partBuilder.tree.splice(0, 0, {
                Element: "Start",
                Name: "Or"
            });
            partBuilder.tree.push({
                Element: "End"
            });
            this.builder.tree.splice(this.startIndex, 0, partBuilder.tree);
            return this;
        };
        QueryToken.prototype.Or = function (expressionBuilder) {
            var part = expressionBuilder(new FieldExpression());
            var partBuilder = part["builder"];
            partBuilder.tree.splice(0, 0, {
                Element: "Start",
                Name: "Or"
            });
            partBuilder.tree.push({
                Element: "End"
            });
            this.builder.tree.splice(this.startIndex, 0, partBuilder.tree);
            return this;
        };
        QueryToken.prototype.GroupBy = function (groupFieldName, collapse) {
            this.builder.StartGroupBy(groupFieldName, collapse);
            return new GroupedQuery(this.builder);
        };
        QueryToken.prototype.OrderBy = function (fieldInternalName, override, useIndexForOrderBy) {
            this.builder.StartOrderBy(override, useIndexForOrderBy);
            this.builder.tree.push({
                Element: "FieldRef",
                Name: fieldInternalName
            });
            return new SortedQuery(this.builder);
        };
        QueryToken.prototype.OrderByDesc = function (fieldInternalName, override, useIndexForOrderBy) {
            this.builder.StartOrderBy(override, useIndexForOrderBy);
            this.builder.tree.push({
                Element: "FieldRef",
                Name: fieldInternalName,
                Descending: true
            });
            return new SortedQuery(this.builder);
        };
        QueryToken.prototype.ToString = function () {
            return this.builder.Finalize();
        };
        return QueryToken;
    })();    
    var FieldExpression = (function () {
        function FieldExpression() {
            this.builder = new Builder();
        }
        FieldExpression.prototype.TextField = function (internalName) {
            return new FieldExpressionToken(this.builder, internalName, "Text");
        };
        FieldExpression.prototype.BooleanField = function (internalName) {
            return new FieldExpressionToken(this.builder, internalName, "Integer");
        };
        FieldExpression.prototype.NumberField = function (internalName) {
            return new FieldExpressionToken(this.builder, internalName, "Number");
        };
        FieldExpression.prototype.UserField = function (internalName) {
            return new UserFieldExpression(this.builder, internalName);
        };
        FieldExpression.prototype.LookupField = function (internalName) {
            return new LookupFieldExpression(this.builder, internalName, "Lookup");
        };
        FieldExpression.prototype.LookupMultiField = function (internalName) {
            return new FieldExpressionToken(this.builder, internalName, "LookupMulti");
        };
        FieldExpression.prototype.DateField = function (internalName) {
            return new FieldExpressionToken(this.builder, internalName, "Date");
        };
        FieldExpression.prototype.DateTimeField = function (internalName) {
            return new FieldExpressionToken(this.builder, internalName, "DateTime");
        };
        FieldExpression.prototype.DateRangesOverlap = function (eventDateField, endDateField, recurrenceIDField, dateTimeValue) {
            /// <summary>
            /// Used in queries to compare the dates in a recurring event with a specified DateTime value, to determine whether they overlap.
            /// </summary>
            var pos = this.builder.tree.length;
            this.builder.tree.push({
                Element: "Start",
                Name: "DateRangesOverlap"
            });
            this.builder.tree.push({
                Element: "FieldRef",
                Name: eventDateField
            });
            this.builder.tree.push({
                Element: "FieldRef",
                Name: endDateField
            });
            this.builder.tree.push({
                Element: "FieldRef",
                Name: recurrenceIDField
            });
            this.builder.tree.push({
                Element: "Value",
                ValueType: "DateTime",
                Value: dateTimeValue
            });
            this.builder.tree.push({
                Element: "End"
            });
            return new QueryToken(this.builder, pos);
        };
        return FieldExpression;
    })();    
    var LookupFieldExpression = (function () {
        function LookupFieldExpression(builder, name, valueType) {
            this.builder = builder;
            this.name = name;
            this.valueType = valueType;
        }
        LookupFieldExpression.prototype.Id = function () {
            return new FieldExpressionToken(this.builder, this.name, "Integer");
        };
        LookupFieldExpression.prototype.Value = function () {
            return new FieldExpressionToken(this.builder, this.name, this.valueType);
        };
        return LookupFieldExpression;
    })();    
    var UserFieldExpression = (function (_super) {
        __extends(UserFieldExpression, _super);
        function UserFieldExpression(builder, name) {
            this.builder = builder;
            this.name = name;
            this.startIndex = builder.tree.length;
                _super.call(this, builder, name, "User");
        }
        UserFieldExpression.prototype.IsEqualToCurrentUser = function () {
            this.builder.tree.push({
                Element: 'FieldRef',
                Name: this.name,
                LookupId: true
            });
            this.builder.BinaryOperator(this.startIndex, "Eq", "Integer", "{UserID}");
            return new QueryToken(this.builder, this.startIndex);
        };
        UserFieldExpression.prototype.IsInCurrentUserGroups = function () {
            this.builder.tree.push({
                Element: 'FieldRef',
                Name: this.name
            });
            this.builder.Membership(this.startIndex, "CurrentUserGroups");
            return new QueryToken(this.builder, this.startIndex);
        };
        UserFieldExpression.prototype.IsInSPGroup = function () {
            this.builder.tree.push({
                Element: 'FieldRef',
                Name: this.name
            });
            this.builder.Membership(this.startIndex, "SPGroup");
            return new QueryToken(this.builder, this.startIndex);
        };
        UserFieldExpression.prototype.IsInSPWebGroups = function () {
            this.builder.tree.push({
                Element: 'FieldRef',
                Name: this.name
            });
            this.builder.Membership(this.startIndex, "SPWeb.Groups");
            return new QueryToken(this.builder, this.startIndex);
        };
        UserFieldExpression.prototype.IsInSPWebAllUsers = function () {
            this.builder.tree.push({
                Element: 'FieldRef',
                Name: this.name
            });
            this.builder.Membership(this.startIndex, "SPWeb.AllUsers");
            return new QueryToken(this.builder, this.startIndex);
        };
        UserFieldExpression.prototype.IsInSPWebUsers = function () {
            this.builder.tree.push({
                Element: 'FieldRef',
                Name: name
            });
            this.builder.Membership(this.startIndex, "SPWeb.Users");
            return new QueryToken(this.builder, this.startIndex);
        };
        return UserFieldExpression;
    })(LookupFieldExpression);    
    var FieldExpressionToken = (function () {
        function FieldExpressionToken(builder, name, valueType, isLookupId) {
            this.builder = builder;
            this.name = name;
            this.startIndex = builder.tree.length;
            this.valueType = valueType;
            this.builder.tree.push({
                Element: 'FieldRef',
                Name: name,
                LookupId: isLookupId
            });
        }
        FieldExpressionToken.prototype.IsTrue = function () {
            this.builder.BinaryOperator(this.startIndex, "Eq", "Integer", "1");
            return new QueryToken(this.builder, this.startIndex);
        };
        FieldExpressionToken.prototype.IsFalse = function () {
            this.builder.BinaryOperator(this.startIndex, "Eq", "Integer", "0");
            return new QueryToken(this.builder, this.startIndex);
        };
        FieldExpressionToken.prototype.IsNull = function () {
            this.builder.UnaryOperator(this.startIndex, "IsNull");
            return new QueryToken(this.builder, this.startIndex);
        };
        FieldExpressionToken.prototype.IsNotNull = function () {
            this.builder.UnaryOperator(this.startIndex, "IsNotNull");
            return new QueryToken(this.builder, this.startIndex);
        };
        FieldExpressionToken.prototype.IsEqualTo = function (value) {
            this.builder.BinaryOperator(this.startIndex, "Eq", this.valueType, value);
            return new QueryToken(this.builder, this.startIndex);
        };
        FieldExpressionToken.prototype.IsGreaterThan = function (value) {
            this.builder.BinaryOperator(this.startIndex, "Gt", this.valueType, value);
            return new QueryToken(this.builder, this.startIndex);
        };
        FieldExpressionToken.prototype.IsLessThan = function (value) {
            this.builder.BinaryOperator(this.startIndex, "Lt", this.valueType, value);
            return new QueryToken(this.builder, this.startIndex);
        };
        FieldExpressionToken.prototype.IsGreaterThanOrEqualTo = function (value) {
            this.builder.BinaryOperator(this.startIndex, "Geq", this.valueType, value);
            return new QueryToken(this.builder, this.startIndex);
        };
        FieldExpressionToken.prototype.IsLessThanOrEqualTo = function (value) {
            this.builder.BinaryOperator(this.startIndex, "Leq", this.valueType, value);
            return new QueryToken(this.builder, this.startIndex);
        };
        FieldExpressionToken.prototype.IsNotEqualTo = function (value) {
            this.builder.BinaryOperator(this.startIndex, "Neq", this.valueType, value);
            return new QueryToken(this.builder, this.startIndex);
        };
        FieldExpressionToken.prototype.NotIncludes = function (value) {
            this.builder.BinaryOperator(this.startIndex, "NotIncludes", this.valueType, value);
            return new QueryToken(this.builder, this.startIndex);
        };
        FieldExpressionToken.prototype.Includes = function (value) {
            this.builder.BinaryOperator(this.startIndex, "Includes", this.valueType, value);
            return new QueryToken(this.builder, this.startIndex);
        };
        FieldExpressionToken.prototype.Contains = function (value) {
            this.builder.BinaryOperator(this.startIndex, "Contains", this.valueType, value);
            return new QueryToken(this.builder, this.startIndex);
        };
        FieldExpressionToken.prototype.BeginsWith = function (value) {
            this.builder.BinaryOperator(this.startIndex, "BeginsWith", this.valueType, value);
            return new QueryToken(this.builder, this.startIndex);
        };
        FieldExpressionToken.prototype.In = function (arrayOfValues) {
            this.builder.tree.splice(this.startIndex, 0, {
                Element: "Start",
                Name: "In"
            });
            this.builder.tree.push({
                Element: "Start",
                Name: "Values"
            });
            for(var i = 0; i < arrayOfValues.length; i++) {
                this.builder.tree.push({
                    Element: "Value",
                    ValueType: this.valueType,
                    Value: arrayOfValues[i]
                });
            }
            this.builder.tree.push({
                Element: "End"
            });
            this.builder.tree.push({
                Element: "End"
            });
            return new QueryToken(this.builder, this.startIndex);
        };
        return FieldExpressionToken;
    })();    
    var GroupedQuery = (function () {
        function GroupedQuery(builder) {
            this.builder = builder;
        }
        GroupedQuery.prototype.OrderBy = function (fieldInternalName, override, useIndexForOrderBy) {
            this.builder.StartOrderBy(override, useIndexForOrderBy);
            this.builder.tree.push({
                Element: "FieldRef",
                Name: fieldInternalName
            });
            return new SortedQuery(this.builder);
        };
        GroupedQuery.prototype.OrderByDesc = function (fieldInternalName, override, useIndexForOrderBy) {
            this.builder.StartOrderBy(override, useIndexForOrderBy);
            this.builder.tree.push({
                Element: "FieldRef",
                Name: fieldInternalName,
                Descending: true
            });
            return new SortedQuery(this.builder);
        };
        GroupedQuery.prototype.ToString = function () {
            return this.builder.Finalize();
        };
        return GroupedQuery;
    })();    
    var SortedQuery = (function () {
        function SortedQuery(builder) {
            this.builder = builder;
        }
        SortedQuery.prototype.ThenBy = function (fieldInternalName, override, useIndexForOrderBy) {
            this.builder.tree.push({
                Element: "FieldRef",
                Name: fieldInternalName
            });
            return new SortedQuery(this.builder);
        };
        SortedQuery.prototype.ThenByDesc = function (fieldInternalName, override, useIndexForOrderBy) {
            this.builder.tree.push({
                Element: "FieldRef",
                Name: fieldInternalName,
                Descending: true
            });
            return new SortedQuery(this.builder);
        };
        SortedQuery.prototype.ToString = function () {
            return this.builder.Finalize();
        };
        return SortedQuery;
    })();    
    var Builder = (function () {
        function Builder() {
            this.tree = new Array();
            this.unclosedTags = 0;
        }
        Builder.prototype.Membership = function (startIndex, type) {
            this.tree.splice(startIndex, 0, {
                Element: "Start",
                Name: "Membership",
                Attributes: [
                    {
                        Name: "Type",
                        Value: type
                    }
                ]
            });
            this.tree.push({
                Element: "End"
            });
        };
        Builder.prototype.UnaryOperator = function (startIndex, operation) {
            this.tree.splice(startIndex, 0, {
                Element: "Start",
                Name: operation
            });
            this.tree.push({
                Element: "End"
            });
        };
        Builder.prototype.BinaryOperator = function (startIndex, operation, valueType, value) {
            this.tree.splice(startIndex, 0, {
                Element: "Start",
                Name: operation
            });
            this.tree.push({
                Element: "Value",
                ValueType: valueType,
                Value: value
            });
            this.tree.push({
                Element: "End"
            });
        };
        Builder.prototype.StartGroupBy = function (groupFieldName, collapse) {
            if(this.unclosedTags > 0) {
                this.tree.push({
                    Element: "End",
                    Count: this.unclosedTags
                });
            }
            this.unclosedTags = 0;
            if(collapse) {
                this.tree.push({
                    Element: "Start",
                    Name: "GroupBy",
                    Attributes: [
                        {
                            Name: "Collapse",
                            Value: "TRUE"
                        }
                    ]
                });
            } else {
                this.tree.push({
                    Element: "Start",
                    Name: "GroupBy"
                });
            }
            this.tree.push({
                Element: "FieldRef",
                Name: groupFieldName
            });
            this.tree.push({
                Element: "End"
            });
        };
        Builder.prototype.StartOrderBy = function (override, useIndexForOrderBy) {
            if(this.unclosedTags > 0) {
                this.tree.push({
                    Element: "End",
                    Count: this.unclosedTags
                });
            }
            this.unclosedTags = 1;
            var attributes = new Array();
            if(override) {
                attributes.push({
                    Name: "Override",
                    Value: "TRUE"
                });
            }
            if(useIndexForOrderBy) {
                attributes.push({
                    Name: "UseIndexForOrderBy",
                    Value: "TRUE"
                });
            }
            if(attributes.length > 0) {
                this.tree.push({
                    Element: "Start",
                    Name: "OrderBy",
                    Attributes: attributes
                });
            } else {
                this.tree.push({
                    Element: "Start",
                    Name: "OrderBy"
                });
            }
        };
        Builder.prototype.Finalize = function () {
            var sb = new Sys.StringBuilder();
            var writer = SP.XmlWriter.create(sb);
            for(var i = 0; i < this.tree.length; i++) {
                if(this.tree[i].Element == "FieldRef") {
                    writer.writeStartElement("FieldRef");
                    writer.writeAttributeString("Name", this.tree[i].Name);
                    if(this.tree[i].LookupId) {
                        writer.writeAttributeString("LookupId", "True");
                    }
                    if(this.tree[i].Descending) {
                        writer.writeAttributeString("Ascending", "False");
                    }
                    writer.writeEndElement();
                } else if(this.tree[i].Element == "Start") {
                    writer.writeStartElement(this.tree[i].Name);
                    if(this.tree[i].Attributes) {
                        for(var a = 0; a < this.tree[i].Attributes.length; a++) {
                            writer.writeAttributeString(this.tree[i].Attributes[a].Name, this.tree[i].Attributes[a].Value);
                        }
                    }
                } else if(this.tree[i].Element == "Value") {
                    writer.writeStartElement("Value");
                    writer.writeAttributeString("Type", this.tree[i].ValueType);
                    var value = this.tree[i].Value.toString();
                    if(value.slice(0, 1) == "{" && value.slice(-1) == "}") {
                        writer.writeRaw("<" + value.slice(1, value.length - 1) + " />");
                    } else {
                        writer.writeString(value);
                    }
                    writer.writeEndElement();
                } else if(this.tree[i].Element == "End") {
                    var count = this.tree[i].Count;
                    if(count) {
                        while(count > 0) {
                            count--;
                            writer.writeEndElement();
                        }
                    } else {
                        writer.writeEndElement();
                    }
                }
            }
            while(this.unclosedTags > 0) {
                this.unclosedTags--;
                writer.writeEndElement();
            }
            this.tree = new Array();
            writer.close();
            return sb.toString();
        };
        return Builder;
    })();    
})(CamlBuilderInternal || (CamlBuilderInternal = {}));
//@ sourceMappingURL=CamlBuilder.js.map

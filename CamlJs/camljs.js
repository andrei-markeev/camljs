var CamlBuilder = (function () {
    function CamlBuilder() {
    }
    /** Generate CAML Query, starting from <Where> tag */
    CamlBuilder.prototype.Where = function () {
        return CamlBuilder.Internal.createWhere();
    };

    /** Generate <View> tag for SP.CamlQuery
    @param viewFields If omitted, default view fields are requested; otherwise, only values for the fields with the specified internal names are returned.
    Specifying view fields is a good practice, as it decreases traffic between server and client. */
    CamlBuilder.prototype.View = function (viewFields) {
        return CamlBuilder.Internal.createView(viewFields);
    };

    /** Generate <ViewFields> tag for SPServices */
    CamlBuilder.prototype.ViewFields = function (viewFields) {
        return CamlBuilder.Internal.createViewFields(viewFields);
    };

    /** Use for:
    1. SPServices CAMLQuery attribute
    2. Creating partial expressions
    3. In conjunction with Any & All clauses
    */
    CamlBuilder.Expression = function () {
        return CamlBuilder.Internal.createExpression();
    };
    return CamlBuilder;
})();

var CamlBuilder;
(function (CamlBuilder) {
    (function (ViewScope) {
        /**  */
        ViewScope[ViewScope["Recursive"] = 0] = "Recursive";

        /**  */
        ViewScope[ViewScope["RecursiveAll"] = 1] = "RecursiveAll";

        /**  */
        ViewScope[ViewScope["FilesOnly"] = 2] = "FilesOnly";
    })(CamlBuilder.ViewScope || (CamlBuilder.ViewScope = {}));
    var ViewScope = CamlBuilder.ViewScope;

    

    

    (function (DateRangesOverlapType) {
        /** Returns events for today */
        DateRangesOverlapType[DateRangesOverlapType["Now"] = 0] = "Now";

        /** Returns events for one day, specified by CalendarDate in QueryOptions */
        DateRangesOverlapType[DateRangesOverlapType["Day"] = 1] = "Day";

        /** Returns events for one week, specified by CalendarDate in QueryOptions */
        DateRangesOverlapType[DateRangesOverlapType["Week"] = 2] = "Week";

        /** Returns events for one month, specified by CalendarDate in QueryOptions.
        Caution: usually also returns few days from previous and next months */
        DateRangesOverlapType[DateRangesOverlapType["Month"] = 3] = "Month";

        /** Returns events for one year, specified by CalendarDate in QueryOptions */
        DateRangesOverlapType[DateRangesOverlapType["Year"] = 4] = "Year";
    })(CamlBuilder.DateRangesOverlapType || (CamlBuilder.DateRangesOverlapType = {}));
    var DateRangesOverlapType = CamlBuilder.DateRangesOverlapType;

    var Internal = (function () {
        function Internal() {
        }
        Internal.createView = function (viewFields) {
            return new ViewInternal().View(viewFields);
        };
        Internal.createViewFields = function (viewFields) {
            return new ViewInternal().CreateViewFields(viewFields);
        };
        Internal.createWhere = function () {
            return new QueryInternal().Where();
        };
        Internal.createExpression = function () {
            return new FieldExpression(new Builder());
        };
        return Internal;
    })();
    CamlBuilder.Internal = Internal;

    var ViewInternal = (function () {
        function ViewInternal() {
            this.builder = new Builder();
        }
        /** Adds View element. */
        ViewInternal.prototype.View = function (viewFields) {
            this.builder.WriteStart("View");
            this.builder.unclosedTags++;
            if (viewFields && viewFields.length > 0)
                this.CreateViewFields(viewFields);
            this.joinsManager = new JoinsManager(this.builder, this);
            return this;
        };
        ViewInternal.prototype.CreateViewFields = function (viewFields) {
            this.builder.WriteStart("ViewFields");
            for (var i = 0; i < viewFields.length; i++) {
                this.builder.WriteFieldRef(viewFields[i]);
            }
            this.builder.WriteEnd();
            return this;
        };
        ViewInternal.prototype.RowLimit = function (limit, paged) {
            this.builder.WriteRowLimit(paged || false, limit);
            return this;
        };
        ViewInternal.prototype.Scope = function (scope) {
            switch (scope) {
                case 2 /* FilesOnly */:
                    this.builder.SetAttributeToLastElement("View", "Scope", "FilesOnly");
                    break;
                case 0 /* Recursive */:
                    this.builder.SetAttributeToLastElement("View", "Scope", "Recursive");
                    break;
                case 1 /* RecursiveAll */:
                    this.builder.SetAttributeToLastElement("View", "Scope", "RecursiveAll");
                    break;
                default:
                    console.log('Incorrect view scope! Please use values from CamlBuilder.ViewScope enumeration.');
                    break;
            }
            return this;
        };
        ViewInternal.prototype.InnerJoin = function (lookupFieldInternalName, alias) {
            return this.joinsManager.Join(lookupFieldInternalName, alias, "INNER");
        };
        ViewInternal.prototype.LeftJoin = function (lookupFieldInternalName, alias) {
            return this.joinsManager.Join(lookupFieldInternalName, alias, "LEFT");
        };

        /** Select projected field for using in the main Query body
        @param remoteFieldAlias By this alias, the field can be used in the main Query body. */
        ViewInternal.prototype.Select = function (remoteFieldInternalName, remoteFieldAlias) {
            return this.joinsManager.ProjectedField(remoteFieldInternalName, remoteFieldAlias);
        };
        ViewInternal.prototype.ToString = function () {
            if (this.joinsManager != null)
                this.joinsManager.Finalize();
            return this.builder.Finalize();
        };
        ViewInternal.prototype.ToCamlQuery = function () {
            this.joinsManager.Finalize();
            return this.builder.FinalizeToSPQuery();
        };

        /** Adds Query clause to the View XML. */
        ViewInternal.prototype.Query = function () {
            this.joinsManager.Finalize();
            this.builder.WriteStart("Query");
            this.builder.unclosedTags++;
            return new QueryInternal(this.builder);
        };
        return ViewInternal;
    })();

    /** Represents SharePoint CAML Query element */
    var QueryInternal = (function () {
        function QueryInternal(builder) {
            this.builder = builder || new Builder();
        }
        /** Adds Where clause to the query, inside you can specify conditions for certain field values. */
        QueryInternal.prototype.Where = function () {
            this.builder.WriteStart("Where");
            this.builder.unclosedTags++;
            return new FieldExpression(this.builder);
        };
        return QueryInternal;
    })();
    var JoinsManager = (function () {
        function JoinsManager(builder, viewInternal) {
            this.projectedFields = [];
            this.joins = [];
            this.originalView = viewInternal;
            this.builder = builder;
        }
        JoinsManager.prototype.Finalize = function () {
            if (this.joins.length > 0) {
                this.builder.WriteStart("Joins");
                for (var i = 0; i < this.joins.length; i++) {
                    var join = this.joins[i];
                    this.builder.WriteStart("Join", [
                        { Name: "Type", Value: join.JoinType },
                        { Name: "ListAlias", Value: join.Alias }
                    ]);
                    this.builder.WriteStart("Eq");
                    this.builder.WriteFieldRef(join.RefFieldName, { RefType: "ID" });
                    this.builder.WriteFieldRef("ID", { List: join.Alias });
                    this.builder.WriteEnd();
                    this.builder.WriteEnd();
                }
                this.builder.WriteEnd();
                this.builder.WriteStart("ProjectedFields");
                for (var i = 0; i < this.projectedFields.length; i++) {
                    var projField = this.projectedFields[i];
                    this.builder.WriteStart("Field", [
                        { Name: "ShowField", Value: projField.FieldName },
                        { Name: "Type", Value: "Lookup" },
                        { Name: "Name", Value: projField.Alias },
                        { Name: "List", Value: projField.JoinAlias }
                    ]);
                    this.builder.WriteEnd();
                }
                this.builder.WriteEnd();
            }
        };

        JoinsManager.prototype.Join = function (lookupFieldInternalName, alias, joinType) {
            this.joins.push({ RefFieldName: lookupFieldInternalName, Alias: alias, JoinType: joinType });
            return new Join(this.builder, this);
        };
        JoinsManager.prototype.ProjectedField = function (remoteFieldInternalName, remoteFieldAlias) {
            this.projectedFields.push({ FieldName: remoteFieldInternalName, Alias: remoteFieldAlias, JoinAlias: this.joins[this.joins.length - 1].Alias });
            return this.originalView;
        };
        return JoinsManager;
    })();
    var Join = (function () {
        function Join(builder, joinsManager) {
            this.builder = builder;
            this.joinsManager = joinsManager;
        }
        /** Select projected field for using in the main Query body
        @param remoteFieldAlias By this alias, the field can be used in the main Query body. */
        Join.prototype.Select = function (remoteFieldInternalName, remoteFieldAlias) {
            return this.joinsManager.ProjectedField(remoteFieldInternalName, remoteFieldAlias);
        };
        Join.prototype.InnerJoin = function (lookupFieldInternalName, alias) {
            return this.joinsManager.Join(lookupFieldInternalName, alias, "INNER");
        };
        Join.prototype.LeftJoin = function (lookupFieldInternalName, alias) {
            return this.joinsManager.Join(lookupFieldInternalName, alias, "LEFT");
        };
        return Join;
    })();
    var QueryToken = (function () {
        function QueryToken(builder, startIndex) {
            this.builder = builder;
            this.startIndex = startIndex;
        }
        /** Adds And clause to the query. */
        QueryToken.prototype.And = function () {
            this.builder.tree.splice(this.startIndex, 0, { Element: "Start", Name: "And" });
            this.builder.unclosedTags++;
            return new FieldExpression(this.builder);
        };

        /** Adds Or clause to the query. */
        QueryToken.prototype.Or = function () {
            this.builder.tree.splice(this.startIndex, 0, { Element: "Start", Name: "Or" });
            this.builder.unclosedTags++;
            return new FieldExpression(this.builder);
        };

        /** Adds GroupBy clause to the query.
        @param collapse If true, only information about the groups is retrieved, otherwise items are also retrieved. */
        QueryToken.prototype.GroupBy = function (groupFieldName, collapse) {
            this.builder.WriteStartGroupBy(groupFieldName, collapse);
            return new GroupedQuery(this.builder);
        };

        /** Adds OrderBy clause to the query
        @param fieldInternalName Internal field of the first field by that the data will be sorted (ascending)
        @param override This is only necessary for large lists. DON'T use it unless you know what it is for!
        @param useIndexForOrderBy This is only necessary for large lists. DON'T use it unless you know what it is for!
        */
        QueryToken.prototype.OrderBy = function (fieldInternalName, override, useIndexForOrderBy) {
            this.builder.WriteStartOrderBy(override, useIndexForOrderBy);
            this.builder.WriteFieldRef(fieldInternalName);
            return new SortedQuery(this.builder);
        };

        /** Adds OrderBy clause to the query (using descending order for the first field).
        @param fieldInternalName Internal field of the first field by that the data will be sorted (descending)
        @param override This is only necessary for large lists. DON'T use it unless you know what it is for!
        @param useIndexForOrderBy This is only necessary for large lists. DON'T use it unless you know what it is for!
        */
        QueryToken.prototype.OrderByDesc = function (fieldInternalName, override, useIndexForOrderBy) {
            this.builder.WriteStartOrderBy(override, useIndexForOrderBy);
            this.builder.WriteFieldRef(fieldInternalName, { Descending: true });
            return new SortedQuery(this.builder);
        };

        /** Returns the XML string representing the generated CAML
        */
        QueryToken.prototype.ToString = function () {
            return this.builder.Finalize();
        };

        /** Returns SP.CamlQuery object that represents the constructed query
        */
        QueryToken.prototype.ToCamlQuery = function () {
            return this.builder.FinalizeToSPQuery();
        };
        return QueryToken;
    })();

    var FieldExpression = (function () {
        function FieldExpression(builder) {
            this.builder = builder;
        }
        /** Specifies that a condition will be tested against the field with the specified internal name, and the type of this field is Text */
        FieldExpression.prototype.TextField = function (internalName) {
            return new FieldExpressionToken(this.builder, internalName, "Text");
        };

        /** Specifies that a condition will be tested against the field with the specified internal name, and the type of this field is Boolean */
        FieldExpression.prototype.BooleanField = function (internalName) {
            return new FieldExpressionToken(this.builder, internalName, "Integer");
        };

        /** Specifies that a condition will be tested against the field with the specified internal name, and the type of this field is URL */
        FieldExpression.prototype.UrlField = function (internalName) {
            return new FieldExpressionToken(this.builder, internalName, "URL");
        };

        /** Specifies that a condition will be tested against the field with the specified internal name, and the type of this field is Number */
        FieldExpression.prototype.NumberField = function (internalName) {
            return new FieldExpressionToken(this.builder, internalName, "Number");
        };

        /** Specifies that a condition will be tested against the field with the specified internal name, and the type of this field is Integer */
        FieldExpression.prototype.IntegerField = function (internalName) {
            return new FieldExpressionToken(this.builder, internalName, "Integer");
        };

        /** Specifies that a condition will be tested against the field with the specified internal name, and the type of this field is Counter (usually ID field) */
        FieldExpression.prototype.CounterField = function (internalName) {
            return new FieldExpressionToken(this.builder, internalName, "Counter");
        };

        /** Specifies that a condition will be tested against the field with the specified internal name, and the type of this field is User */
        FieldExpression.prototype.UserField = function (internalName) {
            return new UserFieldExpression(this.builder, internalName);
        };

        /** Specifies that a condition will be tested against the field with the specified internal name, and the type of this field is Lookup */
        FieldExpression.prototype.LookupField = function (internalName) {
            return new LookupFieldExpression(this.builder, internalName);
        };

        /** Specifies that a condition will be tested against the field with the specified internal name, and the type of this field is LookupMulti */
        FieldExpression.prototype.LookupMultiField = function (internalName) {
            return new LookupOrUserMultiFieldExpression(this.builder, internalName, 1 /* LookupMulti */);
        };

        /** Specifies that a condition will be tested against the field with the specified internal name, and the type of this field is UserMulti */
        FieldExpression.prototype.UserMultiField = function (internalName) {
            return new LookupOrUserMultiFieldExpression(this.builder, internalName, 0 /* UserMulti */);
        };

        /** Specifies that a condition will be tested against the field with the specified internal name, and the type of this field is Date */
        FieldExpression.prototype.DateField = function (internalName) {
            return new FieldExpressionToken(this.builder, internalName, "Date");
        };

        /** Specifies that a condition will be tested against the field with the specified internal name, and the type of this field is DateTime */
        FieldExpression.prototype.DateTimeField = function (internalName) {
            return new FieldExpressionToken(this.builder, internalName, "DateTime");
        };

        /** Used in queries for retrieving recurring calendar events.
        @param overlapType Defines type of overlap: return all events for a day, for a week, for a month or for a year
        @param calendarDate Defines date that will be used for determining events for which exactly day/week/month/year will be returned.
        This value is ignored for overlapType=Now, but for the other overlap types it is mandatory.
        This value will cause generation of QueryOptions/CalendarDate element.
        @param eventDateField Internal name of "Start Time" field (default: "EventDate" - all OOTB Calendar lists use this name)
        @param endDateField Internal name of "End Time" field (default: "EndDate" - all OOTB Calendar lists use this name)
        @param recurrenceIDField Internal name of "Recurrence ID" field (default: "RecurrenceID" - all OOTB Calendar lists use this name)
        */
        FieldExpression.prototype.DateRangesOverlap = function (overlapType, calendarDate, eventDateField, endDateField, recurrenceIDField) {
            var pos = this.builder.tree.length;

            this.builder.WriteStart("DateRangesOverlap");
            this.builder.WriteFieldRef(eventDateField || "EventDate");
            this.builder.WriteFieldRef(endDateField || "EndDate");
            this.builder.WriteFieldRef(recurrenceIDField || "RecurrenceID");

            var value;
            switch (overlapType) {
                case 0 /* Now */:
                    value = CamlValues.Now;
                    break;
                case 1 /* Day */:
                    value = CamlValues.Today;
                    break;
                case 2 /* Week */:
                    value = "{Week}";
                    break;
                case 3 /* Month */:
                    value = "{Month}";
                    break;
                case 4 /* Year */:
                    value = "{Year}";
                    break;
            }

            this.builder.WriteValueElement("Date", value);
            this.builder.WriteEnd();

            // TODO: write CalendarDate to QueryOptions
            return new QueryToken(this.builder, pos);
        };

        /** Adds And clauses to the query. Use for creating bracket-expressions in conjuction with CamlBuilder.Expression(). */
        FieldExpression.prototype.All = function () {
            var conditions = [];
            for (var _i = 0; _i < (arguments.length - 0); _i++) {
                conditions[_i] = arguments[_i + 0];
            }
            var pos = this.builder.tree.length;

            if (conditions.length == 1 && conditions[0] instanceof Array)
                conditions = conditions[0];

            conditions.reverse();
            for (var i = 0; i < conditions.length; i++) {
                var conditionBuilder = conditions[i]["builder"];
                if (conditionBuilder.unclosedTags > 0)
                    conditionBuilder.WriteEnd(conditionBuilder.unclosedTags);
                if (i > 0) {
                    conditionBuilder.tree.splice(0, 0, { Element: "Start", Name: "And" });
                    this.builder.WriteEnd();
                }
                Array.prototype.splice.apply(this.builder.tree, [pos, 0].concat(conditionBuilder.tree));
            }
            return new QueryToken(this.builder, pos);
        };

        /** Adds Or clauses to the query. Use for creating bracket-expressions in conjuction with CamlBuilder.Expression(). */
        FieldExpression.prototype.Any = function () {
            var conditions = [];
            for (var _i = 0; _i < (arguments.length - 0); _i++) {
                conditions[_i] = arguments[_i + 0];
            }
            var pos = this.builder.tree.length;

            if (conditions.length == 1 && conditions[0] instanceof Array)
                conditions = conditions[0];

            conditions.reverse();
            for (var i = 0; i < conditions.length; i++) {
                var conditionBuilder = conditions[i]["builder"];
                if (conditionBuilder.unclosedTags > 0)
                    conditionBuilder.WriteEnd(conditionBuilder.unclosedTags);
                if (i > 0) {
                    conditionBuilder.tree.splice(0, 0, { Element: "Start", Name: "Or" });
                    this.builder.WriteEnd();
                }
                Array.prototype.splice.apply(this.builder.tree, [pos, 0].concat(conditionBuilder.tree));
            }
            return new QueryToken(this.builder, pos);
        };
        return FieldExpression;
    })();

    var FieldMultiExpressionType;
    (function (FieldMultiExpressionType) {
        FieldMultiExpressionType[FieldMultiExpressionType["UserMulti"] = 0] = "UserMulti";
        FieldMultiExpressionType[FieldMultiExpressionType["LookupMulti"] = 1] = "LookupMulti";
    })(FieldMultiExpressionType || (FieldMultiExpressionType = {}));

    var LookupOrUserMultiFieldExpression = (function () {
        function LookupOrUserMultiFieldExpression(builder, name, type) {
            this.builder = builder;
            this.name = name;
            this.type = type;
            if (this.type == 0 /* UserMulti */)
                this.typeAsString = "UserMulti";
            else
                this.typeAsString = "LookupMulti";
        }
        LookupOrUserMultiFieldExpression.prototype.IncludesSuchItemThat = function () {
            if (this.type == 1 /* LookupMulti */)
                return new LookupFieldExpression(this.builder, this.name);
            else
                return new UserFieldExpression(this.builder, this.name);
        };

        LookupOrUserMultiFieldExpression.prototype.IsNull = function () {
            return new FieldExpressionToken(this.builder, this.name, this.typeAsString, false).IsNull();
        };

        LookupOrUserMultiFieldExpression.prototype.IsNotNull = function () {
            return new FieldExpressionToken(this.builder, this.name, this.typeAsString, false).IsNotNull();
        };

        LookupOrUserMultiFieldExpression.prototype.Includes = function (value) {
            return new FieldExpressionToken(this.builder, this.name, this.typeAsString, false).EqualTo(value);
        };

        LookupOrUserMultiFieldExpression.prototype.NotIncludes = function (value) {
            return new FieldExpressionToken(this.builder, this.name, this.typeAsString, false).NotEqualTo(value);
        };

        LookupOrUserMultiFieldExpression.prototype.EqualTo = function (value) {
            return new FieldExpressionToken(this.builder, this.name, this.typeAsString, false).EqualTo(value);
        };

        LookupOrUserMultiFieldExpression.prototype.NotEqualTo = function (value) {
            return new FieldExpressionToken(this.builder, this.name, this.typeAsString, false).NotEqualTo(value);
        };
        return LookupOrUserMultiFieldExpression;
    })();

    var LookupFieldExpression = (function () {
        function LookupFieldExpression(builder, name) {
            this.builder = builder;
            this.name = name;
        }
        LookupFieldExpression.prototype.Id = function () {
            return new FieldExpressionToken(this.builder, this.name, "Integer", true);
        };
        LookupFieldExpression.prototype.Value = function () {
            return new FieldExpressionToken(this.builder, this.name, "Lookup");
        };
        LookupFieldExpression.prototype.ValueAsText = function () {
            return new FieldExpressionToken(this.builder, this.name, "Text");
        };
        LookupFieldExpression.prototype.ValueAsNumber = function () {
            return new FieldExpressionToken(this.builder, this.name, "Number");
        };
        LookupFieldExpression.prototype.ValueAsDateTime = function () {
            return new FieldExpressionToken(this.builder, this.name, "DateTime");
        };
        LookupFieldExpression.prototype.ValueAsDate = function () {
            return new FieldExpressionToken(this.builder, this.name, "Date");
        };
        LookupFieldExpression.prototype.ValueAsBoolean = function () {
            return new FieldExpressionToken(this.builder, this.name, "Integer");
        };
        return LookupFieldExpression;
    })();

    var UserFieldExpression = (function () {
        function UserFieldExpression(builder, name) {
            var self = this;
            this.builder = builder;
            this.name = name;
            this.startIndex = builder.tree.length;
            this.Membership = {
                /** DEPRECATED. Please use UserField(...).IsInCurrentUserGroups() instead */
                CurrentUserGroups: function () {
                    return self.IsInCurrentUserGroups();
                },
                /** DEPRECATED. Please use UserField(...).IsInSPGroup() instead */
                SPGroup: function (groupId) {
                    return self.IsInSPGroup(groupId);
                },
                /** DEPRECATED. Please use UserField(...).IsInSPWeb* methods instead */
                SPWeb: {
                    /** DEPRECATED. Please use UserField(...).IsInSPWebAllUsers() instead */
                    AllUsers: function () {
                        return self.IsInSPWebAllUsers();
                    },
                    /** DEPRECATED. Please use UserField(...).IsInSPWebUsers() instead */
                    Users: function () {
                        return self.IsInSPWebUsers();
                    },
                    /** DEPRECATED. Please use UserField(...).IsInSPWebGroups() instead */
                    Groups: function () {
                        return self.IsInSPWebGroups();
                    }
                }
            };
        }
        UserFieldExpression.prototype.Id = function () {
            return new FieldExpressionToken(this.builder, this.name, "Integer", true);
        };
        UserFieldExpression.prototype.ValueAsText = function () {
            return new FieldExpressionToken(this.builder, this.name, "Text");
        };
        UserFieldExpression.prototype.EqualToCurrentUser = function () {
            this.builder.WriteFieldRef(this.name, { LookupId: true });
            this.builder.WriteBinaryOperation(this.startIndex, "Eq", "Integer", "{UserID}");
            return new QueryToken(this.builder, this.startIndex);
        };
        UserFieldExpression.prototype.IsInCurrentUserGroups = function () {
            this.builder.WriteFieldRef(this.name);
            this.builder.WriteMembership(this.startIndex, "CurrentUserGroups");
            return new QueryToken(this.builder, this.startIndex);
        };
        UserFieldExpression.prototype.IsInSPGroup = function (groupId) {
            this.builder.WriteFieldRef(this.name);
            this.builder.WriteMembership(this.startIndex, "SPGroup", groupId);
            return new QueryToken(this.builder, this.startIndex);
        };
        UserFieldExpression.prototype.IsInSPWebGroups = function () {
            this.builder.WriteFieldRef(this.name);
            this.builder.WriteMembership(this.startIndex, "SPWeb.Groups");
            return new QueryToken(this.builder, this.startIndex);
        };
        UserFieldExpression.prototype.IsInSPWebAllUsers = function () {
            this.builder.WriteFieldRef(this.name);
            this.builder.WriteMembership(this.startIndex, "SPWeb.AllUsers");
            return new QueryToken(this.builder, this.startIndex);
        };
        UserFieldExpression.prototype.IsInSPWebUsers = function () {
            this.builder.WriteFieldRef(this.name);
            this.builder.WriteMembership(this.startIndex, "SPWeb.Users");
            return new QueryToken(this.builder, this.startIndex);
        };
        return UserFieldExpression;
    })();

    var FieldExpressionToken = (function () {
        function FieldExpressionToken(builder, name, valueType, isLookupId) {
            this.builder = builder;
            this.name = name;
            this.startIndex = builder.tree.length;
            this.valueType = valueType;

            this.builder.WriteFieldRef(name, { LookupId: isLookupId });
        }
        FieldExpressionToken.prototype.IsTrue = function () {
            this.builder.WriteBinaryOperation(this.startIndex, "Eq", "Integer", "1");
            return new QueryToken(this.builder, this.startIndex);
        };
        FieldExpressionToken.prototype.IsFalse = function () {
            this.builder.WriteBinaryOperation(this.startIndex, "Eq", "Integer", "0");
            return new QueryToken(this.builder, this.startIndex);
        };

        FieldExpressionToken.prototype.IsNull = function () {
            this.builder.WriteUnaryOperation(this.startIndex, "IsNull");
            return new QueryToken(this.builder, this.startIndex);
        };
        FieldExpressionToken.prototype.IsNotNull = function () {
            this.builder.WriteUnaryOperation(this.startIndex, "IsNotNull");
            return new QueryToken(this.builder, this.startIndex);
        };
        FieldExpressionToken.prototype.EqualTo = function (value) {
            if (value instanceof Date)
                value = value.toISOString();
            this.builder.WriteBinaryOperation(this.startIndex, "Eq", this.valueType, value);
            return new QueryToken(this.builder, this.startIndex);
        };
        FieldExpressionToken.prototype.GreaterThan = function (value) {
            if (value instanceof Date)
                value = value.toISOString();
            this.builder.WriteBinaryOperation(this.startIndex, "Gt", this.valueType, value);
            return new QueryToken(this.builder, this.startIndex);
        };
        FieldExpressionToken.prototype.LessThan = function (value) {
            if (value instanceof Date)
                value = value.toISOString();
            this.builder.WriteBinaryOperation(this.startIndex, "Lt", this.valueType, value);
            return new QueryToken(this.builder, this.startIndex);
        };
        FieldExpressionToken.prototype.GreaterThanOrEqualTo = function (value) {
            if (value instanceof Date)
                value = value.toISOString();
            this.builder.WriteBinaryOperation(this.startIndex, "Geq", this.valueType, value);
            return new QueryToken(this.builder, this.startIndex);
        };
        FieldExpressionToken.prototype.LessThanOrEqualTo = function (value) {
            if (value instanceof Date)
                value = value.toISOString();
            this.builder.WriteBinaryOperation(this.startIndex, "Leq", this.valueType, value);
            return new QueryToken(this.builder, this.startIndex);
        };
        FieldExpressionToken.prototype.NotEqualTo = function (value) {
            if (value instanceof Date)
                value = value.toISOString();
            this.builder.WriteBinaryOperation(this.startIndex, "Neq", this.valueType, value);
            return new QueryToken(this.builder, this.startIndex);
        };
        FieldExpressionToken.prototype.Contains = function (value) {
            this.builder.WriteBinaryOperation(this.startIndex, "Contains", this.valueType, value);
            return new QueryToken(this.builder, this.startIndex);
        };
        FieldExpressionToken.prototype.BeginsWith = function (value) {
            this.builder.WriteBinaryOperation(this.startIndex, "BeginsWith", this.valueType, value);
            return new QueryToken(this.builder, this.startIndex);
        };
        FieldExpressionToken.prototype.In = function (arrayOfValues) {
            this.builder.tree.splice(this.startIndex, 0, { Element: "Start", Name: "In" });
            this.builder.WriteStart("Values");

            for (var i = 0; i < arrayOfValues.length; i++) {
                var value = arrayOfValues[i];
                if (value instanceof Date)
                    value = value.toISOString();
                this.builder.WriteValueElement(this.valueType, value);
            }

            this.builder.WriteEnd();
            this.builder.WriteEnd();

            return new QueryToken(this.builder, this.startIndex);
        };
        return FieldExpressionToken;
    })();

    var GroupedQuery = (function () {
        function GroupedQuery(builder) {
            this.builder = builder;
        }
        GroupedQuery.prototype.OrderBy = function (fieldInternalName, override, useIndexForOrderBy) {
            this.builder.WriteStartOrderBy(override, useIndexForOrderBy);
            this.builder.WriteFieldRef(fieldInternalName);
            return new SortedQuery(this.builder);
        };

        GroupedQuery.prototype.OrderByDesc = function (fieldInternalName, override, useIndexForOrderBy) {
            this.builder.WriteStartOrderBy(override, useIndexForOrderBy);
            this.builder.WriteFieldRef(fieldInternalName, { Descending: true });
            return new SortedQuery(this.builder);
        };

        GroupedQuery.prototype.ToString = function () {
            return this.builder.Finalize();
        };

        GroupedQuery.prototype.ToCamlQuery = function () {
            return this.builder.FinalizeToSPQuery();
        };
        return GroupedQuery;
    })();

    var SortedQuery = (function () {
        function SortedQuery(builder) {
            this.builder = builder;
        }
        SortedQuery.prototype.ThenBy = function (fieldInternalName, override, useIndexForOrderBy) {
            this.builder.WriteFieldRef(fieldInternalName);
            return new SortedQuery(this.builder);
        };

        SortedQuery.prototype.ThenByDesc = function (fieldInternalName, override, useIndexForOrderBy) {
            this.builder.WriteFieldRef(fieldInternalName, { Descending: true });
            return new SortedQuery(this.builder);
        };

        SortedQuery.prototype.ToString = function () {
            return this.builder.Finalize();
        };

        SortedQuery.prototype.ToCamlQuery = function () {
            return this.builder.FinalizeToSPQuery();
        };
        return SortedQuery;
    })();

    var Builder = (function () {
        function Builder() {
            this.tree = new Array();
            this.unclosedTags = 0;
        }
        Builder.prototype.SetAttributeToLastElement = function (tagName, attributeName, attributeValue) {
            for (var i = this.tree.length - 1; i >= 0; i--) {
                if (this.tree[i].Name == tagName) {
                    this.tree[i].Attributes = this.tree[i].Attributes || [];
                    this.tree[i].Attributes.push({ Name: attributeName, Value: attributeValue });
                    return;
                }
            }
            console.log("CamlJs ERROR: can't find element '" + tagName + "' in the tree while setting attribute " + attributeName + " to '" + attributeValue + "'!");
        };
        Builder.prototype.WriteRowLimit = function (paged, limit) {
            if (paged)
                this.tree.push({ Element: "Start", Name: "RowLimit", Attributes: [{ Name: "Paged", Value: "TRUE" }] });
            else
                this.tree.push({ Element: "Start", Name: "RowLimit" });

            this.tree.push({ Element: "Raw", Xml: limit });

            this.tree.push({ Element: "End" });
        };
        Builder.prototype.WriteStart = function (tagName, attributes) {
            if (attributes)
                this.tree.push({ Element: "Start", Name: tagName, Attributes: attributes });
            else
                this.tree.push({ Element: "Start", Name: tagName });
        };
        Builder.prototype.WriteEnd = function (count) {
            if (count > 0)
                this.tree.push({ Element: "End", Count: count });
            else
                this.tree.push({ Element: "End" });
        };
        Builder.prototype.WriteFieldRef = function (fieldInternalName, options) {
            var fieldRef = { Element: 'FieldRef', Name: fieldInternalName };
            for (var name in options || {}) {
                fieldRef[name] = options[name];
            }
            this.tree.push(fieldRef);
        };
        Builder.prototype.WriteValueElement = function (valueType, value) {
            if (valueType == "Date")
                this.tree.push({ Element: "Value", ValueType: "DateTime", Value: value });
            else if (valueType == "DateTime")
                this.tree.push({ Element: "Value", ValueType: "DateTime", Value: value, IncludeTimeValue: true });
            else
                this.tree.push({ Element: "Value", ValueType: valueType, Value: value });
        };
        Builder.prototype.WriteMembership = function (startIndex, type, groupId) {
            var attributes = [{ Name: "Type", Value: type }];
            if (groupId) {
                attributes.push({ Name: "ID", Value: groupId });
            }
            this.tree.splice(startIndex, 0, { Element: "Start", Name: "Membership", Attributes: attributes });
            this.WriteEnd();
        };
        Builder.prototype.WriteUnaryOperation = function (startIndex, operation) {
            this.tree.splice(startIndex, 0, { Element: "Start", Name: operation });
            this.WriteEnd();
        };
        Builder.prototype.WriteBinaryOperation = function (startIndex, operation, valueType, value) {
            this.tree.splice(startIndex, 0, { Element: "Start", Name: operation });
            this.WriteValueElement(valueType, value);
            this.WriteEnd();
        };
        Builder.prototype.WriteStartGroupBy = function (groupFieldName, collapse) {
            if (this.unclosedTags > 0) {
                var tagsToClose = this.unclosedTags;
                if (this.tree[0].Name == "Query")
                    tagsToClose--;
                else if (this.tree[0].Name == "View")
                    tagsToClose -= 2;
                this.tree.push({ Element: "End", Count: tagsToClose });
                this.unclosedTags -= tagsToClose;
            }
            if (collapse)
                this.tree.push({ Element: "Start", Name: "GroupBy", Attributes: [{ Name: "Collapse", Value: "TRUE" }] });
            else
                this.tree.push({ Element: "Start", Name: "GroupBy" });
            this.tree.push({ Element: "FieldRef", Name: groupFieldName });
            this.WriteEnd();
        };
        Builder.prototype.WriteStartOrderBy = function (override, useIndexForOrderBy) {
            if (this.unclosedTags > 0) {
                var tagsToClose = this.unclosedTags;
                if (this.tree[0].Name == "Query")
                    tagsToClose--;
                else if (this.tree[0].Name == "View")
                    tagsToClose -= 2;
                this.tree.push({ Element: "End", Count: tagsToClose });
                this.unclosedTags -= tagsToClose;
            }

            var attributes = new Array();
            if (override)
                attributes.push({ Name: "Override", Value: "TRUE" });
            if (useIndexForOrderBy)
                attributes.push({ Name: "UseIndexForOrderBy", Value: "TRUE" });
            if (attributes.length > 0)
                this.tree.push({ Element: "Start", Name: "OrderBy", Attributes: attributes });
            else
                this.tree.push({ Element: "Start", Name: "OrderBy" });
            this.unclosedTags++;
        };
        Builder.prototype.Finalize = function () {
            var sb = new window["Sys"].StringBuilder();
            var writer = window["SP"].XmlWriter.create(sb);
            for (var i = 0; i < this.tree.length; i++) {
                if (this.tree[i].Element == "FieldRef") {
                    writer.writeStartElement("FieldRef");
                    writer.writeAttributeString("Name", this.tree[i].Name);
                    if (this.tree[i].LookupId)
                        writer.writeAttributeString("LookupId", "True");
                    if (this.tree[i].Descending)
                        writer.writeAttributeString("Ascending", "False");
                    for (var attr in this.tree[i]) {
                        if (attr == "Element" || attr == "Name" || attr == "LookupId" || attr == "Descending")
                            continue;
                        writer.writeAttributeString(attr, this.tree[i][attr]);
                    }
                    writer.writeEndElement();
                } else if (this.tree[i].Element == "Start") {
                    writer.writeStartElement(this.tree[i].Name);
                    if (this.tree[i].Attributes) {
                        for (var a = 0; a < this.tree[i].Attributes.length; a++) {
                            writer.writeAttributeString(this.tree[i].Attributes[a].Name, this.tree[i].Attributes[a].Value);
                        }
                    }
                } else if (this.tree[i].Element == "Raw") {
                    writer.writeRaw(this.tree[i].Xml);
                } else if (this.tree[i].Element == "Value") {
                    writer.writeStartElement("Value");
                    if (this.tree[i].IncludeTimeValue === true)
                        writer.writeAttributeString("IncludeTimeValue", "True");
                    writer.writeAttributeString("Type", this.tree[i].ValueType);
                    var value = this.tree[i].Value.toString();
                    if (value.slice(0, 1) == "{" && value.slice(-1) == "}")
                        writer.writeRaw("<" + value.slice(1, value.length - 1) + " />");
                    else
                        writer.writeString(value);

                    writer.writeEndElement();
                } else if (this.tree[i].Element == "End") {
                    var count = this.tree[i].Count;
                    if (count) {
                        while (count > 0) {
                            count--;
                            writer.writeEndElement();
                        }
                    } else {
                        writer.writeEndElement();
                    }
                }
            }

            while (this.unclosedTags > 0) {
                this.unclosedTags--;
                writer.writeEndElement();
            }

            this.tree = new Array();
            writer.close();
            return sb.toString();
        };
        Builder.prototype.FinalizeToSPQuery = function () {
            var camlWhere = this.Finalize();
            var query = new window["SP"].CamlQuery();
            query.set_viewXml("<View><Query>" + camlWhere + "</Query></View>");
            return query;
        };
        return Builder;
    })();
    var CamlValues = (function () {
        function CamlValues() {
        }
        /** Dynamic value that represents current date with specified offset (may be negative) */
        CamlValues.TodayWithOffset = function (offsetDays) {
            return "{Today OffsetDays=\"" + offsetDays + "\"}";
        };
        CamlValues.UserID = "{UserID}";

        CamlValues.Today = "{Today}";

        CamlValues.Now = "{Now}";

        CamlValues.ListProperty = {
            /** Date and time the list was created. */
            Created: "{ListProperty Name=\"Created\"}",
            /** Server-relative URL of the default list view. */
            DefaultViewUrl: "{ListProperty Name=\"DefaultViewUrl\"}",
            /** Description of the list. */
            Description: "{ListProperty Name=\"Description\"}",
            /** Determines if RSS syndication is enabled for the list */
            EnableSyndication: "{ListProperty Name=\"EnableSyndication\"}",
            /** Number of items in the list */
            ItemCount: "{ListProperty Name=\"ItemCount\"}",
            /** Title linked to the list */
            LinkTitle: "{ListProperty Name=\"LinkTitle\"}",
            /** For a document library that uses version control with major versions only, maximum number of major versions allowed for items. */
            MajorVersionLimit: "{ListProperty Name=\"MajorVersionLimit\"}",
            /** For a document library that uses version control with both major and minor versions, maximum number of major versions allowed for items. */
            MajorWithMinorVersionsLimit: "{ListProperty Name=\"MajorWithMinorVersionsLimit\"}",
            /** Site-relative URL for the list. */
            RelativeFolderPath: "{ListProperty Name=\"RelativeFolderPath\"}",
            /** Title of the list. */
            Title: "{ListProperty Name=\"Title\"}",
            /** View selector with links to views for the list. */
            ViewSelector: "{ListProperty Name=\"ViewSelector\"}"
        };

        CamlValues.ProjectProperty = {
            /** Category of the current post item. */
            BlogCategoryTitle: "{ProjectProperty Name=\"BlogCategoryTitle\"}",
            /** Title of the current post item. */
            BlogPostTitle: "{ProjectProperty Name=\"BlogPostTitle\"}",
            /** Represents a description for the current website. */
            Description: "{ProjectProperty Name=\"Description\"}",
            /** Represents a value that determines whether the recycle bin is enabled for the current website. */
            RecycleBinEnabled: "{ProjectProperty Name=\"RecycleBinEnabled\"}",
            /** User name of the owner for the current site collection. */
            SiteOwnerName: "{ProjectProperty Name=\"SiteOwnerName\"}",
            /** Full URL of the current site collection. */
            SiteUrl: "{ProjectProperty Name=\"SiteUrl\"}",
            /** Title of the current Web site. */
            Title: "{ProjectProperty Name=\"Title\"}",
            /** Full URL of the current Web site. */
            Url: "{ProjectProperty Name=\"Url\"}"
        };
        return CamlValues;
    })();
    CamlBuilder.CamlValues = CamlValues;
})(CamlBuilder || (CamlBuilder = {}));

// -------------------- Dependencies ------------------
if (typeof (window["Sys"]) == "undefined" || window["Sys"] == null) {
    window["Sys"] = {};
    window["Sys"].StringBuilder = function Sys$StringBuilder(initialText) {
        this._parts = (typeof (initialText) !== 'undefined' && initialText !== null && initialText !== '') ? [initialText.toString()] : [];
        this._value = {};
        this._len = 0;
    };

    function Sys$StringBuilder$append(text) {
        this._parts[this._parts.length] = text;
    }
    function Sys$StringBuilder$appendLine(text) {
        this._parts[this._parts.length] = ((typeof (text) === 'undefined') || (text === null) || (text === '')) ? '\r\n' : text + '\r\n';
    }
    function Sys$StringBuilder$clear() {
        this._parts = [];
        this._value = {};
        this._len = 0;
    }
    function Sys$StringBuilder$isEmpty() {
        if (this._parts.length === 0)
            return true;
        return this.toString() === '';
    }
    function Sys$StringBuilder$toString(separator) {
        separator = separator || '';
        var parts = this._parts;
        if (this._len !== parts.length) {
            this._value = {};
            this._len = parts.length;
        }
        var val = this._value;
        if (typeof (val[separator]) === 'undefined') {
            if (separator !== '') {
                for (var i = 0; i < parts.length;) {
                    if ((typeof (parts[i]) === 'undefined') || (parts[i] === '') || (parts[i] === null)) {
                        parts.splice(i, 1);
                    } else {
                        i++;
                    }
                }
            }
            val[separator] = this._parts.join(separator);
        }
        return val[separator];
    }

    window["Sys"].StringBuilder.prototype = {
        append: Sys$StringBuilder$append,
        appendLine: Sys$StringBuilder$appendLine,
        clear: Sys$StringBuilder$clear,
        isEmpty: Sys$StringBuilder$isEmpty,
        toString: Sys$StringBuilder$toString
    };
}

if (typeof window["SP"] == 'undefined') {
    window["SP"] = {};
    function SP_ScriptUtility$isNullOrEmptyString(str) {
        var strNull = null;

        return str === strNull || typeof str === 'undefined' || !str.length;
    }
    ;
    window["SP"].XmlWriter = function SP_XmlWriter($p0) {
        this.$f_0 = [];
        this.$1_0 = $p0;
        this.$V_0 = true;
    };
    window["SP"].XmlWriter.create = function SP_XmlWriter$create(sb) {
        return new window["SP"].XmlWriter(sb);
    };
    window["SP"].XmlWriter.prototype = {
        $1_0: null,
        $11_0: null,
        $V_0: false,
        $k_0: false,
        writeStartElement: function SP_XmlWriter$writeStartElement(tagName) {
            this.$1R_0();
            this.$1A_0();
            this.$f_0.push(tagName);
            this.$11_0 = tagName;
            this.$1_0.append('<');
            this.$1_0.append(tagName);
            this.$V_0 = false;
            this.$k_0 = false;
        },
        writeElementString: function SP_XmlWriter$writeElementString(tagName, value) {
            this.$1R_0();
            this.$1A_0();
            this.writeStartElement(tagName);
            this.writeString(value);
            this.writeEndElement();
        },
        writeEndElement: function SP_XmlWriter$writeEndElement() {
            this.$1R_0();
            if (SP_ScriptUtility$isNullOrEmptyString(this.$11_0)) {
                throw "Invalid operation";
            }
            if (!this.$V_0) {
                this.$1_0.append(' />');
                this.$V_0 = true;
            } else {
                this.$1_0.append('</');
                this.$1_0.append(this.$11_0);
                this.$1_0.append('>');
            }
            this.$f_0.pop();
            if (this.$f_0.length > 0) {
                this.$11_0 = this.$f_0[this.$f_0.length - 1];
            } else {
                this.$11_0 = null;
            }
        },
        $1A_0: function SP_XmlWriter$$1A_0() {
            if (!this.$V_0) {
                this.$1_0.append('>');
                this.$V_0 = true;
            }
        },
        writeAttributeString: function SP_XmlWriter$writeAttributeString(localName, value) {
            if (this.$V_0) {
                throw "Invalid operation";
            }
            this.$1_0.append(' ');
            this.$1_0.append(localName);
            this.$1_0.append('=\"');
            this.$1T_0(value, true);
            this.$1_0.append('\"');
        },
        writeStartAttribute: function SP_XmlWriter$writeStartAttribute(localName) {
            if (!this.$V_0) {
                throw "Invalid operation";
            }
            this.$k_0 = true;
            this.$1_0.append(' ');
            this.$1_0.append(localName);
            this.$1_0.append('=\"');
        },
        writeEndAttribute: function SP_XmlWriter$writeEndAttribute() {
            if (!this.$k_0) {
                throw "Invalid operation";
            }
            this.$1_0.append('\"');
            this.$k_0 = false;
        },
        writeString: function SP_XmlWriter$writeString(value) {
            if (this.$k_0) {
                this.$1T_0(value, true);
                this.$1_0.append(value);
            } else {
                this.$1A_0();
                this.$1T_0(value, false);
            }
        },
        writeRaw: function SP_XmlWriter$writeRaw(xml) {
            this.$1R_0();
            this.$1A_0();
            this.$1_0.append(xml);
        },
        $1R_0: function SP_XmlWriter$$1R_0() {
            if (this.$k_0) {
                throw "Invalid operation";
            }
        },
        $1T_0: function SP_XmlWriter$$1T_0($p0, $p1) {
            if (SP_ScriptUtility$isNullOrEmptyString($p0)) {
                return;
            }
            for (var $v_0 = 0; $v_0 < $p0.length; $v_0++) {
                var $v_1 = $p0.charCodeAt($v_0);

                if ($v_1 === 62) {
                    this.$1_0.append('&gt;');
                } else if ($v_1 === 60) {
                    this.$1_0.append('&lt;');
                } else if ($v_1 === 38) {
                    this.$1_0.append('&amp;');
                } else if ($v_1 === 34 && $p1) {
                    this.$1_0.append('&quot;');
                } else if ($v_1 === 39 && $p1) {
                    this.$1_0.append('&apos;');
                } else if ($v_1 === 9 && $p1) {
                    this.$1_0.append('&#09;');
                } else if ($v_1 === 10) {
                    this.$1_0.append('&#10;');
                } else if ($v_1 === 13) {
                    this.$1_0.append('&#13;');
                } else {
                    this.$1_0.append(($p0.charAt($v_0)).toString());
                }
            }
        },
        close: function SP_XmlWriter$close() {
        }
    };
}
//# sourceMappingURL=camljs.js.map

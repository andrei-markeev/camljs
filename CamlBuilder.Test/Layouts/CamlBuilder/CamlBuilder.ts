declare module Sys {
    export class StringBuilder {
        /** Appends a string to the string builder */
        append(s: string): void;
        /** Appends a line to the string builder */
        appendLine(s: string): void;
        /** Clears the contents of the string builder */
        clear(): void;
        /** Indicates wherever the string builder is empty */
        isEmpty(): bool;
        /** Gets the contents of the string builder as a string */
        toString(): string;
    }
}
declare module SP {
    /** Defines a writer that provides a set of methods to append text in XML format. Use the static SP.XmlWriter.create(sb) Method to create an SP.XmlWriter object with the Sys.StringBuilder object you pass in. */
    export class XmlWriter {
        /** Creates a new instance of the XmlWriter class with the specified string builder. */
        static create(sb: Sys.StringBuilder): SP.XmlWriter;
        /** Appends a start element tag with the specified name in XML format to the object?s string builder. */
        writeStartElement(tagName: string): void;
        /** Appends an element with the specified tag name and value in XML format to the string builder. */
        writeElementString(tagName: string, value: string): void;
        /** Appends an end element tag in XML format to the object?s string builder. This method appends the end element tag ?/>? if the start element tag is not closed; otherwise, it appends a full end element tag ?</tagName>? to the string builder. */
        writeEndElement(): void;
        /** Appends an attribute with the specified name and value in XML format to the object?s string builder. */
        writeAttributeString(localName: string, value: string): void;
        /** This method only appends the name of the attribute. You can append the value of the attribute by calling the SP.XmlWriter.writeString(value) Method, and close the attribute by calling the SP.XmlWriter.writeEndAttribute() Method. */
        writeStartAttribute(localName: string): void;
        /** Appends an end of an attribute in XML format to the object?s string builder. */
        writeEndAttribute(): void;
        /** Appends the specified value for an element tag or attribute to the object?s string builder. */
        writeString(value: string): void;
        /** Appends the specified text to the object?s string builder. */
        writeRaw(xml: string): void;
        /** This member is reserved for internal use and is not intended to be used directly from your code. */
        close(): void;
    }

}

class CamlBuilder {
    static Query(): CamlBuilderInternal.IQuery {
        return CamlBuilderInternal.Query.create();
    }
    static QueryPart(): CamlBuilderInternal.IFieldExpression {
        return CamlBuilderInternal.QueryPart.create();
    }
}

module CamlBuilderInternal {

    export interface IQuery extends IGroupable {
        Where(expressionBuilder: { (e: IFieldExpression): IQueryPart; }): IGroupable;
    }
    export interface IFinalizable {
        /** Get the resulting CAML query as string */
        ToString(): string;
    }
    export interface ISortable extends IFinalizable {
        /** Adds OrderBy clause to the query
            @param fieldInternalName Internal field of the first field by that the data will be sorted (ascending)
            @param override This is only necessary for large lists. DON'T use it unless you know what it is for!
            @param useIndexForOrderBy This is only necessary for large lists. DON'T use it unless you know what it is for!
        */
        OrderBy(fieldInternalName: string, override?: bool, useIndexForOrderBy?: bool): ISortedQuery;
        /** Adds OrderBy clause to the query (using descending order for the first field).
            @param fieldInternalName Internal field of the first field by that the data will be sorted (descending)
            @param override This is only necessary for large lists. DON'T use it unless you know what it is for!
            @param useIndexForOrderBy This is only necessary for large lists. DON'T use it unless you know what it is for!
        */
        OrderByDesc(fieldInternalName: string, override?: bool, useIndexForOrderBy?: bool): ISortedQuery;
    }
    export interface IGroupable extends ISortable {
        /** Adds GroupBy clause to the query.
            @param collapse If true, only information about the groups is retrieved, otherwise items are also retrieved. */
        GroupBy(fieldInternalName): IGroupedQuery;
    }

    export interface IQueryPart {
        /** Adds And clause to the query. */
        And(expressionBuilder: { (e: IFieldExpression): IQueryPart; }): IQueryPart;
        /** Adds Or clause to the query. */
        Or(expressionBuilder: { (e: IFieldExpression): IQueryPart; }): IQueryPart;
    }
    export interface IGroupedQuery extends ISortable {
    }
    export interface ISortedQuery extends IFinalizable {
        /** Specifies next order field (ascending) */
        ThenBy(fieldInternalName: string): any;
        /** Specifies next order field (descending) */
        ThenByDesc(fieldInternalName: string): any;
    }

    export interface IFieldExpression {
        /** Specifies that a condition will be tested against the field with the specified internal name, and the type of this field is Text */
        TextField(internalName: string): ITextFieldExpression;
        /** Specifies that a condition will be tested against the field with the specified internal name, and the type of this field is Boolean */
        BooleanField(internalName: string): IBooleanFieldExpression;
        /** Specifies that a condition will be tested against the field with the specified internal name, and the type of this field is Number */
        NumberField(internalName: string): INumberFieldExpression;
        /** Specifies that a condition will be tested against the field with the specified internal name, and the type of this field is User */
        UserField(internalName: string): IUserFieldExpression;
        /** Specifies that a condition will be tested against the field with the specified internal name, and the type of this field is Lookup */
        LookupField(internalName: string): ILookupFieldExpression;
        /** Specifies that a condition will be tested against the field with the specified internal name, and the type of this field is LookupMulti */
        LookupMultiField(internalName: string): ILookupMultiFieldExpression;
        /** Specifies that a condition will be tested against the field with the specified internal name, and the type of this field is Date */
        DateField(internalName: string): IDateTimeFieldExpression;
        /** Specifies that a condition will be tested against the field with the specified internal name, and the type of this field is DateTime */
        DateTimeField(internalName: string): IDateTimeFieldExpression;
        /** Used in queries to compare the dates in a recurring event with a specified DateTime value, to determine whether they overlap.
            Usually necessary in Calendar lists or Calendar views.
            @param eventDateField Internal name of "Start Time" field ("EventDate" for Calendar lists)
            @param endDateField Internal name of "End Time" field ("EndDate" for Calendar lists)
            @param recurrenceIDField Internal name of "Recurrence ID" field ("RecurrenceID" for Calendar lists)
         */
        DateRangesOverlap(eventDateField: string, endDateField: string, recurrenceIDField: string, dateTimeValue: string): IQueryPart;
    }
    export interface IBooleanFieldExpression {
        /** Checks whether the value of the field is True */
        IsTrue(): IQueryPart;
        /** Checks whether the value of the field is False */
        IsFalse(): IQueryPart;
        /** Checks whether the value of the field is equal to the specified value */
        IsEqualTo(value: bool): IQueryPart;
        /** Checks whether the value of the field is not equal to the specified value */
        IsNotEqualTo(value: bool): IQueryPart;
        /** Checks whether the value of the field was specified by user */
        IsNull(): IQueryPart;
        /** Checks whether the value of the field was specified by user */
        IsNotNull(): IQueryPart;
    }
    export interface INumberFieldExpression {
        IsEqualTo(value: number): IQueryPart;
        IsNotEqualTo(value: number): IQueryPart;
        IsGreaterThan(value: number): IQueryPart;
        IsLessThan(value: number): IQueryPart;
        IsGreaterThanOrEqualTo(value: number): IQueryPart;
        IsLessThanOrEqualTo(value: number): IQueryPart;
        IsNull(): IQueryPart;
        IsNotNull(): IQueryPart;
        In(arrayOfValues: number[]): IQueryPart;
    }
    export interface IDateTimeFieldExpression {
        IsEqualTo(value: string): IQueryPart;
        IsNotEqualTo(value: string): IQueryPart;
        IsGreaterThan(value: string): IQueryPart;
        IsLessThan(value: string): IQueryPart;
        IsGreaterThanOrEqualTo(value: string): IQueryPart;
        IsLessThanOrEqualTo(value: string): IQueryPart;
        IsNull(): IQueryPart;
        IsNotNull(): IQueryPart;
        In(arrayOfValues: string[]): IQueryPart;
    }
    export interface ITextFieldExpression {
        IsEqualTo(value: string): IQueryPart;
        IsNotEqualTo(value: string): IQueryPart;
        Contains(value: string): IQueryPart;
        BeginsWith(value: string): IQueryPart;
        IsNull(): IQueryPart;
        IsNotNull(): IQueryPart;
        In(arrayOfValues: string[]): IQueryPart;
    }
    export interface IUserFieldExpression {
        IsEqualToCurrentUser(): IQueryPart;
        IsInCurrentUserGroups(): IQueryPart;
        IsInSPGroup(): IQueryPart;
        IsInSPWebGroups(): IQueryPart;
        IsInSPWebAllUsers(): IQueryPart;
        IsInSPWebUsers(): IQueryPart;
        Id(): INumberFieldExpression;
        Value(): ITextFieldExpression;
    }
    export interface ILookupFieldExpression {
        Id(): INumberFieldExpression;
        Value(): ITextFieldExpression;
    }
    export interface ILookupMultiFieldExpression {
        Includes(value): IQueryPart;
        NotIncludes(value): IQueryPart;
    }

    export class Query {
        static create(): IQuery {
            return new QueryInternal();
        }
    }
    export class QueryPart {
        static create(): IFieldExpression {
            return new FieldExpression();
        }
    }

    /** Represents SharePoint CAML Query element */
    class QueryInternal {
        /** Creates Query CAML element */
        constructor() {
            this.builder.tree.push({ Element: "Start", Name: "Query" });
            this.builder.unclosedTags++;
            this.builder = new Builder();
        }
        private builder: Builder;
        /** Adds Where clause to the query, inside you can specify conditions for certain field values. */
        Where(expressionBuilder: { (e: IFieldExpression): IQueryPart; }): IGroupable {
            var part = expressionBuilder(new FieldExpression());
            this.builder.tree.push({ Element: "Start", Name: "Where" });
            this.builder.unclosedTags++;
            var partBuilder = <Builder>part["builder"];
            this.builder.tree.push(partBuilder.tree);
            return this;
        }
        /** Adds GroupBy clause to the query.
            @param collapse If true, only information about the groups is retrieved, otherwise items are also retrieved. */
        GroupBy(groupFieldName: string, collapse?: bool): IGroupedQuery {
            this.builder.StartGroupBy(groupFieldName, collapse);
            return new GroupedQuery(this.builder);
        }
        /** Adds OrderBy clause to the query
            @param fieldInternalName Internal field of the first field by that the data will be sorted (ascending)
            @param override This is only necessary for large lists. DON'T use it unless you know what it is for!
            @param useIndexForOrderBy This is only necessary for large lists. DON'T use it unless you know what it is for!
        */
        OrderBy(fieldInternalName: string, override?: bool, useIndexForOrderBy?: bool): ISortedQuery {
            this.builder.StartOrderBy(override, useIndexForOrderBy);
            this.builder.tree.push({ Element: "FieldRef", Name: fieldInternalName });
            return new SortedQuery(this.builder);
        }
        /** Adds OrderBy clause to the query (using descending order for the first field).
            @param fieldInternalName Internal field of the first field by that the data will be sorted (descending)
            @param override This is only necessary for large lists. DON'T use it unless you know what it is for!
            @param useIndexForOrderBy This is only necessary for large lists. DON'T use it unless you know what it is for!
        */
        OrderByDesc(fieldInternalName: string, override?: bool, useIndexForOrderBy?: bool): ISortedQuery {
            this.builder.StartOrderBy(override, useIndexForOrderBy);
            this.builder.tree.push({ Element: "FieldRef", Name: fieldInternalName, Descending: true });
            return new SortedQuery(this.builder);
        }
        ToString() {
            return this.builder.Finalize();
        }
    }
    class QueryToken implements IQueryPart {
        constructor(builder: Builder, startIndex: number) {
            this.builder = builder;
            this.startIndex = startIndex;
        }
        private builder: Builder;
        private startIndex: number;

        And(expressionBuilder: { (e: IFieldExpression): IQueryPart; }): IQueryPart {
            var part = expressionBuilder(new FieldExpression());
            var partBuilder = <Builder>part["builder"];
            partBuilder.tree.splice(0, 0, { Element: "Start", Name: "Or" });
            partBuilder.tree.push({ Element: "End" });
            this.builder.tree.splice(this.startIndex, 0, partBuilder.tree);
            return this;
        };

        Or(expressionBuilder: { (e: IFieldExpression): IQueryPart; }): IQueryPart {
            var part = expressionBuilder(new FieldExpression());
            var partBuilder = <Builder>part["builder"];
            partBuilder.tree.splice(0, 0, { Element: "Start", Name: "Or" });
            partBuilder.tree.push({ Element: "End" });
            this.builder.tree.splice(this.startIndex, 0, partBuilder.tree);
            return this;
        };

        GroupBy(groupFieldName: string, collapse?: bool) {
            this.builder.StartGroupBy(groupFieldName, collapse);
            return new GroupedQuery(this.builder);
        };

        OrderBy(fieldInternalName: string, override?: bool, useIndexForOrderBy?: bool) {
            this.builder.StartOrderBy(override, useIndexForOrderBy);
            this.builder.tree.push({ Element: "FieldRef", Name: fieldInternalName });
            return new SortedQuery(this.builder);
        };

        OrderByDesc(fieldInternalName: string, override?: bool, useIndexForOrderBy?: bool) {
            this.builder.StartOrderBy(override, useIndexForOrderBy);
            this.builder.tree.push({ Element: "FieldRef", Name: fieldInternalName, Descending: true });
            return new SortedQuery(this.builder);
        };

        ToString() {
            return this.builder.Finalize();
        };
    }

    class FieldExpression implements IFieldExpression {
        constructor() {
            this.builder = new Builder();
        }
        private builder: Builder;
        TextField(internalName: string): ITextFieldExpression {
            return new FieldExpressionToken(this.builder, internalName, "Text");
        }
        BooleanField(internalName: string): IBooleanFieldExpression {
            return new FieldExpressionToken(this.builder, internalName, "Integer");
        }
        NumberField(internalName: string): INumberFieldExpression {
            return new FieldExpressionToken(this.builder, internalName, "Number");
        }
        UserField(internalName: string): IUserFieldExpression {
            return new UserFieldExpression(this.builder, internalName);
        }
        LookupField(internalName: string): ILookupFieldExpression {
            return new LookupFieldExpression(this.builder, internalName, "Lookup");
        }
        LookupMultiField(internalName: string): ILookupMultiFieldExpression {
            return new FieldExpressionToken(this.builder, internalName, "LookupMulti");
        }
        DateField(internalName: string): IDateTimeFieldExpression {
            return new FieldExpressionToken(this.builder, internalName, "Date");
        }
        DateTimeField(internalName: string): IDateTimeFieldExpression {
            return new FieldExpressionToken(this.builder, internalName, "DateTime");
        }
        DateRangesOverlap(eventDateField: string, endDateField: string, recurrenceIDField: string, dateTimeValue: string): IQueryPart {
            /// <summary>
            /// Used in queries to compare the dates in a recurring event with a specified DateTime value, to determine whether they overlap.
            /// </summary>

            var pos = this.builder.tree.length;

            this.builder.tree.push({ Element: "Start", Name: "DateRangesOverlap" });
            this.builder.tree.push({ Element: "FieldRef", Name: eventDateField });
            this.builder.tree.push({ Element: "FieldRef", Name: endDateField });
            this.builder.tree.push({ Element: "FieldRef", Name: recurrenceIDField });
            this.builder.tree.push({ Element: "Value", ValueType: "DateTime", Value: dateTimeValue });
            this.builder.tree.push({ Element: "End" });

            return new QueryToken(this.builder, pos);
        }
    }

    class LookupFieldExpression implements ILookupFieldExpression {
        constructor(builder: Builder, name: string, valueType: string) {
            this.builder = builder;
            this.name = name;
            this.valueType = valueType;
        }
        private builder: Builder;
        private name: string;
        private valueType: string;
        Id(): INumberFieldExpression {
            return new FieldExpressionToken(this.builder, this.name, "Integer");
        }
        Value(): ITextFieldExpression {
            return new FieldExpressionToken(this.builder, this.name, this.valueType);
        }
    }

    class UserFieldExpression extends LookupFieldExpression implements IUserFieldExpression {
        constructor(builder: Builder, name: string) {
            this.builder = builder;
            this.name = name;
            this.startIndex = builder.tree.length;
            super(builder, name, "User");
        }
        private builder: Builder;
        private name: string;
        private startIndex: number;

        IsEqualToCurrentUser(): IQueryPart {
            this.builder.tree.push({ Element: 'FieldRef', Name: this.name, LookupId: true });
            this.builder.BinaryOperator(this.startIndex, "Eq", "Integer", "{UserID}");
            return new QueryToken(this.builder, this.startIndex);
        }
        IsInCurrentUserGroups(): IQueryPart {
            this.builder.tree.push({ Element: 'FieldRef', Name: this.name });
            this.builder.Membership(this.startIndex, "CurrentUserGroups");
            return new QueryToken(this.builder, this.startIndex);
        }
        IsInSPGroup(): IQueryPart {
            this.builder.tree.push({ Element: 'FieldRef', Name: this.name });
            this.builder.Membership(this.startIndex, "SPGroup");
            return new QueryToken(this.builder, this.startIndex);
        }
        IsInSPWebGroups(): IQueryPart {
            this.builder.tree.push({ Element: 'FieldRef', Name: this.name });
            this.builder.Membership(this.startIndex, "SPWeb.Groups");
            return new QueryToken(this.builder, this.startIndex);
        }
        IsInSPWebAllUsers(): IQueryPart {
            this.builder.tree.push({ Element: 'FieldRef', Name: this.name });
            this.builder.Membership(this.startIndex, "SPWeb.AllUsers");
            return new QueryToken(this.builder, this.startIndex);
        }
        IsInSPWebUsers(): IQueryPart {
            this.builder.tree.push({ Element: 'FieldRef', Name: name });
            this.builder.Membership(this.startIndex, "SPWeb.Users");
            return new QueryToken(this.builder, this.startIndex);
        }
    }

    class FieldExpressionToken implements IBooleanFieldExpression, INumberFieldExpression, ITextFieldExpression, IDateTimeFieldExpression {
        constructor(builder: Builder, name: string, valueType: string, isLookupId?: bool) {
            this.builder = builder;
            this.name = name;
            this.startIndex = builder.tree.length;
            this.valueType = valueType;

            this.builder.tree.push({ Element: 'FieldRef', Name: name, LookupId: isLookupId });
        }
        private builder: Builder;
        private name: string;
        private startIndex: number;
        private valueType: string;

        IsTrue(): IQueryPart {
            this.builder.BinaryOperator(this.startIndex, "Eq", "Integer", "1");
            return new QueryToken(this.builder, this.startIndex);
        };
        IsFalse(): IQueryPart {
            this.builder.BinaryOperator(this.startIndex, "Eq", "Integer", "0");
            return new QueryToken(this.builder, this.startIndex);
        };

        IsNull(): IQueryPart {
            this.builder.UnaryOperator(this.startIndex, "IsNull");
            return new QueryToken(this.builder, this.startIndex);
        };
        IsNotNull(): IQueryPart {
            this.builder.UnaryOperator(this.startIndex, "IsNotNull");
            return new QueryToken(this.builder, this.startIndex);
        };
        IsEqualTo(value): IQueryPart {
            this.builder.BinaryOperator(this.startIndex, "Eq", this.valueType, value);
            return new QueryToken(this.builder, this.startIndex);
        };
        IsGreaterThan(value): IQueryPart {
            this.builder.BinaryOperator(this.startIndex, "Gt", this.valueType, value);
            return new QueryToken(this.builder, this.startIndex);
        };
        IsLessThan(value): IQueryPart {
            this.builder.BinaryOperator(this.startIndex, "Lt", this.valueType, value);
            return new QueryToken(this.builder, this.startIndex);
        };
        IsGreaterThanOrEqualTo(value): IQueryPart {
            this.builder.BinaryOperator(this.startIndex, "Geq", this.valueType, value);
            return new QueryToken(this.builder, this.startIndex);
        };
        IsLessThanOrEqualTo(value): IQueryPart {
            this.builder.BinaryOperator(this.startIndex, "Leq", this.valueType, value);
            return new QueryToken(this.builder, this.startIndex);
        };
        IsNotEqualTo(value): IQueryPart {
            this.builder.BinaryOperator(this.startIndex, "Neq", this.valueType, value);
            return new QueryToken(this.builder, this.startIndex);
        };
        NotIncludes(value): IQueryPart {
            this.builder.BinaryOperator(this.startIndex, "NotIncludes", this.valueType, value);
            return new QueryToken(this.builder, this.startIndex);
        };
        Includes(value): IQueryPart {
            this.builder.BinaryOperator(this.startIndex, "Includes", this.valueType, value);
            return new QueryToken(this.builder, this.startIndex);
        };
        Contains(value): IQueryPart {
            this.builder.BinaryOperator(this.startIndex, "Contains", this.valueType, value);
            return new QueryToken(this.builder, this.startIndex);
        };
        BeginsWith(value): IQueryPart {
            this.builder.BinaryOperator(this.startIndex, "BeginsWith", this.valueType, value);
            return new QueryToken(this.builder, this.startIndex);
        };
        In(arrayOfValues: any[]): IQueryPart {

            this.builder.tree.splice(this.startIndex, 0, { Element: "Start", Name: "In" });
            this.builder.tree.push({ Element: "Start", Name: "Values" });

            for (var i = 0; i < arrayOfValues.length; i++) {
                this.builder.tree.push({ Element: "Value", ValueType: this.valueType, Value: arrayOfValues[i] });
            }

            this.builder.tree.push({ Element: "End" });
            this.builder.tree.push({ Element: "End" });

            return new QueryToken(this.builder, this.startIndex);
        };

    }

    class GroupedQuery implements IGroupedQuery {
        constructor(builder: Builder) {
            this.builder = builder;
        }
        private builder: Builder;

        OrderBy(fieldInternalName: string, override?: bool, useIndexForOrderBy?: bool) {
            this.builder.StartOrderBy(override, useIndexForOrderBy);
            this.builder.tree.push({ Element: "FieldRef", Name: fieldInternalName });
            return new SortedQuery(this.builder);
        };

        OrderByDesc(fieldInternalName: string, override?: bool, useIndexForOrderBy?: bool) {
            this.builder.StartOrderBy(override, useIndexForOrderBy);
            this.builder.tree.push({ Element: "FieldRef", Name: fieldInternalName, Descending: true });
            return new SortedQuery(this.builder);
        };

        ToString() {
            return this.builder.Finalize();
        };
    }

    class SortedQuery implements ISortedQuery {
        constructor(builder: Builder) {
            this.builder = builder;
        }
        private builder: Builder;
        ThenBy(fieldInternalName: string, override?: bool, useIndexForOrderBy?: bool) {
            this.builder.tree.push({ Element: "FieldRef", Name: fieldInternalName });
            return new SortedQuery(this.builder);
        };

        ThenByDesc(fieldInternalName: string, override?: bool, useIndexForOrderBy?: bool) {
            this.builder.tree.push({ Element: "FieldRef", Name: fieldInternalName, Descending: true });
            return new SortedQuery(this.builder);
        };

        ToString() {
            return this.builder.Finalize();
        };
    }

    class Builder {
        constructor() {
            this.tree = new Array();
            this.unclosedTags = 0;
        }
        tree: any[];
        unclosedTags: number;
        Membership(startIndex, type) {
            this.tree.splice(startIndex, 0, { Element: "Start", Name: "Membership", Attributes: [{ Name: "Type", Value: type }] });
            this.tree.push({ Element: "End" });
        }
        UnaryOperator(startIndex, operation) {
            this.tree.splice(startIndex, 0, { Element: "Start", Name: operation });
            this.tree.push({ Element: "End" });
        }
        BinaryOperator(startIndex, operation, valueType, value) {
            this.tree.splice(startIndex, 0, { Element: "Start", Name: operation });
            this.tree.push({ Element: "Value", ValueType: valueType, Value: value });
            this.tree.push({ Element: "End" });
        }
        StartGroupBy(groupFieldName, collapse) {
            if (this.unclosedTags > 0)
                this.tree.push({ Element: "End", Count: this.unclosedTags });
            this.unclosedTags = 0;
            if (collapse)
                this.tree.push({ Element: "Start", Name: "GroupBy", Attributes: [{ Name: "Collapse", Value: "TRUE" }] });
            else
                this.tree.push({ Element: "Start", Name: "GroupBy" });
            this.tree.push({ Element: "FieldRef", Name: groupFieldName });
            this.tree.push({ Element: "End" });
        }
        StartOrderBy(override, useIndexForOrderBy) {
            if (this.unclosedTags > 0)
                this.tree.push({ Element: "End", Count: this.unclosedTags });
            this.unclosedTags = 1;

            var attributes = new Array();
            if (override)
                attributes.push({ Name: "Override", Value: "TRUE" });
            if (useIndexForOrderBy)
                attributes.push({ Name: "UseIndexForOrderBy", Value: "TRUE" });
            if (attributes.length > 0)
                this.tree.push({ Element: "Start", Name: "OrderBy", Attributes: attributes });
            else
                this.tree.push({ Element: "Start", Name: "OrderBy" });

        }
        Finalize() {
            var sb = new Sys.StringBuilder();
            var writer = SP.XmlWriter.create(sb);
            for (var i = 0; i < this.tree.length; i++) {
                if (this.tree[i].Element == "FieldRef") {
                    writer.writeStartElement("FieldRef");
                    writer.writeAttributeString("Name", this.tree[i].Name);
                    if (this.tree[i].LookupId)
                        writer.writeAttributeString("LookupId", "True");
                    if (this.tree[i].Descending)
                        writer.writeAttributeString("Ascending", "False");
                    writer.writeEndElement();
                } else if (this.tree[i].Element == "Start") {
                    writer.writeStartElement(this.tree[i].Name);
                    if (this.tree[i].Attributes) {
                        for (var a = 0; a < this.tree[i].Attributes.length; a++) {
                            writer.writeAttributeString(
                                    this.tree[i].Attributes[a].Name,
                                    this.tree[i].Attributes[a].Value);
                        }
                    }
                } else if (this.tree[i].Element == "Value") {
                    writer.writeStartElement("Value");
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
        }
    }

}


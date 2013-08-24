declare module Sys {
    export class StringBuilder {
        /** Appends a string to the string builder */
        append(s: string): void;
        /** Appends a line to the string builder */
        appendLine(s: string): void;
        /** Clears the contents of the string builder */
        clear(): void;
        /** Indicates wherever the string builder is empty */
        isEmpty(): boolean;
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
    constructor() {
    }
    Where(): CamlBuilder.IFieldExpression {
        return CamlBuilder.Internal.createWhere();
    }
    /** Use for:
        1. SPServices CAMLQuery attribute
        2. Creating partial expressions
        3. In conjunction with Any & All clauses
         */
    static Expression(): CamlBuilder.IFieldExpression {
        return CamlBuilder.Internal.createExpression();
    }
}

module CamlBuilder {

    export interface IView {
        Query(): IQuery;
    }
    export interface IQuery {
        Where(): IFieldExpression;
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
        OrderBy(fieldInternalName: string, override?: boolean, useIndexForOrderBy?: boolean): ISortedQuery;
        /** Adds OrderBy clause to the query (using descending order for the first field).
            @param fieldInternalName Internal field of the first field by that the data will be sorted (descending)
            @param override This is only necessary for large lists. DON'T use it unless you know what it is for!
            @param useIndexForOrderBy This is only necessary for large lists. DON'T use it unless you know what it is for!
        */
        OrderByDesc(fieldInternalName: string, override?: boolean, useIndexForOrderBy?: boolean): ISortedQuery;
    }
    export interface IGroupable extends ISortable {
        /** Adds GroupBy clause to the query.
            @param collapse If true, only information about the groups is retrieved, otherwise items are also retrieved. */
        GroupBy(fieldInternalName): IGroupedQuery;
    }

    export interface IExpression extends IGroupable {
        /** Adds And clause to the query. */
        And(): IFieldExpression;
        /** Adds Or clause to the query. */
        Or(): IFieldExpression;
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
        /** Adds And clauses to the query. Use for creating bracket-expressions in conjuction with CamlBuilder.Expression(). */
        All(...conditions: IExpression[]): IExpression;
        /** Adds Or clauses to the query. Use for creating bracket-expressions in conjuction with CamlBuilder.Expression(). */
        Any(...conditions: IExpression[]): IExpression;
        /** Specifies that a condition will be tested against the field with the specified internal name, and the type of this field is Text */
        TextField(internalName: string): ITextFieldExpression;
        /** Specifies that a condition will be tested against the field with the specified internal name, and the type of this field is Boolean */
        BooleanField(internalName: string): IBooleanFieldExpression;
        /** Specifies that a condition will be tested against the field with the specified internal name, and the type of this field is URL */
        UrlField(internalName: string): ITextFieldExpression;
        /** Specifies that a condition will be tested against the field with the specified internal name, and the type of this field is Number */
        NumberField(internalName: string): INumberFieldExpression;
        /** Specifies that a condition will be tested against the field with the specified internal name, and the type of this field is Counter (usually ID fields) */
        CounterField(internalName: string): INumberFieldExpression;
        /** Specifies that a condition will be tested against the field with the specified internal name, and the type of this field is Integer */
        IntegerField(internalName: string): INumberFieldExpression;
        /** Specifies that a condition will be tested against the field with the specified internal name, and the type of this field is User */
        UserField(internalName: string): IUserFieldExpression;
        /** Specifies that a condition will be tested against the field with the specified internal name, and the type of this field is Lookup */
        LookupField(internalName: string): ILookupFieldExpression;
        /** DEPRECATED. Please use LookupField(...).Id() instead */
        LookupIdField(internalName: string): INumberFieldExpression;
        /** Specifies that a condition will be tested against the field with the specified internal name, and the type of this field is LookupMulti */
        LookupMultiField(internalName: string): ILookupMultiFieldExpression;
        /** Specifies that a condition will be tested against the field with the specified internal name, and the type of this field is UserMulti */
        UserMultiField(internalName: string): ILookupMultiFieldExpression;
        /** Specifies that a condition will be tested against the field with the specified internal name, and the type of this field is Date */
        DateField(internalName: string): IDateTimeFieldExpression;
        /** Specifies that a condition will be tested against the field with the specified internal name, and the type of this field is DateTime */
        DateTimeField(internalName: string): IDateTimeFieldExpression;
        /** Used in queries for retrieving recurring calendar events.
            NOTICE: DateRangesOverlap with overlapType other than Now cannot be used with SP.CamlQuery, because it doesn't support 
            CalendarDate and ExpandRecurrence query options. Lists.asmx, however, supports them, so you can still use DateRangesOverlap
            with SPServices.
            @param overlapType Defines type of overlap: return all events for a day, for a week, for a month or for a year
            @param calendarDate Defines date that will be used for determining events for which exactly day/week/month/year will be returned.
                                This value is ignored for overlapType=Now, but for the other overlap types it is mandatory.
            @param eventDateField Internal name of "Start Time" field (default: "EventDate" - all OOTB Calendar lists use this name)
            @param endDateField Internal name of "End Time" field (default: "EndDate" - all OOTB Calendar lists use this name)
            @param recurrenceIDField Internal name of "Recurrence ID" field (default: "RecurrenceID" - all OOTB Calendar lists use this name)
         */
        DateRangesOverlap(overlapType: DateRangesOverlapType, calendarDate: string, eventDateField?: string, endDateField?: string, recurrenceIDField?: string): IExpression;
    }
    export interface IBooleanFieldExpression {
        /** Checks whether the value of the field is True */
        IsTrue(): IExpression;
        /** Checks whether the value of the field is False */
        IsFalse(): IExpression;
        /** Checks whether the value of the field is equal to the specified value */
        EqualTo(value: boolean): IExpression;
        /** Checks whether the value of the field is not equal to the specified value */
        NotEqualTo(value: boolean): IExpression;
        /** Checks whether the value of the field was specified by user */
        IsNull(): IExpression;
        /** Checks whether the value of the field was not specified by user */
        IsNotNull(): IExpression;
    }
    export interface INumberFieldExpression {
        /** Checks whether the value of the field is equal to the specified value */
        EqualTo(value: number): IExpression;
        /** Checks whether the value of the field is not equal to the specified value */
        NotEqualTo(value: number): IExpression;
        /** Checks whether the value of the field is greater than the specified value */
        GreaterThan(value: number): IExpression;
        /** Checks whether the value of the field is less than the specified value */
        LessThan(value: number): IExpression;
        /** Checks whether the value of the field is greater than or equal to the specified value */
        GreaterThanOrEqualTo(value: number): IExpression;
        /** Checks whether the value of the field is less than or equal to the specified value */
        LessThanOrEqualTo(value: number): IExpression;
        /** Checks whether the value of the field was specified by user */
        IsNull(): IExpression;
        /** Checks whether the value of the field was not specified by user */
        IsNotNull(): IExpression;
        /** Checks whether the value of the field is equal to one of the specified values */
        In(arrayOfValues: number[]): IExpression;
    }
    export interface IDateTimeFieldExpression {
        /** Checks whether the value of the field was specified by user */
        IsNull(): IExpression;
        /** Checks whether the value of the field was not specified by user */
        IsNotNull(): IExpression;
        
        // Date overloads
        
        /** Checks whether the value of the field is equal to the specified value */
        EqualTo(value: Date): IExpression;
        /** Checks whether the value of the field is not equal to the specified value */
        NotEqualTo(value: Date): IExpression;
        /** Checks whether the value of the field is greater than the specified value */
        GreaterThan(value: Date): IExpression;
        /** Checks whether the value of the field is less than the specified value */
        LessThan(value: Date): IExpression;
        /** Checks whether the value of the field is greater than or equal to the specified value */
        GreaterThanOrEqualTo(value: Date): IExpression;
        /** Checks whether the value of the field is less than or equal to the specified value */
        LessThanOrEqualTo(value: Date): IExpression;
        /** Checks whether the value of the field is equal to one of the specified values */
        In(arrayOfValues: Date[]): IExpression;
        
        // string overloads
        
        /** Checks whether the value of the field is equal to the specified value.
            The datetime value should be defined in ISO 8601 format! */
        EqualTo(value: string): IExpression;
        /** Checks whether the value of the field is not equal to the specified value.
            The datetime value should be defined in ISO 8601 format! */
        NotEqualTo(value: string): IExpression;
        /** Checks whether the value of the field is greater than the specified value.
            The datetime value should be defined in ISO 8601 format! */
        GreaterThan(value: string): IExpression;
        /** Checks whether the value of the field is less than the specified value.
            The datetime value should be defined in ISO 8601 format! */
        LessThan(value: string): IExpression;
        /** Checks whether the value of the field is greater than or equal to the specified value.
            The datetime value should be defined in ISO 8601 format! */
        GreaterThanOrEqualTo(value: string): IExpression;
        /** Checks whether the value of the field is less than or equal to the specified value.
            The datetime value should be defined in ISO 8601 format! */
        LessThanOrEqualTo(value: string): IExpression;
        /** Checks whether the value of the field is equal to one of the specified values.
            The datetime value should be defined in ISO 8601 format! */
        In(arrayOfValues: string[]): IExpression;
    }
    export interface ITextFieldExpression {
        /** Checks whether the value of the field is equal to the specified value */
        EqualTo(value: string): IExpression;
        /** Checks whether the value of the field is not equal to the specified value */
        NotEqualTo(value: string): IExpression;
        /** Checks whether the value of the field contains the specified substring */
        Contains(value: string): IExpression;
        /** Checks whether the value of the field begins with the specified substring */
        BeginsWith(value: string): IExpression;
        /** Checks whether the value of the field was specified by user */
        IsNull(): IExpression;
        /** Checks whether the value of the field was not specified by user */
        IsNotNull(): IExpression;
        /** Checks whether the value of the field is equal to one of the specified values */
        In(arrayOfValues: string[]): IExpression;
    }
    export interface IUserFieldExpression {
        /** DEPRECATED. Please use IsIn* methods instead. This property will be removed in next release(!!) */
        Membership: IMembership;
        EqualToCurrentUser(): IExpression;
        IsInCurrentUserGroups(): IExpression;
        IsInSPGroup(): IExpression;
        IsInSPWebGroups(): IExpression;
        IsInSPWebAllUsers(): IExpression;
        IsInSPWebUsers(): IExpression;
        Id(): INumberFieldExpression;
        ValueAsText(): ITextFieldExpression;
    }
    /** DEPRECATED!! Please use UserField(...).IsIn* methods instead. This interface will be removed in the next release */
    export interface IMembership {
        /** DEPRECATED. Please use UserField(...).IsInCurrentUserGroups() instead */
        CurrentUserGroups(): IExpression;
        /** DEPRECATED. Please use UserField(...).IsInSPGroup() instead */
        SPGroup(): IExpression;
        /** DEPRECATED. Please use UserField(...).IsInSPWeb* methods instead */
        SPWeb: IMembershipSPWeb;
    }
    /** DEPRECATED!! Please use UserField(...).IsInSPWeb* methods instead. This interface will be removed in the next release */
    export interface IMembershipSPWeb {
        /** DEPRECATED. Please use UserField(...).IsInSPWebAllUsers() instead */
        AllUsers(): IExpression;
        /** DEPRECATED. Please use UserField(...).IsInSPWebUsers() instead */
        Users(): IExpression;
        /** DEPRECATED. Please use UserField(...).IsInSPWebGroups() instead */
        Groups(): IExpression;
    }

    export interface ILookupFieldExpression {
        Id(): INumberFieldExpression;
        ValueAsText(): ITextFieldExpression;
        ValueAsCounter(): INumberFieldExpression;
        ValueAsNumber(): INumberFieldExpression;
        ValueAsDate(): IDateTimeFieldExpression;
        ValueAsDateTime(): IDateTimeFieldExpression;
        ValueAsBoolean(): IBooleanFieldExpression;
    }
    export interface ILookupMultiFieldExpression {
        EqualTo(value: string): IExpression;
        NotEqualTo(value: string): IExpression;
        Includes(value): IExpression;
        NotIncludes(value): IExpression;
    }

    export enum DateRangesOverlapType {
        Now,
        Day,
        Week,
        Month,
        Year
    }

    export class Internal {
        static createView(): IView {
            return new QueryInternal().View();
        }
        static createWhere(): IFieldExpression {
            return new QueryInternal().Where();
        }
        static createExpression(): IFieldExpression {
            return new FieldExpression(new Builder());
        }
    }

    /** Represents SharePoint CAML Query element */
    class QueryInternal implements IView, IQuery  {
        constructor() {
            this.builder = new Builder();
        }
        private builder: Builder;
        /** Adds View element. */
        View(): IView {
            this.builder.WriteStart("View");
            this.builder.unclosedTags++;
            return this;
        }
        /** Adds Query clause to the View XML. */
        Query(): IQuery {
            this.builder.WriteStart("Query");
            this.builder.unclosedTags++;
            return this;
        }
        /** Adds Where clause to the query, inside you can specify conditions for certain field values. */
        Where(): IFieldExpression {
            this.builder.WriteStart("Where");
            this.builder.unclosedTags++;
            return new FieldExpression(this.builder);
        }
    }
    class QueryToken implements IExpression {
        constructor(builder: Builder, startIndex: number) {
            this.builder = builder;
            this.startIndex = startIndex;
        }
        private builder: Builder;
        private startIndex: number;

        /** Adds And clause to the query. */
        And(): IFieldExpression {
            this.builder.tree.splice(this.startIndex, 0, { Element: "Start", Name: "And" });
            this.builder.unclosedTags++;
            return new FieldExpression(this.builder);
        }

        /** Adds Or clause to the query. */
        Or(): IFieldExpression {
            this.builder.tree.splice(this.startIndex, 0, { Element: "Start", Name: "Or" });
            this.builder.unclosedTags++;
            return new FieldExpression(this.builder);
        }

        /** Adds GroupBy clause to the query.
            @param collapse If true, only information about the groups is retrieved, otherwise items are also retrieved. */
        GroupBy(groupFieldName: string, collapse?: boolean) {
            this.builder.WriteStartGroupBy(groupFieldName, collapse);
            return new GroupedQuery(this.builder);
        }

        /** Adds OrderBy clause to the query
            @param fieldInternalName Internal field of the first field by that the data will be sorted (ascending)
            @param override This is only necessary for large lists. DON'T use it unless you know what it is for!
            @param useIndexForOrderBy This is only necessary for large lists. DON'T use it unless you know what it is for!
        */
        OrderBy(fieldInternalName: string, override?: boolean, useIndexForOrderBy?: boolean) {
            this.builder.WriteStartOrderBy(override, useIndexForOrderBy);
            this.builder.WriteFieldRef(fieldInternalName);
            return new SortedQuery(this.builder);
        }

        /** Adds OrderBy clause to the query (using descending order for the first field).
            @param fieldInternalName Internal field of the first field by that the data will be sorted (descending)
            @param override This is only necessary for large lists. DON'T use it unless you know what it is for!
            @param useIndexForOrderBy This is only necessary for large lists. DON'T use it unless you know what it is for!
        */
        OrderByDesc(fieldInternalName: string, override?: boolean, useIndexForOrderBy?: boolean) {
            this.builder.WriteStartOrderBy(override, useIndexForOrderBy);
            this.builder.WriteFieldRef(fieldInternalName, { Descending: true });
            return new SortedQuery(this.builder);
        }

        /** Returns the XML string representing the generated CAML
        */
        ToString() {
            return this.builder.Finalize();
        }
    }

    class FieldExpression implements IFieldExpression {
        constructor(builder: Builder) {
            this.builder = builder;
        }
        private builder: Builder;

        /** Specifies that a condition will be tested against the field with the specified internal name, and the type of this field is Text */
        TextField(internalName: string): ITextFieldExpression {
            return new FieldExpressionToken(this.builder, internalName, "Text");
        }
        /** Specifies that a condition will be tested against the field with the specified internal name, and the type of this field is Boolean */
        BooleanField(internalName: string): IBooleanFieldExpression {
            return new FieldExpressionToken(this.builder, internalName, "Integer");
        }
        /** Specifies that a condition will be tested against the field with the specified internal name, and the type of this field is URL */
        UrlField(internalName: string): ITextFieldExpression {
            return new FieldExpressionToken(this.builder, internalName, "URL");
        }
        /** Specifies that a condition will be tested against the field with the specified internal name, and the type of this field is Number */
        NumberField(internalName: string): INumberFieldExpression {
            return new FieldExpressionToken(this.builder, internalName, "Number");
        }
        /** Specifies that a condition will be tested against the field with the specified internal name, and the type of this field is Integer */
        IntegerField(internalName: string): INumberFieldExpression {
            return new FieldExpressionToken(this.builder, internalName, "Integer");
        }
        /** Specifies that a condition will be tested against the field with the specified internal name, and the type of this field is Counter (usually ID field) */
        CounterField(internalName: string): INumberFieldExpression {
            return new FieldExpressionToken(this.builder, internalName, "Counter");
        }
        /** Specifies that a condition will be tested against the field with the specified internal name, and the type of this field is User */
        UserField(internalName: string): IUserFieldExpression {
            return new UserFieldExpression(this.builder, internalName);
        }
        /** Specifies that a condition will be tested against the field with the specified internal name, and the type of this field is Lookup */
        LookupField(internalName: string): ILookupFieldExpression {
            return new LookupFieldExpression(this.builder, internalName, "Lookup");
        }
        /** DEPRECATED. Please use LookupField(...).Id() instead. This method will be removed in the next release. */
        LookupIdField(internalName: string): INumberFieldExpression {
            return new LookupFieldExpression(this.builder, internalName, "Lookup").Id();
        }
        /** Specifies that a condition will be tested against the field with the specified internal name, and the type of this field is LookupMulti */
        LookupMultiField(internalName: string): ILookupMultiFieldExpression {
            return new FieldExpressionToken(this.builder, internalName, "LookupMulti");
        }
        /** Specifies that a condition will be tested against the field with the specified internal name, and the type of this field is UserMulti */
        UserMultiField(internalName: string): ILookupMultiFieldExpression {
            return new FieldExpressionToken(this.builder, internalName, "UserMulti");
        }
        /** Specifies that a condition will be tested against the field with the specified internal name, and the type of this field is Date */
        DateField(internalName: string): IDateTimeFieldExpression {
            return new FieldExpressionToken(this.builder, internalName, "Date");
        }
        /** Specifies that a condition will be tested against the field with the specified internal name, and the type of this field is DateTime */
        DateTimeField(internalName: string): IDateTimeFieldExpression {
            return new FieldExpressionToken(this.builder, internalName, "DateTime");
        }
        /** Used in queries for retrieving recurring calendar events.
            @param overlapType Defines type of overlap: return all events for a day, for a week, for a month or for a year
            @param calendarDate Defines date that will be used for determining events for which exactly day/week/month/year will be returned.
                                This value is ignored for overlapType=Now, but for the other overlap types it is mandatory.
                                This value will cause generation of QueryOptions/CalendarDate element.
            @param eventDateField Internal name of "Start Time" field (default: "EventDate" - all OOTB Calendar lists use this name)
            @param endDateField Internal name of "End Time" field (default: "EndDate" - all OOTB Calendar lists use this name)
            @param recurrenceIDField Internal name of "Recurrence ID" field (default: "RecurrenceID" - all OOTB Calendar lists use this name)
         */
        DateRangesOverlap(overlapType: DateRangesOverlapType, calendarDate: string, eventDateField?: string, endDateField?: string, recurrenceIDField?: string): IExpression {
            var pos = this.builder.tree.length;

            this.builder.WriteStart("DateRangesOverlap");
            this.builder.WriteFieldRef(eventDateField || "EventDate");
            this.builder.WriteFieldRef(endDateField || "EndDate");
            this.builder.WriteFieldRef(recurrenceIDField || "RecurrenceID");

            var value;
            switch (overlapType) {
                case DateRangesOverlapType.Now:
                    value = CamlValues.Now;
                    break;
                case DateRangesOverlapType.Day:
                    value = CamlValues.Today;
                    break;
                case DateRangesOverlapType.Week:
                    value = "{Week}";
                    break;
                case DateRangesOverlapType.Month:
                    value = "{Month}";
                    break;
                case DateRangesOverlapType.Year:
                    value = "{Year}";
                    break;
            }

            this.builder.WriteValueElement("DateTime", value);
            this.builder.WriteEnd();

            // TODO: write CalendarDate to QueryOptions

            return new QueryToken(this.builder, pos);
        }
        /** Adds And clauses to the query. Use for creating bracket-expressions in conjuction with CamlBuilder.Expression(). */
        All(...conditions: IExpression[]): IExpression {
            var pos = this.builder.tree.length;

            conditions.reverse();
            for (var i = 0; i < conditions.length; i++)
            {
                var conditionBuilder = <Builder>conditions[i]["builder"];
                if (conditionBuilder.unclosedTags > 0)
                    conditionBuilder.WriteEnd(conditionBuilder.unclosedTags);
                if (i > 0) {
                    conditionBuilder.tree.splice(0, 0, { Element: "Start", Name: "And" });
                    this.builder.WriteEnd();
                }
                Array.prototype.splice.apply(this.builder.tree, [pos, 0].concat(conditionBuilder.tree));
            }
            return new QueryToken(this.builder, pos);
        }
        /** Adds Or clauses to the query. Use for creating bracket-expressions in conjuction with CamlBuilder.Expression(). */
        Any(...conditions: IExpression[]): IExpression {
            var pos = this.builder.tree.length;

            conditions.reverse();
            for (var i = 0; i < conditions.length; i++)
            {
                var conditionBuilder = <Builder>conditions[i]["builder"];
                if (conditionBuilder.unclosedTags > 0)
                    conditionBuilder.WriteEnd(conditionBuilder.unclosedTags);
                if (i > 0) {
                    conditionBuilder.tree.splice(0, 0, { Element: "Start", Name: "Or" });
                    this.builder.WriteEnd();
                }
                Array.prototype.splice.apply(this.builder.tree, [pos, 0].concat(conditionBuilder.tree));
            }
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
            return new FieldExpressionToken(this.builder, this.name, "Integer", true);
        }
        Value(): ITextFieldExpression {
            return new FieldExpressionToken(this.builder, this.name, this.valueType);
        }
        ValueAsText(): ITextFieldExpression {
            return new FieldExpressionToken(this.builder, this.name, "Text");
        }
        ValueAsNumber(): INumberFieldExpression {
            return new FieldExpressionToken(this.builder, this.name, "Number");
        }
        ValueAsCounter(): INumberFieldExpression {
            return new FieldExpressionToken(this.builder, this.name, "Number");
        }
        ValueAsDateTime(): IDateTimeFieldExpression {
            return new FieldExpressionToken(this.builder, this.name, "DateTime");
        }
        ValueAsDate(): IDateTimeFieldExpression {
            return new FieldExpressionToken(this.builder, this.name, "Date");
        }
        ValueAsBoolean(): IBooleanFieldExpression {
            return new FieldExpressionToken(this.builder, this.name, "Integer");
        }
    }

    class UserFieldExpression implements IUserFieldExpression {
        constructor(builder: Builder, name: string) {
            var self = this;
            this.builder = builder;
            this.name = name;
            this.startIndex = builder.tree.length;
            this.Membership = {
                /** DEPRECATED. Please use UserField(...).IsInCurrentUserGroups() instead */
                CurrentUserGroups(): IExpression {
                    return self.IsInCurrentUserGroups();
                },
                /** DEPRECATED. Please use UserField(...).IsInSPGroup() instead */
                SPGroup(): IExpression {
                    return self.IsInSPGroup();
                },
                /** DEPRECATED. Please use UserField(...).IsInSPWeb* methods instead */
                SPWeb: {
                    /** DEPRECATED. Please use UserField(...).IsInSPWebAllUsers() instead */
                    AllUsers(): IExpression {
                        return self.IsInSPWebAllUsers();
                    },
                    /** DEPRECATED. Please use UserField(...).IsInSPWebUsers() instead */
                    Users(): IExpression {
                        return self.IsInSPWebUsers();
                    },
                    /** DEPRECATED. Please use UserField(...).IsInSPWebGroups() instead */
                    Groups(): IExpression {
                        return self.IsInSPWebGroups();
                    }
                }
            };
        }
        private builder: Builder;
        private name: string;
        private startIndex: number;

        /** DEPRECATED. Please use IsIn* methods instead */
        Membership: IMembership;

        Id(): INumberFieldExpression {
            return new FieldExpressionToken(this.builder, this.name, "Integer", true);
        }
        ValueAsText(): ITextFieldExpression {
            return new FieldExpressionToken(this.builder, this.name, "Text");
        }
        EqualToCurrentUser(): IExpression {
            this.builder.WriteFieldRef(this.name, { LookupId: true });
            this.builder.WriteBinaryOperation(this.startIndex, "Eq", "Integer", "{UserID}");
            return new QueryToken(this.builder, this.startIndex);
        }
        IsInCurrentUserGroups(): IExpression {
            this.builder.WriteFieldRef(this.name);
            this.builder.WriteMembership(this.startIndex, "CurrentUserGroups");
            return new QueryToken(this.builder, this.startIndex);
        }
        IsInSPGroup(): IExpression {
            this.builder.WriteFieldRef(this.name);
            this.builder.WriteMembership(this.startIndex, "SPGroup");
            return new QueryToken(this.builder, this.startIndex);
        }
        IsInSPWebGroups(): IExpression {
            this.builder.WriteFieldRef(this.name);
            this.builder.WriteMembership(this.startIndex, "SPWeb.Groups");
            return new QueryToken(this.builder, this.startIndex);
        }
        IsInSPWebAllUsers(): IExpression {
            this.builder.WriteFieldRef(this.name);
            this.builder.WriteMembership(this.startIndex, "SPWeb.AllUsers");
            return new QueryToken(this.builder, this.startIndex);
        }
        IsInSPWebUsers(): IExpression {
            this.builder.WriteFieldRef(this.name);
            this.builder.WriteMembership(this.startIndex, "SPWeb.Users");
            return new QueryToken(this.builder, this.startIndex);
        }
    }

    class FieldExpressionToken implements IBooleanFieldExpression, INumberFieldExpression, ITextFieldExpression, IDateTimeFieldExpression {
        constructor(builder: Builder, name: string, valueType: string, isLookupId?: boolean) {
            this.builder = builder;
            this.name = name;
            this.startIndex = builder.tree.length;
            this.valueType = valueType;

            this.builder.WriteFieldRef(name, { LookupId: isLookupId });
        }
        private builder: Builder;
        private name: string;
        private startIndex: number;
        private valueType: string;

        IsTrue(): IExpression {
            this.builder.WriteBinaryOperation(this.startIndex, "Eq", "Integer", "1");
            return new QueryToken(this.builder, this.startIndex);
        }
        IsFalse(): IExpression {
            this.builder.WriteBinaryOperation(this.startIndex, "Eq", "Integer", "0");
            return new QueryToken(this.builder, this.startIndex);
        }

        IsNull(): IExpression {
            this.builder.WriteUnaryOperation(this.startIndex, "IsNull");
            return new QueryToken(this.builder, this.startIndex);
        }
        IsNotNull(): IExpression {
            this.builder.WriteUnaryOperation(this.startIndex, "IsNotNull");
            return new QueryToken(this.builder, this.startIndex);
        }
        EqualTo(value): IExpression {
            if (value instanceof Date)
                value = value.toISOString();
            this.builder.WriteBinaryOperation(this.startIndex, "Eq", this.valueType, value);
            return new QueryToken(this.builder, this.startIndex);
        }
        GreaterThan(value): IExpression {
            if (value instanceof Date)
                value = value.toISOString();
            this.builder.WriteBinaryOperation(this.startIndex, "Gt", this.valueType, value);
            return new QueryToken(this.builder, this.startIndex);
        }
        LessThan(value): IExpression {
            if (value instanceof Date)
                value = value.toISOString();
            this.builder.WriteBinaryOperation(this.startIndex, "Lt", this.valueType, value);
            return new QueryToken(this.builder, this.startIndex);
        }
        GreaterThanOrEqualTo(value): IExpression {
            if (value instanceof Date)
                value = value.toISOString();
            this.builder.WriteBinaryOperation(this.startIndex, "Geq", this.valueType, value);
            return new QueryToken(this.builder, this.startIndex);
        }
        LessThanOrEqualTo(value): IExpression {
            if (value instanceof Date)
                value = value.toISOString();
            this.builder.WriteBinaryOperation(this.startIndex, "Leq", this.valueType, value);
            return new QueryToken(this.builder, this.startIndex);
        }
        NotEqualTo(value): IExpression {
            if (value instanceof Date)
                value = value.toISOString();
            this.builder.WriteBinaryOperation(this.startIndex, "Neq", this.valueType, value);
            return new QueryToken(this.builder, this.startIndex);
        }
        NotIncludes(value): IExpression {
            this.builder.WriteBinaryOperation(this.startIndex, "NotIncludes", this.valueType, value);
            return new QueryToken(this.builder, this.startIndex);
        }
        Includes(value): IExpression {
            this.builder.WriteBinaryOperation(this.startIndex, "Includes", this.valueType, value);
            return new QueryToken(this.builder, this.startIndex);
        }
        Contains(value): IExpression {
            this.builder.WriteBinaryOperation(this.startIndex, "Contains", this.valueType, value);
            return new QueryToken(this.builder, this.startIndex);
        }
        BeginsWith(value): IExpression {
            this.builder.WriteBinaryOperation(this.startIndex, "BeginsWith", this.valueType, value);
            return new QueryToken(this.builder, this.startIndex);
        }
        In(arrayOfValues: any[]): IExpression {

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
        }

    }

    class GroupedQuery implements IGroupedQuery {
        constructor(builder: Builder) {
            this.builder = builder;
        }
        private builder: Builder;

        OrderBy(fieldInternalName: string, override?: boolean, useIndexForOrderBy?: boolean) {
            this.builder.WriteStartOrderBy(override, useIndexForOrderBy);
            this.builder.WriteFieldRef(fieldInternalName);
            return new SortedQuery(this.builder);
        }

        OrderByDesc(fieldInternalName: string, override?: boolean, useIndexForOrderBy?: boolean) {
            this.builder.WriteStartOrderBy(override, useIndexForOrderBy);
            this.builder.WriteFieldRef(fieldInternalName, { Descending: true });
            return new SortedQuery(this.builder);
        }

        ToString() {
            return this.builder.Finalize();
        }
    }

    class SortedQuery implements ISortedQuery {
        constructor(builder: Builder) {
            this.builder = builder;
        }
        private builder: Builder;
        ThenBy(fieldInternalName: string, override?: boolean, useIndexForOrderBy?: boolean) {
            this.builder.WriteFieldRef(fieldInternalName);
            return new SortedQuery(this.builder);
        }

        ThenByDesc(fieldInternalName: string, override?: boolean, useIndexForOrderBy?: boolean) {
            this.builder.WriteFieldRef(fieldInternalName, { Descending: true });
            return new SortedQuery(this.builder);
        }

        ToString() {
            return this.builder.Finalize();
        }
    }

    class Builder {
        constructor() {
            this.tree = new Array();
            this.unclosedTags = 0;
        }
        tree: any[];
        unclosedTags: number;

        WriteStart(tagName: string) {
            this.tree.push({ Element: "Start", Name: tagName });
        }
        WriteEnd(count?: number) {
            if (count > 0)
                this.tree.push({ Element: "End", Count: count });
            else
                this.tree.push({ Element: "End" });
        }
        WriteFieldRef(fieldInternalName: string, options?: any) {
            var fieldRef = { Element: 'FieldRef', Name: fieldInternalName };
            for (var name in options || {}) {
                fieldRef[name] = options[name];
            }
            this.tree.push(fieldRef);
        }
        WriteValueElement(valueType: string, value: any) {
            if (valueType == "Date")
                this.tree.push({ Element: "Value", ValueType: "DateTime", Value: value, IncludeTimeValue: false });
            else
                this.tree.push({ Element: "Value", ValueType: valueType, Value: value });
        }
        WriteMembership(startIndex: number, type) {
            this.tree.splice(startIndex, 0, { Element: "Start", Name: "Membership", Attributes: [{ Name: "Type", Value: type }] });
            this.WriteEnd();
        }
        WriteUnaryOperation(startIndex, operation) {
            this.tree.splice(startIndex, 0, { Element: "Start", Name: operation });
            this.WriteEnd();
        }
        WriteBinaryOperation(startIndex, operation, valueType, value) {
            this.tree.splice(startIndex, 0, { Element: "Start", Name: operation });
            this.WriteValueElement(valueType, value);
            this.WriteEnd();
        }
        WriteStartGroupBy(groupFieldName, collapse) {
            if (this.unclosedTags > 0)
            {
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
        }
        WriteStartOrderBy(override, useIndexForOrderBy) {
            if (this.unclosedTags > 0)
            {
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
                    if (this.tree[i].IncludeTimeValue === false)
                        writer.writeAttributeString("IncludeTimeValue", "False");
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
    export class CamlValues {
        static UserID: string = "{UserID}";
        static Today: string = "{Today}";
        static Now: string = "{Now}";
        static ListProperty = {
            Created: "{ListProperty Name=\"Created\"}",
            DefaultViewUrl: "{ListProperty Name=\"DefaultViewUrl\"}",
            Description: "{ListProperty Name=\"Description\"}",
            EnableSyndication: "{ListProperty Name=\"EnableSyndication\"}",
            ItemCount: "{ListProperty Name=\"ItemCount\"}",
            LinkTitle: "{ListProperty Name=\"LinkTitle\"}",
            MajorVersionLimit: "{ListProperty Name=\"MajorVersionLimit\"}",
            MajorWithMinorVersionsLimit: "{ListProperty Name=\"MajorWithMinorVersionsLimit\"}",
            RelativeFolderPath: "{ListProperty Name=\"RelativeFolderPath\"}",
            Title: "{ListProperty Name=\"Title\"}",
            ViewSelector: "{ListProperty Name=\"ViewSelector\"}"
        };
        static ProjectProperty = {
            BlogCategoryTitle: "{ProjectProperty Name=\"BlogCategoryTitle\"}",
            BlogPostTitle: "{ProjectProperty Name=\"BlogPostTitle\"}",
            Description: "{ProjectProperty Name=\"Description\"}",
            RecycleBinEnabled: "{ProjectProperty Name=\"RecycleBinEnabled\"}",
            SiteOwnerName: "{ProjectProperty Name=\"SiteOwnerName\"}",
            SiteUrl: "{ProjectProperty Name=\"SiteUrl\"}",
            Title: "{ProjectProperty Name=\"Title\"}",
            Url: "{ProjectProperty Name=\"Url\"}"
        }
    }
}


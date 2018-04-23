class CamlBuilder {
    constructor() {
    }
    /** Generate CAML Query, starting from <Where> tag */
    Where(): CamlBuilder.IFieldExpression {
        return CamlBuilder.Internal.createWhere();
    }
    /** Generate <View> tag for SP.CamlQuery
        @param viewFields If omitted, default view fields are requested; otherwise, only values for the fields with the specified internal names are returned.
                          Specifying view fields is a good practice, as it decreases traffic between server and client. */
    View(viewFields?: string[]): CamlBuilder.IView {
        return CamlBuilder.Internal.createView(viewFields);
    }

    /** Generate <ViewFields> tag for SPServices */
    ViewFields(viewFields: string[]): CamlBuilder.IFinalizableToString {
        return CamlBuilder.Internal.createViewFields(viewFields);
    }

    /** Use for:
        1. SPServices CAMLQuery attribute
        2. Creating partial expressions
        3. In conjunction with Any & All clauses
    */
    static Expression(): CamlBuilder.IFieldExpression {
        return CamlBuilder.Internal.createExpression();
    }

    static FromXml(xml: string): CamlBuilder.IRawQuery {
        return CamlBuilder.Internal.createRawQuery(xml);
    }
}

module CamlBuilder {

    declare var SP, Sys, ActiveXObject;

    export interface IView extends IFinalizable {
        /** Define query */
        Query(): IQuery;
        /** Define maximum amount of returned records */
        RowLimit(limit: number, paged?: boolean): IView;
        /** Define view scope */
        Scope(scope: ViewScope): IView;
        /** Join the list you're querying with another list.
            Joins are only allowed through a lookup field relation.
            @param lookupFieldInternalName Internal name of the lookup field, that points to the list you're going to join in.
            @alias alias for the joined list */
        InnerJoin(lookupFieldInternalName: string, alias: string): IJoin;
        /** Join the list you're querying with another list.
            Joins are only allowed through a lookup field relation.
            @param lookupFieldInternalName Internal name of the lookup field, that points to the list you're going to join in.
            @alias alias for the joined list */
        LeftJoin(lookupFieldInternalName: string, alias: string): IJoin;
    }
    export interface IJoinable {
        /** Join the list you're querying with another list.
            Joins are only allowed through a lookup field relation.
            @param lookupFieldInternalName Internal name of the lookup field, that points to the list you're going to join in.
            @param alias Alias for the joined list
            @param fromList (optional) List where the lookup column resides - use it only for nested joins */
        InnerJoin(lookupFieldInternalName: string, alias: string, fromList?: string): IJoin;
        /** Join the list you're querying with another list.
            Joins are only allowed through a lookup field relation.
            @param lookupFieldInternalName Internal name of the lookup field, that points to the list you're going to join in.
            @param alias Alias for the joined list
            @param fromList (optional) List where the lookup column resides - use it only for nested joins */
        LeftJoin(lookupFieldInternalName: string, alias: string, fromList?: string): IJoin;
    }
    export interface IJoin extends IJoinable {
        /** Select projected field for using in the main Query body
            @param remoteFieldAlias By this alias, the field can be used in the main Query body. */
        Select(remoteFieldInternalName: string, remoteFieldAlias: string): IProjectableView;
    }
    export interface IProjectableView extends IJoinable {
        /** Define query */
        Query(): IQuery;
        /** Define maximum amount of returned records */
        RowLimit(limit: number, paged?: boolean): IView;
        /** Define view scope */
        Scope(scope: ViewScope): IView;
        /** Select projected field for using in the main Query body
            @param remoteFieldAlias By this alias, the field can be used in the main Query body. */
        Select(remoteFieldInternalName: string, remoteFieldAlias: string): IProjectableView;
    }
    export enum ViewScope {
        Recursive,
        RecursiveAll,
        FilesOnly
    }
    export interface IQuery extends IGroupable {
        Where(): IFieldExpression;
    }
    export interface IFinalizableToString {
        /** Get the resulting CAML query as string */
        ToString(): string;
    }
    export interface IFinalizable extends IFinalizableToString {
        /** Get the resulting CAML query as SP.CamlQuery object */
        ToCamlQuery(): any;
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
        /** Adds And clauses to the query. Use for creating bracket-expressions in conjuction with CamlBuilder.Expression(). */
        All(conditions: IExpression[]): IExpression;
        /** Adds Or clauses to the query. Use for creating bracket-expressions in conjuction with CamlBuilder.Expression(). */
        Any(conditions: IExpression[]): IExpression;
        /** Specifies that a condition will be tested against the field with the specified internal name, and the type of this field is Text */
        TextField(internalName: string): ITextFieldExpression;
        /** Specifies that a condition will be tested against the field with the specified internal name, and the type of this field is Choice */
        ChoiceField(internalName: string): ITextFieldExpression;
        /** Specifies that a condition will be tested against the field with the specified internal name, and the type of this field is Computed */
        ComputedField(internalName: string): ITextFieldExpression;
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
        /** Specifies that a condition will be tested against the field with the specified internal name, and the type of this field is LookupMulti */
        LookupMultiField(internalName: string): ILookupMultiFieldExpression;
        /** Specifies that a condition will be tested against the field with the specified internal name, and the type of this field is UserMulti */
        UserMultiField(internalName: string): IUserMultiFieldExpression;
        /** Specifies that a condition will be tested against the field with the specified internal name, and the type of this field is Date */
        DateField(internalName: string): IDateTimeFieldExpression;
        /** Specifies that a condition will be tested against the field with the specified internal name, and the type of this field is DateTime */
        DateTimeField(internalName: string): IDateTimeFieldExpression;
        /** Specifies that a condition will be tested against the field with the specified internal name, and the type of this field is ModStat (moderation status) */
        ModStatField(internalName: string): IModStatFieldExpression;
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
        /** Checks whether the value of the User field is equal to id of the current user */
        EqualToCurrentUser(): IExpression;
        /** Checks whether the group specified by the value of the field includes the current user. */
        IsInCurrentUserGroups(): IExpression;
        /** Checks whether the user specified by the value of the field is member of the specified SharePoint Group. */
        IsInSPGroup(groupId: number): IExpression;
        /** Checks whether the user specified by the value of the field is member of current SPWeb groups. */
        IsInSPWebGroups(): IExpression;
        /** Checks whether the user specified by the value of the field is in current SPWeb users. */
        IsInSPWebAllUsers(): IExpression;
        /** Checks whether the user specified by the value of the field has received the rights to the site directly (not through a group). */
        IsInSPWebUsers(): IExpression;
        /** Specifies that id of the user will be used for further comparisons. */
        Id(): INumberFieldExpression;
        /** Specifies that lookup target field value will be used for further comparisons. */
        ValueAsText(): ITextFieldExpression;
    }
    /** DEPRECATED!! Please use UserField(...).IsIn* methods instead. This interface will be removed in the next release */
    export interface IMembership {
        /** DEPRECATED. Please use UserField(...).IsInCurrentUserGroups() instead */
        CurrentUserGroups(): IExpression;
        /** DEPRECATED. Please use UserField(...).IsInSPGroup() instead */
        SPGroup(groupId: number): IExpression;
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
        /** Specifies that lookup id value will be used. */
        Id(): INumberFieldExpression;
        /** Specifies that lookup value will be used and this value is of type Text */
        ValueAsText(): ITextFieldExpression;
        /** Specifies that lookup value will be used and this value is of type Number */
        ValueAsNumber(): INumberFieldExpression;
        /** Specifies that lookup value will be used and this value is of type Date */
        ValueAsDate(): IDateTimeFieldExpression;
        /** Specifies that lookup value will be used and this value is of type DateTime */
        ValueAsDateTime(): IDateTimeFieldExpression;
        /** Specifies that lookup value will be used and this value is of type Boolean */
        ValueAsBoolean(): IBooleanFieldExpression;
    }
    export interface ILookupMultiFieldExpression {
        /** Checks a condition against every item in the multi lookup value */
        IncludesSuchItemThat(): ILookupFieldExpression;
        
        /** Checks whether the field values collection is empty */
        IsNull(): IExpression;
        /** Checks whether the field values collection is not empty */
        IsNotNull(): IExpression;

        /** DEPRECATED: use "IncludesSuchItemThat().ValueAsText().EqualTo(value)" instead. */
        Includes(value): IExpression;
        /** DEPRECATED: use "IncludesSuchItemThat().ValueAsText().NotEqualTo(value)" instead. */
        NotIncludes(value): IExpression;

        /** DEPRECATED: "Eq" operation in CAML works exactly the same as "Includes". To avoid confusion, please use Includes. */
        EqualTo(value): IExpression;
        /** DEPRECATED: "Neq" operation in CAML works exactly the same as "NotIncludes". To avoid confusion, please use NotIncludes. */
        NotEqualTo(value): IExpression;
    }
    export interface IUserMultiFieldExpression {
        /** Checks a condition against every item in the multi lookup value */
        IncludesSuchItemThat(): IUserFieldExpression;

        /** Checks whether the field values collection is empty */
        IsNull(): IExpression;
        /** Checks whether the field values collection is not empty */
        IsNotNull(): IExpression;

        /** DEPRECATED: use "IncludesSuchItemThat().ValueAsText().EqualTo(value)" instead. */
        Includes(value): IExpression;
        /** DEPRECATED: use "IncludesSuchItemThat().ValueAsText().NotEqualTo(value)" instead. */
        NotIncludes(value): IExpression;

        /** DEPRECATED: "Eq" operation in CAML works exactly the same as "Includes". To avoid confusion, please use Includes. */
        EqualTo(value): IExpression;
        /** DEPRECATED: "Neq" operation in CAML works exactly the same as "NotIncludes". To avoid confusion, please use NotIncludes. */
        NotEqualTo(value): IExpression;
    }

    export interface IModStatFieldExpression {
        /** Represents moderation status ID. */
        ModStatId(): INumberFieldExpression;
        /** Checks whether the value of the field is Approved - same as ModStatId.EqualTo(0) */
        IsApproved(): IExpression;
        /** Checks whether the value of the field is Rejected - same as ModStatId.EqualTo(1) */
        IsRejected(): IExpression;
        /** Checks whether the value of the field is Pending - same as ModStatId.EqualTo(2) */
        IsPending(): IExpression;
        /** Represents moderation status as localized text. In most cases it is better to use ModStatId in the queries instead of ValueAsText. */
        ValueAsText(): ITextFieldExpression;
    }

    export interface IRawQuery {
        /** Change Where clause */
        ReplaceWhere(): IFieldExpression;
        ModifyWhere(): IRawQueryModify;
    }

    export interface IRawQueryModify {
        AppendOr(): IFieldExpression;
        AppendAnd(): IFieldExpression;
    }

    export enum DateRangesOverlapType {
        /** Returns events for today */
        Now,
        /** Returns events for one day, specified by CalendarDate in QueryOptions */
        Day,
        /** Returns events for one week, specified by CalendarDate in QueryOptions */
        Week,
        /** Returns events for one month, specified by CalendarDate in QueryOptions.
            Caution: usually also returns few days from previous and next months */
        Month,
        /** Returns events for one year, specified by CalendarDate in QueryOptions */
        Year
    }

    export class Internal {
        static createView(viewFields?: string[]): IView {
            return new ViewInternal().View(viewFields);
        }
        static createViewFields(viewFields: string[]): IFinalizableToString {
            return new ViewInternal().CreateViewFields(viewFields);
        }
        static createWhere(): IFieldExpression {
            return new QueryInternal().Where();
        }
        static createExpression(): IFieldExpression {
            return new FieldExpression(new Builder());
        }
        static createRawQuery(xml: string): IRawQuery {
            return new RawQueryInternal(xml);
        }
    }

    class ViewInternal implements IView {
        constructor() {
            this.builder = new Builder();
        }
        private builder: Builder;
        private joinsManager: JoinsManager;
        /** Adds View element. */
        View(viewFields?: string[]): IView {
            this.builder.WriteStart("View");
            this.builder.unclosedTags++;
            if (viewFields && viewFields.length > 0)
                this.CreateViewFields(viewFields);
            this.joinsManager = new JoinsManager(this.builder, this);
            return this;
        }
        CreateViewFields(viewFields: string[]): IFinalizableToString {
            this.builder.WriteStart("ViewFields");
            for (var i = 0; i < viewFields.length; i++) {
                this.builder.WriteFieldRef(viewFields[i]);
            }
            this.builder.WriteEnd();
            return this;
        }
        RowLimit(limit: number, paged?: boolean): IView {
            this.builder.WriteRowLimit(paged || false, limit);
            return this;
        }
        Scope(scope: ViewScope): IView {
            switch (scope) {
                case ViewScope.FilesOnly:
                    this.builder.SetAttributeToLastElement("View", "Scope", "FilesOnly");
                    break;
                case ViewScope.Recursive:
                    this.builder.SetAttributeToLastElement("View", "Scope", "Recursive");
                    break;
                case ViewScope.RecursiveAll:
                    this.builder.SetAttributeToLastElement("View", "Scope", "RecursiveAll");
                    break;
                default:
                    throw new Error('Incorrect view scope! Please use values from CamlBuilder.ViewScope enumeration.');
            }
            return this;
        }
        InnerJoin(lookupFieldInternalName: string, alias: string, fromList?: string): IJoin {
            return this.joinsManager.Join(lookupFieldInternalName, alias, "INNER", fromList);
        }
        LeftJoin(lookupFieldInternalName: string, alias: string, fromList?: string): IJoin {
            return this.joinsManager.Join(lookupFieldInternalName, alias, "LEFT", fromList);
        }
        /** Select projected field for using in the main Query body
            @param remoteFieldAlias By this alias, the field can be used in the main Query body. */
        Select(remoteFieldInternalName: string, remoteFieldAlias: string): IProjectableView {
            return this.joinsManager.ProjectedField(remoteFieldInternalName, remoteFieldAlias);
        }
        ToString(): string {
            if (this.joinsManager != null)
                this.joinsManager.Finalize();
            return this.builder.Finalize();
        }
        ToCamlQuery(): any {
            this.joinsManager.Finalize();
            return this.builder.FinalizeToSPQuery();
        }

        /** Adds Query clause to the View XML. */
        Query(): IQuery {
            this.joinsManager.Finalize();
            this.builder.WriteStart("Query");
            this.builder.unclosedTags++;
            return new QueryInternal(this.builder);
        }
    }

    /** Represents SharePoint CAML Query element */
    class QueryInternal implements IQuery  {
        constructor(builder?: Builder) {
            this.builder = builder || new Builder();
        }
        private builder: Builder;
        /** Adds Where clause to the query, inside you can specify conditions for certain field values. */
        Where(): IFieldExpression {
            this.builder.WriteStart("Where");
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

        ToString(): string {
            return this.builder.Finalize();
        }
        ToCamlQuery(): any {
            return this.builder.FinalizeToSPQuery();
        }
    }
    class JoinsManager {
        constructor(builder: Builder, viewInternal: ViewInternal) {
            this.projectedFields = [];
            this.joins = [];
            this.originalView = viewInternal;
            this.builder = builder;
        }
        private builder: Builder;
        private originalView: ViewInternal;
 
        Finalize() {
            if (this.joins.length > 0) {
                this.builder.WriteStart("Joins");
                for (var i = 0; i < this.joins.length; i++) {
                    var join = this.joins[i];
                    this.builder.WriteStart("Join", [
                        { Name: "Type", Value: join.JoinType },
                        { Name: "ListAlias", Value: join.Alias }
                    ]);
                    this.builder.WriteStart("Eq");
                    var fieldAttrs = { RefType: "ID" };
                    if (join.FromList)
                        fieldAttrs["List"] = join.FromList;
                    this.builder.WriteFieldRef(join.RefFieldName, fieldAttrs);
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
        }
        private joins: { RefFieldName: string, Alias: string, JoinType: string, FromList?: string }[];
        private projectedFields: any[];
        Join(lookupFieldInternalName: string, alias: string, joinType: string, fromList?: string): IJoin {
            this.joins.push({ RefFieldName: lookupFieldInternalName, Alias: alias, JoinType: joinType, FromList: fromList });
            return new Join(this.builder, this);
        }
        ProjectedField(remoteFieldInternalName: string, remoteFieldAlias: string): IProjectableView {
            this.projectedFields.push({ FieldName: remoteFieldInternalName, Alias: remoteFieldAlias, JoinAlias: this.joins[this.joins.length - 1].Alias });
            return this.originalView;
        }
    }
    class Join implements IJoin {
        constructor(builder: Builder, joinsManager: JoinsManager) {
            this.builder = builder;
            this.joinsManager = joinsManager;
        }
        private builder: Builder;
        private joinsManager: JoinsManager;
        /** Select projected field for using in the main Query body
            @param remoteFieldAlias By this alias, the field can be used in the main Query body. */
        Select(remoteFieldInternalName: string, remoteFieldAlias: string): IProjectableView {
            return this.joinsManager.ProjectedField(remoteFieldInternalName, remoteFieldAlias);
        }
        InnerJoin(lookupFieldInternalName: string, alias: string, fromList?: string): IJoin {
            return this.joinsManager.Join(lookupFieldInternalName, alias, "INNER", fromList);
        }
        LeftJoin(lookupFieldInternalName: string, alias: string, fromList?: string): IJoin {
            return this.joinsManager.Join(lookupFieldInternalName, alias, "LEFT", fromList);
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

        /** Returns SP.CamlQuery object that represents the constructed query
        */
        ToCamlQuery() {
            return this.builder.FinalizeToSPQuery();
        }

    }

    enum ModifyType {
        Replace,
        AppendOr,
        AppendAnd
    }

    class RawQueryInternal implements IRawQuery, IRawQueryModify {
        public constructor(xml: string) {
            this.xml = xml;
        }
        private xml: string;

        public ReplaceWhere(): IFieldExpression {
            return this.modifyWhere(ModifyType.Replace);
        }
        public ModifyWhere(): IRawQueryModify {
            return this;
        }
        public AppendOr(): IFieldExpression {
            return this.modifyWhere(ModifyType.AppendOr);
        }
        public AppendAnd(): IFieldExpression {
            return this.modifyWhere(ModifyType.AppendAnd);
        }

        private modifyWhere(modifyType: ModifyType): IFieldExpression {
            var builder = new Builder();
            var xmlDoc: Document = this.getXmlDocument(this.xml);

            var whereBuilder = this.parseRecursive(builder, xmlDoc.documentElement, modifyType);
            if (whereBuilder == null)
                throw new Error("CamlJs error: cannot find Query tag in provided XML")

            builder.WriteStart("Where");
            builder.unclosedTags++;
            switch (modifyType) {
                case ModifyType.Replace:
                    return new FieldExpression(builder);
                case ModifyType.AppendAnd:
                    var pos = builder.tree.length;
                    builder.WriteStart("And");
                    builder.unclosedTags++;
                    builder.tree = builder.tree.concat(whereBuilder.tree);
                    return new FieldExpression(builder);
                case ModifyType.AppendOr:
                    var pos = builder.tree.length;
                    builder.WriteStart("Or");
                    builder.unclosedTags++;
                    builder.tree = builder.tree.concat(whereBuilder.tree);
                    return new FieldExpression(builder);
                default:
                    throw new Error("CamlJs error: unknown ModifyType " + modifyType);
            }
        }

        private getXmlDocument(xml: string): Document {
            var xmlDoc: Document;
            if (window["DOMParser"]) {
                var parser = new DOMParser();
                xmlDoc = parser.parseFromString(this.xml, "text/xml");
            }
            else // Internet Explorer
            {
                xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
                xmlDoc["async"] = false;
                xmlDoc["loadXML"](this.xml);
            }
            return xmlDoc;
        }

        private parseRecursive(builder: Builder, node: Node, modifyType: ModifyType): Builder {
            if (node.nodeName == "#text") {
                builder.tree.push({ Element: "Raw", Xml: node.nodeValue });
                return;
            }

            var attrs = [];
            for (var i = 0, len = (<HTMLElement>node).attributes.length; i < len; i++) {
                attrs.push({ Name: (<HTMLElement>node).attributes[i].name, Value: (<HTMLElement>node).attributes[i].value });
            }
            builder.WriteStart(node.nodeName, attrs);
            builder.unclosedTags++;
            var found = node.nodeName == "Query" ? new Builder() : null;
            for (var i = 0, len = node.childNodes.length; i < len; i++) {
                if (node.nodeName == "Query" && node.childNodes[i].nodeName == "Where") {
                    var whereBuilder = new Builder();
                    var whereNode = node.childNodes[i];
                    for (var w = 0, wlen = whereNode.childNodes.length; w < wlen; w++) {
                        this.parseRecursive(whereBuilder, whereNode.childNodes[w], modifyType);
                    }
                    found = whereBuilder;
                    continue;
                }

                var result = this.parseRecursive(builder, node.childNodes[i], modifyType)
                if (found == null)
                    found = result;
            }
            if (!found) {
                builder.unclosedTags--;
                builder.WriteEnd();
            }
            return found;
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
        /** Specifies that a condition will be tested against the field with the specified internal name, and the type of this field is Choice */
        ChoiceField(internalName: string): ITextFieldExpression {
            return new FieldExpressionToken(this.builder, internalName, "Choice");
        }
        /** Specifies that a condition will be tested against the field with the specified internal name, and the type of this field is Computed */
        ComputedField(internalName: string): ITextFieldExpression {
            return new FieldExpressionToken(this.builder, internalName, "Computed");
        };
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
            return new LookupFieldExpression(this.builder, internalName);
        }
        /** Specifies that a condition will be tested against the field with the specified internal name, and the type of this field is LookupMulti */
        LookupMultiField(internalName: string): ILookupMultiFieldExpression {
            return new LookupOrUserMultiFieldExpression(this.builder, internalName, FieldMultiExpressionType.LookupMulti);
        }
        /** Specifies that a condition will be tested against the field with the specified internal name, and the type of this field is UserMulti */
        UserMultiField(internalName: string): IUserMultiFieldExpression {
            return new LookupOrUserMultiFieldExpression(this.builder, internalName, FieldMultiExpressionType.UserMulti);
        }
        /** Specifies that a condition will be tested against the field with the specified internal name, and the type of this field is Date */
        DateField(internalName: string): IDateTimeFieldExpression {
            return new FieldExpressionToken(this.builder, internalName, "Date");
        }
        /** Specifies that a condition will be tested against the field with the specified internal name, and the type of this field is DateTime */
        DateTimeField(internalName: string): IDateTimeFieldExpression {
            return new FieldExpressionToken(this.builder, internalName, "DateTime");
        }
        /** Specifies that a condition will be tested against the field with the specified internal name, and the type of this field is ModStat (moderation status) */
        ModStatField(internalName: string): IModStatFieldExpression {
            return new ModStatFieldExpression(this.builder, internalName);
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

            this.builder.WriteValueElement("Date", value);
            this.builder.WriteEnd();

            // TODO: write CalendarDate to QueryOptions

            return new QueryToken(this.builder, pos);
        }
        /** Adds And clauses to the query. Use for creating bracket-expressions in conjuction with CamlBuilder.Expression(). */
        All(...conditions: any[]): IExpression {
            var pos = this.builder.tree.length;

            if (conditions.length == 1 && conditions[0] instanceof Array)
                conditions = conditions[0];

            var builders = [];
            for (var i = 0; i < conditions.length; i++)
                builders.push(<Builder>conditions[i]["builder"]);

            this.builder.WriteConditions(builders, "And");
            return new QueryToken(this.builder, pos);
        }
        /** Adds Or clauses to the query. Use for creating bracket-expressions in conjuction with CamlBuilder.Expression(). */
        Any(...conditions: any[]): IExpression {
            var pos = this.builder.tree.length;

            if (conditions.length == 1 && conditions[0] instanceof Array)
                conditions = conditions[0];

            var builders = [];
            for (var i = 0; i < conditions.length; i++)
                builders.push(<Builder>conditions[i]["builder"]);

            this.builder.WriteConditions(builders, "Or");
            return new QueryToken(this.builder, pos);
        }
    }

    enum FieldMultiExpressionType {
        UserMulti,
        LookupMulti
    }

    class LookupOrUserMultiFieldExpression implements ILookupMultiFieldExpression {
        constructor(builder: Builder, name: string, type: FieldMultiExpressionType) {
            this.builder = builder;
            this.name = name;
            this.type = type;
            if (this.type == FieldMultiExpressionType.UserMulti)
                this.typeAsString = "UserMulti";
            else
                this.typeAsString = "LookupMulti";
        }
        private builder: Builder;
        private type: FieldMultiExpressionType;
        private name: string;
        private typeAsString: string;

        IncludesSuchItemThat(): any {
            if (this.type == FieldMultiExpressionType.LookupMulti)
                return new LookupFieldExpression(this.builder, this.name);
            else
                return new UserFieldExpression(this.builder, this.name);
        }

        IsNull(): IExpression {
            return new FieldExpressionToken(this.builder, this.name, this.typeAsString, false).IsNull();
        }

        IsNotNull(): IExpression {
            return new FieldExpressionToken(this.builder, this.name, this.typeAsString, false).IsNotNull();
        }

        Includes(value): IExpression {
            return new FieldExpressionToken(this.builder, this.name, this.typeAsString, false).EqualTo(value);
        }

        NotIncludes(value): IExpression {
            return new FieldExpressionToken(this.builder, this.name, this.typeAsString, false).NotEqualTo(value);
        }

        EqualTo(value): IExpression {
            return new FieldExpressionToken(this.builder, this.name, this.typeAsString, false).EqualTo(value);
        }

        NotEqualTo(value): IExpression {
            return new FieldExpressionToken(this.builder, this.name, this.typeAsString, false).NotEqualTo(value);
        }

    }

    class LookupFieldExpression implements ILookupFieldExpression {
        constructor(builder: Builder, name: string) {
            this.builder = builder;
            this.name = name;
        }
        private builder: Builder;
        private name: string;
        Id(): INumberFieldExpression {
            return new FieldExpressionToken(this.builder, this.name, "Integer", true);
        }
        Value(): ITextFieldExpression {
            return new FieldExpressionToken(this.builder, this.name, "Lookup");
        }
        ValueAsText(): ITextFieldExpression {
            return new FieldExpressionToken(this.builder, this.name, "Text");
        }
        ValueAsNumber(): INumberFieldExpression {
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
                CurrentUserGroups: (): IExpression => {
                    return self.IsInCurrentUserGroups();
                },
                /** DEPRECATED. Please use UserField(...).IsInSPGroup() instead */
                SPGroup: (groupId: number): IExpression => {
                    return self.IsInSPGroup(groupId);
                },
                /** DEPRECATED. Please use UserField(...).IsInSPWeb* methods instead */
                SPWeb: {
                    /** DEPRECATED. Please use UserField(...).IsInSPWebAllUsers() instead */
                    AllUsers: (): IExpression => {
                        return self.IsInSPWebAllUsers();
                    },
                    /** DEPRECATED. Please use UserField(...).IsInSPWebUsers() instead */
                    Users: (): IExpression => {
                        return self.IsInSPWebUsers();
                    },
                    /** DEPRECATED. Please use UserField(...).IsInSPWebGroups() instead */
                    Groups: (): IExpression => {
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
        IsInSPGroup(groupId: number): IExpression {
            this.builder.WriteFieldRef(this.name);
            this.builder.WriteMembership(this.startIndex, "SPGroup", groupId);
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

    class ModStatFieldExpression implements IModStatFieldExpression {
        constructor(builder: Builder, name: string) {
            this.builder = builder;
            this.name = name;
            this.startIndex = builder.tree.length;
        }
        private builder: Builder;
        private name: string;
        private startIndex: number;
        ModStatId() {
            return new FieldExpressionToken(this.builder, this.name, "ModStat");
        }
        IsApproved() {
            return new FieldExpressionToken(this.builder, this.name, "ModStat").EqualTo(0);
        }
        IsRejected() {
            return new FieldExpressionToken(this.builder, this.name, "ModStat").EqualTo(1);
        }
        IsPending() {
            return new FieldExpressionToken(this.builder, this.name, "ModStat").EqualTo(2);
        }
        ValueAsText() {
            return new FieldExpressionToken(this.builder, this.name, "Text");
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
            if (value === true)
                value = 1;
            if (value === false)
                value = 0;
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

        ToCamlQuery() {
            return this.builder.FinalizeToSPQuery();
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

        ToCamlQuery() {
            return this.builder.FinalizeToSPQuery();
        }
    }

    class Builder {
        constructor() {
            this.tree = new Array();
            this.unclosedTags = 0;
        }
        tree: any[];
        unclosedTags: number;

        SetAttributeToLastElement(tagName: string, attributeName: string, attributeValue: string) {
            for (var i = this.tree.length - 1; i >= 0; i--) {
                if (this.tree[i].Name == tagName) {
                    this.tree[i].Attributes = this.tree[i].Attributes || [];
                    this.tree[i].Attributes.push({Name: attributeName, Value: attributeValue})
                    return;
                }
            }
            throw new Error("CamlJs ERROR: can't find element '" + tagName + "' in the tree while setting attribute " + attributeName + " to '" + attributeValue + "'!");
        }
        WriteRowLimit(paged: boolean, limit: number) {
            if (paged)
                this.tree.push({ Element: "Start", Name: "RowLimit", Attributes: [{ Name: "Paged", Value: "TRUE" }] });
            else
                this.tree.push({ Element: "Start", Name: "RowLimit" });

            this.tree.push({ Element: "Raw", Xml: limit });

            this.tree.push({ Element: "End" });
        }
        WriteStart(tagName: string, attributes?: any[]) {
            if (attributes)
                this.tree.push({ Element: "Start", Name: tagName, Attributes: attributes });
            else
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
                this.tree.push({ Element: "Value", ValueType: "DateTime", Value: value });
            else if (valueType == "DateTime")
                this.tree.push({ Element: "Value", ValueType: "DateTime", Value: value, IncludeTimeValue: true });
            else
                this.tree.push({ Element: "Value", ValueType: valueType, Value: value });
        }
        WriteMembership(startIndex: number, type, groupId?: number) {
            var attributes = [{ Name: "Type", Value: type }];
            if (groupId) {
                attributes.push({ Name: "ID", Value: groupId });
            }
            this.tree.splice(startIndex, 0, { Element: "Start", Name: "Membership", Attributes: attributes });
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
                if (tagsToClose > 0)
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
                if (tagsToClose > 0)
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
        WriteConditions(builders: Builder[], elementName: string) {
            var pos = this.tree.length;
            builders.reverse();
            for (var i = 0; i < builders.length; i++) {
                var conditionBuilder = builders[i];
                if (conditionBuilder.unclosedTags > 0)
                    conditionBuilder.WriteEnd(conditionBuilder.unclosedTags);
                if (i > 0) {
                    conditionBuilder.tree.splice(0, 0, { Element: "Start", Name: elementName });
                    this.WriteEnd();
                }
                Array.prototype.splice.apply(this.tree, [pos, 0].concat(conditionBuilder.tree));
            }
        }
        Finalize(): string {
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
                            writer.writeAttributeString(
                                this.tree[i].Attributes[a].Name,
                                this.tree[i].Attributes[a].Value);
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
        }
        FinalizeToSPQuery() {
            var camlQuery = this.Finalize();
            if (camlQuery.indexOf("<View") != 0)
                camlQuery = "<View><Query>" + camlQuery + "</Query></View>";
            var query = new SP.CamlQuery();
            query.set_viewXml(camlQuery);
            return query;
        }
    }
    export class CamlValues {
        /** Dynamic value that represents Id of the current user */
        static UserID: string = "{UserID}";
        /** Dynamic value that represents current date */
        static Today: string = "{Today}";
        /** Dynamic value that represents current date with specified offset (may be negative) */
        static TodayWithOffset(offsetDays: number): string {
            return "{Today OffsetDays=\"" + offsetDays + "\"}";
        }
        static Now: string = "{Now}";
        /** Dynamic value that represents a property of the current list */
        static ListProperty = {
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
        /** Dynamic value that represents a property of the current SPWeb */
        static ProjectProperty = {
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
        }
    }
}

export = CamlBuilder;

// -------------------- Dependencies ------------------

(function(window) {

    if (typeof (window["Sys"]) == "undefined" || window["Sys"] == null) {
        window["Sys"] = {};
        window["Sys"].StringBuilder = function Sys$StringBuilder(initialText) {
            this._parts = (typeof (initialText) !== 'undefined' && initialText !== null && initialText !== '') ?
            [initialText.toString()] : [];
            this._value = {};
            this._len = 0;
        }
    
        var Sys$StringBuilder$append = function(text) {
            this._parts[this._parts.length] = text;
        }
        var Sys$StringBuilder$appendLine = function(text) {
            this._parts[this._parts.length] =
            ((typeof (text) === 'undefined') || (text === null) || (text === '')) ?
            '\r\n' : text + '\r\n';
        }
        var Sys$StringBuilder$clear = function() {
            this._parts = [];
            this._value = {};
            this._len = 0;
        }
        var Sys$StringBuilder$isEmpty = function() {
            if (this._parts.length === 0) return true;
            return this.toString() === '';
        }
        var Sys$StringBuilder$toString = function(separator) {
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
                        }
                        else {
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
        }
    
    }
    
    if (typeof window["SP"] == 'undefined') {
        window["SP"] = {};

        var SP_ScriptUtility$isNullOrEmptyString = function(str) {
            var strNull = null;

            return str === strNull || typeof str === 'undefined' || !str.length;
        };

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
                }
                else {
                    this.$1_0.append('</');
                    this.$1_0.append(this.$11_0);
                    this.$1_0.append('>');
                }
                this.$f_0.pop();
                if (this.$f_0.length > 0) {
                    this.$11_0 = this.$f_0[this.$f_0.length - 1];
                }
                else {
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
                }
                else {
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
                    }
                    else if ($v_1 === 60) {
                        this.$1_0.append('&lt;');
                    }
                    else if ($v_1 === 38) {
                        this.$1_0.append('&amp;');
                    }
                    else if ($v_1 === 34 && $p1) {
                        this.$1_0.append('&quot;');
                    }
                    else if ($v_1 === 39 && $p1) {
                        this.$1_0.append('&apos;');
                    }
                    else if ($v_1 === 9 && $p1) {
                        this.$1_0.append('&#09;');
                    }
                    else if ($v_1 === 10) {
                        this.$1_0.append('&#10;');
                    }
                    else if ($v_1 === 13) {
                        this.$1_0.append('&#13;');
                    }
                    else {
                        this.$1_0.append(($p0.charAt($v_0)).toString());
                    }
                }
            },
            close: function SP_XmlWriter$close() {
            }
        };
    }

})(typeof window != "undefined" ? window : global);
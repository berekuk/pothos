import { BuildQueryResult, DBQueryConfig, Relation, TableRelationalConfig } from 'drizzle-orm';
import { GraphQLResolveInfo } from 'graphql';
import {
  FieldKind,
  FieldMap,
  FieldNullability,
  FieldOptionsFromKind,
  InputFieldMap,
  InputShapeFromFields,
  InterfaceParam,
  MaybePromise,
  Normalize,
  ObjectRef,
  ObjectTypeOptions,
  SchemaTypes,
  ShapeFromTypeParam,
  TypeParam,
} from '@pothos/core';
import type { DrizzleObjectFieldBuilder } from './drizzle-field-builder';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export interface DrizzlePluginOptions<Types extends SchemaTypes> {
  client: unknown;
}

export const drizzleTableName = Symbol.for('Pothos.drizzleTableName');

export type DrizzleObjectOptions<
  Types extends SchemaTypes,
  Table,
  Shape,
  Selection,
  Interfaces extends InterfaceParam<Types>[],
> = Omit<
  ObjectTypeOptions<Types, ObjectRef<Types, Shape>, Shape, Interfaces> & {
    name: string;
    select?: Selection;
  },
  'fields'
> & {
  fields?: (
    t: DrizzleObjectFieldBuilder<
      Types,
      Table extends keyof Types['DrizzleRelationSchema']
        ? Types['DrizzleRelationSchema'][Table]
        : never,
      Shape & { [drizzleTableName]?: Table }
    >,
  ) => FieldMap;
};

export type DrizzleFieldOptions<
  Types extends SchemaTypes,
  ParentShape,
  Type extends TypeParam<Types>,
  Nullable extends FieldNullability<Type>,
  Args extends InputFieldMap,
  Kind extends FieldKind,
  ResolveShape,
  ResolveReturnShape,
  Param,
> = Omit<
  FieldOptionsFromKind<
    Types,
    ParentShape,
    Type,
    Nullable,
    Args,
    Kind,
    ResolveShape,
    ResolveReturnShape
  >,
  'type' | 'resolve'
> & {
  type: Param;
  resolve: (
    query: DBQueryConfig<
      Param extends [unknown] ? 'many' : 'one',
      false,
      Types['DrizzleRelationSchema'],
      Types['DrizzleRelationSchema'][(Param extends [unknown] ? Param[0] : Param) &
        keyof Types['DrizzleRelationSchema']]
    >,
    parent: ParentShape,
    args: InputShapeFromFields<Args>,
    ctx: Types['Context'],
    info: GraphQLResolveInfo,
  ) => MaybePromise<ShapeFromTypeParam<Types, Type, Nullable>>;
};

export type DrizzleObjectFieldOptions<
  Types extends SchemaTypes,
  ParentShape,
  Type extends TypeParam<Types>,
  Nullable extends FieldNullability<Type>,
  Args extends InputFieldMap,
  Select,
  ResolveReturnShape,
> = PothosSchemaTypes.ObjectFieldOptions<
  Types,
  Normalize<
    Omit<
      unknown extends Select
        ? ParentShape
        : ParentShape &
            BuildQueryResult<
              Types['DrizzleRelationSchema'],
              ExtractTable<Types, ParentShape>,
              (Select extends (...args: any[]) => infer R ? R : Select) & Record<string, unknown>
            >,
      typeof drizzleTableName
    >
  >,
  Type,
  Nullable,
  Args,
  ResolveReturnShape
> & {
  select?: Select &
    (
      | DBQueryConfig<
          'one',
          false,
          Types['DrizzleRelationSchema'],
          ExtractTable<Types, ParentShape>
        >
      | ((
          args: InputShapeFromFields<Args>,
          ctx: Types['Context'],
          nestedSelection: <Selection extends boolean | {}>(
            selection?: Selection,
            path?: string[],
          ) => Selection,
        ) => DBQueryConfig<
          'one',
          false,
          Types['DrizzleRelationSchema'],
          ExtractTable<Types, ParentShape>
        >)
    );
};

type ExtractTable<Types extends SchemaTypes, Shape> = Shape extends {
  [drizzleTableName]?: keyof Types['DrizzleRelationSchema'];
}
  ? Types['DrizzleRelationSchema'][NonNullable<Shape[typeof drizzleTableName]>]
  : never;

export type RelatedFieldOptions<
  Types extends SchemaTypes,
  Table extends TableRelationalConfig,
  Field extends keyof Table['relations'],
  Nullable extends boolean,
  Args extends InputFieldMap,
  ResolveReturnShape,
  Shape,
> = Omit<
  DrizzleObjectFieldOptions<
    Types,
    Shape,
    RefForRelation<Types, Table['relations'][Field]>,
    Nullable,
    Args,
    {
      columns: {};
      with: { [K in Field]: true };
    },
    ResolveReturnShape
  >,
  'resolve' | 'type' | 'description' | 'select'
> & {
  description?: string | false;
  type?: ObjectRef<Types, TypesForRelation<Types, Table['relations'][Field]>>;
  query?: QueryForField<Types, Args, Table['relations'][Field]>;
};

export type RefForRelation<Types extends SchemaTypes, Rel extends Relation> = Rel extends {
  $relationBrand: 'One';
}
  ? ObjectRef<Types, TypesForRelation<Types, Rel>>
  : [ObjectRef<Types, TypesForRelation<Types, Rel>>];

export type TypesForRelation<Types extends SchemaTypes, Rel extends Relation> = BuildQueryResult<
  Types['DrizzleRelationSchema'],
  Types['DrizzleRelationSchema'][Rel['referencedTable']['_']['name']],
  true
>;

export type QueryForField<
  Types extends SchemaTypes,
  Args extends InputFieldMap,
  Rel extends Relation,
> = (
  Rel extends {
    $relationBrand: 'One';
  }
    ? Omit<
        DBQueryConfig<
          'one',
          false,
          Types['DrizzleRelationSchema'],
          Types['DrizzleRelationSchema'][Rel['referencedTable']['_']['name']]
        >,
        'with' | 'columns' | 'extra'
      >
    : Omit<
        DBQueryConfig<
          'many',
          false,
          Types['DrizzleRelationSchema'],
          Types['DrizzleRelationSchema'][Rel['referencedTable']['_']['name']]
        >,
        'with' | 'columns' | 'extra'
      >
) extends infer QueryConfig
  ? QueryConfig | ((args: InputShapeFromFields<Args>, context: Types['Context']) => QueryConfig)
  : never;

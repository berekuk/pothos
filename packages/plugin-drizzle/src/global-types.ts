import type {
  BuildQueryResult,
  DBQueryConfig,
  ExtractTablesWithRelations,
  TableRelationalConfig,
} from 'drizzle-orm';
import {
  FieldKind,
  FieldNullability,
  FieldRef,
  InputFieldMap,
  InterfaceParam,
  SchemaTypes,
  ShapeFromTypeParam,
  TypeParam,
} from '@pothos/core';

import type {
  DrizzleFieldOptions,
  DrizzleObjectFieldOptions,
  DrizzleObjectOptions,
  DrizzlePluginOptions,
  PothosDrizzlePlugin,
} from '.';

declare global {
  export namespace PothosSchemaTypes {
    export interface Plugins<Types extends SchemaTypes> {
      drizzle: PothosDrizzlePlugin<Types>;
    }

    export interface SchemaBuilderOptions<Types extends SchemaTypes> {
      drizzle: DrizzlePluginOptions<Types>;
    }

    export interface UserSchemaTypes {
      DrizzleSchema: Record<string, unknown>;
      DrizzleRelationSchema: Record<string, TableRelationalConfig>;
    }

    export interface ExtendDefaultTypes<PartialTypes extends Partial<UserSchemaTypes>> {
      DrizzleSchema: PartialTypes['DrizzleSchema'] & {};
      DrizzleRelationSchema: ExtractTablesWithRelations<PartialTypes['DrizzleSchema'] & {}>;
    }

    export interface SchemaBuilder<Types extends SchemaTypes> {
      drizzleObject: <
        Interfaces extends InterfaceParam<Types>[],
        Table extends keyof Types['DrizzleRelationSchema'],
        Selection extends
          | DBQueryConfig<
              'one',
              false,
              Types['DrizzleRelationSchema'],
              Types['DrizzleRelationSchema'][Table]
            >
          | true,
        Shape = BuildQueryResult<
          Types['DrizzleRelationSchema'],
          Types['DrizzleRelationSchema'][Table],
          Selection
        >,
      >(
        table: Table,
        options: DrizzleObjectOptions<Types, Table, Shape, Selection, Interfaces>,
      ) => ObjectRef<Types, Shape, Shape>;
    }

    export interface PothosKindToGraphQLType {
      DrizzleObject: 'Object';
    }

    export interface FieldOptionsByKind<
      Types extends SchemaTypes,
      ParentShape,
      Type extends TypeParam<Types>,
      Nullable extends FieldNullability<Type>,
      Args extends InputFieldMap,
      ResolveShape,
      ResolveReturnShape,
    > {
      DrizzleObject: DrizzleObjectFieldOptions<
        Types,
        ParentShape,
        Type,
        Nullable,
        Args,
        ResolveShape,
        ResolveReturnShape
      >;
    }

    export interface RootFieldBuilder<
      Types extends SchemaTypes,
      ParentShape,
      Kind extends FieldKind = FieldKind,
    > {
      drizzleField: <
        Args extends InputFieldMap,
        Param extends keyof Types['DrizzleRelationSchema'] | [keyof Types['DrizzleRelationSchema']],
        Nullable extends FieldNullability<Type>,
        ResolveShape,
        ResolveReturnShape,
        Type extends TypeParam<Types> = Param extends [unknown]
          ? [
              ObjectRef<
                Types,
                BuildQueryResult<
                  Types['DrizzleRelationSchema'],
                  Types['DrizzleRelationSchema'][Param[0] & keyof Types['DrizzleRelationSchema']],
                  true
                >
              >,
            ]
          : ObjectRef<
              Types,
              BuildQueryResult<
                Types['DrizzleRelationSchema'],
                Types['DrizzleRelationSchema'][Param & keyof Types['DrizzleRelationSchema']],
                true
              >
            >,
      >(
        options: DrizzleFieldOptions<
          Types,
          ParentShape,
          Type,
          Nullable,
          Args,
          Kind,
          ResolveShape,
          ResolveReturnShape,
          Param
        >,
      ) => FieldRef<Types, ShapeFromTypeParam<Types, Type, Nullable>>;
    }
  }
}

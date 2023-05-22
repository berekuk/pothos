import { InferModelFromColumns, TableRelationalConfig } from 'drizzle-orm';
import {
  CompatibleTypes,
  ExposeNullability,
  FieldKind,
  FieldRef,
  InputFieldMap,
  NormalizeArgs,
  RootFieldBuilder,
  SchemaTypes,
  ShapeFromTypeParam,
  TypeParam,
} from '@pothos/core';
import { RelatedFieldOptions, TypesForRelation } from './types';

// Workaround for FieldKind not being extended on Builder classes
const RootBuilder: {
  // eslint-disable-next-line @typescript-eslint/prefer-function-type
  new <Types extends SchemaTypes, Shape, Kind extends FieldKind>(
    builder: PothosSchemaTypes.SchemaBuilder<Types>,
    kind: FieldKind,
    graphqlKind: PothosSchemaTypes.PothosKindToGraphQLType[FieldKind],
  ): PothosSchemaTypes.RootFieldBuilder<Types, Shape, Kind>;
} = RootFieldBuilder as never;

export class DrizzleObjectFieldBuilder<
  Types extends SchemaTypes,
  TableConfig extends TableRelationalConfig,
  Shape,
  ExposableShape = InferModelFromColumns<TableConfig['columns']>,
> extends RootBuilder<Types, Shape, 'DrizzleObject'> {
  exposeBoolean = this.createExpose('Boolean');
  exposeFloat = this.createExpose('Float');
  exposeInt = this.createExpose('Int');
  exposeID = this.createExpose('ID');
  exposeString = this.createExpose('String');
  exposeBooleanList = this.createExpose(['Boolean']);
  exposeFloatList = this.createExpose(['Float']);
  exposeIntList = this.createExpose(['Int']);
  exposeIDList = this.createExpose(['ID']);
  exposeStringList = this.createExpose(['String']);
  table: string;

  constructor(typename: string, builder: PothosSchemaTypes.SchemaBuilder<Types>, table: string) {
    super(builder, 'DrizzleObject', 'Object');

    this.table = table;
  }

  relation<
    Field extends keyof TableConfig['relations'],
    Nullable extends boolean,
    Args extends InputFieldMap,
    ResolveReturnShape,
  >(
    name: Field,
    ...allArgs: NormalizeArgs<
      [
        options: RelatedFieldOptions<
          Types,
          TableConfig,
          Field,
          Nullable,
          Args,
          ResolveReturnShape,
          Shape
        >,
      ]
    >
  ): FieldRef<Types, TypesForRelation<Types, TableConfig['relations'][Field]>, 'Object'> {
    // const [{ description, ...options } = {} as never] = allArgs;
    // const relationField = getRelation(this.model, this.builder, name);
    // const ref = options.type ?? getRefFromModel(relationField.type, this.builder);

    // const { query = {}, resolve, extensions, ...rest } = options;

    // const relationSelect = (
    //   args: object,
    //   context: object,
    //   nestedQuery: (query: unknown) => unknown,
    // ) => ({ select: { [name]: nestedQuery(query) } });

    return this.field({
      // ...(rest as {}),
      // type: relationField.isList ? [ref] : ref,
      // description: getFieldDescription(this.model, this.builder, name, description),
      // extensions: {
      //   ...extensions,
      //   pothosPrismaSelect: relationSelect as never,
      //   pothosPrismaLoaded: (value: Record<string, unknown>) => value[name] !== undefined,
      //   pothosPrismaFallback:
      //     resolve &&
      //     ((q: {}, parent: Shape, args: {}, context: {}, info: GraphQLResolveInfo) =>
      //       resolve(
      //         { ...q, ...(typeof query === 'function' ? query(args, context) : query) } as never,
      //         parent,
      //         args as never,
      //         context,
      //         info,
      //       )),
      // },
      // resolve: (parent) => (parent as Record<string, never>)[name],
    } as never) as never;
  }

  expose<
    Type extends TypeParam<Types>,
    Nullable extends boolean,
    ResolveReturnShape,
    Name extends CompatibleTypes<Types, ExposableShape, Type, Nullable>,
  >(
    ...args: NormalizeArgs<
      [
        name: Name,
        options: Omit<
          PothosSchemaTypes.ObjectFieldOptions<
            Types,
            Shape,
            Type,
            Nullable,
            {},
            ResolveReturnShape
          >,
          'resolve' | 'select'
        >,
      ]
    >
  ) {
    const [name, options = {} as never] = args;

    // const typeConfig = this.builder.configStore.getTypeConfig(this.typename, 'Object');
    // const usingSelect = !!typeConfig.extensions?.pothosPrismaSelect;

    return this.exposeField(name as never, {
      ...options,
      extensions: {
        ...options.extensions,
        // pothosPrismaVariant: name,
        // pothosPrismaSelect: usingSelect && {
        //   [name]: true,
        // },
      },
    });
  }

  private createExpose<Type extends TypeParam<Types>>(type: Type) {
    return <
      Nullable extends boolean,
      ResolveReturnShape,
      Name extends CompatibleTypes<
        Types,
        ExposableShape,
        Type,
        Type extends [unknown] ? { list: true; items: true } : true
      >,
    >(
      ...args: NormalizeArgs<
        [
          name: Name,
          options: Omit<
            PothosSchemaTypes.ObjectFieldOptions<
              Types,
              ExposableShape,
              Type,
              Nullable,
              {},
              ResolveReturnShape
            >,
            'resolve' | 'type' | 'select'
          > &
            ExposeNullability<Types, Type, ExposableShape, Name, Nullable> & {
              description?: string | false;
            },
        ]
      >
    ): FieldRef<Types, ShapeFromTypeParam<Types, Type, Nullable>, 'DrizzleObject'> => {
      const [name, { description, ...options } = {} as never] = args;

      return this.expose(
        name as never,
        {
          ...options,
          type,
        } as never,
      );
    };
  }
}

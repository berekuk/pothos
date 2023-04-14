// @ts-nocheck
/* eslint-disable max-classes-per-file */
import { InputFieldMap, InputFieldsFromShape, InputRef, inputShapeKey, PothosInputObjectTypeConfig, RecursivelyNormalizeNullableFields, SchemaTypes, } from '../types/index.ts';
import { BaseTypeRef } from './base.ts';
import { InputFieldRef } from './input-field.ts';
export class InputObjectRef<Types extends SchemaTypes, T> extends BaseTypeRef<Types, PothosInputObjectTypeConfig> implements InputRef<T>, PothosSchemaTypes.InputObjectRef<Types, T> {
    override kind = "InputObject" as const;
    [inputShapeKey]!: T;
    private fields = new Set<() => InputFieldMap>();
    private fieldCbs = new Set<(name: string, ref: InputFieldRef<Types>) => void>();
    constructor(name: string) {
        super("InputObject", name);
    }
    addFields(fields: () => InputFieldMap) {
        this.fields.add(fields);
        for (const cb of this.fieldCbs) {
            for (const [name, ref] of Object.entries(fields())) {
                if (ref) {
                    cb(name, ref as InputFieldRef<Types>);
                }
            }
        }
    }
    onField(cb: (name: string, ref: InputFieldRef<Types>) => void) {
        this.fieldCbs.add(cb);
        for (const fieldMap of this.fields) {
            for (const [name, ref] of Object.entries(fieldMap())) {
                if (ref) {
                    cb(name, ref as InputFieldRef<Types>);
                }
            }
        }
    }
}
export class ImplementableInputObjectRef<Types extends SchemaTypes, T extends object> extends InputObjectRef<Types, RecursivelyNormalizeNullableFields<T>> {
    builder: PothosSchemaTypes.SchemaBuilder<Types>;
    constructor(builder: PothosSchemaTypes.SchemaBuilder<Types>, name: string) {
        super(name);
        this.builder = builder;
    }
<<<<<<< HEAD
    implement(options: PothosSchemaTypes.InputObjectTypeOptions<Types, InputFieldsFromShape<RecursivelyNormalizeNullableFields<T>>>) {
        this.builder.inputType<ImplementableInputObjectRef<Types, T>, InputFieldsFromShape<RecursivelyNormalizeNullableFields<T>>>(this, options);
        return this as InputObjectRef<RecursivelyNormalizeNullableFields<T>>;
=======
    implement(options: PothosSchemaTypes.InputObjectTypeOptions<Types, InputFieldsFromShape<Types, RecursivelyNormalizeNullableFields<T>, "InputObject">>) {
        this.builder.inputType<ImplementableInputObjectRef<Types, T>, InputFieldsFromShape<Types, RecursivelyNormalizeNullableFields<T>, "InputObject">>(this, options);
        return this as InputObjectRef<Types, T>;
>>>>>>> 6f53ee9c (Add builder and SchemaTypes to field and type refs)
    }
}

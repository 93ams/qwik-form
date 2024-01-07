import type {NoSerialize} from '@builder.io/qwik';
import {FieldStore} from "./store/field";
import {ArrayStore} from "./store/array";

export type PartialKey<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>
export type IsTuple<T extends Array<any>> = number extends T['length'] ? false : true
export type TupleKeys<T extends Array<any>> = Exclude<keyof T, keyof any[]>
export type Maybe<T> = T | undefined
export type MaybeValue<T> = T | null | undefined
export type MaybePromise<T> = T | Promise<T>
export type MaybeArray<T> = T | T[]
export type MaybeFunction<T> = T | (() => T)

export type FieldElement = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
export type FieldValue = MaybeValue<string | string[] | number | boolean
    | NoSerialize<Blob> | NoSerialize<Blob>[] | NoSerialize<File> | NoSerialize<File>[] | Date>
export type FieldValues = { [name: string]: FieldValue | FieldValues | (FieldValue | FieldValues)[] }|unknown[]
export type InitialValues<TValue> = TValue extends string[] | NoSerialize<Blob>[] | NoSerialize<File>[]
    ? TValue
    : TValue extends FieldValue
        ? Maybe<TValue>
        : { [Key in keyof Required<TValue>]: InitialValues<TValue[Key]> };
export type PartialValues<T> = T extends string[] | NoSerialize<Blob>[] | NoSerialize<File>[]
    ? T
    : T extends FieldValue
        ? Maybe<T>
        : { [Key in keyof T]?: PartialValues<T[Key]> }

export type ValuePath<K extends string | number, V> = V extends string[]
    ? `${K}` | `${K}.${ValuePaths<V>}`
    : V extends FieldValue | Blob
        ? `${K}`
        : `${K}.${ValuePaths<V>}`;
export type ValuePaths<V> = V extends Array<infer TChild>
    ? IsTuple<V> extends true
        ? {
            [TKey in TupleKeys<V>]-?: ValuePath<TKey & string, V[TKey]>;
        }[TupleKeys<V>]
        : ValuePath<number, TChild>
    : { [TKey in keyof V]-?: ValuePath<TKey & string, V[TKey]> }[keyof V];

export type PathValue<V, P> = P extends `${infer TKey1}.${infer TKey2}`
    ? TKey1 extends keyof V
        ? TKey2 extends ValuePaths<V[TKey1]> | ArrayPaths<V[TKey1]>
            ? PathValue<V[TKey1], TKey2>
            : never
        : TKey1 extends `${number}`
            ? V extends Array<infer TChild>
                ? PathValue<TChild, TKey2 & (ValuePaths<TChild> | ArrayPaths<TChild>)>
                : never
            : never
    : P extends keyof V
        ? V[P]
        : never;

export type ArrayPath<K extends string | number, V> = V extends Array<any>
    ? `${K}` | `${K}.${ArrayPaths<V>}`
    : V extends FieldValues
        ? `${K}.${ArrayPaths<V>}`
        : never;
export type ArrayPaths<V> = V extends Array<infer C>
    ? IsTuple<V> extends true
        ? { [K in TupleKeys<V>]-?: ArrayPath<K & string, V[K]> }[TupleKeys<V>]
        : ArrayPath<number, C>
    : { [K in keyof V]-?: ArrayPath<K & string, V[K]>; }[keyof V];

export type TypeTemplatePath<K extends string | number, V, T> = V extends T
    ? V extends Array<any> | Record<string, any>
        ? `${K}` | `${K}.${TypeTemplatePaths<V, T>}`
        : `${K}`
    : V extends FieldValues | (FieldValue | FieldValues)[]
        ? `${K extends number ? '$' : K}.${TypeTemplatePaths<V, T>}`
        : never;
export type TypeTemplatePaths<D, T> = D extends Array<infer Child>
    ? IsTuple<D> extends true
        ? { [Key in TupleKeys<D>]-?: TypeTemplatePath<Key & string, D[Key], T> }[TupleKeys<D>]
        : TypeTemplatePath<number, Child, T>
    : { [Key in keyof D]-?: TypeTemplatePath<Key & string, D[Key], T> }[keyof D];

export type FieldPath<V extends FieldValues> = ValuePaths<V>;
export type FieldPathValue<V extends FieldValues, P extends FieldPath<V>> = PathValue<V, P>;
export type FieldArrayPath<V extends FieldValues> = ArrayPaths<V>;
export type FieldArrayPathValue<V extends FieldValues, P extends FieldArrayPath<V>> = PathValue<V, P> & Array<unknown>;
export type TypeInfoPath<V extends FieldValues, T> = TypeTemplatePaths<V, T>;
export type PathStore<V extends FieldValues, P extends FieldPath<V> | FieldArrayPath<V>> =
    P extends FieldPath<V>
    ? FieldStore<V, P>
    : P extends FieldArrayPath<V>
    ? ArrayStore<V, P>
    : never

export type RawFieldState<V extends FieldValues, N extends FieldPath<V>> = {
    startValue?: FieldPathValue<V, N>
    value?: FieldPathValue<V, N>
    touched: boolean
    dirty: boolean
    error: string
}
export type RawArrayState = {
    startItems: number[];
    items: number[];
    error: string;
    touched: boolean;
    dirty: boolean;
}

export type FormStatus = 'submitting' | 'submitted' | 'validating' | 'invalid'
export type ValidationMode = 'touched' | 'input' | 'change' | 'blur' | 'submit'
export type ResponseStatus = 'info' | 'error' | 'success'
export type ResponseData = Maybe<Record<string, any> | Array<any>>

export type FormResponse<D extends ResponseData> = Partial<{
    status: ResponseStatus;
    message: string;
    data: D;
}>

export type FormErrors<V extends FieldValues> = { [name in | FieldPath<V> | FieldArrayPath<V>]?: Maybe<string> }
export type ValidateField<V> = (value: Maybe<V>) => MaybePromise<string>;
export type ValidateForm<V extends FieldValues> = (values: PartialValues<V>) => MaybePromise<FormErrors<V>>
export type TransformField<V> = (value: Maybe<V>, event: Event, element: FieldElement) => MaybePromise<Maybe<V>>;

export type StoreWithField<T, N extends keyof T> = {store: T, field: N}
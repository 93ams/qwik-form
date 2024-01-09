import {NoSerialize} from "@builder.io/qwik";
import {
    FieldArrayPath,
    FieldArrayPathValue,
    FieldPath,
    FieldPathValue,
    FieldValue,
    FieldValues,
    Maybe,
    PartialValues
} from "./types";

let counter = 0;
export function getUniqueId(): number { return counter++ }
export const getOptions = <N extends string, O extends Record<string, any>>
(arg1?: N | N[] | O, arg2?: O): Partial<O> => (typeof arg1 !== 'string' && !Array.isArray(arg1) ? arg1 : arg2) || {};

const toValue = (item: string | NoSerialize<File> | NoSerialize<Blob>) =>
    item instanceof Blob ? item.size : item;
export const isFieldDirty = <V extends FieldValue>(initial?: V, current?: V) =>
    Array.isArray(initial) && Array.isArray(current)
        ? initial.map(toValue).join() !== current.map(toValue).join()
        : initial instanceof Date && current instanceof Date
            ? initial.getTime() !== current.getTime()
            : Number.isNaN(initial) && Number.isNaN(current)
                ? false
                : initial !== current

export const getPathIndex = <V extends FieldValues>(name: string, path: FieldPath<V> | FieldArrayPath<V>) =>
    +path.replace(`${name}.`, '').split('.')[0]
export function getPathValue<V extends FieldValues, N extends FieldPath<V>>
    (path: N, object: PartialValues<V>): Maybe<FieldPathValue<V, N>>
export function getPathValue<V extends FieldValues, N extends FieldArrayPath<V>>
    (path: N, object: PartialValues<V>): Maybe<FieldArrayPathValue<V, N>>
export function getPathValue(path: string, object: Record<string, any>): any {
    return path.split('.').reduce<any>((value, key) => value?.[key], object);
}
export const sortPathIndex = <V extends FieldValues>(name: FieldArrayPath<V>) =>
    (pathA: FieldPath<V> | FieldArrayPath<V>, pathB: FieldPath<V> | FieldArrayPath<V>) =>
        getPathIndex(name, pathA) - getPathIndex(name, pathB);
export const sub = (path?: string, name?: any) => path !== undefined
    ? (name !== undefined ? `${path}.${name}` : path)
    : (name !== undefined ? name : '')
import {FieldArrayPath, FieldValues} from "../types";
import {getUniqueId} from "../utils";

export type ArraysStore<V extends FieldValues> = { [P in FieldArrayPath<V>]?: ArrayStore<V, P> }
export type ArrayStore<V extends FieldValues, P extends FieldArrayPath<V> = FieldArrayPath<V>> = {
    name: P,

    initial: number[]
    items: number[]

    active?: boolean
    dirty?: boolean
    error?: string
}
// Constructor
export const newArrayStore = <V extends FieldValues, P extends FieldArrayPath<V>>
(name: P, initial: number[] = [], error = '') => ({name, error, initial, items: initial} as ArrayStore<V, P>)

// Array Methods
export const insertInArray = <V extends FieldValues, P extends FieldArrayPath<V> = FieldArrayPath<V>>
(store: ArrayStore<V,P>, index: number) => {
    store.items?.splice(index, 0, getUniqueId());
    store.dirty = true;
}
export const moveInArray = <V extends FieldValues, P extends FieldArrayPath<V> = FieldArrayPath<V>>
(store: ArrayStore<V,P>, from: number, to: number)=>  {
    if (!store.items) return
    store.items.splice(to, 0, store.items.splice(from, 1)[0])
    setArrayDirty(store)
}
export const replaceInArray = <V extends FieldValues, P extends FieldArrayPath<V> = FieldArrayPath<V>>
(store?: ArrayStore<V,P>, index?: number)=>  {
    if (!store?.items || index === undefined) return
    const lastIndex = store.items.length - 1;
    if (index >= 0 && index <= lastIndex) {
        store.items[index] = getUniqueId();
        store.dirty = true;
        return true
    }
    return false
}
export const removeFromArray = <V extends FieldValues, P extends FieldArrayPath<V> = FieldArrayPath<V>>
(store: ArrayStore<V,P>, index: number)=>  {
    if (!store.items) return
    store.items.splice(index, 1);
    setArrayDirty(store)
}

// Dirty
export const isArrayDirty = <V extends FieldValues, P extends FieldArrayPath<V> = FieldArrayPath<V>>
(store: ArrayStore<V,P>)=> store.initial?.join() !== store.items?.join()
export const setArrayDirty = <V extends FieldValues, P extends FieldArrayPath<V> = FieldArrayPath<V>>
(store: ArrayStore<V,P>)=>  {
    const dirty = isArrayDirty(store)
    const diff = dirty !== store.dirty
    if (diff) store.dirty = dirty
    return [dirty, diff]
}
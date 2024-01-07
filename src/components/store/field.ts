import {
    FieldElement,
    FieldPath,
    FieldPathValue,
    FieldValues,
    TransformField,
    ValidateField
} from "../types";
import {QRL} from "@builder.io/qwik";

export type FieldsStore<V extends FieldValues> = { [N in FieldPath<V>]?: FieldStore<V, N> }
export type FieldStore<V extends FieldValues, P extends FieldPath<V> = FieldPath<V>> = {
    transform: QRL<TransformField<FieldPathValue<V, P>>>[]
    validate: QRL<ValidateField<FieldPathValue<V, P>>>[]
    elements: FieldElement[]
    consumers: number[]

    active?: boolean
    dirty?: boolean
    error?: string

    initial?: FieldPathValue<V, P>
    value?: FieldPathValue<V, P>
}
export const newFieldStore = <V extends FieldValues, P extends FieldPath<V>>
(name: P, initial?: FieldPathValue<V, P>,  error = '') => ({
    name,
    error,
    initial,
    value: initial,
    transform: [],
    consumers: [],
    validate: [],
    elements: [],
} as FieldStore<V,P>)
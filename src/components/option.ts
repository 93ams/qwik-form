import type {
    FieldArrayPath,
    FieldArrayPathValue,
    FieldPath,
    FieldPathValue,
    FieldValues,
    InitialValues,
    ValidationMode,
} from './types.ts'

export type Options = Partial<{
    active: boolean
    touched: boolean
    dirty: boolean
    valid: boolean
    focus: boolean
}>

export type MoveOptions = {
    from: number
    to: number
}

export type ValidateOptions = {
    on: Exclude<ValidationMode, 'submit'>[];
    shouldFocus?: boolean;
}

export type RemoveOptions = { at: number }

export type SetResponseOptions = Partial<{ duration: number }>;
export type ErrorResponseOptions = SetResponseOptions & Partial<{ active: boolean }>

export type ValueOptions<V extends FieldValues, N extends FieldArrayPath<V>> = {
    value: FieldArrayPathValue<V, N>[number]
    at: number
}

export type ResetOptions<V extends FieldValues, N extends FieldPath<V>> = Partial<{
    initialValue: FieldPathValue<V, N>
    initialValues: InitialValues<V>
    keepResponse: boolean
    keepSubmitCount: boolean
    keepSubmitted: boolean
    keepValues: boolean
    keepDirtyValues: boolean
    keepItems: boolean
    keepDirtyItems: boolean
    keepErrors: boolean
    keepTouched: boolean
    keepDirty: boolean
}>

export type InsertOptions<V extends FieldValues, N extends FieldArrayPath<V>> = {
    at?: number
    value: FieldArrayPathValue<V, N>[number]
}

export type SwapOptions = {
    at: number
    and: number
};
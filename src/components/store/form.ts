import {getOptions, getPathIndex, getPathValue, getUniqueId, isFieldDirty, sortPathIndex} from "../utils";
import {QRL} from "@builder.io/qwik";
import {
    FieldArrayPath,
    FieldArrayPathValue,
    FieldPath,
    FieldValue,
    FieldValues,
    FormErrors,
    FormResponse,
    FormStatus,
    Maybe,
    MaybeArray,
    PartialValues, PathStore, PathValue,
    RawArrayState,
    RawFieldState,
    ResponseData,
    TypeInfoPath,
    ValidateForm,
    ValidationMode
} from "../types";
import {
    ErrorResponseOptions,
    InsertOptions,
    MoveOptions,
    Options,
    RemoveOptions,
    ResetOptions,
    SetResponseOptions,
    ValidateOptions,
    ValueOptions
} from "../option";
import {FieldsStore, FieldStore, newFieldStore} from "./field";
import {
    ArraysStore,
    ArrayStore,
    insertInArray,
    moveInArray,
    newArrayStore,
    removeFromArray,
    replaceInArray
} from "./array";

export type FormStore<V extends FieldValues, D extends ResponseData = undefined>= {
    fields: FieldsStore<V>
    arrays: ArraysStore<V>

    loader: Readonly<V>
    paths: TypeInfoPath<V, any[]>[]
    validator?: QRL<ValidateForm<V>>
    validateOn: ValidationMode
    revalidateOn: ValidationMode

    element?: HTMLFormElement
    validators: number[]

    dirty?: boolean
    invalid?: boolean
    submitCount: number
    status?: FormStatus
    response?: FormResponse<D>

}
export function newFormStore<V extends FieldValues, D extends ResponseData = undefined>
(loader: Readonly<V>) {
    return {
        revalidateOn: 'input',
        validateOn: 'submit',
        validators: [],
        submitCount: 0,
        paths: [],
        arrays: [],
        fields: [],
        loader,
    } as FormStore<V, D>
}
export function submit<V extends FieldValues>(store: FormStore<V>) {

}

export function reset<V extends FieldValues>(store: FormStore<V>, opts?: ResetOptions<V, FieldPath<V>>): void
export function reset<V extends FieldValues, P extends FieldPath<V>>(store: FormStore<V>, name: P | FieldArrayPath<V>, opts?: ResetOptions<V, P>): void
export function reset<V extends FieldValues>(store: FormStore<V>, names: (FieldPath<V> | FieldArrayPath<V>)[], opts?: Maybe<ResetOptions<V, FieldPath<V>>>): void
export function reset<V extends FieldValues, P extends FieldPath<V>>(
    store: FormStore<V>,
    arg2?: P | FieldArrayPath<V> | (FieldPath<V> | FieldArrayPath<V>)[] | ResetOptions<V, P>,
    arg3?: ResetOptions<V, P>,
){
    const [fieldNames, fieldArrayNames] = searchNames(store, arg2, false);
    const resetSingleField = typeof arg2 === 'string' && fieldNames.length === 1;
    const resetEntireForm = !resetSingleField && !Array.isArray(arg2);
    const options = getOptions(arg2, arg3);
    const {
        initialValue,
        initialValues,
        keepResponse,
        keepSubmitCount,
        keepSubmitted,
        keepValues,
        keepDirtyValues,
        keepItems ,
        keepDirtyItems ,
        keepErrors,
        keepDirty,
    } = options;
    fieldNames.forEach((name) => {
        const field = getField(store, name)!;
        if (resetSingleField ? 'initialValue' in options : initialValues) {
            field.initial = resetSingleField
                ? initialValue : getPathValue(name, initialValues!);
        }
        const keepDirtyValue = keepDirtyValues && field.dirty;
        if (!keepValues && !keepDirtyValue) {
            field.value = field.initial;
            field.elements.forEach((element) => {
                if (element.type === 'file') element.value = '';
            })
        }
        if (!keepDirty && !keepValues && !keepDirtyValue) field.dirty = false
        if (!keepErrors) field.error = ''
    })

    fieldArrayNames.forEach((name) => {
        const fieldArray = getArray(store, name)!;
        const keepCurrentDirtyItems = keepDirtyItems && fieldArray.dirty;
        if (!keepItems && !keepCurrentDirtyItems) {
            if (initialValues) {
                fieldArray.initial =
                    getPathValue(name, initialValues)?.map(() => getUniqueId()) || [];
            }
            fieldArray.items = [...fieldArray.initial];
        }
        if (!keepDirty && !keepItems && !keepCurrentDirtyItems) fieldArray.dirty = false
        if (!keepErrors) fieldArray.error = '';
    });
    if (resetEntireForm) {
        if (!keepResponse) store.response = {};
        if (!keepSubmitCount) store.submitCount = 0;
        if (!keepSubmitted) store.status = 'submitted';
    }
    setState(store)
}
// Fields and Arrays
export function fieldsAndArrays<V extends FieldValues>(store: FormStore<V>) {
    return [...Object.values(store.fields), ...Object.values(store.arrays)] as
        (FieldStore<V, FieldPath<V>> | ArrayStore<V, FieldArrayPath<V>>)[]
}
export function getField<V extends FieldValues, P extends FieldPath<V>>(store: FormStore<V>, name: P): Maybe<FieldStore<V, P>> { return store.fields[name] }
export function getArray<V extends FieldValues, P extends FieldArrayPath<V>>(store: FormStore<V>, name: P): Maybe<ArrayStore<V, P>> {return store.arrays[name]}
export function hasField<V extends FieldValues>(store: FormStore<V>, name: FieldPath<V>, {active = true, dirty , valid}: Options) {
    const field = getField(store, name);
    return !!field && (!active || field.active) &&  (!dirty || field.dirty) && (!valid || !field.error)
}
export function hasArray<V extends FieldValues>(store: FormStore<V>, name: FieldArrayPath<V>, {active = true, dirty , valid}: Options) {
    const array = getArray(store, name)
    return !!array &&(!active || array.active) && (!dirty || array.dirty) && (!valid || !array.error)
}

// Names
export function getFieldNames<V extends FieldValues>(store: FormStore<V>, valid: boolean = true) {
    const names = Object.keys(store.fields) as FieldPath<V>[];
    return valid ? removeInvalidNames(store, names) : names
}
export function getArrayNames<V extends FieldValues>(store: FormStore<V>, valid: boolean = true) {
    const names = Object.keys(store.arrays) as FieldArrayPath<V>[];
    return valid ? removeInvalidNames(store, names) : names;
}
export function searchNames<V extends FieldValues, O extends Record<string, any>>(
    store: FormStore<V>,
    arg1?: FieldPath<V> | FieldArrayPath<V> | (FieldPath<V> | FieldArrayPath<V>)[] | O,
    valid?: boolean
): [FieldPath<V>[], FieldArrayPath<V>[]] {
    const allFieldNames = getFieldNames(store, valid);
    const allArrayNames = getArrayNames(store, valid);
    if (typeof arg1 === 'string' || Array.isArray(arg1)) {
        return (Array.isArray(arg1) ? arg1 : [arg1])
            .reduce((tuple, name) => {
                    const [fieldNames, arrayNames] = tuple;
                    if (allArrayNames.includes(name as FieldArrayPath<V>)) {
                        allArrayNames.forEach((arrayName) => {
                            if (arrayName.startsWith(name)) arrayNames.add(arrayName);
                        })
                        allFieldNames.forEach((fieldName) => {
                            if (fieldName.startsWith(name)) fieldNames.add(fieldName);
                        })
                    } else fieldNames.add(name as FieldPath<V>)
                    return tuple
                },
                [new Set<FieldPath<V>>(), new Set<FieldArrayPath<V>>()] as [Set<FieldPath<V>>, Set<FieldArrayPath<V>>]
            ).map((set) => [...set]) as [FieldPath<V>[], FieldArrayPath<V>[]]
    }
    return [allFieldNames, allArrayNames];
}

// State
export function getArrayState<V extends FieldValues>(store: FormStore<V>, name: FieldArrayPath<V>) {
    const fieldArray = getArray(store, name);
    if (!fieldArray) return undefined
    return {
        startItems: fieldArray.initial,
        items: fieldArray.items,
        error: fieldArray.error,
        dirty: fieldArray.dirty,
    } as RawArrayState
}
export function setArrayState<V extends FieldValues>(store: FormStore<V>, name: FieldArrayPath<V>, state: RawArrayState) {
    let field = getArray(store, name)
    if (!field) {
        field = newArrayStore(name, state.items)
        store.arrays[name] = field
    }
    field.initial = state.startItems;
    field.items = state.items;
    field.error = state.error;
    field.dirty = state.dirty;
}
export function getFieldState<V extends FieldValues, P extends FieldPath<V>>(store: FormStore<V>, name: P) {
    const field = getField(store, name);
    if (!field) return undefined
    return {
        startValue: field.initial,
        value: field.value,
        error: field.error,
        dirty: field.dirty,
    } as RawFieldState<V, P>
}
export function setFieldState<V extends FieldValues, P extends FieldPath<V>>(store: FormStore<V>, name: P, state: RawFieldState<V, P>) {
    let field = getField(store, name)
    if (!field) {
        field = newFieldStore(name, state.value)
        store.fields[name] = field
    }
    field.initial = state.startValue;
    field.value = state.value;
    field.error = state.error;
    field.dirty = state.dirty;
}

// Values
export function setValue<V extends FieldValues, P extends FieldPath<V> >(store: FormStore<V>, name: P, value: PathValue<V, P>,
    { dirty = true, valid = true, focus = true}: Options) {
    let field = getField(store, name)
    if (!field) {
        field = newFieldStore(name, value)
        store.fields[name] = field
    }
    field.value = value
    if (dirty) setFieldDirty(store, field)
    if (valid && shouldValidate(store, field as PathStore<V, P>, {
        on: ['touched', 'input'],
    })) validate(store, name, {focus})
}
export function setArrayValue<V extends FieldValues, P extends FieldArrayPath<V>>(store: FormStore<V>, name: P, {at: index, value}: ValueOptions<V, P>) {
    const updateStores = (prevPath: string, data: object) => {
        Object.entries(data).forEach(([path, value]) => {
            const compoundPath = `${prevPath}.${path}`;
            if (store.paths.includes(compoundPath.replace(/.\d+./g, '.$.') as any)) {
                const items = value.map(() => getUniqueId())
                setArrayState(store, compoundPath as FieldArrayPath<V>, {
                    startItems: [...items], items, error: '', touched: false, dirty: false,
                })
            } else if (!value || typeof value !== 'object' || Array.isArray(value) || value instanceof Date || value instanceof Blob) {
                setFieldState(store, compoundPath as FieldPath<V>, {
                    startValue: value, value, error: '', touched: false, dirty: false,
                })
            }
            if (value && typeof value === 'object') updateStores(compoundPath, value);
        })
    }
    updateStores(name, {[index]: value});
}
export function getValues<V extends FieldValues>(store: FormStore<V>, options?: Options): PartialValues<V>
export function getValues<V extends FieldValues>
(store: FormStore<V>, names: (FieldPath<V> | FieldArrayPath<V>)[], options?: Options): PartialValues<V>
export function getValues<V extends FieldValues, P extends FieldArrayPath<V>>
(store: FormStore<V>, name: P, options?: Options): PartialValues<FieldArrayPathValue<V, P>>
export function getValues<V extends FieldValues>
(store: FormStore<V>, arg1?: FieldArrayPath<V> | (FieldPath<V> | FieldArrayPath<V>)[] | Options, arg2?: Options) {
    const {active = true, dirty, valid} = getOptions(arg1, arg2);
    return searchNames(store, arg1)[0].reduce<any>((values, name) => {
            const field = getField(store, name)!;
            if ((!active || field.active) &&
                (!dirty || field.dirty) &&
                (!valid || !field.error))
                (typeof arg1 === 'string' ? name.replace(`${arg1}.`, '') : name)
                    .split('.')
                    .reduce((object, key, index, keys) =>
                            (object[key] = index === keys.length - 1
                                ? field.value
                                : (typeof object[key] === 'object' && object[key]) ||
                                (isNaN(+keys[index + 1]) ? {} : [])),
                        values)
            return values;
        },
        typeof arg1 === 'string' ? [] : {}
    )
}

// Util Methods
export function focusField<V extends FieldValues>
(store: FormStore<V>, name: FieldPath<V>) { getField(store, name)?.elements[0]?.focus() }

export function removeInvalidNames<V extends FieldValues, P extends FieldPath<V> | FieldArrayPath<V>>
(store: FormStore<V>, names: P[]) {
    getArrayNames(store,false).forEach((fieldArrayName) => {
        const lastIndex = getArray(store, fieldArrayName)!.items.length || 1 - 1;
        names.filter((name) =>
            name.startsWith(`${fieldArrayName}.`) && getPathIndex(fieldArrayName, name) > lastIndex)
            .forEach((name) => names.splice(names.indexOf(name), 1));
    })
    return names
}

export function shouldValidate<V extends FieldValues, P extends FieldPath<V> | FieldArrayPath<V>, S extends PathStore<V, P>>
(store: FormStore<V>, field: S, {on}: ValidateOptions) {
    return (on as string[]).includes((store.validateOn === 'submit'
        ? store.status === 'submitting' : field.error)
        ? store.revalidateOn : store.validateOn)
}

export async function validate<V extends FieldValues>(store: FormStore<V>, opts?: Options): Promise<boolean>;
export async function validate<V extends FieldValues>
(store: FormStore<V>, name: MaybeArray<FieldPath<V> | FieldArrayPath<V>>, opts?: Options): Promise<boolean>;
export async function validate<V extends FieldValues>
(store: FormStore<V>, arg1?: MaybeArray<FieldPath<V> | FieldArrayPath<V>> | Options, arg2?: Options) {
    const [fieldNames, arrayNames] = searchNames(store, arg1);
    const { active = true, focus = true } = getOptions(arg1, arg2);
    const validator = getUniqueId();
    store.validators.push(validator);
    store.status = 'validating';
    const formErrors: FormErrors<V> = store.validator
        ? await store.validator(getValues(store, { active: active }))
        : {};
    let valid = typeof arg1 !== 'string' && !Array.isArray(arg1)
        ? !Object.keys(formErrors).length : true;
    const [errorFields] = await Promise.all([
        Promise.all(fieldNames.map(async (name) => {
                const field = getField(store, name)!;
                if (!active || field.active) {
                    let localError: string | undefined;
                    for (const validation of field.validate) {
                        localError = await validation(field.value)
                        if (localError) break
                    }
                    const fieldError = localError || formErrors[name] || '';
                    if (fieldError) valid = false
                    field.error = fieldError;
                    return fieldError ? name : null;
                }
            })
        ), Promise.all(arrayNames.map(async (name) => {
                const fieldArray = getArray(store, name)!;
                if (!active || fieldArray.active) {
                    let localError = '';
                    for (const validation of fieldArray.validate) {
                        localError = await validation(fieldArray.items)
                        if (localError) break
                    }
                    const arrayError = localError || formErrors[name] || '';
                    if (arrayError) valid = false
                    fieldArray.error = arrayError
                }
            })
        )]);
    setErrorResponse(store, formErrors, { active })
    if (focus) {
        const name = errorFields.find((name) => name);
        if (name) focusField(store, name);
    }
    setInvalid(store, !valid);
    store.validators.splice(store.validators.indexOf(validator), 1)
    if (!store.validators.length && store.status === 'validating') store.status = undefined;
    return valid;
}

// Array Methods
export function insert<V extends FieldValues, P extends FieldArrayPath<V>>
(store: FormStore<V>, name: P, opts: InsertOptions<V, P>) {
    const fieldArray = getArray(store, name);
    if (!fieldArray) return
    const arrayLength = fieldArray.items.length;
    const { at: index = arrayLength, value } = opts;
    if (index < 0 && index > arrayLength) {
        return
    }
    if (index < arrayLength) {
        const filterName = (value: string) =>
            value.startsWith(`${name}.`) && getPathIndex(name, value) >= index;
        const getNextIndexName = <T extends string>(fieldName: T, i: number) =>
            fieldName.replace(`${name}.${i}`,`${name}.${i + 1}`) as T;

        getFieldNames(store)
            .filter(filterName)
            .sort(sortPathIndex(name))
            .reverse()
            .forEach((fieldName) =>
                setFieldState(store, getNextIndexName(fieldName,
                        getPathIndex(name, fieldName)),
                    getFieldState(store, fieldName)!))

        getArrayNames(store, )
            .filter(filterName)
            .sort(sortPathIndex(name))
            .reverse()
            .forEach((fieldName) =>
                setArrayState(store, getNextIndexName(fieldName,
                        getPathIndex(name, fieldName)),
                    getArrayState(store, fieldName)!))
    }
    setArrayValue(store, name, { at: index, value });
    insertInArray(fieldArray, index);
    store.dirty = true;
    setTimeout(async () =>{
        if (shouldValidate(store, fieldArray, {
            on: ['touched', 'input'],
        })) {
            await validate(store, name, {})
        }
    }, 250)
}
export function move<V extends FieldValues>
(store: FormStore<V>, name: FieldArrayPath<V>, { from: fromIndex, to: toIndex }: MoveOptions) {
    const fieldArray = getArray(store, name);
    if (!fieldArray) return
    const lastIndex = fieldArray.items.length - 1;
    if (fromIndex < 0 || fromIndex > lastIndex || toIndex < 0 || toIndex > lastIndex || fromIndex === toIndex) return

    const filterName = (value: string) => {
        if (!value.startsWith(name)) return
        const fieldIndex = getPathIndex(name, value);
        return (fieldIndex >= fromIndex && fieldIndex <= toIndex)
            || (fieldIndex <= fromIndex && fieldIndex >= toIndex)
    }
    const getPrevIndexName = <T extends string>(name: T, i: number): T =>
        name.replace(`${name}.${i}`,
            fromIndex < toIndex ? `${name}.${i - 1}` : `${name}.${i + 1}`) as T;
    const getToIndexName = <T extends string>(name: T): T =>
        name.replace(`${name}.${fromIndex}`, `${name}.${toIndex}`) as T;

    const fieldNames = getFieldNames(store).filter(filterName).sort(sortPathIndex(name))
    const fieldArrayNames = getArrayNames(store).filter(filterName).sort(sortPathIndex(name))

    if (fromIndex > toIndex) {
        fieldNames.reverse();
        fieldArrayNames.reverse();
    }

    const fieldStateMap = new Map<FieldPath<V>, RawFieldState<V, FieldPath<V>>>();
    const fieldArrayStateMap = new Map<FieldArrayPath<V>, RawArrayState>();

    fieldNames.forEach((fieldName) => {
        const fieldState = getFieldState(store, fieldName)!;
        const fieldIndex = getPathIndex(name, fieldName);
        if (fieldIndex === fromIndex) {
            fieldStateMap.set(fieldName, fieldState)
            return
        }
        setFieldState(store, getPrevIndexName(fieldName, fieldIndex), fieldState)
    })
    fieldStateMap.forEach((fieldState, fieldName) =>
        setFieldState(store, getToIndexName(fieldName), fieldState))
    fieldArrayNames.forEach((fieldArrayName) => {
        const fieldArrayState = getArrayState(store, fieldArrayName)!
        const fieldArrayIndex = getPathIndex(name, fieldArrayName)
        if (fieldArrayIndex === fromIndex) {
            fieldArrayStateMap.set(fieldArrayName, fieldArrayState)
            return
        }
        setArrayState(store, getPrevIndexName(fieldArrayName, fieldArrayIndex), fieldArrayState)
    })
    fieldArrayStateMap.forEach((fieldArrayState, fieldArrayName) =>
        setArrayState(store, getToIndexName(fieldArrayName), fieldArrayState))

    moveInArray(fieldArray, fromIndex, toIndex)
}
export function replace<V extends FieldValues, P extends FieldArrayPath<V>>
(store: FormStore<V>, name: P, options: ValueOptions<V, P>) {
    if (replaceInArray(getArray(store, name), options.at)) {
        setArrayValue(store, name, options)
        store.dirty = true
    }
}
export function remove<V extends FieldValues>
(store: FormStore<V>, name: FieldArrayPath<V>, { at: index }: RemoveOptions) {
    const fieldArray = getArray(store, name)
    if (!fieldArray) return
    const lastIndex = fieldArray.items.length - 1;
    if (index < 0 && index > lastIndex) return
    const filterName = (value: string) =>
        value.startsWith(`${name}.`) && getPathIndex(name, value) > index;
    const getPrevIndexName = <T extends string>(name: T, i: number) =>
        name.replace(`${name}.${i}`, `${name}.${i - 1}`) as T;

    getFieldNames(store, )
        .filter(filterName)
        .sort(sortPathIndex(name))
        .forEach((fieldName) =>
            setFieldState(store,
                getPrevIndexName(fieldName, getPathIndex(name, fieldName)),
                getFieldState(store, fieldName)!))
    getArrayNames(store, )
        .filter(filterName)
        .sort(sortPathIndex(name))
        .forEach((fieldName) =>
            setArrayState(store, 
                getPrevIndexName(fieldName,
                    getPathIndex(name, fieldName)),
                getArrayState(store, fieldName)!))
    removeFromArray(fieldArray, index);

    if (shouldValidate(store, fieldArray, {
        on: ['touched', 'input'],
    })) {
        validate(store, name, {})
    }
}

// Errors
export function setError<V extends FieldValues>
(store: FormStore<V>, name: FieldPath<V> | FieldArrayPath<V>, error: string, {active = true, dirty, focus = !!error}: Options = {}) {
    for (const field of [
        getField(store, name as FieldPath<V>),
        getArray(store, name as FieldArrayPath<V>),
    ]) {
        if (field &&(!active || field.active) && (!dirty || field.dirty)) {
            field.error = error;
            if (error && 'value' in field && focus) focusField(store, name as FieldPath<V>);
        }
    }
    setInvalid(store, !!error);
}
export function getErrors<V extends FieldValues>(store: FormStore<V>, opts?: Options): FormErrors<V>;
export function getErrors<V extends FieldValues>(store: FormStore<V>, name: FieldArrayPath<V>, opts?: Options): FormErrors<V>;
export function getErrors<V extends FieldValues>(store: FormStore<V>, names: (FieldPath<V> | FieldArrayPath<V>)[], opts?: Options): FormErrors<V>;
export function getErrors<V extends FieldValues>
(store: FormStore<V>, arg1?: FieldArrayPath<V> | (FieldPath<V> | FieldArrayPath<V>)[] | Options, arg2?: Options): FormErrors<V> {
    const [fieldNames, fieldArrayNames] = searchNames(store, arg1);
    const {active = true, dirty} = getOptions(arg1, arg2);
    return [
        ...fieldNames.map((name) => [name, getField(store, name)!] as const),
        ...fieldArrayNames.map((name) => [name, getArray(store, name)!] as const),
    ].reduce<FormErrors<V>>((formErrors, [name, field]) => {
        if (field.error && (!active || field.active) && (!dirty || field.dirty))
            formErrors[name] = field.error;
        return formErrors;
    }, {});
}
export function getError<V extends FieldValues>
(store: FormStore<V>, name: FieldPath<V> | FieldArrayPath<V>, { active = true, dirty}: Options) {
    for (const field of [
        getField(store, name as FieldPath<V>),
        getArray(store, name as FieldArrayPath<V>),
    ]) {
        if (field &&
            (!active || field.active) &&
            (!dirty || field.dirty)) {
            return field.error;
        }
    }
    return undefined;
}
export function clearError<V extends FieldValues>
(store: FormStore<V>, name: FieldPath<V> | FieldArrayPath<V>, opts?: Options) { setError(store, name, '', opts) }

export function setFieldDirty<V extends FieldValues, P extends FieldPath<V>>
(store: FormStore<V>, field: FieldStore<V, P>) {
    const dirty = isFieldDirty(field.initial as Maybe<FieldValue>, field.value as Maybe<FieldValue>)
    if (dirty !== field.dirty) {
        field.dirty = dirty;
        setDirty(store, dirty);
    }
}
export function setDirty<V extends FieldValues>(store: FormStore<V>, dirty?: boolean) {
    store.dirty = dirty || fieldsAndArrays(store).some(({active, dirty}) => active && dirty)
}
export function setInvalid<V extends FieldValues>(store: FormStore<V>, invalid?: boolean) {
    store.invalid = invalid || fieldsAndArrays(store).some(({active, error}) => active && error)
}
export function setState<V extends FieldValues>(store: FormStore<V>) {
    let dirty = false, invalid = false;
    for (const field of fieldsAndArrays(store)) {
        if (field.active) {
            if (field.dirty) dirty = true
            if (field.error) invalid = true
        }
        if (touched && dirty && invalid) break
    }
    store.dirty = dirty;
    store.invalid = invalid;
}

// Response
export function setResponse<V extends FieldValues, D extends ResponseData>
(store: FormStore<V, D>, response: FormResponse<D>, { duration }: SetResponseOptions = {}) {
    store.response = response;
    if (duration) setTimeout(() => {
        if (store.response === response) store.response = undefined;
    }, duration);
}
export function setErrorResponse<V extends FieldValues>
(store: FormStore<V>, formErrors: FormErrors<V>, { duration, active = true }: ErrorResponseOptions) {
    const message = Object.entries<Maybe<string>>(formErrors)
        .reduce<string[]>((errors, [name, error]) => {
            if ([getField(store, name as FieldPath<V>), getArray(store, name as FieldArrayPath<V>)]
                .every((field) => !field || (active && !field.active))
            ) errors.push(error!);
            return errors;
        }, [])
        .join(' ');
    if (message) setResponse(store, { status: 'error', message }, { duration });
}
export function clearResponse<V extends FieldValues, D extends ResponseData>
(store: FormStore<V, D>)	{ store.response = undefined }
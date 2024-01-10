import {
    $,
    QRL,
    useContextProvider,
    useSignal,
    useStore,
    createContextId,
    Signal,
    useContext,
    useComputed$
} from "@builder.io/qwik";
import {SafeParseReturnType} from "zod/lib/types";

export type UseFormProps<T extends unknown[] | Record<any, any>> = {
    onSubmit?: (data: T) => void
    validate?:  QRL<(data: T) => SafeParseReturnType<T, T>>
    initial: T
}
export type FormContext = { errors: Signal<Record<string, string>> }
export const FormContextId = createContextId<FormContext>("form_context")
export const useForm = <T extends unknown[] | Record<any, any>>({initial, validate}: UseFormProps<T>) => {
    const errors = useSignal<Record<string, string>>({})
    const value = useStore<T>(initial)
    const reset = JSON.stringify(initial)
    useContextProvider(FormContextId, { errors })
    return {
        value,
        errors,
        'preventdefault:reset': true,
        'preventdefault:submit': true,
        onReset$: $(() => {
            if (errors?.value) errors.value = {}
            Object.assign(value, JSON.parse(reset))
        }),
        onSubmit$: validate ? $(async () => {
            const res = await validate(value)
            if (res.success) errors.value = {}
            else errors.value = res.error.issues.reduce<any>((errors, error) => {
                const path = error.path.join('.');
                if (!errors[path]) errors[path] = error.message;
                return errors;
            }, {})
        }) : $((_: SubmitEvent, el: HTMLFormElement) => (new FormData(el)).forEach(console.log)),
    }
}
export const useError = (name: string) => {
    const { errors } = useContext(FormContextId)
    return useComputed$(() => errors.value[name])
}
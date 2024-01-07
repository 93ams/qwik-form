import {useStore} from "@builder.io/qwik";
import {newFormStore} from "./form";
import {FieldValues} from "../types";

export type UseFormProps<V extends FieldValues> = {
    onSubmit?: (data: V) => void
    validate: (data: V) => any
    initial: V
}
export const useForm = <V extends FieldValues>(props: UseFormProps<V>) => {
    const store = newFormStore({

    })
    return useStore(props.initial)
}

export type ArrayRef<T> = {
    add: (t: T) => void
    value?: T[]
}
export const useArray = <T,>() => {
    const store: ArrayRef<T> = {
        add: (t) =>
            store.value?.push(t)
    }
    return store
}
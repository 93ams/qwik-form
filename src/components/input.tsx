import {FieldValues, StoreWithField} from "./types";
import {ClassList, PropFunction, Signal} from "@builder.io/qwik";

export type InputValueType = FormDataEntryValue | number | ReadonlyArray<string> | null

export type HTMLInputEl = {}
type TextInputProps = {
    name?: string
    type?: 'text' | 'email' | 'tel' | 'password' | 'url' | 'date'
    label?: string
    error?: string
    required?: boolean
    placeholder?: string
    class?: ClassList | Signal<ClassList> | undefined;
    ref?: PropFunction<(element: Element) => void>
    onInput$?: PropFunction<(ev: Event, el: HTMLInputElement) => void>
    onChange$?: PropFunction<(ev: Event, el: HTMLInputElement) => void>
    onBlur$?: PropFunction<(ev: FocusEvent, el: HTMLInputElement) => void>
};
export type TelInputProps = TextInputProps&{}
export type FileInputProps = {
    accept: string // ContentTypes accepted by the server
    alt: string // Alternative string
}

export type InputProps<T extends FieldValues, P extends keyof T> = StoreWithField<T, P> & TextInputProps
export const Input = <T extends FieldValues, P extends keyof T>({store, field, ...props}: InputProps<T, P>) =>
    <input {...props}
           value={store[field] as InputValueType}
           onInput$={(ev, el) =>
               store[field] = el.value as T[P]}/>

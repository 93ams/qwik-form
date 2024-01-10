import {$, ButtonHTMLAttributes, component$, HTMLAttributes, JSXNode, QRL} from "@builder.io/qwik";
import {sub, inputValue} from "./utils";
import {useError} from "./store/hooks";

export type OnInput = QRL<(_: InputEvent, el: HTMLInputElement) => any>

// Group
export type GroupCtx<T extends { [K in keyof T]: T[K] }, K extends keyof T> =
    { value: T[K], name: string, field: K, onInput$: OnInput }
export type GroupChildren<T extends { [K in keyof T]: T[K] }> =
    (ctx: <K extends keyof T>(name: K) => GroupCtx<T, K>, store: T) => JSXNode
export type GroupProps<T extends { [K in keyof T]: T[K] }> =
    { children: GroupChildren<T>, name?: string, value: T }
export const Group = <T extends { [K in keyof T]: T[K] }>
({children, value: parent, name}: GroupProps<T>) => {
    return children(<K extends keyof T>(field: K) =>
        ({
            value: parent[field], name: sub(name, field), field,
            onInput$: $((_: InputEvent, el: HTMLInputElement) =>
                parent[field] = inputValue(el) as T[K])
        }), parent)
}

// Array
export type ListCtx<T> = { onInput$: OnInput, name: string, value: T }
export type ListChildren<T> = (ctx: ListCtx<T>, i: number) => JSXNode
export type ListProps<T> = { children: ListChildren<T>, name?: string, value: T[] }

export const List = <T, >({children, value: parent, name}: ListProps<T>) =>
    <>{parent.map((value, i) => children({
        value, name: sub(name, i),
        onInput$: $((_, el) =>
            parent.splice(i as number, 1, inputValue(el) as T))
    }, i)) }</>

type RemProps = { slice: any[], i: number, children: string | JSXNode } & Omit<ButtonHTMLAttributes<any>, 'value'>
export const Rem = (({slice, i, children, ...props}: RemProps) =>
    <button onClick$={() => slice.splice(i as number, 1)} type='button' {...props}>{children}</button>)

type AddProps<T> = { slice: T[], value: T, children: string | JSXNode } & Omit<ButtonHTMLAttributes<any>, 'value'>
export const Add = <T, >({slice, value, children, ...props}: AddProps<T>) =>
    <button onClick$={() => slice.push(value)} type='button' {...props}>{children}</button>


export type ErrorProps = { name: string } & Omit<HTMLAttributes<HTMLLabelElement>, 'for'>
export const Error = component$<ErrorProps>(({ name, ...props }) => {
    const error = useError(name)
    return error && <label for={name}  {...props}>{error}</label>
})

type TextInputProps = {
    type?: 'text'
    pattern?: string
}
type FileInputProps = {
    type: 'file'
    accept?: string
}
type NumberInputProps = {
    type: 'number'
    min?: number
    max?: number
}

type InputProps<T> = {
    onInput$: OnInput
    errorClass?: string
    labelClass?: string
    label?: string
    name: string
    value: T
    align?: string
    height?: number
    size?: number
    alt?: string
} & (TextInputProps | NumberInputProps | FileInputProps)
export const Input =<T extends string|number|File>({ label, labelClass, errorClass, ...ctx }: InputProps<T>) => <>
    <label for={ctx.name} class={labelClass}>{label}</label>
    <input {...ctx} />
    <Error name={ctx.name} class={errorClass}/>
</>

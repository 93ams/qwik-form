import {$, ButtonHTMLAttributes, HTMLAttributes, JSXNode, QRL} from "@builder.io/qwik";
import {sub} from "./utils";

export type OnInput = QRL<(_: InputEvent, el: HTMLInputElement) => any>
export type Props<V> = { value: V, name?: string }

// Group
export type GroupCtx<T extends { [K in keyof T]: T[K] }, K extends keyof T> =
    { value: T[K], name: string, field: K, onInput$: OnInput }
export type GroupChildren<T extends { [K in keyof T]: T[K] }> =
    (ctx: <K extends keyof T>(name: K) => GroupCtx<T, K>, store: T) => JSXNode
export type GroupProps <T extends { [K in keyof T]: T[K] }> =
    { children: GroupChildren<T> } & Props<T>
export const Group = <T extends { [K in keyof T]: T[K] }>
({ children, value: parent, name }: GroupProps<T>) => {
    return children(<K extends keyof T>(field: K) =>
        ({ value: parent[field], name: sub(name, field), field,
            onInput$: $((_: InputEvent, el: HTMLInputElement) =>
                parent[field] = el.value as T[K])
        }), parent)
}

// Array
export type ListCtx<T> = { name: string, value: T, onInput$: OnInput }
export type ListChildren<T> = (ctx: ListCtx<T>, i: number) => JSXNode
export type ListProps<T> = { children: ListChildren<T> } & Props<T[]>

export const List = <T,>({children, value: parent, name}: ListProps<T>) =>
    <>{parent.map((value: T, i: number) =>
        children({ value, name: sub(name, i),
            onInput$: $((_, el) =>
                parent.splice(i as number, 1, el.value as T))
        }, i))
    }</>

type RemProps = {slice: any[], i: number, children: string | JSXNode }&Omit<ButtonHTMLAttributes<any>, 'value'>
export const Rem =(({ slice, i, children, ...props }: RemProps) =>
    <button onClick$={() => slice.splice(i as number, 1)} type='button' {...props}>{children}</button>)

type AddProps<T> = {slice: T[], value: T, children: string | JSXNode }&Omit<ButtonHTMLAttributes<any>, 'value'>
export const Add = <T,>({ slice, value, children, ...props }: AddProps<T>) =>
    <button onClick$={() => slice.push(value)} type='button' {...props} onReset$={$(console.log)}>{children}</button>
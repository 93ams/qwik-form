import {HTMLAttributes, JSXNode, QRL} from "@builder.io/qwik";
import {FieldValues, StoreWithField} from "./types";
import {sub} from "./utils";

export type FormProps<V extends FieldValues> = HTMLAttributes<HTMLFormElement> & {
    children: (ctx: <K extends keyof V>(field: K) => { field: K, name: string, store: V }) => JSXNode
    store: V
}
export const Form = <V extends FieldValues>
({ children, store, ...rest }: FormProps<V>) => <form {...rest}>
    {children((name) => ({ store, field: name, name: name as string }))}
</form>

export type FormGroupProps<V extends FieldValues, P extends keyof V> = {
    children: (ctx: <K extends keyof V[P]>(name: K) => { field: K, name: string, store: V[P] }) => JSXNode
    name?: string
} & StoreWithField<V, P>
export const Group = <V extends FieldValues, P extends keyof V>
({
     field,
     children,
     store: parent,
     name = field as string,
 }: FormGroupProps<V, P>) => {
    const store = parent[field]
    return children((field) =>  ({
        name: sub(name, field),
        store,
        field,
    }))
}
export type FormArrayCtx<V extends FieldValues, P extends keyof V> = { field: number, name: string, store: V[P] }
export type FormArrayProps<V extends FieldValues, P extends keyof V> = {
    children: (ctx: FormArrayCtx<V, P>, i: number) => JSXNode
    name?: string
} & StoreWithField<V, P>
export const Array = <V extends FieldValues, P extends keyof V>
({
     field,
     children,
     store: parent,
     name = field as string,
 }: FormArrayProps<V, P>) => {
    const store = parent[field]
    return <>{(store as any[])?.map((_, field) =>
        children({
            name: sub(name, field),
            store,
            field,
        }, field))}</>
}

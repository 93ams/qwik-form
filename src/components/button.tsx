import {component$, Slot} from "@builder.io/qwik";
import {reset, submit} from "./store/form";

export const FormReset = component$(({store, props}) => {
    return <button onClick$={() => reset(store)} {...props}><Slot/></button>
})
export const FormSubmit = component$(({store, props}) => {
    return <button onClick$={() => submit(store)} {...props}><Slot/></button>
})


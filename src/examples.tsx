import {component$, useStore} from "@builder.io/qwik";
import {Input} from "./components/input";
import {Form, Array, Group} from "./components";
import {initial} from "./components/zod";
import {z} from "zod";

export const BareMatrix = component$(() =>
<Form store={{field: [[[1,2],[3,4]],[[1,2],[3,4]]]}}
      preventdefault:submit
      onSubmit$={(ev, el) => (new FormData(el)).forEach(console.log)
}>{(c) => <>
    <Array {...c('field')}>{(c) =>
        <Array {...c}>{(c) =>
            <Array {...c}>{(c) =>
                <Input {...c} />
            }</Array>
        }</Array>
    }</Array>
    <button type='submit'>Submit</button>
    <button type='reset'>Reset</button>
</>}</Form>)

export const SingleField = component$(() => {
    const store = useStore({
        foo: 'bar'
    })
    return <>
        <Input field='foo' store={store} />
        {store.foo}
    </>
})
export const ClientSide = component$(() => {
    const store = useStore({
        foo: {
            nested: 'bar',
            dsa: ['qwerty']
        },
        asd: [{
            deep: 'gfdgde'
        }, {
            deep: 'qweweq'
        }],
        matrix: [
            [0, 1],
            [2, 3],
        ],
    })
    return <>
        <Form store={store}>{(c) => <>
            <Group {...c('foo')}>{(c) => <>
                <Input {...c('nested')} />
                <Array {...c('dsa')}>{(c) =>
                    <Input {...c} />
                }</Array>
            </>}</Group>
            <Array {...c('asd')}>{(c) =>
                <Group {...c}>{(c) =>
                    <Input {...c('deep')} />
                }</Group>
            }</Array>
            <Array {...c('matrix')}>{(c,i) => <>
                <Array {...c}>{(c, j) =><>
                    <Input {...c} />
                    <button onClick$={() => store.matrix[i].splice(j,1)} type='button'>Rem Y</button>
                </>}</Array>
                <button onClick$={() => store.matrix[i].push(0)} type='button'>Add Y</button>
                <button onClick$={() => store.matrix.splice(i,1)} type='button'>Rem X</button>
            </>}</Array>
            <button onClick$={() => store.matrix.push([0])} type='button'>Add X</button>
        </>}</Form>
        <br/>
        {JSON.stringify(store)}
    </>
})

const Schema = z.object({
    name: z.object({
        first: z.string({
            required_error: 'Please enter your first name.',
        }).min(3, 'Your name must have 3 characters or more.'),
        last: z.string({
            required_error: 'Please enter your last name.',
        }).min(3, 'Your name must have 3 characters or more.'),
    }),
    age: z.number({
        required_error: 'Please enter your age.',
    }).min(18, 'you must be at least 18 yo'),
    emails: z.object({
        value: z.string({
            required_error: 'Please enter your email.',
        }).email('The email address is badly formatted.'),
        usage: z.string().array(),
    }).array().default([{
        value: 'asd',
        usage: ['test'],
    }]),
})
const store = initial(Schema)
export const ZodServerSide = component$(() => {
    return <Form store={store} preventdefault:submit
                 onSubmit$={(_, el) => (new FormData(el)).forEach(console.log)}
    >{c => <>
        <Group {...c('name')}>{c => <>
            <Input {...c('first')} />
            <Input {...c('last')} />
        </>}</Group>
        <Input {...c('age')} />
        <Array {...c('emails')}>{({store,...c}, i) =>
            <Group {...c} store={store}>{(c) => <>
                <Input {...c('value')}/>
                <Array {...c('usage')}>{c =>
                    <Input {...c}/>
                }</Array>
            </>}</Group>
        }</Array>
        <button type='submit'>Submit</button>
        <button type='reset'>Reset</button>
    </>}</Form>
})


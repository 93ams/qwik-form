import {component$, useStore} from "@builder.io/qwik";
import {List, Group, Add, Rem} from "./components";
import {initial} from "./components/zod";
import {z} from "zod";

const init = {
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
}
const reset = JSON.stringify(init)
export const ClientSide = component$(() => {
    const store = useStore(init)
    return <>
        <form
            preventdefault:reset onReset$={() =>
                Object.assign(store, JSON.parse(reset))}
            preventdefault:submit onSubmit$={(_, el) =>
                (new FormData(el)).forEach(console.log)}
        >
            <Group value={store}>{c=><>
                <Group {...c('foo')}>{(c, store) => <div>
                    <input {...c('nested')} />
                    <br/>
                    <List {...c('dsa')}>{(c, i) => <div key={c.name}>
                        <label for={c.name}>{c.name}</label>
                        <input {...c} onReset$={(ev, el) => console.log(el)}/>
                        <Rem slice={store.dsa} i={i}>Rem</Rem>
                        <br/>
                    </div>}</List>
                    <Add slice={store.dsa} value={''}>Add</Add>
                    <br/>
                </div>}</Group>
                <List {...c('asd')}>{(c, i) => <div key={c.name}>
                    <Group {...c}>{(c) => <div key={c.name}>
                        <label for={c.name}>{c.name}</label>
                        <input {...c('deep')} />
                    </div>}</Group>
                    <Rem slice={store.asd} i={i}>Rem</Rem>
                    <br/>
                </div>}</List>
                <Add slice={store.asd} value={{deep: ''}}>Add</Add>
                <br/>
                <List {...c('matrix')}>{(row, i) => <div key={row.name}>
                    <List {...row}>{(c, j) => <div key={c.name}>
                        <label for={c.name}>{c.name}</label>
                        <input {...c} type='number' min={0} max={20}/>
                        <Rem slice={row.value} i={j}>Rem Y</Rem>
                        <br/>
                    </div>}</List>
                    <Add slice={row.value} value={0}>Add Y</Add>
                    <Rem slice={store.matrix} i={i}>Rem X</Rem>
                    <br/>
                </div>}</List>
                <Add slice={store.matrix} value={[0]}>Add X</Add>
                <button type='submit'>Submit</button>
                <button type='reset'>Reset</button>
            </>}</Group>
        </form>
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
export const ZodServerSide = component$(() =>
    <form>
        <Group value={store}>{c=><>
            <Group {...c('name')}>{c => <>
                <input {...c('first')} />
                <input {...c('last')} />
            </>}</Group>
            <input {...c('age')} />
            <List {...c('emails')}>{c =>
                <Group {...c}>{c => <>
                    <input {...c('value')}/>
                    <List {...c('usage')}>{c =>
                        <input {...c}/>
                    }</List>
                </>}</Group>
            }</List>
            <button type='submit'>Submit</button>
            <button type='reset'>Reset</button>
        </>}</Group>
    </form>)


export const ZodClientSide = component$(() => {
    const store = useStore(initial(Schema))
    return <>
        <form
            preventdefault:reset onReset$={() =>
            Object.assign(store, JSON.parse(reset))}
            preventdefault:submit onSubmit$={(_, el) =>
            (new FormData(el)).forEach(console.log)}
        >
            <Group value={store}>{c => <>
                <Group {...c('name')}>{c => <>
                    <input {...c('first')} />
                    <input {...c('last')} />
                </>}</Group>
                <input {...c('age')} type='number' />
                <List {...c('emails')}>{(c, i) => <div key={c.name}>
                    <Group {...c}>{(c, row) => <div key={c.name}>
                        <input {...c('value')}/>
                        <List {...c('usage')}>{(c, j) => <div key={c.name}>
                            <label for={c.name}>{c.name}</label>
                            <input {...c} type='number' min={0} max={20}/>
                            <Rem slice={row.usage} i={j}>Rem</Rem>
                            <br/>
                        </div>}</List>
                        <Add slice={row.usage} value={''}>Add</Add>
                    </div>}</Group>
                    <Rem slice={store.emails} i={i}>Rem</Rem>
                </div>}</List>
                <Add slice={store.emails} value={{value: '', usage: []}}>Add</Add>
                <button type='submit'>Submit</button>
                <button type='reset'>Reset</button>
            </>}</Group>
        </form>
        <br/>
        { JSON.stringify(store) }
    </>
})
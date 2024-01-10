import {$, component$} from "@builder.io/qwik";
import {List, Group, Add, Rem, Input} from "./components";
import {useForm} from "./components/store/hooks";
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
export const ClientSide = component$(() => {
    const {value, ...props} = useForm({
        initial: init
    })
    return <>
        <h1>Client Side Object</h1>
        <form {...props}>
            <Group value={value}>{c => <>
                <Group {...c('foo')}>{(c, store) => <div>
                    <Input {...c('nested')}/> <br/>
                    <List {...c('dsa')}>{(c, i) => <div key={c.name}>
                        <Input {...c}/>
                        <Rem slice={store.dsa} i={i}>Rem</Rem> <br/>
                    </div>}</List>
                    <Add slice={store.dsa} value={''}>Add</Add> <br/>
                </div>}</Group>
                <List {...c('asd')}>{(c, i) => <div key={c.name}>
                    <Group {...c}>{c => <div key={c.name}>
                        <Input {...c('deep')}/>
                    </div>}</Group>
                    <Rem slice={value.asd} i={i}>Rem</Rem> <br/>
                </div>}</List>
                <Add slice={value.asd} value={{deep: ''}}>Add</Add> <br/>
                <List {...c('matrix')}>{(row, i) => <div key={row.name}>
                    <List {...row}>{(c, j) => <div key={c.name}>
                        <Input {...c} type='number' />
                        <Rem slice={row.value} i={j}>Rem Y</Rem> <br/>
                    </div>}</List>
                    <Add slice={row.value} value={0}>Add Y</Add>
                    <Rem slice={value.matrix} i={i}>Rem X</Rem> <br/>
                </div>}</List>
                <Add slice={value.matrix} value={[0]}>Add X</Add>
                <div>
                    <button type='submit'>Submit</button>
                    <button type='reset'>Reset</button>
                </div>
            </>}</Group>
        </form>
        <br/>
        {JSON.stringify(value)}
    </>
})
const Schema = z.object({
    name: z.object({
        first: z.string({
            required_error: 'Please enter your first name.',
        }).min(3, 'Your name must have 3 characters or more.')
            .default('John'),
        last: z.string({
            required_error: 'Please enter your last name.',
        }).min(3, 'Your name must have 3 characters or more.')
            .default('Doe'),
    }),
    age: z.number({
        required_error: 'Please enter your age.',
    }).min(18, 'you must be at least 18 yo'),
    emails: z.object({
        value: z.string({
            required_error: 'Please enter your email.',
        }).email('The email address is poorly formatted.'),
        usage: z.string().array().default(['']),
    }).array().default([{
        value: 'asd',
        usage: [''],
    }]),
})
const store = initial(Schema)
export const ZodServerSide = component$(() =>
    <form>
        <h1>Server Side Zod</h1>
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
                        <input {...c} type='number' />
                    }</List>
                </>}</Group>
            }</List>
            <button type='submit'>Submit</button>
            <button type='reset'>Reset</button>
        </>}</Group>
    </form>)

export const ZodClientSide = component$(() => {
    const {value, errors, ...props} = useForm<z.infer<typeof Schema>>({
        validate: $(Schema.safeParse),
        initial: initial(Schema),
    })
    return <>
        <h1>Client Side Zod</h1>
        <form {...props}>
            <Group value={value}>{c => <>
                <Group {...c('name')}>{c => <>
                    <Input {...c('first')} label={`First Name: `}/> <br/>
                    <Input {...c('last')} label={`Last Name: `}/>
                </>}</Group> <br/>
                <Input {...c('age')} type='number' label={`Age: `}/> <br/>
                <List {...c('emails')}>{(c, i) => <div key={c.name}>
                    <Group {...c}>{(c, row) => <>
                        <Input {...c('value')} label={`Email #${i}: `}/> <br/>
                        <List {...c('usage')}>{(c, j) => <div key={c.name}>
                            <Input {...c} type='number' label={`Usage #${i}/${j}: `}/>
                            <Rem slice={row.usage} i={j}>Remove Usage</Rem> <br/>
                        </div>}</List>
                        <Add slice={row.usage} value={''}>Add Usage</Add>
                    </>}</Group>
                    <Rem slice={value.emails} i={i}>Remove Email</Rem>
                </div>}</List> <br/>
                <Add slice={value.emails} value={{value: '', usage: ['']}}>Add Email</Add>
                <button type='submit'>Submit</button>
                <button type='reset'>Reset</button>
            </>}</Group>
        </form>
        <br/>
        {JSON.stringify(value)}<br/>
        {JSON.stringify(errors?.value)}
    </>
})
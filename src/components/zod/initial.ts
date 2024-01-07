import {z} from "zod";
const defaultValue = <T extends z.ZodTypeAny>(schema: T): z.infer<T> =>
    schema instanceof z.ZodDefault ? schema._def.defaultValue()
        : schema instanceof z.ZodArray ? []
            : schema instanceof z.ZodString ? ''
                : schema instanceof z.ZodObject ? initial(schema)
                    : !("innerType" in schema._def) ? undefined
                        : defaultValue(schema._def.innerType)
const sideEffect =  <E extends z.ZodEffects<z.AnyZodObject>>(schema: E) =>
    schema.innerType() instanceof z.ZodEffects ? initial(schema.innerType())
        : initial(z.ZodObject.create(schema.innerType().shape))
export const initial = <T extends z.ZodTypeAny>(schema: T): z.infer<T> =>
    (schema instanceof z.ZodEffects) ? sideEffect(schema)
        :  (schema instanceof z.ZodObject)
        ? Object.fromEntries(Object.entries<z.ZodTypeAny>(schema.shape).
            map(([key, value]) =>
                [key, defaultValue(value)])) as z.infer<T> : null
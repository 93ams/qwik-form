import { z } from "zod";

export const validate = <T extends z.ZodTypeAny>(schema: T) => {
    return (data: z.infer<T>) => {
        const res = schema.parse(data)
        if (res.success) {
            return
        }
        // TODO: map error
        return res.error
    }
}
import { AsyncLocalStorage } from "node:async_hooks";

interface AuthContextInterface{
    userId:string,
    tenantId:string,
    name:string
    role:"Admin"|"Employee"

}
export const authContext = new AsyncLocalStorage<AuthContextInterface>();

export function getAuthContext():AuthContextInterface{
    const context = authContext.getStore();
    if(!context){
        throw new Error("Authentication context is not available");
    }
    return context
}
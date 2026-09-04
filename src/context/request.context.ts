import { AsyncLocalStorage } from "node:async_hooks";
import { TenantIdType } from "../middleware/auth.js";

interface AuthContextInterface{
    userId:string,
    tenantId:TenantIdType,
    name:string
    role:"Admin"|"Employee"
    scope:String[]
}
export const authContext = new AsyncLocalStorage<AuthContextInterface>();

export function getAuthContext():AuthContextInterface{
    const context = authContext.getStore();
    if(!context){
        throw new Error("Authentication context is not available");
    }
    return context
}
import { authContext } from "../context/request.context.js";




export function scopeChecker (requiredScope:string):{allowed:boolean}{
    const scopeFromToken = authContext.getStore()?.scope;
    if(!scopeFromToken || !scopeFromToken.includes(requiredScope)){
        return {allowed:false}
    }
    return {allowed : true}
}
import 'dotenv/config'
import jwt from "jsonwebtoken";
import type{ Request,Response,NextFunction } from "express";

export type TenantIdType =  "seven_elven" | "cj_more" | "lotus";


interface PayloadUser{
    userId:string,
    tenantId:TenantIdType,
    name:string,
    role:"Admin"|"Employee",
    scope:String[]
}

declare global{
    namespace Express{
        interface Request{
            user: PayloadUser;
        }
    }
}

export const authMiddleware = async(req:Request,res:Response,next:NextFunction)=>{
    try {
        const token = req.headers["authorization"]?.split(" ")[1];
        if(!token){
            //  set WWW.Authenticate
            res.setHeader("WWW.Authenticate",`Bearer resource_metadata=${"http://localhost:8000/auth/.well-known/oauth-protected-resource"}`)
            res.status(401).json("You don't have token");
            return;
        }

        // if no token set to undefined
        // if(!token){
        //     req.user = undefined as any;
        //     return next();
        // } 
        const decode = jwt.verify(token,process.env.JWT_SECRET_KEY as string) as PayloadUser;
        if(!decode){
             res.status(401).json("You don't have token");
            return;
        }
        req.user = decode;
        next();
    } catch (error:any) {
        if(error.name === "TokenExpiredError"){
             res.status(401).json("Your session is expired");
             return;
        }
        res.status(401).json("Internal Server Error");

    }
}
import { AuditLog } from "../models/auditLog.model.js"

export const logAudit= async ({actor,action,targetModel,targetId,metadata={}})=>{
    try {
        await AuditLog.create({
            actor,action,targetModel,targetId,metadata
        })
    } catch (error) {
        console.error("Audit Logging Failed!, Error:",error);
        
    }
}
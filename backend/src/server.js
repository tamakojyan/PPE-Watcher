import 'dotenv/config'
console.log("JWT_SECRET >>>", process.env.JWT_SECRET);
import {buildApp} from "./app.js";



const app=buildApp();
const port = Number(process.env.PORT || 3000);

app.listen({host:'0.0.0.0',port}).then(()=>app.log.info(`API listening on :${port}`)).catch((err)=>{
    app.log.error(err);
    process.exit(1)
});
import app from "./src/app.js";
import { env } from "./src/config/env.js";

app.listen(env.port, (error)=>{
    try{
        console.log(`Server run in htttp://localhost:${env.port}`)

        if(error){
            console.error(error);
        }
    }catch(error){
        console.log('Error to inicialize server: ',error); 
    }
}); 
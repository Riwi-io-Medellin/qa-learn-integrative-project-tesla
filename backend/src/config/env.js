import dotenv from 'dotenv'; 
dotenv.config(); 

const requiredVars = [
    'PORT',
    'NODE_ENV',
    'PG_HOST',
    'PG_PORT',
    'PG_DATABASE',
    'PG_USER', 
    'PG_PASSWORD', 
    'JWT_SECRET',
    'JWT_EXPIRES_IN', 
    'BCRYPT_SALT_ROUNDS',
    'FRONTEND_URL'
]

//Valida que todas las variables existan antes de arrancar 

const missing = requiredVars.filter(key => !process.env[key]); 

if(missing.length > 0){
    console.error(`Faltan variables de entorno: ${missing.join(', ')}`)
    process.exit(1); //Detiene el servidor si falta alguna 
}; 

export const env = {

    //server 
    port: process.env.PORT || 3000,
    nodeEnv: process.env.NODE_ENV, 

    //Postgres
    pg: {
        host: process.env.PG_HOST, 
        port: process.env.PG_PORT, 
        user: process.env.PG_USER, 
        password: process.env.PG_PASSWORD,
        database: process.env.PG_DATABASE,
    },

    //JWT
    jwt:{
        secret: process.env.JWT_SECRET, 
        expiresIn: process.env.JWT_EXPIRES_IN
    }, 

    // Bcrypt
    bcrypt: {
        saltRounds: Number(process.env.BCRYPT_SALT_ROUNDS)
    }, 

    //Cors
    frontendUrl: process.env.FRONTEND_URL,
}; 
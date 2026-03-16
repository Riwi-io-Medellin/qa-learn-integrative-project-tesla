import { Pool } from 'pg';
import { env } from './env.js';

export let pool; 

export const connectPostgres = async () => {

    const poolPg = new Pool({
        host: env.pg.host, 
        port: env.pg.port,
        database: env.pg.database, 
        user: env.pg.user, 
        password: env.pg.password,
    })

    try{
        const connection = await poolPg.connect()
        console.log('Postgres connected')
        pool = poolPg
    }catch(error){
        console.log(error)
        process.exit(1)
    }
}


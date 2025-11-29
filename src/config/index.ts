import { join } from 'path'
import { config } from 'dotenv'

const envPath = join(__dirname, '../../.env')

config({ path: envPath })


export default {
    databaseUrl: process.env.DATABASE_URL,
    superSecret: process.env.JWT_SECRET,
    url: process.env.URL,
}
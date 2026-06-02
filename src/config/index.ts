import { join } from 'path'
import { config } from 'dotenv'

const envPath = join(__dirname, '../../.env')

config({ path: envPath })


export default {
    dbHost: process.env.DB_HOST,
    dbPort: parseInt(process.env.DB_PORT || '5432', 10),
    dbUsername: process.env.DB_USERNAME,
    dbPassword: process.env.DB_PASSWORD,
    dbName: process.env.DB_NAME,
    superSecret: process.env.JWT_SECRET,
    url: process.env.URL,
}
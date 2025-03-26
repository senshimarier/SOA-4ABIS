import dotenv from 'dotenv';
import { Sequelize } from 'sequelize';

dotenv.config();
const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,{
        host: process.env.DB_HOST, //DIRECCION
        port: process.env.DB_PORT,
        dialect: 'mysql',
        loggin: false, //puedes activarlo para que jale siempre
    }
);

sequelize.authenticate()
    .then(() => console.log ('conexion con exito.'))
    .catch(err => console.error('No se pudo conectar: ', err));

export default sequelize;
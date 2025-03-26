import {DataTypes} from 'sequelize';
import sequelize from '../conf/bd.js';
//esta es la representacion de mis tablas de la bd en un archivo para poder manipular la info desde querys
const User = sequelize.define('User', {
    id:{
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement:true,
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    phone: {
        type: DataTypes.STRING,
        allowNull:false,
        unique:true,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    status: {
        type: DataTypes.BOOLEAN,
        allowNull:false,
        defaultValue:true,
    },
    creationDate: {
        type: DataTypes.DATE,
        allowNull:false,
        defaultValue:DataTypes.NOW,
    },
}, {
    timestamps:false,//Desactiva createdAt y updateAt
    tableName: 'users',//Asegurate de que coincida con el nombre de tu tabla
});
//se puede hacer la version de uno a uno, de uno a muchos, por asi decirlo dejar las consulta con codiciones
export default User;

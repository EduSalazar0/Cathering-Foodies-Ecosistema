// auth-service/src/models/UserModel.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    return sequelize.define('User', {
        id: {
            type: DataTypes.STRING, // UUID proveniente del claim 'sub' de Keycloak
            primaryKey: true,
            allowNull: false,
            autoIncrement: false
        },
        username: {
            type: DataTypes.STRING,
            allowNull: false
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        role: {
            type: DataTypes.STRING,
            defaultValue: 'estudiante' 
        },
        colegio_id: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        allergies: {
            type: DataTypes.TEXT, // Almacenado como JSON en texto
            allowNull: true
        }
    }, {
        tableName: 'users',
        timestamps: true
    });
};
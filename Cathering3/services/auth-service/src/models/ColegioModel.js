// services/auth-service/src/models/ColegioModel.js
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Colegio extends Model {}

    Colegio.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        nombre: {
            type: DataTypes.STRING,
            allowNull: false
        },
        direccion: {
            type: DataTypes.STRING,
            allowNull: true
        },
        telefono: {
            type: DataTypes.STRING,
            allowNull: true
        },
        ciudad: {
            type: DataTypes.STRING,
            allowNull: true
        },
        provincia: {
            type: DataTypes.STRING,
            allowNull: true
        },
        // Relación: ID del usuario Administrador que creó este colegio
        admin_user_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    }, {
        sequelize,
        modelName: 'Colegio',
        tableName: 'colegios',
        timestamps: true
    });

    return Colegio;
};
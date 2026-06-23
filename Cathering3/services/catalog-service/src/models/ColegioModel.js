// services/catalog-service/src/models/ColegioModel.js
module.exports = (sequelize, DataTypes) => {
    const Colegio = sequelize.define('Colegio', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: { 
            type: DataTypes.STRING,
            allowNull: false
        },
        address: { // Changed from direccion
            type: DataTypes.STRING
        },
        phone: { // Changed from telefono
            type: DataTypes.STRING
        },
        city: { // Changed from ciudad
            type: DataTypes.STRING
        },
        province: { // Changed from provincia
            type: DataTypes.STRING
        }
    }, {
        tableName: 'colegios', 
        timestamps: true 
    });

    return Colegio;
};
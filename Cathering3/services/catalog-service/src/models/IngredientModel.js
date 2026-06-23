// services/catalog-service/src/models/IngredientModel.js
module.exports = (sequelize, DataTypes) => {
    const Ingredient = sequelize.define('Ingredient', {
        id: { 
            type: DataTypes.INTEGER, 
            primaryKey: true, 
            autoIncrement: true 
        },
        name: { // Changed from nombre
            type: DataTypes.STRING, 
            allowNull: false, 
            unique: true 
        },
        isCommon: { // Changed from is_common (CamelCase is standard JS)
            type: DataTypes.BOOLEAN, 
            defaultValue: false 
        } 
    }, { 
        timestamps: false 
    });

    return Ingredient;
};
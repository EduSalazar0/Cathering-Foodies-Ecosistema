const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Product extends Model {}

    Product.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        // CHANGED TO ENGLISH
        name: { 
            type: DataTypes.STRING,
            allowNull: false
        },
        description: {
            type: DataTypes.STRING,
            allowNull: true
        },
        price: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        stock: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        preparationTime: { // Changed from tiempo_prep
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        category: {
            type: DataTypes.STRING,
            defaultValue: 'General'
        },
        image: {
            type: DataTypes.STRING,
            allowNull: true
        },
        ingredients: {
            type: DataTypes.TEXT, // Stored as comma-separated string
            allowNull: true
        },
        availableFrom: { // Changed from available_From
            type: DataTypes.DATEONLY,
            allowNull: true
        },
        colegioId: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    }, {
        sequelize,
        modelName: 'Product',
        tableName: 'products',
        timestamps: true
    });

    return Product;
};
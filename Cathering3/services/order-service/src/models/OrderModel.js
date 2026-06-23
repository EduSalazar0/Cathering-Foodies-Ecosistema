module.exports = (sequelize, DataTypes) => {
    const Order = sequelize.define('Order', {
        id: { 
            type: DataTypes.INTEGER, 
            primaryKey: true, 
            autoIncrement: true 
        },
        status: {
            type: DataTypes.STRING, // Cambiamos a STRING para evitar líos con ENUMs estrictos por ahora
            defaultValue: 'PAID',
            allowNull: false
        },
        total: { 
            type: DataTypes.FLOAT, 
            allowNull: false 
        },
        // IMPORTANTE: userId es solo un número aquí, sin relación SQL
        userId: { 
            type: DataTypes.STRING, 
            allowNull: false 
        },
        colegioId: { 
            type: DataTypes.INTEGER,
            allowNull: false
        },
        // ID de la billetera usada (opcional si pagó en efectivo)
        walletId: { 
            type: DataTypes.INTEGER,
            allowNull: true
        }
    }, {
        timestamps: true
    });

    return Order;
};
module.exports = (sequelize, DataTypes) => {
    const Transaction = sequelize.define('Transaction', {
        id: { 
            type: DataTypes.INTEGER, 
            primaryKey: true, 
            autoIncrement: true 
        },
        userId: {
            type: DataTypes.STRING,
            allowNull: false
        },
        type: { 
            type: DataTypes.ENUM('RECHARGE', 'PAYMENT'), 
            allowNull: false 
        },
        amount: { 
            type: DataTypes.TEXT, 
            allowNull: false 
        },
        description: { 
            type: DataTypes.STRING 
        }
    }, {
        timestamps: true
    });

    return Transaction;
};
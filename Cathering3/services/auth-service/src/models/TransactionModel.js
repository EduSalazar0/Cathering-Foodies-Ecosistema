// services/auth-service/src/models/TransactionModel.js
module.exports = (sequelize, DataTypes) => {
    const Transaction = sequelize.define('Transaction', {
        id: { 
            type: DataTypes.INTEGER, 
            primaryKey: true, 
            autoIncrement: true 
        },
        amount: { 
            type: DataTypes.FLOAT, 
            allowNull: false 
        },
        type: { 
            type: DataTypes.STRING, 
            allowNull: false
        }, 
        description: { 
            type: DataTypes.STRING 
        },
        userId: { 
            type: DataTypes.INTEGER, 
            allowNull: false 
        }
    }, {
        tableName: 'transactions',
        timestamps: true
    });

    return Transaction;
};
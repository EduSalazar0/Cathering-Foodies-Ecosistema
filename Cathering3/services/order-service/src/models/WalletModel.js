module.exports = (sequelize, DataTypes) => {
    const Wallet = sequelize.define('Wallet', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        balance: {
            type: DataTypes.STRING, // Base64 de AWS KMS
            allowNull: false,
            defaultValue: "0.00" // Se cifrará en controlador, pero SQLite por defecto dejará "0.00"
        },
        // userId único para asegurar una billetera por estudiante
        userId: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        pin: {
            type: DataTypes.STRING,
            allowNull: true
        }
    }, {
        timestamps: true
    });

    return Wallet;
};
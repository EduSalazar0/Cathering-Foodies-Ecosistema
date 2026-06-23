const kmsService = require('../services/KmsService');

class WalletController {
    constructor(WalletModel, TransactionModel) {
        this.Wallet = WalletModel;
        this.Transaction = TransactionModel;
    }

    // El estudiante ve su saldo
    async getBalance(req, res) {
        try {
            const userId = req.user.id || req.user.sub;
            
            const wallet = await this.Wallet.findOne({ where: { userId } });
            
            if (!wallet) {
                return res.json({ saldo: 0 });
            }

            // Descifrar el saldo actual
            const decryptedValue = await kmsService.decryptData(wallet.balance);
            console.log(`[BALANCE RAW]: ${decryptedValue}`);
            
            // Parsear estrictamente el resultado
            const saldoReal = parseFloat(decryptedValue);
            console.log(`[BALANCE PARSED]: ${saldoReal}`);

            res.json({ saldo: isNaN(saldoReal) ? 0 : saldoReal });
        } catch (error) {
            console.error("Error en getBalance:", error);
            res.status(500).json({ error: 'Error al obtener saldo seguro' });
        }
    }

    // El estudiante recarga dinero (SUMA)
    async recharge(req, res) {
        console.log('--- RECARGA LLEGÓ AL CONTROLADOR ---', req.body);
        try {
            const userId = req.user.id || req.user.sub;
            const amount = req.body.amount;

            console.log(`[KMS] INTENTO DE RECARGA RECIBIDO EN PUERTO 3003`);
            console.log(`Usuario ID: ${userId} | Monto: ${amount}`);

            if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
                return res.status(400).json({ error: 'Monto inválido' });
            }

            let wallet = await this.Wallet.findOne({ where: { userId } });

            if (wallet) {
                // Si la billetera YA EXISTE
                const currentString = await kmsService.decryptData(wallet.balance);
                
                const currentBalance = parseFloat(currentString) || 0;
                const rechargeAmount = parseFloat(amount);
                
                const newBalance = currentBalance + rechargeAmount;
                
                // Cifrar el nuevo total convirtiéndolo a string primero
                wallet.balance = await kmsService.encryptData(newBalance.toString());
                
                // Guarda en base de datos
                await wallet.save();
                
                // AUDITORÍA: Registrar transacción
                if (this.Transaction) {
                    await this.Transaction.create({ 
                        userId: userId, 
                        type: 'RECHARGE', 
                        amount: await kmsService.encryptData(amount.toString()) 
                    });
                    console.log(`[AUDITORÍA KMS] Transacción de RECHARGE registrada cifrada.`);
                }

                console.log(`[KMS] Nuevo Saldo Seguro Guardado (Ciphertext Length: ${wallet.balance.length})`);
                return res.json({ message: 'Recarga criptográfica exitosa', nuevo_saldo: newBalance });
            } else {
                // Si la billetera NO EXISTE
                const encryptedInitial = await kmsService.encryptData(parseFloat(amount).toString());
                
                wallet = await this.Wallet.create({
                    userId,
                    balance: encryptedInitial
                });
                
                // AUDITORÍA: Registrar transacción
                if (this.Transaction) {
                    await this.Transaction.create({ 
                        userId: userId, 
                        type: 'RECHARGE', 
                        amount: encryptedInitial 
                    });
                    console.log(`[AUDITORÍA KMS] Transacción de RECHARGE inicial registrada cifrada.`);
                }

                console.log(`[KMS] Billetera Creada y Saldo Seguro Guardado (Ciphertext Length: ${encryptedInitial.length})`);
                return res.json({ message: 'Billetera creada y recarga exitosa', nuevo_saldo: parseFloat(amount) });
            }
        } catch (error) {
            console.error("Error en recharge:", error);
            res.status(500).json({ error: 'Error al recargar saldo seguro' });
        }
    }
}

module.exports = WalletController;
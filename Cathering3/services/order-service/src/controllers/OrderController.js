const { Op } = require('sequelize');
const kmsService = require('../services/KmsService');

class OrderController {
    constructor(OrderModel, OrderItemModel, WalletModel, TransactionModel) {
        this.Order = OrderModel;
        this.OrderItem = OrderItemModel;
        this.Wallet = WalletModel;
        this.Transaction = TransactionModel;
    }

    async createOrder(req, res) {
        console.log("INICIANDO PROCESO DE CREAR ORDEN...");
        try {
            const user = req.user;

            // 1. SOLUCIÓN KEYCLOAK: Extraer el ID correctamente
            const userId = user.sub || user.id;

            // 2. SOLUCIÓN CARRITO: Soportar que llegue como arreglo directo o como objeto
            const items = req.body.items || req.body;

            console.log(`Usuario: ${userId} | Colegio: ${user.colegio_id}`);

            if (!items || !Array.isArray(items) || items.length === 0) {
                return res.status(400).json({ error: "Carrito vacío" });
            }

            // 1. Calcular Total
            let total = 0;
            const orderItemsData = items.map(item => {
                const price = parseFloat(item.price);
                const qty = parseInt(item.quantity);
                total += price * qty;
                return {
                    productId: item.id,
                    productName: item.name,
                    quantity: qty,
                    price: price,
                    removedIngredients: (item.removedIngredients && item.removedIngredients.length > 0) ? JSON.stringify(item.removedIngredients) : null
                };
            });
            console.log(`Total calculado del carrito: $${total}`);

            // 2. Buscar Billetera
            const wallet = await this.Wallet.findOne({ where: { userId: userId } });
            if (!wallet) {
                console.log("Error: No hay billetera");
                return res.status(404).json({ error: "Sin billetera" });
            }

            // 3. SOLUCIÓN KMS: Descifrar saldo antes de la matemática
            const decryptedBalanceStr = await kmsService.decryptData(wallet.balance);
            const saldoActual = parseFloat(decryptedBalanceStr);
            console.log(`Saldo real (Descifrado KMS): $${saldoActual}`);

            if (saldoActual < total) {
                console.log("Error: Saldo insuficiente");
                return res.status(400).json({ error: "Saldo insuficiente" });
            }

            // 4. Cobrar y volver a encriptar el nuevo saldo
            const nuevoSaldo = saldoActual - total;
            const encryptedNuevoSaldo = await kmsService.encryptData(nuevoSaldo.toString());

            await wallet.update({ balance: encryptedNuevoSaldo });
            console.log("Cobro realizado y re-encriptado en Wallet de forma segura.");

            // AUDITORÍA: Registrar transacción
            if (this.Transaction) {
                await this.Transaction.create({ 
                    userId: userId, 
                    type: 'PAYMENT', 
                    amount: await kmsService.encryptData(total.toString()) 
                });
                console.log(`[AUDITORÍA KMS] Transacción de PAYMENT registrada cifrada.`);
            }

            // 5. Crear Orden en DB
            console.log("Intentando guardar Orden en DB...");
            const newOrder = await this.Order.create({
                userId: userId,
                colegioId: user.colegio_id,
                total: total,
                status: 'PAID',
                walletId: wallet.id
            });
            console.log(`ORDEN GUARDADA CON ÉXITO. ID: ${newOrder.id}`);

            // 6. Guardar Items de la Orden
            const itemsToSave = orderItemsData.map(i => ({ ...i, OrderId: newOrder.id }));
            await this.OrderItem.bulkCreate(itemsToSave);
            console.log("Items guardados");

            res.status(201).json({
                message: "Pedido realizado con éxito",
                order: newOrder,
                nuevo_saldo: nuevoSaldo
            });

        } catch (error) {
            console.error("ERROR FATAL EN CREATE ORDER");
            console.error(error);
            res.status(500).json({ error: "Error procesando el pedido: " + error.message });
        }
    }
    async getIncomingOrders(req, res) {
        try {
            const user = req.user;
            if (!user.colegio_id) return res.status(400).json({ error: "Usuario sin colegio" });

            const orders = await this.Order.findAll({
                where: {
                    colegioId: user.colegio_id,
                    status: { [Op.in]: ['PAID', 'EN_PREPARACION', 'LISTO'] }
                },
                include: [{ model: this.OrderItem, as: 'items' }],
                order: [['createdAt', 'ASC']]
            });
            console.log(`📦 Cocina: Encontrados ${orders.length} pedidos para colegio ${user.colegio_id}`);
            res.json(orders);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Error obteniendo pedidos" });
        }
    }

    async updateStatus(req, res) {
        try {
            const { id } = req.params;
            const { status } = req.body;
            const order = await this.Order.findByPk(id);
            if (!order) return res.status(404).json({ error: "No encontrado" });
            order.status = status;
            await order.save();
            res.json(order);
        } catch (error) {
            res.status(500).json({ error: "Error updating status" });
        }
    }

    async getMyOrders(req, res) {
        try {
            const orders = await this.Order.findAll({
                where: { userId: req.user.id },
                include: [{ model: this.OrderItem, as: 'items' }],
                order: [['createdAt', 'DESC']]
            });
            res.json(orders);
        } catch (error) {
            res.status(500).json({ error: "Error getting orders" });
        }
    }
}

module.exports = OrderController;
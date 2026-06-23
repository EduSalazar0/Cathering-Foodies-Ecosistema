const { KMSClient, EncryptCommand, DecryptCommand, CreateKeyCommand, CreateAliasCommand, ListAliasesCommand } = require('@aws-sdk/client-kms');

class KmsService {
    constructor() {
        // Volviendo al nombre del contenedor interno de Docker para KMS
        const endpoint = process.env.LOCALSTACK_URL || 'http://localstack_aws:4566';

        this.client = new KMSClient({
            endpoint: endpoint,
            region: 'us-east-1',
            credentials: {
                accessKeyId: 'test',
                secretAccessKey: 'test'
            }
        });
        this.aliasName = 'alias/cathering-wallet-key';
        this.keyId = null;
    }

    async init() {
        try {
            // Verificar si la key ya existe a través de los alias
            const { Aliases } = await this.client.send(new ListAliasesCommand({}));
            const existingAlias = Aliases.find(a => a.AliasName === this.aliasName);

            if (existingAlias) {
                this.keyId = existingAlias.TargetKeyId;
                console.log(`[KMS] Llave encontrada en LocalStack. KeyId: ${this.keyId}`);
            } else {
                console.log(`[KMS] Llave no encontrada. Generando nueva llave criptográfica en LocalStack...`);
                // Crear nueva llave KMS
                const createResponse = await this.client.send(new CreateKeyCommand({
                    Description: 'Master Key para Wallet de Cathering'
                }));
                this.keyId = createResponse.KeyMetadata.KeyId;

                // Crear el alias para referenciarla fácilmente después
                await this.client.send(new CreateAliasCommand({
                    AliasName: this.aliasName,
                    TargetKeyId: this.keyId
                }));
                console.log(`[KMS] Llave y alias creados exitosamente. KeyId: ${this.keyId}`);
            }
        } catch (error) {
            console.error('[KMS] Error de inicialización:', error);
            throw error;
        }
    }

    async encryptData(plainText) {
        if (!this.keyId) await this.init();
        if (plainText === null || plainText === undefined) return plainText;

        try {
            const bufferText = Buffer.from(plainText.toString());
            const response = await this.client.send(new EncryptCommand({
                KeyId: this.keyId,
                Plaintext: bufferText
            }));
            // Devolver cifrado en base64 para guardarlo fácil en DB
            return Buffer.from(response.CiphertextBlob).toString('base64');
        } catch (error) {
            console.error('[KMS] Error al cifrar:', error);
            throw error;
        }
    }
    async decryptData(cipherTextBase64) {
        // 1. Asegurar inicialización
        if (!this.keyId) await this.init();

        // 2. Si no hay saldo en la base de datos o llega indefinido, retornar '0'
        if (!cipherTextBase64) return '0';

        try {
            // 3. Convertir de Base64 a Buffer
            const bufferCipher = Buffer.from(cipherTextBase64, 'base64');

            // 4. Enviar a KMS en LocalStack
            const response = await this.client.send(new DecryptCommand({
                CiphertextBlob: bufferCipher
            }));

            // 5. Decodificar el Uint8Array devuelto por AWS SDK v3
            const decodedString = new TextDecoder().decode(response.Plaintext);

            console.log(`[KMS DECRYPT EXITO]: Texto descifrado de la base de datos -> ${decodedString}`);

            // 6. Retorno explícito del valor
            return decodedString;

        } catch (error) {
            console.error('[KMS] Error al descifrar:', error.message);
            // En caso de fallo criptográfico, devolver '0' para no crashear la aplicación
            return '0';
        }
    }

}

// Exportar una única instancia (Singleton)
module.exports = new KmsService();


import { JSONRPCServerAndClient, JSONRPCClient, JSONRPCServer, JSONRPCParams } from "json-rpc-2.0";
import {
    RequestAccountParams,
    ListCurrenciesParams,
    SignTransactionParams,
    Transport,
    ExchangeType,
    TransactionExchangePayload,
    SellExchangePayload,
    EcdsaSignature,
    DeviceInfo,
    ApplicationDetails
} from './LedgerLiveApiSdk.types';
import {
    Account,
    Currency,
    Transaction,
    SignedTransaction,
} from "./types";
import {
    deserializeAccount,
    serializeTransaction,
    deserializeSignedTransaction,
    serializeSignedTransaction,
} from "./serializers";
import Logger from './logger';
import LedgerPlatformApduTransport from './LedgerPlatformApduTransport'

const defaultLogger = new Logger('LL-API');

export default class LedgerLiveApi {
    private transport: Transport;
    private logger: Logger;
    private serverAndClient?: JSONRPCServerAndClient;

    constructor(transport: Transport, logger: Logger = defaultLogger) {
        this.transport = transport;
        this.logger = logger;
    }

    /**
     * Wrapper to api request for logging
     */
    private async _request(method: string, params?: JSONRPCParams | undefined, clientParams?: void | undefined): Promise<any> {
        if (!this.serverAndClient) {
            this.logger.error(`not connected`, method);
            throw new Error("Ledger Live API not connected");
        }

        this.logger.log(`request - ${method}`, params, clientParams);
        try {
            const result = await this.serverAndClient.request(method, params, clientParams);
            this.logger.log(`response - ${method}`, params, clientParams);
            return result;
        } catch (error) {
            this.logger.warn(`error - ${method}`, params, clientParams);
            throw error;
        }
    }

    /**
     * Connect the SDK to the Ledger Live instance
     */
    connect() {
        const serverAndClient = new JSONRPCServerAndClient(
            new JSONRPCServer(),
            new JSONRPCClient((payload) => this.transport.send(payload)),
        );

        this.transport.onMessage = (payload) => serverAndClient.receiveAndSend(payload);
        this.transport.connect();
        this.serverAndClient = serverAndClient;
        this.logger.log('connected', this.transport);
    }

    /**
     * Disconnect the SDK
     */
    async disconnect() {
        delete this.serverAndClient;
        await this.transport.disconnect();
        this.logger.log('disconnected', this.transport);
    }

    /** Legder Live Methods */

    /**
     * Let user choose an account in a Ledger Live, providing filters for choosing currency or allowing add account.
     * 
     * @param {RequestAccountParams} params - parameters for the request modal
     * @returns {Promise<Account>} The account picked by the user
     */
    async requestAccount(params: RequestAccountParams): Promise<Account> {
        const rawAccount = await this._request('account.request', params || {});

        return deserializeAccount(rawAccount);
    }

    /**
     * List accounts added by user on Ledger Live
     * 
     * @returns {Account[]} The list of accounts
     */
    async listAccounts(): Promise<Account[]> {
        const rawAccounts = await this._request('account.list');

        return rawAccounts.map(deserializeAccount);
    }

    /**
     * List crypto-currencies supported by Ledger Live, providing filters by name or ticker
     * 
     * @param {ListCurrenciesParams} params - filters for currencies
     * @returns {Currency[]} A list of currencies matching the params
     */
    async listCurrencies(params?: ListCurrenciesParams): Promise<Currency[]> {
        return this._request('currency.list', params || {});
    }

    /**
     * Let user verify it's account address on his device through Ledger Live
     * 
     * @param accountId - LL id of the account
     * @returns string - the verified address
     */
    async receive(accountId: string): Promise<string> {
        return this._request('account.receive', { accountId });
    }

    /**
     * Let user sign a transaction through Ledger Live
     * @param {string} accountId - LL id of the account 
     * @param {Transaction} transaction  - the transaction in the currency family-specific format
     * @param {SignTransactionParams} params - parameters for the sign modal
     * 
     * @returns {SignedTransaction}
     */
    async signTransaction(accountId: string, transaction: Transaction, params?: SignTransactionParams): Promise<SignedTransaction> {
        const rawSignedTransaction = await this._request('transaction.sign', {
            accountId,
            transaction: serializeTransaction(transaction),
            params: params || {},
        });

        return deserializeSignedTransaction(rawSignedTransaction);
    }

    /**
     * Broadcast a signed transaction through Ledger Live, providing an optimistic Operation givent by signTransaction
     * @param {string} accountId - LL id of the account
     * @param {SignedTransaction} signedTransaction - a signed transaction given by LL when signing
     * 
     * @returns {string} - hash of the transaction
     */
    async broadcastSignedTransaction(accountId: string, signedTransaction: SignedTransaction): Promise<string> {
        return this._request('transaction.broadcast', {
            accountId,
            signedTransaction: serializeSignedTransaction(signedTransaction),
        });
    }

    /**
     * Synchronize an account with its network and return an updated view of the account
     * @param {string} accountId - The id of the account to synchronize
     * 
     * @returns {Account} An updated view of the account 
     */
    async synchronizeAccount(accountId: string): Promise<Account> {
        accountId;
        throw new Error('Function is not implemented yet');
    }

    /**
     * Start the exchange process by generating a nonce on Ledger device
     * @param {ExchangeType} exchangeType The type of exchange to initiate
     * @param {string} partnerName Name of the partner used to retrieve partner informations.
     * 
     * @returns {string} The nonce of the exchange
     */
    async initExchange(exchangeType: ExchangeType, partnerName: String): Promise<string> {
        exchangeType;
        partnerName;
        throw new Error('Function is not implemented yet');
    }

    /**
     * Complete an exchange process by passing by the exchange content and its signature. Ledger Live will treat and forward
     * exchange payload to the device and sign an broadcast the transaction once accepted by user.
     * @param {TransactionExchangePayload | SellExchangePayload} exchangePayload The payload of the exchange operations with details of the transaction to create.
     * @param {EcdsaSignature} payloadSignature Signature of the payload signed by the provider
     */
    async completeExchange(exchangePayload: TransactionExchangePayload | SellExchangePayload, payloadSignature: EcdsaSignature): Promise<string> {
        exchangePayload;
        payloadSignature;
        throw new Error('Function is not implemented yet');
    }

    /**
     * Get information about a currently connected device (firmware version...) TODO recup du cache en ouvrant le manager
     * 
     * @returns {Promise<DeviceInfo>} Informations about a currently connected device
     */
    async getLastConnectedDeviceInfo(): Promise<DeviceInfo> {
        throw new Error('Function is not implemented yet');
    }

    /**
     * List applications installed on the last connected device. Application list is cached by Ledger Live
     * when the user open the manager.
     * 
     * @returns {Promise<ApplicationDetails[]>} The list of applications
     */
    async listApps(): Promise<ApplicationDetails[]> {
        throw new Error('Function is not implemented yet');
    }

    /**
     * Open a bridge to an application to exchange APDUs with a device application.
     * @param {string} appName - The name of the application to bridge
     * 
     * @returns {Promise<LedgerPlatformApduTransport>} A APDU transport which can be used either to send raw APDU
     * or used with ledgerjs libraries.
     */
    async bridgeApp(appName: string): Promise<LedgerPlatformApduTransport> {
        appName;
        throw new Error('Function is not implemented yet');
    }

    /**
     * Open a bridge to a the device dashboard to exchange APDUs
     * 
     * @returns {Promise<LedgerPlatformApduTransport>} A APDU transport which can be used either to send raw APDU
     * or used with ledgerjs libraries.
     */
    async bridgeDashboard(): Promise<LedgerPlatformApduTransport> {
        throw new Error('Function is not implemented yet');
    }

}

import { JSONRPCServerAndClient, JSONRPCClient, JSONRPCServer } from "json-rpc-2.0";
import { 
    RequestAccountParams,
    ListCurrenciesParams,
    SignTransactionParams,
    Transport
} from './LedgerLiveApiSdk.types';
import {
    Account, 
    Currency, 
    Transaction, 
    SignedTransaction
} from "./types";
import {
    deserializeAccount, 
    serializeTransaction, 
    deserializeSignedTransaction, 
    serializeSignedTransaction,
} from "./serializers";

export default class LedgerLiveApi {
    private transport: Transport;
    private serverAndClient?: JSONRPCServerAndClient;
    
    constructor(transport: Transport) {
        this.transport = transport;
    }

    private api(): JSONRPCServerAndClient {
        if (!this.serverAndClient) {
            throw new Error("Ledger Live API not connected");
        }

        return this.serverAndClient;
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
    }

    /**
     * Disconnect the SDK
     */
    async disconnect() {
        delete this.serverAndClient;
        return this.transport.disconnect();
    }

    /** Legder Live Methods */

    /**
     * Let user choose an account in a Ledger Live, providing filters for choosing currency or allowing add account.
     * 
     * @param {RequestAccountParams} params - parameters for the request modal
     * @returns Account
     */
    async requestAccount(params: RequestAccountParams): Promise<Account> {
        const rawAccount = await this.api().request('account.request', params || {});
        
        return deserializeAccount(rawAccount);
    }

    /**
     * List accounts added by user on Ledger Live
     * 
     * @returns {Account[]}
     */
    async listAccounts(): Promise<Account[]> {
        const rawAccounts = await this.api().request('account.list');

        return rawAccounts.map(deserializeAccount);
    }

    /**
     * List crypto-currencies supported by Ledger Live, providing filters by name or ticker
     * 
     * @param {ListCurrenciesParams} params - filters for currencies
     * @returns {Currency[]}
     */
    async listCurrencies(params?: ListCurrenciesParams): Promise<Currency[]> {
        return this.api().request('currency.list', params || {});
    }

    /**
     * Let user verify it's account address on his device through Ledger Live
     * 
     * @param accountId - LL id of the account
     * @returns string - the verified address
     */
    async receive(accountId: string): Promise<string> {
        return this.api().request('account.receive', { accountId });
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
        const rawSignedTransaction = await this.api().request('transaction.sign', {
            accountId,
            transaction: serializeTransaction(transaction),
            params: params || {},
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
        return this.api().request('transaction.broadcast', {
            accountId,
            signedTransaction: serializeSignedTransaction(signedTransaction),
        });
    }
}
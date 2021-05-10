
import { JSONRPCServerAndClient, JSONRPCClient, JSONRPCServer } from "json-rpc-2.0";
import {RequestAccountParams, ListCurrenciesParams, Transport} from './LedgerLiveApiSdk.types';
import {Account, Currency, Transaction, SignedTransaction} from "./types";
import {deserializeAccount, serializeTransaction} from "./serializers";
import {RawAccount} from "./rawTypes";

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

    connect() {
        const serverAndClient = new JSONRPCServerAndClient(
            new JSONRPCServer(),
            new JSONRPCClient((payload) => this.transport.send(payload)),
        );

        this.transport.onMessage = (payload) => serverAndClient.receiveAndSend(payload);
        this.transport.connect();
        this.serverAndClient = serverAndClient;
    }

    async disconnect() {
        delete this.serverAndClient;
        return this.transport.disconnect();
    }

    /** Legder Live Methods */

    async requestAccount(params: RequestAccountParams): Promise<Account> {
        const rawAccount = await this.api().request('account.request', params || {});
        return deserializeAccount(rawAccount);
    }

    async listAccounts(): Promise<Account[]> {
        const rawAccounts = await this.api().request('account.list');
        return rawAccounts.map(deserializeAccount);
    }

    async listCurrencies(params: ListCurrenciesParams): Promise<Currency[]> {
        return this.api().request('currency.list', params || {});
    }

    async getAccount(accountId: string): Promise<Account> {
        const rawAccount = await this.api().request('account.get', { accountId }) as RawAccount;
        return deserializeAccount(rawAccount);
    }

    async receive(accountId: string): Promise<string> {
        return this.api().request('account.receive', { accountId });
    }

    async signTransaction(accountId: string, transaction: Transaction): Promise<SignedTransaction> {
        return this.api().request('transaction.sign', {
            accountId,
            transaction: serializeTransaction(transaction),
        });
    }

    async broadcastSignedTransaction(accountId: string, signedTransaction: SignedTransaction): Promise<any> {
        return this.api().request('transaction.broadcast', { accountId, signedTransaction });
    }
}
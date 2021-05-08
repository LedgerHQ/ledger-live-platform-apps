
import { JSONRPCServerAndClient, JSONRPCClient, JSONRPCServer } from "json-rpc-2.0";
import {RequestAccountParams, SignedTransaction, Transport} from './LedgerLiveApiSdk.types';
import {Account, Currency, Transaction} from "./types";
import {deserializeAccount, serializeTransaction} from "./serializers";
import {RawAccount} from "./rawTypes";

export default class LedgerLiveApi {
    private transport: Transport;
    private serverAndClient?: JSONRPCServerAndClient;
    
    constructor(transport: Transport) {
        this.transport = transport;
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
        if (!this.serverAndClient) {
            throw new Error("Ledger Live API not connected");
        }
        const rawAccount = await this.serverAndClient.request('account.request', params);
        return deserializeAccount(rawAccount);
    }

    async listAccounts(): Promise<Account[]> {
        if (!this.serverAndClient) {
            throw new Error("Ledger Live API not connected");
        }
        const rawAccounts = await this.serverAndClient.request('account.list');
        return rawAccounts.map(deserializeAccount);
    }

    async listCurrencies(): Promise<Currency[]> {
        if (!this.serverAndClient) {
            throw new Error("Ledger Live API not connected");
        }

        return this.serverAndClient.request('currency.list');
    }

    async getAccount(accountId: string): Promise<Account> {
        if (!this.serverAndClient) {
            throw new Error("Ledger Live API not connected");
        }
        const rawAccount = await this.serverAndClient.request('account.get', { accountId }) as RawAccount;
        return deserializeAccount(rawAccount);
    }

    async receive(accountId: string): Promise<string> {
        if (!this.serverAndClient) {
            throw new Error("Ledger Live API not connected");
        }
        return this.serverAndClient.request('account.receive', { accountId });
    }

    async signTransaction(accountId: string, transaction: Transaction): Promise<SignedTransaction> {
        if (!this.serverAndClient) {
            throw new Error("Ledger Live API not connected");
        }

        return this.serverAndClient.request('transaction.sign', {
            accountId,
            transaction: serializeTransaction(transaction),
        });
    }

    async broadcastSignedTransaction(accountId: string, signedTransaction: SignedTransaction): Promise<any> {
        if (!this.serverAndClient) {
            throw new Error("Ledger Live API not connected");
        }

        return this.serverAndClient.request('transaction.broadcast', { accountId, signedTransaction });
    }
}

import { JSONRPCServerAndClient, JSONRPCClient, JSONRPCServer } from "json-rpc-2.0";
import {SignedTransaction, Transport} from './LedgerLiveApiSdk.types';

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

    async listAccounts() {
        if (!this.serverAndClient) {
            throw new Error("Ledger Live API not connected");
        }
        return this.serverAndClient.request('account.list');
    }

    async getAccount(accountId: string) {
        if (!this.serverAndClient) {
            throw new Error("Ledger Live API not connected");
        }
        return this.serverAndClient.request('account.get', { accountId });
    }

    async receive(accountId: string) {
        if (!this.serverAndClient) {
            throw new Error("Ledger Live API not connected");
        }
        return this.serverAndClient.request('account.receive', { accountId });
    }

    async signTransaction(accountId: string, transaction: Object): Promise<SignedTransaction> {
        if (!this.serverAndClient) {
            throw new Error("Ledger Live API not connected");
        }
        console.log("calling signTransaction on live api", transaction)

        return this.serverAndClient.request('transaction.sign', { accountId, transaction });
    }

    async broadcastSignedTransaction(accountId: string, signedTransaction: SignedTransaction) {
        if (!this.serverAndClient) {
            throw new Error("Ledger Live API not connected");
        }

        return this.serverAndClient.request('transaction.broadcast', { accountId, signedTransaction });
    }
}

import { JSONRPCServerAndClient, JSONRPCClient, JSONRPCServer } from "json-rpc-2.0";
import { Transport } from './LedgerLiveApiSdk.types';

export default class LedgerLiveApi {
    private transport: Transport;
    private serverAndClient?: JSONRPCServerAndClient;
    
    constructor(transport: Transport) {
        this.transport = transport;
    }

    connect() {
        const serverAndClient = new JSONRPCServerAndClient(
            new JSONRPCServer(),
            new JSONRPCClient((payload) => this.transport.send(payload))
        );

        this.transport.onMessage = (payload) => serverAndClient.receiveAndSend(payload);
        this.transport.connect();
        this.serverAndClient = serverAndClient;
    }

    disconnect() {
        delete this.serverAndClient;
        return this.transport.disconnect();
    }

    /** Legder Live Methods */

    listAccounts() {
        if (!this.serverAndClient) {
            throw new Error("Ledger Live API not connected");
        }
        return this.serverAndClient.request('account.list');
    }

    getAccount(accountId: string) {
        if (!this.serverAndClient) {
            throw new Error("Ledger Live API not connected");
        }
        return this.serverAndClient.request('account.get', { accountId });
    }

    receive(accountId: string) {
        if (!this.serverAndClient) {
            throw new Error("Ledger Live API not connected");
        }
        return this.serverAndClient.request('account.receive', { accountId });
    }

    signTransaction(accountId: string, transaction: Object) {
        if (!this.serverAndClient) {
            throw new Error("Ledger Live API not connected");
        }
        return this.serverAndClient.request('transaction.sign', { accountId, transaction });
    }
}

import { JSONRPCServerAndClient, JSONRPCClient, JSONRPCServer } from "json-rpc-2.0";
import { Transport } from './LedgerLiveApiSdk.types';

export default class LedgerLiveApi {
    private transport: Transport;
    private serverAndClient?: JSONRPCServerAndClient;
    
    constructor(transport: Transport) {
        this.transport = transport;
    }

    connect() {
        this.serverAndClient = new JSONRPCServerAndClient(
            new JSONRPCServer(),
            new JSONRPCClient((payload) => this.transport.send(payload))
        );

        this.transport.onMessage = (payload) => this.serverAndClient?.receiveAndSend(payload);
        this.transport.connect();
    }

    disconnect() {
        delete this.serverAndClient;
        return this.transport.disconnect();
    }

    /** Legder Live Methods */

    listAccounts() {
        return this.serverAndClient?.request('account.list'); 
    }

    getAccount(accountId: string) {
        return this.serverAndClient?.request('account.get', { accountId }); 
    }

    receiveAccount(accountId: string) {
        return this.serverAndClient?.request('account.receive', { accountId }); 
    }

    signTransaction(accountId: string, transaction: Object) {
        return this.serverAndClient?.request('transaction.sign', { accountId, transaction }); 
    }
}
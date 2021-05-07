import data from "./mocks.json";
import {RequestAccountParams, SignedTransaction} from "./LedgerLiveApiSdk.types";
import {generateRandomTxID} from "../src/DAPPBrowser/mocks";
import {Account} from "./LedgerLiveApiSdk.types"
import {deserializeAccount} from "./serialization/accounts";

const { rawAccounts } = data;

const accounts = rawAccounts.map(deserializeAccount);



export default class LedgerLiveApiMock {
    connected: boolean = false;

    connect() {
        this.connected = true;
    }

    async disconnect() {
        this.connected = false;
    }

    /** Legder Live Methods */

    async requestAccount(_params: RequestAccountParams): Promise<Account> {
        return accounts[0];
    }

    async listAccounts() {
        if (!this.connected) {
            throw new Error("Ledger Live API not connected");
        }
        console.log({accounts})
        return accounts;
    }

    async getAccount(accountId: string) {
        if (!this.connected) {
            throw new Error("Ledger Live API not connected");
        }
        const account = accounts.find((account: any) => account.id === accountId);

        if (!account) {
            throw new Error("Account not found");
        }
        return account;
    }

    async receive(accountId: string) {
        if (!this.connected) {
            throw new Error("Ledger Live API not connected");
        }
        const account = accounts.find((account: any) => account.id === accountId);
        if (!account) {
            throw new Error("Account not found");
        }
        return account.address;
    }

    async signTransaction(_accountId: string, _transaction: Object) {
        if (!this.connected) {
            throw new Error("Ledger Live API not connected");
        }
        return generateRandomTxID(109);
    }

    broadcastSignedTransaction(_signedTransaction: SignedTransaction) {
        if (!this.connected) {
            throw new Error("Ledger Live API not connected");
        }
        return "";
    }

}
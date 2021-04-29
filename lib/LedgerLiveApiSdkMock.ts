import data from "./mocks.json";

const { accounts } = data;

export default class LedgerLiveApiMock {
    connected: boolean = false;

    connect() {
        this.connected = true;
    }

    async disconnect() {
        this.connected = false;
    }

    /** Legder Live Methods */

    async listAccounts() {
        if (!this.connected) {
            throw new Error("Ledger Live API not connected");
        }
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
        return account.freshAddress;
    }

    async signTransaction(_accountId: string, _transaction: Object) {
        if (!this.connected) {
            throw new Error("Ledger Live API not connected");
        }
        return "";
    }
}
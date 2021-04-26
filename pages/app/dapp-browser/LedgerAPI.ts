import { JSONRPCServerAndClient, JSONRPCClient, JSONRPCServer } from "json-rpc-2.0";
import {Account} from "./types";

export class LedgerAPI {
    jsonRPC: JSONRPCServerAndClient;

    constructor() {
        this.jsonRPC = new JSONRPCServerAndClient(
            new JSONRPCServer(),
            new JSONRPCClient((request) => {
                try {
                    window.parent.postMessage(JSON.stringify(request), "*");
                    return Promise.resolve();
                } catch (error) {
                    return Promise.reject(error);
                }
            })
        );

        const receiveMessage = (event: MessageEvent) => {
            if (event.origin !== window.location.origin) {
                if (event.data && typeof event.data === "string") {
                    void this.jsonRPC.receiveAndSend(JSON.parse(event.data.toString()));
                }
            }
        }

        window.addEventListener("message", receiveMessage, false);
    }

    async getAccounts(): Promise<Account[]> {
        return this.jsonRPC.request("account.list") as Promise<Account[]>;
    }
}

import BigNumber from "bignumber.js";

export type MessageHandler = (payload: Object) => Promise<void>;

export interface Transport {
    connect(): void;
    disconnect(): void;
    onMessage: (handler: MessageHandler) => void; 
    send(payload: Object) : Promise<void>;
}

export type EthereumTransaction = {
    family: "ethereum",
    amount?: string,
    recipient: string,
    data?: string,
    gasPrice?: string,
    gasLimit?: string,
}

export type SignedTransaction = {

}

export type Transaction = {

}

export type RawAccount = {
    id: string,
    name: string,
    address: string,
    currency: string,
    balance: string,
}

export type Account = {
    id: string,
    name: string,
    address: string,
    currency: string,
    balance: BigNumber,
}

export type Currency = {
    id: string,
}

export type RequestAccountParams = {
    currencies?: string[],
    allowAddAccount?: boolean,
}

import BigNumber from "bignumber.js";

export type Account = {
    id: string,
    name: string,
    address: string,
    currency: string,
    balance: BigNumber,
    spendableBalance: BigNumber,
    blockHeight: number,
    lastSyncDate: Date,
};

export type Unit = {
    name: string,
    code: string,
    magnitude: number,
};

export type Currency = {
    type: string,
    color: string,
    ticker: string,
    id: string,
    name: string,
    family: string,
    units: Unit[],
};

export interface TransactionCommon {
    amount: BigNumber;
    recipient: string;
}

export interface EthereumTransaction extends TransactionCommon {
    family: "ethereum";
    nonce?: number;
    data?: Buffer;
    gasPrice?: BigNumber;
    gasLimit?: BigNumber;
}

export interface BitcoinTransaction extends TransactionCommon {
    family: "bitcoin";
    feePerByte?: BigNumber;
}

export type Transaction =
    | EthereumTransaction
    | BitcoinTransaction;


// TODO: remove this from the LL api
export type Operation = Object;

export type SignedTransaction = {
    operation: Operation,
    signature: string,
    signatureRaw?: Object,
    expirationDate: Date | null,
}
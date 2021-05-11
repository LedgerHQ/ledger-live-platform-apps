export type RawAccount = {
    id: string,
    name: string,
    address: string,
    currency: string,
    balance: string,
    spendableBalance: string,
    blockHeight: number,
    lastSyncDate: string,
};

export interface RawTransactionCommon {
    family: string,
    amount: string;
    recipient: string;
}

export interface RawEthereumTransaction
    extends RawTransactionCommon {
    family: "ethereum";
    nonce?: number;
    data?: string;
    gasPrice?: string;
    gasLimit?: string;
}

export interface RawBitcoinTransaction
    extends RawTransactionCommon {
    family: "bitcoin";
    feePerByte?: string;
}

export type RawTransaction =
    | RawEthereumTransaction
    | RawBitcoinTransaction;

export type RawSignedTransaction = {
    operation: Object,
    signature: string,
    signatureRaw?: Object,
    expirationDate: string | null,
}
import { BigNumber } from "bignumber.js";

import {
    RawAccount,
    RawTransaction,
    RawEthereumTransaction,
    RawBitcoinTransaction,
    RawSignedTransaction,
} from "./rawTypes";
import {
    Account,
    Transaction,
    EthereumTransaction,
    BitcoinTransaction,
    SignedTransaction,
} from "./types";

export function serializeAccount(
    account: Account
): RawAccount {
    return {
        id: account.id,
        name: account.name,
        address: account.address,
        currency: account.currency,
        balance: account.balance.toString(),
        spendableBalance: account.spendableBalance.toString(),
        blockHeight: account.blockHeight,
        lastSyncDate: account.lastSyncDate.toString(),
    };
}

export function deserializeAccount(
    rawAccount: RawAccount
): Account {
    return {
        id: rawAccount.id,
        name: rawAccount.name,
        address: rawAccount.address,
        currency: rawAccount.currency,
        balance: new BigNumber(rawAccount.balance),
        spendableBalance: new BigNumber(rawAccount.spendableBalance),
        blockHeight: rawAccount.blockHeight,
        lastSyncDate: new Date(rawAccount.lastSyncDate),
    };
}

export function serializeEthereumTransaction(
    transaction: EthereumTransaction
): RawEthereumTransaction {
    return {
        family: transaction.family,
        amount: transaction.amount.toString(),
        recipient: transaction.recipient,
        nonce: transaction.nonce,
        data: transaction.data ? transaction.data.toString("hex") : undefined,
        gasPrice: transaction.gasPrice
            ? transaction.gasPrice.toString()
            : undefined,
        gasLimit: transaction.gasLimit
            ? transaction.gasLimit.toString()
            : undefined,
    };
}

export function deserializeEthereumTransaction(
    rawTransaction: RawEthereumTransaction
): EthereumTransaction {
    return {
        family: rawTransaction.family,
        amount: new BigNumber(rawTransaction.amount),
        recipient: rawTransaction.recipient,
        nonce: rawTransaction.nonce,
        data: rawTransaction.data ? Buffer.from(rawTransaction.data, "hex") : undefined,
        gasPrice: rawTransaction.gasPrice
            ? new BigNumber(rawTransaction.gasPrice)
            : undefined,
        gasLimit: rawTransaction.gasLimit
            ? new BigNumber(rawTransaction.gasLimit)
            : undefined,
    };
}

export function serializeBitcoinTransaction(
    transaction: BitcoinTransaction
): RawBitcoinTransaction {
    return {
        family: transaction.family,
        amount: transaction.amount.toString(),
        recipient: transaction.recipient,
        feePerByte: transaction.feePerByte ? transaction.feePerByte.toString() : undefined,
    };
}

export function deserializeBitcoinTransaction(
    rawTransaction: RawBitcoinTransaction
): BitcoinTransaction {
    return {
        family: rawTransaction.family,
        amount: new BigNumber(rawTransaction.amount),
        recipient: rawTransaction.recipient,
        feePerByte: rawTransaction.feePerByte
            ? new BigNumber(rawTransaction.feePerByte)
            : undefined,
    };
}

export function serializeTransaction(
    transaction: Transaction
): RawTransaction {
    switch (transaction.family) {
        case "ethereum":
            return serializeEthereumTransaction(transaction);
        case "bitcoin":
            return serializeBitcoinTransaction(transaction);
        default:
            throw new Error(`Can't serialize transaction: family not supported`);
    }
}

export function deserializeTransaction(
    rawTransaction: RawTransaction
): Transaction {
    switch (rawTransaction.family) {
        case "ethereum":
            return deserializeEthereumTransaction(rawTransaction);
        case "bitcoin":
            return deserializeBitcoinTransaction(rawTransaction);
        default:
            throw new Error(
                `Can't deserialize transaction: family not supported`
            );
    }
}

export function serializeSignedTransaction(
    signedTansaction: SignedTransaction
): RawSignedTransaction {
    return {
        operation: signedTansaction.operation,
        signature: signedTansaction.signature,
        expirationDate: signedTansaction.expirationDate ? signedTansaction.expirationDate.toString() : null,
        signatureRaw: signedTansaction.signatureRaw,
    }
}

export function deserializeSignedTransaction(
    rawSignedTransaction: RawSignedTransaction
): SignedTransaction {
    return {
        operation: rawSignedTransaction.operation || {},
        signature: rawSignedTransaction.signature,
        expirationDate: rawSignedTransaction.expirationDate ? new Date(rawSignedTransaction.expirationDate) : null,
        signatureRaw: rawSignedTransaction.signatureRaw,
    }
}

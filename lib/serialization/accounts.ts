import {RawAccount,Account} from "../LedgerLiveApiSdk.types";
import BigNumber from "bignumber.js";

export function deserializeAccount(rawAccount: RawAccount): Account {
    return ({
        name: rawAccount.name,
        id: rawAccount.id,
        address: rawAccount.address,
        balance: new BigNumber(rawAccount.balance),
        currency: rawAccount.currency,
    })
}

export function serializeAccount(account: Account): RawAccount {
    return ({
        name: account.name,
        id: account.id,
        address: account.address,
        balance: account.balance.toString(),
        currency: account.currency,
    })
}
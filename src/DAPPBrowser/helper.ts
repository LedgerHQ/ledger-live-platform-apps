import {EthereumTransaction} from "../../lib/LedgerLiveApiSdk.types";
import BN from "bn.js";

export function convertEthToLiveTX(ethTX: any): EthereumTransaction {
    return {
        family: "ethereum",
        amount: new BN(ethTX.value, 16).toString(10),
        recipient: ethTX.to,
        gasPrice: ethTX.gasPrice ? new BN(ethTX.gasPrice, 16).toString(10) : undefined,
        gasLimit: ethTX.gas ? new BN(ethTX.gas, 16).toString(10) : undefined,
        data: ethTX.data,
    }
}
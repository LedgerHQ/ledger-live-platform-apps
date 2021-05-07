import {EthereumTransaction} from "../../lib/LedgerLiveApiSdk.types";
import BN from "bn.js";

export function convertEthToLiveTX(ethTX: any): EthereumTransaction {
    return {
        family: "ethereum",
        amount: ethTX.amount !== undefined ? new BN(ethTX.value.replace("0x", ""), 16).toString(10) : "0",
        recipient: ethTX.to,
        gasPrice: ethTX.gasPrice !== undefined ? new BN(ethTX.gasPrice.replace("0x", ""), 16).toString(10) : undefined,
        gasLimit: ethTX.gas !== undefined ? new BN(ethTX.gas.replace("0x", ""), 16).toString(10) : undefined,
        data: ethTX.data,
    }
}
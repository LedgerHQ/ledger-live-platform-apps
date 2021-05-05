import {EthereumTransaction} from "../../lib/LedgerLiveApiSdk.types";
import BN from "bn.js";

export function convertEthToLiveTX(ethTX: any): EthereumTransaction {
    return {
        family: "ethereum",
        amount: ethTX.amount ? new BN(ethTX.value.replace("0x", ""), 16).toString(10) : undefined,
        recipient: ethTX.to,
        gasPrice: ethTX.gasPrice ? new BN(ethTX.gasPrice.replace("0x", ""), 16).toString(10) : undefined,
        gasLimit: ethTX.gas ? new BN(ethTX.gas.replace("0x", ""), 16).toString(10) : undefined,
        data: ethTX.data,
    }
}
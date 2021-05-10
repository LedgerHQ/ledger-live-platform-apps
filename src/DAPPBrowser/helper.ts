import {EthereumTransaction} from "../../lib/types";
import { BigNumber } from "bignumber.js";

export function convertEthToLiveTX(ethTX: any): EthereumTransaction {
    return {
        family: "ethereum",
        amount: ethTX.value !== undefined ? new BigNumber(ethTX.value.replace("0x", ""), 16) : new BigNumber(0),
        recipient: ethTX.to,
        gasPrice: ethTX.gasPrice !== undefined ? new BigNumber(ethTX.gasPrice.replace("0x", ""), 16) : undefined,
        gasLimit: ethTX.gas !== undefined ? new BigNumber(ethTX.gas.replace("0x", ""), 16) : undefined,
        data: ethTX.data,
    }
}
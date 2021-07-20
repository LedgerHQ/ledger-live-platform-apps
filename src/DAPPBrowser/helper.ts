import { BigNumber } from "bignumber.js";
import eip55 from "eip55";

import type { EthereumTransaction } from "ledger-live-platform-sdk";
import { FAMILIES } from "ledger-live-platform-sdk";

export function convertEthToLiveTX(ethTX: any): EthereumTransaction {
  return {
    family: FAMILIES.ETHEREUM,
    amount:
      ethTX.value !== undefined
        ? new BigNumber(ethTX.value.replace("0x", ""), 16)
        : new BigNumber(0),
    recipient: eip55.encode(ethTX.to),
    gasPrice:
      ethTX.gasPrice !== undefined
        ? new BigNumber(ethTX.gasPrice.replace("0x", ""), 16)
        : undefined,
    gasLimit:
      ethTX.gas !== undefined
        ? new BigNumber(ethTX.gas.replace("0x", ""), 16)
        : undefined,
    data: ethTX.data
      ? Buffer.from(ethTX.data.replace("0x", ""), "hex")
      : undefined,
  };
}

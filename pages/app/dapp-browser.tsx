import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { DAPPBrowser } from "../../src/DAPPBrowser";
import { ChainConfig } from "../../src/DAPPBrowser/types";
import { getQueryVariable } from "../../src/helpers";

const NODE_URL =
  "wss://eth-mainnet.ws.alchemyapi.io/v2/0fyudoTG94QWC0tEtfJViM9v2ZXJuij2";

function DappBrowserPage() {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  const dappName = getQueryVariable("dappName", router) || "DApp";
  const theme = getQueryVariable("theme", router);
  const dappUrl = getQueryVariable("url", router);
  const nanoApp = getQueryVariable("nanoApp", router);
  const nodeURL = getQueryVariable("nodeURL", router) || NODE_URL;
  const isMock = getQueryVariable("mock", router) === "true";
  const initialAccountId = getQueryVariable("accountId", router);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const chainConfigs: ChainConfig[] = useMemo(
    () => [
      { name: "Ethereum", currency: "ethereum", chainID: 1, nodeURL },
      {
        name: "Binance Smart Chain",
        currency: "bsc",
        chainID: 56,
        nodeURL: "wss://bsc-ws-node.nariox.org:443",
      },
    ],
    [nodeURL]
  );

  if (mounted) {
    return dappUrl ? (
      <DAPPBrowser
        dappName={dappName}
        dappUrl={dappUrl}
        nanoApp={nanoApp}
        theme={theme}
        chainConfigs={chainConfigs}
        mock={isMock}
        initialAccountId={initialAccountId}
      />
    ) : null;
  }
  return null;
}

export default DappBrowserPage;

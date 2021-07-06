import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from 'next/router';
import { DAPPBrowser } from "../../src/DAPPBrowser";
import { ChainConfig} from "../../src/DAPPBrowser/types";
import { getQueryVariable } from "../../src/helpers";

const NODE_URL = "wss://eth-mainnet.ws.alchemyapi.io/v2/0fyudoTG94QWC0tEtfJViM9v2ZXJuij2";

function DappBrowserPage() {
    const [mounted, setMounted] = useState(false);
    const router = useRouter();

    const dappName = getQueryVariable("dappName", router) || "DApp";
    const dappUrl = getQueryVariable("url", router);
    const nanoApp = getQueryVariable("nanoApp", router);
    const nodeURL = getQueryVariable("nodeURL", router) || NODE_URL;
    const isMock = getQueryVariable("mock", router)  === "true";
    const initialAccountId = getQueryVariable("accountId", router);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    const chainConfigs: ChainConfig[] = useMemo(() => ([
        { name: "Ethereum", currency: "ethereum", chainID: 1, nodeURL  },
        { name: "Ropsten", currency: "ethereum", chainID: 3, nodeURL: "wss://ropsten.infura.io/ws/v3/a1664f14bbf54437acd24a79a600e3cc" },
        { name: "Polygon", currency: "ethereum", chainID: 137, nodeURL: "wss://rpc-mainnet.maticvigil.com/ws" },
    ]), [nodeURL])

    if (mounted) {
        return (
            !!dappUrl ? (
                <DAPPBrowser
                    dappName={dappName}
                    dappUrl={dappUrl}
                    nanoApp={nanoApp}
                    chainConfigs={chainConfigs}
                    mock={isMock}
                    initialAccountId={initialAccountId}
                />
            ) : null
        );
    }
    return null;
}

export default DappBrowserPage;

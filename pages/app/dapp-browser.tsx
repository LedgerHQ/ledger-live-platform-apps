import React, { useEffect, useState } from "react";
import {NextRouter, useRouter} from 'next/router';
import {DAPPBrowser} from "../../src/DAPPBrowser";

const NODE_URL = "wss://eth-mainnet.ws.alchemyapi.io/v2/0fyudoTG94QWC0tEtfJViM9v2ZXJuij2";

function getQueryVariable(name: string,router: NextRouter): string | undefined {
    const queryVariable = router.query[name];
    if (queryVariable) {
        return !Array.isArray(queryVariable) ? queryVariable : queryVariable[0]
    }
    return undefined;
}

function DappBrowserPage() {
    const [mounted, setMounted] = useState(false);
    const router = useRouter();

    const dappName = getQueryVariable("dappName", router) || "unknown";
    const dappUrl = getQueryVariable("url", router);
    const nanoApp = getQueryVariable("nanoApp", router);
    const nodeURL = getQueryVariable("nodeURL", router) || NODE_URL;
    const isMock = getQueryVariable("mock", router)  === "true";
    const initialAccountId = getQueryVariable("accountId", router);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    if (mounted) {
        return (
            !!dappUrl ? (
                <DAPPBrowser
                    dappName={dappName}
                    dappUrl={dappUrl}
                    nanoApp={nanoApp}
                    nodeUrl={nodeURL}
                    mock={isMock}
                    initialAccountId={initialAccountId}
                />
            ) : null
        );
    }
    return null;
}

export default DappBrowserPage;

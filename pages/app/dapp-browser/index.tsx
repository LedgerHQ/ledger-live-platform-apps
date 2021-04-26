import React, { useEffect, useState } from "react";
import {useRouter} from 'next/router';
import {DAPPBrowser} from "./DAPPBrowser";

const PROJECT_ID = "a1664f14bbf54437acd24a79a600e3cc"
const nodeUrl = `wss://mainnet.infura.io/ws/v3/${PROJECT_ID}`

function DappBrowserPage() {
    const [mounted, setMounted] = useState(false);
    const router = useRouter();

    const { url } = router.query;

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    if (mounted) {
        return (
            !!url ? (
                <DAPPBrowser
                    dappName="paraswap"
                    dappUrl={String(url)}
                    pluginName="paraswap"
                    nodeUrl={nodeUrl}
                />
            ) : null
        );
    }
    return null;
}

export default DappBrowserPage;

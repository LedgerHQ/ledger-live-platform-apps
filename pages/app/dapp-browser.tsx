import React, { useEffect, useState } from "react";
import {useRouter} from 'next/router';
import {DAPPBrowser} from "../../src/DAPPBrowser";

const PROJECT_ID = "dd8953fc6841422dade12653678eadd3"
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

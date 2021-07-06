import React, { useEffect, useState } from "react";
import { useRouter } from 'next/router';
import { getQueryVariable, getQueryArray } from "../../src/helpers";
import { WebBrowser } from "../../src/WebBrowser";

function WebBrowserPage() {
    const [mounted, setMounted] = useState(false);
    const router = useRouter();

    const webAppName = getQueryVariable("webAppName", router) || "DApp";
    const webUrl = getQueryVariable("url", router);
    const isMock = getQueryVariable("mock", router)  === "true";
    const currencies = getQueryArray("currencies", router) || [];
    const initialAccountId = getQueryVariable("accountId", router);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    if (mounted) {
        return (
            !!webUrl ? (
                <WebBrowser
                    webAppName={webAppName}
                    webUrl={webUrl}
                    currencies={currencies}
                    mock={isMock}
                    initialAccountId={initialAccountId}
                />
            ) : null
        );
    }
    return null;
}

export default WebBrowserPage;

import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import { useRouter } from 'next/router'

const AppLoaderPageContainer = styled.div`
  
`;

const DappIframe = styled.iframe`
    width: 100%;
    height: 600px;
`

const PROJECT_ID = "a1664f14bbf54437acd24a79a600e3cc"

const DappBrowser = () => {
    const router = useRouter()
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const [mounted, setMounted] = useState(false);

    const { url } = router.query
    console.log({ url })

    useEffect(() => {
        if (!url) {
            return;
        }

        const dappURL = new URL(String(url));
        const ws = new WebSocket(`wss://ropsten.infura.io/ws/v3/${PROJECT_ID}`);

        if (iframeRef.current) {
            iframeRef.current.src = dappURL.toString();
        }

        ws.onopen = () => {
            console.log("connected to Infura node")
        }

        ws.onmessage = (message) => {
            const rpcJson = JSON.parse(message.data);
            console.log("from infura: ", rpcJson);
            if (iframeRef.current && iframeRef.current.contentWindow) {
                iframeRef.current.contentWindow.postMessage(rpcJson, dappURL.origin);
            }
        }


        window.addEventListener("message", function(event) {
            if (event.origin === dappURL.origin && event.source && event.source instanceof Window) {
                const data = event.data;
                console.log("from dapp: ", data)
                switch (data.method) {
                    case "eth_requestAccounts": {
                        event.source.postMessage({
                            "id": data.id,
                            "jsonrpc": "2.0",
                            "result": ["0x407d73d8a49eeb85d32cf465507dd71d507100c1"]
                        }, event.origin);
                        break;
                    }
                    case "eth_accounts": {
                        event.source.postMessage({
                            "id": data.id,
                            "jsonrpc": "2.0",
                            "result": ["0x407d73d8a49eeb85d32cf465507dd71d507100c1"]
                        }, event.origin);
                        break;
                    }
                    case "eth_sendTransaction": {
                        const txData = data.params[0];

                        console.log("TX REQUEST: ", txData);
                        event.source.postMessage({
                            "id": data.id,
                            "jsonrpc": "2.0",
                            "result": "0xcff6d91d1693abe876c25ba03a58bc6ca693078b3a90e836f656e0dddb08a4cd"
                        }, event.origin);
                        break;
                    }
                    default: {
                        ws.send(JSON.stringify(data));
                    }
                }
            }
        })
        setMounted(true)
    }, [url])

    if (!mounted) {
        return null;
    }

    return (
        <AppLoaderPageContainer>
            <DappIframe ref={iframeRef} />
        </AppLoaderPageContainer>
    );
};

export default DappBrowser;

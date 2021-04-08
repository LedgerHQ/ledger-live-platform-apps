import React, {useState, useEffect, useRef, useCallback, useMemo} from "react";
import styled from "styled-components";
import { useRouter } from 'next/router';
import Select from 'react-select'

const AppLoaderPageContainer = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const DappBrowserTopBar = styled.div`
  box-sizing: border-box;
  background-color: black;
  color: white;
  padding: 8px 16px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const DappIframe = styled.iframe`
    width: 100%;
    flex: 1;
    border: 0;
`

const PROJECT_ID = "a1664f14bbf54437acd24a79a600e3cc"

const options = [
    { value: '0x407d73d8a49eeb85d32cf465507dd71d507100c1', label: 'Account 1 (0x407d73d8a49eeb85d32cf465507dd71d507100c1)' },
    { value: '0xcad38ab8336682b6e084ade61c546183c5ef7582', label: 'Savings Account (0xcad38ab8336682b6e084ade61c546183c5ef7582)' },
    { value: '0x6bf346da89e93ade5be864b483182eb4190246c4', label: 'Account 3 (0x6bf346da89e93ade5be864b483182eb4190246c4)' }
];

const styles = {
    control: (provided: any) => ({
        ...provided,
        width: 400,
        backgroundColor: "black",
    }),
    singleValue: (provided: any) => ({
        ...provided,
        color: "white",
        fontSize: 12
    }),
    indicatorsContainer: (provided: any) => ({
        ...provided,
        color: "white",
    }),
    menu: (provided: any) => ({
        ...provided,
        backgroundColor: "black",
    }),
    option: (provided: any) => ({
        ...provided,
        fontSize: 12,
        backgroundColor: "rgba(0, 0, 0, 0.1)"
    })
}

const DappBrowser = ({ url }: { url: string }) => {
    const iframeRef = useRef<HTMLIFrameElement | null>(null);
    const [option, setOption] = useState(options[0]);
    const dappURL = useMemo(() => new URL(url), [url]);

    const handleAccountChange = useCallback(value => {
        if (iframeRef.current && iframeRef.current.contentWindow) {
            console.log("sending new account to dapp")
            iframeRef.current.contentWindow.postMessage({
                "jsonrpc": "2.0",
                "method": "accountsChanged",
                "params": [
                    [value.value]
                ]
            }, dappURL.origin);
        }

        setOption(value);
    }, [setOption])

    useEffect(() => {
        if (iframeRef.current) {
            iframeRef.current.src = dappURL.toString();
        }

        const ws = new WebSocket(`wss://ropsten.infura.io/ws/v3/${PROJECT_ID}`);
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

        window.addEventListener("message", function(event: MessageEvent) {
            if (event.origin === dappURL.origin && event.source && !(event.source instanceof MessagePort) && !(event.source instanceof ServiceWorker)) {
                const data = event.data;
                console.log("from dapp: ", data)
                switch (data.method) {
                    case "eth_requestAccounts": {
                        event.source.postMessage({
                            "id": data.id,
                            "jsonrpc": "2.0",
                            "result": [option.value]
                        }, event.origin);
                        break;
                    }
                    case "eth_accounts": {
                        event.source.postMessage({
                            "id": data.id,
                            "jsonrpc": "2.0",
                            "result": [option.value]
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
        });
    }, [url])

    console.log(option)
    return (
        <AppLoaderPageContainer>
            <DappBrowserTopBar>
                Ledger DAPP Browser test tool
                <Select
                    options={options}
                    styles={styles}
                    onChange={handleAccountChange}
                    value={option}
                />
            </DappBrowserTopBar>
            <DappIframe ref={iframeRef} />
        </AppLoaderPageContainer>
    );
};

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
            !!url ? <DappBrowser url={String(url)} /> : null
        )
    }
    return null;
}

export default DappBrowserPage;

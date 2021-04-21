import React, {useCallback, useEffect, useRef, useState} from "react";
import styled from "styled-components";
import { JSONRPCServerAndClient, JSONRPCClient, JSONRPCServer } from "json-rpc-2.0";

const AppLoaderPageContainer = styled.div`
  
`;

function DebugApp() {
    const clientRef = useRef<JSONRPCServerAndClient | null>(null);

    useEffect(() => {
        clientRef.current = new JSONRPCServerAndClient(
            new JSONRPCServer(),
            new JSONRPCClient((request) => {
                try {
                    window.postMessage(JSON.stringify(request), "*")
                    return Promise.resolve();
                } catch (error) {
                    return Promise.reject(error);
                }
            })
        );

        const receiveMessage = (event: MessageEvent) => {
            if (event.origin !== window.location.origin) {
                console.log("event: ", event);
                const serverAndClient = clientRef.current;
                if (serverAndClient && event.data && typeof event.data === "string") {
                    void serverAndClient.receiveAndSend(JSON.parse(event.data.toString()));
                }
            }
        }

        window.addEventListener("message", receiveMessage, false);

    }, []);

    const getAccount = useCallback(async () => {
        const serverAndClient = clientRef.current;
        if (serverAndClient) {
            const answer = await serverAndClient.request("account.list");
            console.log("answer: ", answer)
        }
    }, []);

    return (
        <AppLoaderPageContainer>
            <button onClick={getAccount}>
                getAccount
            </button>
        </AppLoaderPageContainer>
    );
}

const AppLoaderPage = () => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    if (mounted) {
        return (
            <DebugApp/>
        );
    }

    return null;
};

export default AppLoaderPage;

import React from "react";
import styled, { keyframes } from "styled-components";
import {AccountSelector} from "./AccountSelector";
import {AccountRequest} from "./AccountRequest";
import LedgerLiveApi from '../../lib/LedgerLiveApiSdk';
import LedgerLiveApiMock from '../../lib/LedgerLiveApiSdkMock';
import WindowMessageTransport from '../../lib/WindowMessageTransport';

import {SmartWebsocket} from "./SmartWebsocket";
import CSSTransition from "react-transition-group/CSSTransition";
import {convertEthToLiveTX} from "./helper";
import {JSONRPCRequest, JSONRPCResponse} from "json-rpc-2.0";
import {Account} from "../../lib/types";

const loading = keyframes`
  0% { opacity:0.8; }
  50% { opacity:0.4; }
  100% { opacity:0.8; }
`;

const AppLoaderPageContainer = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const Loader = styled.div`
  animation: ${loading} 1s ease-in-out infinite;
`

const Overlay = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: black;
  display: flex;
  align-items: center;
  justify-content: center;
  user-select: none;
  
  &.overlay-enter {
    opacity: 1;
  }
  &.overlay-enter-active {
    opacity: 0;
    transition: opacity 300ms;
  }
  &.overlay-enter-done {
    display: none;
    opacity: 0;
  }
  &.overlay-exit {
    opacity: 0;
  }
  &.overlay-exit-active {
    opacity: 1;
    transition: opacity 200ms;
  }
  &.overlay-exit-done {
    opacity: 1;
  }
`

const DappBrowserControlBar = styled.div`
  box-sizing: border-box;
  background-color: black;
  color: white;
  padding: 8px 16px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  order: 2;

  @media only screen and (min-width: 600px) {
    order: 1;
  }
`;

const DappContainer = styled.div`
  width: 100%;
  flex: 1;
  position: relative;
  order: 1;

  @media only screen and (min-width: 600px) {
    order: 2;
  }
`;

const DappIframe = styled.iframe`
    width: 100%;
    height: 100%;
    border: 0;
`;

const MobileOnly = styled.div`
    @media only screen and (min-width: 600px) {
        display: none;
    }
`
const DesktopOnly = styled.div`
    @media only screen and (max-width: 600px) {
        display: none;
    }
`

type DAPPBrowserProps = {
    dappUrl: string,
    dappName: string,
    pluginName: string,
    nodeUrl: string,
    mock?: boolean,
}

type DAPPBrowserState = {
    accounts: Account[],
    selectedAccount: Account | undefined,
    clientLoaded: boolean,
    fetchingAccounts: boolean,
    connected: boolean,
}

const initialState = {
    accounts: [],
    selectedAccount: undefined,
    clientLoaded: false,
    fetchingAccounts: false,
    connected: false,
}

export class DAPPBrowser extends React.Component<DAPPBrowserProps, DAPPBrowserState> {
    ledgerAPI: LedgerLiveApi | LedgerLiveApiMock;
    websocket: SmartWebsocket;
    iframeRef = React.createRef<HTMLIFrameElement>();


    constructor(props: DAPPBrowserProps) {
        super(props);
        this.state = initialState;

        this.receiveDAPPMessage = this.receiveDAPPMessage.bind(this);
        this.setClientLoaded = this.setClientLoaded.bind(this);
        this.selectAccount = this.selectAccount.bind(this);
        this.requestAccount = this.requestAccount.bind(this);
        this.fetchAccounts = this.fetchAccounts.bind(this);

        this.websocket = new SmartWebsocket(props.nodeUrl);
        this.ledgerAPI = props.mock ? new LedgerLiveApiMock() : new LedgerLiveApi(new WindowMessageTransport())
    }

    private sendMessageToDAPP(message: JSONRPCResponse| JSONRPCRequest) {
        const dappURL = new URL(this.props.dappUrl);

        if (this.iframeRef.current && this.iframeRef.current.contentWindow) {
            this.iframeRef.current.contentWindow.postMessage(message, dappURL.origin);
        }
    }

    private async receiveDAPPMessage(event: MessageEvent) {
        const {
            selectedAccount,
        } = this.state;

        const dappURL = new URL(this.props.dappUrl);

        if (event.origin === dappURL.origin) {
            const data = event.data;

            console.log(`MESSAGE FROM APP ${data.method}`, data);

            switch (data.method) {
                case "eth_requestAccounts": {
                    this.sendMessageToDAPP({
                        "id": data.id,
                        "jsonrpc": "2.0",
                        "result": selectedAccount ? [selectedAccount.address] : []
                    });
                    break;
                }
                case "eth_accounts": {
                    this.sendMessageToDAPP({
                        "id": data.id,
                        "jsonrpc": "2.0",
                        "result": selectedAccount ? [selectedAccount.address] : []
                    });
                    break;
                }
                case "eth_sendTransaction": {
                    const ethTX = data.params[0];
                    const tx = convertEthToLiveTX(ethTX);
                    const fromAccount = this.state.accounts.find(account => account.address.toLowerCase() === ethTX.from.toLowerCase());
                    if (fromAccount) {
                        try {
                            const signedTransaction = await this.ledgerAPI.signTransaction(fromAccount.id, tx);
                            console.log("got signedTransaction from llApi", signedTransaction)
                            const hash = await this.ledgerAPI.broadcastSignedTransaction(fromAccount.id, signedTransaction);
                            this.sendMessageToDAPP({
                                "id": data.id,
                                "jsonrpc": "2.0",
                                "result": hash,
                            });
                        } catch (error) {
                            this.sendMessageToDAPP({
                                "id": data.id,
                                "jsonrpc": "2.0",
                                "error": {
                                    "code": 3,
                                    "message": "Transaction declined",
                                    "data": [{
                                        "code": 104,
                                        "message": "Rejected"
                                    }]
                                }
                            });
                        }
                    }
                    break;
                }
                default: {
                    this.websocket.send(data);
                }
            }
        }
    }

    async fetchAccounts() {
        this.setState({
            fetchingAccounts: true,
        });
        const accounts = await this.ledgerAPI.listAccounts();
        const filteredAccounts = accounts
            .filter((account: any) => account.currency === "ethereum");

        this.setState({
            accounts: filteredAccounts,
            selectedAccount: filteredAccounts.length > 0 ? filteredAccounts[0] : undefined,
            fetchingAccounts: false,
        });
    }

    async requestAccount() {
        try {
            const rawPayload = undefined; // TODO: ?
            const payload = rawPayload ? JSON.parse(rawPayload) : undefined;
            const account = await this.ledgerAPI.requestAccount(payload);
            this.selectAccount(account);
        } catch (error) {
            // TODO: handle error
        }
    }

    componentDidMount() {
        window.addEventListener("message", this.receiveDAPPMessage, false);
        this.websocket.on("message", message => {
            this.sendMessageToDAPP(message);
        });

        this.websocket.connect();
        this.ledgerAPI.connect();
        void this.fetchAccounts();

        this.setState({
            connected: true,
        });
    }

    componentWillUnmount() {
        this.setState({
            connected: false,
        })
        window.removeEventListener("message", this.receiveDAPPMessage, false);
        this.websocket.close();
    }

    selectAccount(account: Account | undefined) {
        if (account) {
            this.sendMessageToDAPP({
                "jsonrpc": "2.0",
                "method": "accountsChanged",
                "params": [
                    [account.address]
                ]
            });
        }

        this.setState({
            selectedAccount: account,
        });
    }

    setClientLoaded() {
        this.setState({
            clientLoaded: true,
        });
    }

    render() {
        const {
            accounts,
            selectedAccount,
            clientLoaded,
            fetchingAccounts,
            connected,
        } = this.state;

        const {
            dappUrl,
        } = this.props;
        
        return (
            <AppLoaderPageContainer>
                <DappBrowserControlBar>
                    <MobileOnly>
                        <AccountRequest
                            selectedAccount={selectedAccount}
                            onRequestAccount={this.requestAccount}
                        />
                    </MobileOnly>
                    <DesktopOnly>
                        Ledger DAPP Browser
                        {
                            accounts.length > 0 ? (
                                <AccountSelector
                                    selectedAccount={selectedAccount}
                                    accounts={accounts}
                                    onAccountChange={this.selectAccount}
                                />
                            ) : null
                        }
                    </DesktopOnly>
                </DappBrowserControlBar>
                <DappContainer>
                    <CSSTransition in={clientLoaded} timeout={300} classNames="overlay">
                        <Overlay>
                            <Loader>
                                {
                                    !connected ? "Connecting ..." : fetchingAccounts ? "Loading accounts ..." : accounts.length === 0 ? "You don't have any accounts" : "Loading DAPP ..."
                                }
                            </Loader>
                        </Overlay>
                    </CSSTransition>
                    {
                        connected && accounts.length > 0 ? (
                            <DappIframe
                                ref={this.iframeRef}
                                src={dappUrl}
                                onLoad={this.setClientLoaded}
                            />
                        ) : null
                    }
                </DappContainer>
            </AppLoaderPageContainer>
        )
    }
}

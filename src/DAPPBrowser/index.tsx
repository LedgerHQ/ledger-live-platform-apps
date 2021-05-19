import React from "react";
import styled, { keyframes } from "styled-components";
import { AccountSelector } from "./AccountSelector";
import { AccountRequest } from "./AccountRequest";
import LedgerLiveApi from '../../lib/LedgerLiveApiSdk';
import LedgerLiveApiMock from '../../lib/LedgerLiveApiSdkMock';
import WindowMessageTransport from '../../lib/WindowMessageTransport';

import {SmartWebsocket} from "./SmartWebsocket";
import CSSTransition from "react-transition-group/CSSTransition";
import {convertEthToLiveTX} from "./helper";
import {JSONRPCRequest, JSONRPCResponse} from "json-rpc-2.0";
import {Account} from "../../lib/types";
import {ChainConfig} from "./types";
// import {ChainSelector} from "./ChainSelector";

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
  padding: 12px 16px;
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
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;

    @media only screen and (min-width: 600px) {
        display: none;
    }
`
const DesktopOnly = styled.div`
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;

    @media only screen and (max-width: 600px) {
        display: none;
    }
`

type DAPPBrowserProps = {
    dappUrl: string,
    dappName: string,
    nanoApp?: string,
    mock?: boolean,
    initialAccountId: string | undefined,
    chainConfigs: ChainConfig[],
}

type DAPPBrowserState = {
    accounts: Account[],
    selectedAccount: Account | undefined,
    selectedChainConfig: ChainConfig | undefined,
    clientLoaded: boolean,
    fetchingAccounts: boolean,
    connected: boolean,
}

const getInitialState = (props: DAPPBrowserProps): DAPPBrowserState => {
    if (props.chainConfigs.length === 0) {
        throw new Error("No chain configs provided");
    }

    return {
        accounts: [],
        selectedAccount: undefined,
        selectedChainConfig: props.chainConfigs[0],
        clientLoaded: false,
        fetchingAccounts: false,
        connected: false,
    }
}

export class DAPPBrowser extends React.Component<DAPPBrowserProps, DAPPBrowserState> {
    ledgerAPI: LedgerLiveApi | LedgerLiveApiMock;
    websocket: SmartWebsocket | undefined;
    iframeRef = React.createRef<HTMLIFrameElement>();


    constructor(props: DAPPBrowserProps) {
        super(props);
        this.state = getInitialState(props);

        this.receiveDAPPMessage = this.receiveDAPPMessage.bind(this);
        this.setClientLoaded = this.setClientLoaded.bind(this);
        this.selectAccount = this.selectAccount.bind(this);
        this.requestAccount = this.requestAccount.bind(this);
        this.fetchAccounts = this.fetchAccounts.bind(this);
        this.selectChainConfig = this.selectChainConfig.bind(this);
        this.initChainConfig = this.initChainConfig.bind(this);

        this.ledgerAPI = props.mock ? new LedgerLiveApiMock() : new LedgerLiveApi(new WindowMessageTransport());
    }

    private sendMessageToDAPP(message: JSONRPCResponse| JSONRPCRequest) {
        const dappURL = new URL(this.props.dappUrl);

        if (this.iframeRef.current && this.iframeRef.current.contentWindow) {
            console.log("sending answer to app: ", message);
            this.iframeRef.current.contentWindow.postMessage(message, dappURL.origin);
        }
    }

    private async receiveDAPPMessage(event: MessageEvent) {
        const {
            selectedAccount,
            selectedChainConfig,
        } = this.state;

        if (!selectedChainConfig) {
            throw new Error("No chain config selected");
        }

        const dappURL = new URL(this.props.dappUrl);

        if (event.origin === dappURL.origin) {
            const data = event.data;

            console.log(`MESSAGE FROM APP ${data.method}`, data);

            switch (data.method) {
                case "eth_chainId": {
                    this.sendMessageToDAPP({
                        "id": data.id,
                        "jsonrpc": "2.0",
                        "result": `0x${selectedChainConfig.chainID.toString(16)}`
                    });
                    break;
                }
                case "eth_requestAccounts": {
                    this.sendMessageToDAPP({
                        "id": data.id,
                        "jsonrpc": "2.0",
                        "result": selectedAccount ? [selectedAccount.address] : [],
                    });
                    break;
                }
                case "enable": {
                    this.sendMessageToDAPP({
                        "id": data.id,
                        "jsonrpc": "2.0",
                        "result": selectedAccount ? [selectedAccount.address] : [],
                    });
                    break;
                }
                case "eth_accounts": {
                    this.sendMessageToDAPP({
                        "id": data.id,
                        "jsonrpc": "2.0",
                        "result": selectedAccount ? [selectedAccount.address] : [],
                    });
                    break;
                }
                case "eth_sendTransaction": {
                    const ethTX = data.params[0];
                    const tx = convertEthToLiveTX(ethTX);
                    console.log("CONVERTED TX: ", tx)
                    const fromAccount = this.state.accounts.find(account => account.address.toLowerCase() === ethTX.from.toLowerCase());
                    if (fromAccount) {
                        try {
                            const signedTransaction = await this.ledgerAPI.signTransaction(fromAccount.id, tx, { useApp: this.props.nanoApp });
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
                    if (this.websocket) {
                        this.websocket.send(data);
                    }
                }
            }
        }
    }

    async fetchAccounts() {
        const { selectedChainConfig } = this.state;

        if (!selectedChainConfig) {
            throw new Error("No chain config selected");
        }

        this.setState({
            fetchingAccounts: true,
        });
        const accounts = await this.ledgerAPI.listAccounts();
        const filteredAccounts = accounts
            .filter((account: Account) => account.currency === selectedChainConfig.currency);

        const initialAccount = this.props.initialAccountId ? accounts.find(account => account.id === this.props.initialAccountId) : undefined;
        const storedAccountId: string | null = typeof window !== "undefined" ? localStorage.getItem("accountId") : null;
        const storedAccount = storedAccountId !== null ? accounts.find(account => account.id === storedAccountId) : undefined;

        const selectedAccount = filteredAccounts.length > 0 ? (
            initialAccount || storedAccount || filteredAccounts[0]
        ) : undefined

        this.setState({
            accounts: filteredAccounts,
            fetchingAccounts: false,
            selectedAccount,
        });
    }

    async requestAccount() {
        const { selectedChainConfig } = this.state;

        if (!selectedChainConfig) {
            throw new Error("No chain config selected");
        }

        try {
            const payload = {
                currencies: [selectedChainConfig.currency]
            };
            const account = await this.ledgerAPI.requestAccount(payload);
            this.selectAccount(account);
        } catch (error) {
            // TODO: handle error
        }
    }

    async initChainConfig(chainConfig: ChainConfig) {
        if (this.websocket) {
            this.websocket.close();
            delete this.websocket;
        }

        this.websocket = new SmartWebsocket(chainConfig.nodeURL, {
            reconnect: true,
            reconnectMaxAttempts: Infinity,
        });
        this.websocket.on("message", message => {
            this.sendMessageToDAPP(message);
        });

        this.websocket.connect();
        await this.fetchAccounts();
    }

    async componentDidMount() {
        const { selectedChainConfig } = this.state;

        if (!selectedChainConfig) {
            throw new Error("No chain config selected");
        }

        this.ledgerAPI.connect();
        window.addEventListener("message", this.receiveDAPPMessage, false);

        await this.initChainConfig(selectedChainConfig);

        this.setState({
            connected: true,
        });
    }

    componentWillUnmount() {
        this.setState({
            connected: false,
        })
        window.removeEventListener("message", this.receiveDAPPMessage, false);
        if (this.websocket) {
            this.websocket.close();
        }
    }

    selectAccount(account: Account | undefined) {
        const { selectedChainConfig } = this.state;

        if (!selectedChainConfig) {
            throw new Error("No chain config selected");
        }

        if (account) {
            if (typeof window !== "undefined") {
                localStorage.setItem("accountId", account.id);
            }

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

    async selectChainConfig(chainConfig: ChainConfig | undefined) {
        if (chainConfig) {
            console.log("switched to: ", chainConfig)
            await this.initChainConfig(chainConfig);

            if (typeof window !== "undefined") {
                localStorage.setItem("chainId", chainConfig.chainID.toString());
            }

             this.sendMessageToDAPP({
                 "jsonrpc": "2.0",
                 "method": "chainChanged",
                 "params": [
                     [`0x${chainConfig.chainID.toString(16)}`]
                 ]
             });
        }

        this.setState({
            selectedChainConfig: chainConfig,
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
            clientLoaded,
            fetchingAccounts,
            connected,
            selectedAccount,
            // selectedChainConfig,
        } = this.state;

        const {
            dappUrl,
            // chainConfigs,
        } = this.props;

        return (
            <AppLoaderPageContainer>
                <DappBrowserControlBar>
                    {accounts.length > 0 ? 
                        <MobileOnly>
                            <AccountRequest
                                selectedAccount={selectedAccount}
                                onRequestAccount={this.requestAccount}
                            />
                        </MobileOnly>
                    : null}
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
                        {
                            //                             chainConfigs.length > 0 ? (
                            //                                 <ChainSelector
                            //                                     selectedChainConfig={selectedChainConfig}
                            //                                     chainConfigs={chainConfigs}
                            //                                     onChainConfigChange={this.selectChainConfig}
                            //                                 />
                            //                             ) : null
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

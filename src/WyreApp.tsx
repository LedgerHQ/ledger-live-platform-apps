import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import styled, { useTheme } from "styled-components";
import Image from 'next/image'

import LedgerLiveApi from '../lib/LedgerLiveApiSdk';
import WindowMessageTransport from '../lib/WindowMessageTransport';
import { Account, Currency } from "../lib/types";

import Button from './components/Button';

type WyreConfig = {
  env: string,
  accountId?: string,
  transferNotifyUrl?: string,
};

type ThemeProps = {
  colors: {
    [key: string]: string
  }
}

const SUPPORTED_CURRENCIES = ["ethereum", "bitcoin"];

const WYRE_CONFIG: { [key: string]: WyreConfig } = {
  prod: {
    env: "prod",
    accountId: "AC_UU28B4A64QA",
    transferNotifyUrl: "https://hooks.stitchdata.com/v1/clients/167870/token/33763f1bac7da4fe839aadc5462f7b4e41800de30080cf666fe826c0b9a1a649",
  },
  staging: {
    env: "prod",
    accountId: "AC_32F8LN6LYU9", // Real prod environment, but linked to an account for testing purpose
  },
  test: {
    env: "test",
    accountId: "AC_Y2GAHJA6F9G",
  },
}


const Container = styled.div`
  width: 100%;
  height: 100%;
  padding: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
`

const Panel = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 370px;
  align-items: stretch;
  justify-content: center;

  > * {
    margin-bottom: 24px;
  }
  
  > *:last-child {
    margin-bottom: 0;
  }
`
const Logo = styled.div`
  text-align: center;
  width: 48px;
  align-self: center;
`

const SubmitButtom = styled(Button)`
  flex-grow: 1;
`

const Title = styled.h1`
  font-size: 22px;
  margin-top: 0;
`

const List = styled.ul`
  padding: 0;
  margin: 0;
  margin-bottom: 24px;

  li {
    display: inline-block;
    margin-bottom: 8px;
    line-height: 20px;
    color: ${(props: ThemeProps) => props.colors.text};

    span {
      opacity: 0.7;
    }

    &:before {
      content: '•';
      padding-right: 10px;
      color: ${(props:  ThemeProps) => props.colors.primary};
    }
  }
`

function useDeviceToken(): [string | null, Function] {
  const [deviceToken, setDeviceToken] = useState(window.localStorage.getItem("DEVICE_TOKEN"));

  const updateToken = useCallback((token) => {
    window.localStorage.setItem("DEVICE_TOKEN", token);
  
    setDeviceToken(token);
  }, []);

  useEffect(() => {
    if (!deviceToken) {
      let array = new Uint8Array(25);
      window.crypto.getRandomValues(array);
      const token = Array.prototype.map
          .call(array, x => ("00" + x.toString(16)).slice(-2))
          .join("");
      updateToken(token);
    }
  }, [deviceToken]);


  return [deviceToken, updateToken];
}

const getWyre = (env: string, deviceToken: string, account: Account, currencies: Currency[]) => {
  const config = WYRE_CONFIG[env];
  const accountId = config?.accountId;
  const currency = currencies.find(currency => currency.id === account.currency);

  if (!currency) {
    throw new Error('currency not found for account');
  }

  // @ts-ignore
  const wyreInstance = new window.Wyre({
    env: config.env,
    accountId,
    transferNotifyUrl: config.transferNotifyUrl || undefined,
    auth: {
      type: "secretKey",
      secretKey: deviceToken
    },
    operation: {
      type: "onramp",
      destCurrency: currency.ticker,
      dest: `${account.currency}:${account.address.toLowerCase()}`,
    },
  });

  wyreInstance.on('close', (error: Error | {} | null) => {
    // When closing, it returns an empty object.
    if (error !== null && Object.keys(error).length) {
      console.error('error!', error);
    } else {
      console.log('closed!');
    }
  });
  
  wyreInstance.on('complete', () => {
    console.log('complete!');
  });

  return wyreInstance;
}

export function WyreApp() {
  const {colors} = useTheme();
  const api = useRef<LedgerLiveApi | null>(null);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [deviceToken /*, updateToken*/]  = useDeviceToken();
  // next.js gives wrong data sometimes...so...
  const env = useMemo(() => new URLSearchParams(window.location.search).get('env') || "prod", [window.location]);

  const submit = useCallback(async () => {
    if (api.current && deviceToken && currencies.length) {
      try {
        const account = await api.current.requestAccount({ allowAddAccount: true, currencies: SUPPORTED_CURRENCIES });

        const address = await api.current.receive(account.id);
        if (account.address === address) {
          getWyre(env, deviceToken, account, currencies).open();
        }
      } catch (error) {
        // ignore error
      }
    }
  }, [getWyre, env, api.current, deviceToken, currencies]);

  useEffect(() => {
    const llapi = new LedgerLiveApi(new WindowMessageTransport());

    llapi.connect();
    llapi.listCurrencies()
      .then((currencies) => setCurrencies(currencies))
      .then(() => {
        api.current = llapi;
      });

    return () => {
      api.current = null;
      void llapi.disconnect();
    }
  }, []);

  // const handleTokenChange = useCallback((event) => {
  //   updateToken(event.target.value || null);
  // }, [updateToken]);

  return (
  <>
    <Container>
      <Panel>
        <Logo>
            <Image src="/icons/wyre.svg" width={96} height={96} />
        </Logo>
        <Title>Wyre</Title>
        <List colors={colors}>
          <li><span>Buy Bitcoin, Ethereum and more crypto safely</span></li>
          <li><span>Only 🇺🇸 bank account</span></li>
          <li><span>ACH transfer / No credit & debit cards </span></li>
          <li><span>USD support only</span></li>
        </List>
        {/* <input type="text" value={deviceToken || ""} onChange={handleTokenChange} /> */}

        <SubmitButtom onClick={submit}>Select Account</SubmitButtom>
      </Panel>
    </Container>
  </>);
}

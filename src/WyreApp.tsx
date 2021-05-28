import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import styled from "styled-components";
import Image from 'next/image'

import LedgerLiveApi from '../lib/LedgerLiveApiSdk';
import WindowMessageTransport from '../lib/WindowMessageTransport';
import { Account, Currency } from "../lib/types";

import Button from './components/Button';

type WyreConfig = {
  accountId?: string,
};

const SUPPORTED_CURRENCIES = ["ethereum", "bitcoin"];

const WYRE_CONFIG: { [key: string]: WyreConfig } = {
  prod: {
    accountId: "AC_32F8LN6LYU9",
  },
  test: {
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
`

const Panel = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 340px;
  align-items: stretch;
  justify-content: center;

  > * {
    margin-bottom: 8px;
  }
  
  > *:last-child {
    margin-bottom: 0;
  }
`
const Logo = styled.div`
  text-align: center;
  margin-bottom: 32px;
`

const SubmitButtom = styled(Button)`
  flex-grow: 1;
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
    env,
    accountId,
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

  wyreInstance.on('close', (error: Error | null) => {
    if (error !== null) {
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

  useEffect(() => {
    if (api.current && currencies) {
      submit();
    }
  }, [currencies])

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
        {/* <input type="text" value={deviceToken || ""} onChange={handleTokenChange} /> */}

        <SubmitButtom onClick={submit}>Select Account</SubmitButtom>
      </Panel>
    </Container>
  </>);
}

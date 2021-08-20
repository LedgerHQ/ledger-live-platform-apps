import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from "react";
import CSSTransition from "react-transition-group/CSSTransition";
import styled, { useTheme } from "styled-components";
import Image from "next/image";

import LedgerLiveApi from "@ledgerhq/live-app-sdk";
import { WindowMessageTransport } from "@ledgerhq/live-app-sdk";
import type { Account, Currency } from "@ledgerhq/live-app-sdk";

import Button from "./components/Button";
import Loader from "./components/Loader";

type WyreConfig = {
  env: string;
  accountId?: string;
  transferNotifyUrl?: string;
};

type ThemeProps = {
  colors: {
    [key: string]: string;
  };
};

const SUPPORTED_CURRENCIES = ["ethereum", "bitcoin"];

const WYRE_CONFIG: { [key: string]: WyreConfig } = {
  prod: {
    env: "prod",
    accountId: "AC_UU28B4A64QA",
    transferNotifyUrl:
      "https://hooks.stitchdata.com/v1/clients/167870/token/33763f1bac7da4fe839aadc5462f7b4e41800de30080cf666fe826c0b9a1a649",
  },
  staging: {
    env: "prod",
    accountId: "AC_32F8LN6LYU9", // Real prod environment, but linked to an account for testing purpose
  },
  test: {
    env: "test",
    accountId: "AC_Y2GAHJA6F9G",
  },
};

const Container = styled.div`
  width: 100%;
  height: 100%;
  padding: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
`;

const Panel = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 370px;
  align-items: stretch;
  justify-content: center;

  &.panel-blurring {
    &-enter {
      opacity: 1;
      pointer-events: none;
    }
    &-enter-active,
    &-enter-done {
      opacity: 0.1;
      transition: opacity 0.5s ease-out;
    }
    &-exit {
      opacity: 0.1;
    }
    &-exit-active {
      opacity: 1;
      pointer-events: initial;
      transition: opacity 0.3s ease-in;
    }
  }

  > * {
    margin-bottom: 24px;
  }

  > *:last-child {
    margin-bottom: 0;
  }
`;
const Logo = styled.div`
  text-align: center;
  width: 48px;
  align-self: center;
`;

const SubmitButtom = styled(Button)`
  flex-grow: 1;
`;

const Title = styled.h1`
  font-size: 22px;
  margin-top: 0;
`;

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
      content: "•";
      padding-right: 10px;
      color: ${(props: ThemeProps) => props.colors.primary};
    }
  }
`;

const LoaderContainer = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);

  &.loader-container {
    &-enter {
      opacity: 0;
    }
    &-enter-active {
      opacity: 1;
      transition: opacity 0.3s ease-out 0.4s;
    }
    &-exit {
      opacity: 1;
    }
    &-exit-active {
      opacity: 0;
      transition: opacity 0.2s ease-in;
    }
  }
`;

function useDeviceToken(): [string | null, (token: any) => void] {
  const [deviceToken, setDeviceToken] = useState(
    window.localStorage.getItem("DEVICE_TOKEN")
  );

  const updateToken = useCallback((token) => {
    window.localStorage.setItem("DEVICE_TOKEN", token);

    setDeviceToken(token);
  }, []);

  useEffect(() => {
    if (!deviceToken) {
      const array = new Uint8Array(25);
      window.crypto.getRandomValues(array);
      const token = Array.prototype.map
        .call(array, (x) => ("00" + x.toString(16)).slice(-2))
        .join("");
      updateToken(token);
    }
  }, [deviceToken]);

  return [deviceToken, updateToken];
}

const getWyre = (
  env: string,
  deviceToken: string,
  account: Account,
  currencies: Currency[],
  setIsSubmiting: (isSubmiting: boolean) => void
) => {
  const config = WYRE_CONFIG[env];
  const accountId = config?.accountId;
  const currency = currencies.find(
    (currency) => currency.id === account.currency
  );

  if (!currency) {
    throw new Error("currency not found for account");
  }

  // @ts-ignore
  const wyreInstance = new window.Wyre({
    env: config.env,
    accountId,
    transferNotifyUrl: config.transferNotifyUrl || undefined,
    auth: {
      type: "secretKey",
      secretKey: deviceToken,
    },
    operation: {
      type: "onramp",
      destCurrency: currency.ticker,
      dest: `${account.currency}:${account.address.toLowerCase()}`,
    },
  });

  wyreInstance.on("close", (error: Error | Record<string, unknown> | null) => {
    // When closing, it returns an empty object.
    if (error !== null && Object.keys(error).length) {
      console.error("error!", error);
    } else {
      console.log("closed!");
    }
    setIsSubmiting(false);
  });

  wyreInstance.on("complete", () => {
    console.log("complete!");
  });

  wyreInstance.on("ready", () => {
    setIsSubmiting(false);
  });

  return wyreInstance;
};

export function WyreApp() {
  const { colors } = useTheme();
  const api = useRef<LedgerLiveApi | null>(null);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [deviceToken /*, updateToken*/] = useDeviceToken();
  const [isSubmiting, setIsSubmiting] = useState(false);
  // next.js gives wrong data sometimes...so...
  const env = useMemo(
    () => new URLSearchParams(window.location.search).get("env") || "prod",
    [window.location]
  );

  const submit = useCallback(async () => {
    if (api.current && deviceToken && currencies.length) {
      try {
        setIsSubmiting(true);

        const account = await api.current.requestAccount({
          allowAddAccount: true,
          currencies: SUPPORTED_CURRENCIES,
        });
        const address = await api.current.receive(account.id);

        if (account.address === address) {
          getWyre(env, deviceToken, account, currencies, setIsSubmiting).open();
        }
      } catch (error) {
        setIsSubmiting(false);
      }
    }
  }, [getWyre, env, api.current, deviceToken, currencies]);

  useEffect(() => {
    const llapi = new LedgerLiveApi(new WindowMessageTransport());

    llapi.connect();
    llapi
      .listCurrencies()
      .then((currencies) => setCurrencies(currencies))
      .then(() => {
        api.current = llapi;
      });

    return () => {
      api.current = null;
      void llapi.disconnect();
    };
  }, []);

  // const handleTokenChange = useCallback((event) => {
  //   updateToken(event.target.value || null);
  // }, [updateToken]);

  return (
    <>
      <Container>
        <CSSTransition
          in={isSubmiting}
          timeout={{ appear: 0, enter: 700, exit: 300 }}
          unmountOnExit
          classNames="loader-container"
        >
          <LoaderContainer>
            <Loader>Loading</Loader>
          </LoaderContainer>
        </CSSTransition>
        <CSSTransition
          in={isSubmiting}
          timeout={{ appear: 0, enter: 500, exit: 300 }}
          classNames="panel-blurring"
        >
          <Panel>
            <Logo>
              <Image src="/icons/wyre.svg" width={96} height={96} />
            </Logo>
            <Title>Wyre</Title>
            <List colors={colors}>
              <li>
                <span>Buy Bitcoin, Ethereum and more crypto safely</span>
              </li>
              <li>
                <span>Only 🇺🇸 bank account</span>
              </li>
              <li>
                <span>ACH transfer / No credit & debit cards </span>
              </li>
              <li>
                <span>USD support only</span>
              </li>
            </List>
            {/* <input type="text" value={deviceToken || ""} onChange={handleTokenChange} /> */}

            <SubmitButtom onClick={submit}>Select Account</SubmitButtom>
          </Panel>
        </CSSTransition>
      </Container>
    </>
  );
}

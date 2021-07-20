import Select, { components, OptionTypeBase } from "react-select";
import React, { useMemo, useCallback } from "react";
import Image from "next/image";
import styled, { useTheme, DefaultTheme } from "styled-components";
import Color from "color";

import type { Account } from "ledger-live-platform-sdk";

const IconContainer = styled.div`
  margin-right: 0.4em;
  flex-shrink: 0;
`;

const AccountDetails = styled.div`
  display: flex;
  flex-direction: column;
  align-item: flex-start;
  flex-grow: 1;
`;

const AccountName = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: bold;
`;

const AccountAddress = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  opacity: 0.5;
`;

const AccountIcon = () => (
  <IconContainer>
    <Image src="/icons/ethereum.svg" width={24} height={24} />
  </IconContainer>
);

const AccountOption: typeof components.Option = ({
  children,
  data,
  ...rest
}) => (
  <components.Option data={data} {...rest}>
    <AccountIcon />
    <AccountDetails>
      <AccountName>{children}</AccountName>
      <AccountAddress>{data.value}</AccountAddress>
    </AccountDetails>
  </components.Option>
);

const AccountSummary: typeof components.SingleValue = ({
  children,
  ...rest
}) => (
  <components.SingleValue {...rest}>
    <AccountIcon />
    <AccountName>{children}</AccountName>
  </components.SingleValue>
);

const getSelectStyles = (theme: DefaultTheme) => ({
  control: (provided: any) => ({
    ...provided,
    width: 400,
    backgroundColor: "transparent",
  }),
  singleValue: (provided: any) => ({
    ...provided,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    fontSize: 12,
    color: theme.colors.text,
  }),
  indicatorsContainer: (provided: any) => ({
    ...provided,
    color: "red",
  }),
  menu: (provided: any) => ({
    ...provided,
    backgroundColor: theme.colors.background,
  }),
  option: (
    provided: any,
    { isFocused, isSelected }: { isFocused: boolean; isSelected: boolean }
  ) => ({
    ...provided,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    fontSize: 12,
    color: isSelected ? "#fff" : theme.colors.text,
    backgroundColor: isSelected
      ? new Color(theme.colors.primary).alpha(isFocused ? 0.8 : 1).string()
      : isFocused
      ? new Color(theme.colors.primary).alpha(0.1).string()
      : "transparent",
  }),
});

type AccountSelectorProps = {
  accounts: Account[];
  onAccountChange: (account: Account | undefined) => void;
  selectedAccount: Account | undefined;
};

function fromAccountToOption(account: Account): OptionTypeBase {
  return {
    label: account.name,
    value: account.address,
    data: {
      balance: account.balance,
    },
  };
}

function AccountSelector({
  accounts,
  onAccountChange,
  selectedAccount,
}: AccountSelectorProps) {
  const theme = useTheme();
  const options = useMemo(
    () => accounts.map((account) => fromAccountToOption(account)),
    [accounts]
  );
  const value = useMemo(
    () => (selectedAccount ? fromAccountToOption(selectedAccount) : undefined),
    [selectedAccount]
  );

  const styles = useMemo(() => getSelectStyles(theme), [theme]);

  const handleOnChange = useCallback(
    (option: OptionTypeBase | null) => {
      const newSelectedAccount = option
        ? accounts.find((account) => account.address === option.value)
        : undefined;
      onAccountChange(newSelectedAccount);
    },
    [accounts, onAccountChange]
  );

  return (
    <div>
      <Select
        instanceId="account"
        options={options}
        styles={styles}
        components={{ SingleValue: AccountSummary, Option: AccountOption }}
        onChange={handleOnChange}
        value={value}
        isSearchable={false}
      />
    </div>
  );
}

export default AccountSelector;

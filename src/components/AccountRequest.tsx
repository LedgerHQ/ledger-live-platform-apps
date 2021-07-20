import React from "react";
import styled from "styled-components";
import Image from "next/image";

import type { Account } from "ledger-live-platform-sdk";
import Button from "../components/Button";

const Row = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const AccountDisplay = styled.div`
  overflow: hidden;
  text-overflow: ellipsis;
  flex-shrink: 1;
  white-space: nowrap;
  display: flex;
  flex-direction: row;
  align-items: center;
  font-weight: 600;
`;

const AccountIcon = styled.div`
  margin-right: 0.4em;
  flex-shrink: 0;
`;

const AccountName = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
`;

type AccountRequestProps = {
  onRequestAccount: any;
  selectedAccount: Account | undefined;
};

function AccountRequest({
  onRequestAccount,
  selectedAccount,
}: AccountRequestProps) {
  return (
    <Row>
      <AccountDisplay>
        {selectedAccount ? (
          <>
            <AccountIcon>
              <Image src="/icons/ethereum.svg" width={24} height={24} />
            </AccountIcon>
            <AccountName>{selectedAccount?.name}</AccountName>
          </>
        ) : null}
      </AccountDisplay>
      <Button transparent small onClick={onRequestAccount}>
        {selectedAccount ? "Change account" : "Add Account"}
      </Button>
    </Row>
  );
}

export default AccountRequest;

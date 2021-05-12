import React from "react";
import styled from "styled-components";
import {Account} from "../../lib/types";

// TODO:
const Row = styled.div`
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
`

// TODO:
const Button = styled.button`
    height: 100%;
    border: none;
    transition-duration: color 0.4s;
    flex: flex-grow;
    
    &:active {
        color: grey; // TODO: correct color
    }
`;

type AccountRequestProps = {
    onRequestAccount: any,
    selectedAccount: Account | undefined,
};

export function AccountRequest({ onRequestAccount, selectedAccount }: AccountRequestProps) {

    return (
        <Row>
            {/* TODO: <img src={}/> */}
            {selectedAccount?.name}
            <Button onClick={onRequestAccount}>
                Change account
            </Button>
        </Row>
    )
}

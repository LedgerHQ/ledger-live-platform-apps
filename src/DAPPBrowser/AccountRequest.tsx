import React from "react";
import styled from "styled-components";
import {Account} from "../../lib/types";

// TODO:
const Row = styled.div`
    width: 100%;
    display: flex;
    flex-direction: row;
`

// TODO:
const Button = styled.button`
    height: 100%;
    border: none;
    transition-duration: color 0.4s;
    
    &:active {
        color: grey; // TODO: correct color
    }
`;

/*
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
*/

type AccountRequestProps = {
    onRequestAccount: any,
    selectedAccount: Account | undefined,
};

export function AccountRequest({ onRequestAccount, selectedAccount }: AccountRequestProps) {

    return (
        <Row>
            {/* TODO: <img src={selectedAccount.}/> */}
            {selectedAccount?.name}
            <Button onClick={onRequestAccount}>
                Change account
            </Button>
        </Row>
    )
}

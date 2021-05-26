import Select from "react-select";
import React, { useMemo, useCallback } from "react";
import { useTheme, DefaultTheme } from "styled-components";
import Color from "color";

import {Option} from "react-select/src/filters";
import {ChainConfig} from "./types";

const getSelectStyles = (theme: DefaultTheme) => ({
    control: (provided: any) => ({
        ...provided,
        width: 400,
        backgroundColor: "transparent",
    }),
    singleValue: (provided: any) => ({
        ...provided,
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
    option: (provided: any, { isFocused, isSelected }: { isFocused: boolean, isSelected: boolean }) => ({
        ...provided,
        fontSize: 12,
        color: isSelected ? "#fff" : theme.colors.text,
        backgroundColor: isSelected
            ? new Color(theme.colors.primary).alpha(isFocused ? 0.8 : 1).string()
            : isFocused
                ? new Color(theme.colors.primary).alpha(0.1).string()
                : "transparent",
    })
});

type ChainSelectorProps = {
    chainConfigs: ChainConfig[],
    onChainConfigChange: (chainConfig: ChainConfig | undefined) => void,
    selectedChainConfig: ChainConfig | undefined,
};

function fromChainConfigToOption(chainConfig: ChainConfig): Option {
    return {
        label: `${chainConfig.name}`,
        value: chainConfig.name,
        data: {

        },
    }
}

export function ChainSelector({ chainConfigs, onChainConfigChange, selectedChainConfig }: ChainSelectorProps) {
    const theme = useTheme();
    const options = useMemo(() => chainConfigs.map(chainConfig => fromChainConfigToOption(chainConfig)), [chainConfigs]);
    const value = useMemo(() => selectedChainConfig ? fromChainConfigToOption(selectedChainConfig) : undefined, [selectedChainConfig]);

    const styles = useMemo(() => getSelectStyles(theme), [theme]);

    const handleOnChange = useCallback((option: Option | null) => {
        const newSelectedAccount = option ? chainConfigs.find(chainConfig => chainConfig.name === option.value) : undefined;
        onChainConfigChange(newSelectedAccount);
    }, [chainConfigs, onChainConfigChange])

    return (
        <Select
            instanceId="chain"
            options={options}
            styles={styles}
            onChange={handleOnChange}
            value={value}
        />
    )
}
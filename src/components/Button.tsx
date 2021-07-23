import styled, { css, DefaultTheme } from "styled-components";
import Color from "color";

type Props = {
  theme: DefaultTheme;
  transparent?: boolean;
  small?: boolean;
  disabled?: boolean;
};

const Button = styled.button`
  outline: none;
  border: none;
  border-radius: 4px;
  padding: 0.8em 1.2em;
  transition-duration: color 0.2s, background 0.2s;
  white-space: nowrap;
  cursor: pointer;

  ${(p: Props) => css`
    background: ${p.theme.colors.primary};
    color: ${p.theme.colors.contrast};

    &:hover,
    &:focus {
      background: ${Color(p.theme.colors.primary).lighten(0.1).string()};
    }
  `}

  ${(p: Props) =>
    p.transparent &&
    css`
      background: transparent;
      color: ${p.theme.colors.primary};

      &:hover,
      &:focus {
        background: ${Color(p.theme.colors.text).alpha(0.1).string()};
      }
    `}

  ${(p: Props) =>
    p.disabled &&
    !p.transparent &&
    css`
      opacity: 0.4;
      cursor: default;
    `}

  ${(p: Props) =>
    p.disabled &&
    !p.transparent &&
    css`
      &,
      &:hover,
      &:focus {
        background: ${Color(p.theme.colors.text).alpha(0.2).string()};
      }
    `}
    
  ${(p: Props) =>
    p.disabled &&
    p.transparent &&
    css`
      &,
      &:hover,
      &:focus {
        color: ${Color(p.theme.colors.text).alpha(0.2).string()};
      }
    `}

  ${(p: Props) =>
    p.small &&
    css`
      font-size: 0.9em;
      padding: 0.4em 0.8em;
    `}
`;

export default Button;

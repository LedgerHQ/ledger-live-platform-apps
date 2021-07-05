
import styled, { css } from "styled-components";

const desktopMQ = `@media only screen and (min-width: 600px)`;
const mobileMQ = `@media only screen and (max-width: 600px)`;

const DappBrowserControlBar = styled.div`
box-sizing: border-box;
padding: 16px;
display: flex;
flex-direction: row;
align-items: center;
justify-content: flex-end;

${(p: { desktop?: boolean, mobile?: boolean}) => p.desktop && css`
  ${mobileMQ} {
    display: none;
  }`
}

${(p: { desktop?: boolean, mobile?: boolean}) => p.mobile && css`
  ${desktopMQ} {
    display: none;
  }`
}

${mobileMQ} {
  padding: 12px;
}
`;

export default DappBrowserControlBar;
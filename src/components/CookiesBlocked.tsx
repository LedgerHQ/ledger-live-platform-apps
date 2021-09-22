import React from "react";
import styled from "styled-components";

const CookiesBlockedContainer = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 24px;

  > * + * {
    margin-top: 24px;
  }
`;

const CookiesBlocked = () => (
  <CookiesBlockedContainer>
    <strong>{"Third-party cookies are disabled"}</strong>
    <div>
      {
        "Please enable third-party cookies in order to make DApps properly works."
      }
    </div>
  </CookiesBlockedContainer>
);

export default CookiesBlocked;

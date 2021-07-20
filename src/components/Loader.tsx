import styled, { keyframes } from "styled-components";

const loadingKeyframes = keyframes`
0% { opacity:0.8; }
50% { opacity:0.4; }
100% { opacity:0.8; }
`;

const Loader = styled.div`
  animation: ${loadingKeyframes} 1s ease-in-out infinite;
  font-weight: bold;
`;

export default Loader;

import React from "react";
import Router from "next/router";
import NProgress from "nprogress";
import Meta from "./Meta";
import Nav from "./Nav";

import Link from "next/link";
import styled from "styled-components";

Router.onRouteChangeStart = () => {
  console.log("triggered");
  NProgress.start();
};
Router.onRouteChangeComplete = () => {
  NProgress.done();
  console.log("triggered");
};
Router.onRouteChangeError = () => {
  NProgress.done();
  console.log("triggered");
};
const Logo = styled.h1`
  font-size: 4rem;
  margin-left: 2rem;
  position: relative;
  z-index: 2;
  transform: skew(-7deg);
  a {
    padding: 0.5rem 1rem;
    background: ${props => props.theme.red};
    text-transform: uppercase;
    text-decoration: none;
    color: #fff;
  }
  @media (max-width: ${props => props.theme.maxWidth}) {
    margin: 0;
    text-align: center;
  }
`;

const StyledHeader = styled.header`
  .bar {
    border-bottom: 10px solid ${props => props.theme.black};
    display: grid;
    grid-template-columns: auto 1fr;
    justify-content: space-between;
    align-items: stretch;
    @media (max-width: ${props => props.theme.maxWidth}) {
      grid-template-columns: 1fr;
      justify-content: center;
    }
  }
  .sub-bar {
    grid-template-columns: 1fr auto;
    border-bottom: 1px solid ${props => props.theme.lightGrey};
  }
`;

const Header = () => {
  return (
    <StyledHeader className="header">
      <Meta />
      <div className="bar">
        <Logo>
          <Link href="/">
            <a>Sick Fits</a>
          </Link>
        </Logo>
        <Nav />
      </div>
      <div className="sub-bar">
        <p>Search</p>
        <p>Cart</p>
      </div>
    </StyledHeader>
  );
};

export default Header;

import React, { Component } from "react";
import { Query } from "react-apollo";
import gql from "graphql-tag";
import styled from "styled-components";

import Item from "./Item";

const Centered = styled.div`
  text-align: center;
  margin: 0 auto;
`;

const ItemsList = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-gap: 60px;
  max-width: ${props => props.theme.maxWidth};
`;

const ALL_ITEMS_QUERY = gql`
  query ALL_ITEMS_QUERY {
    items {
      id
      price
      title
      description
      image
      largeImage
    }
  }
`;

class Items extends Component {
  render() {
    return (
      <Centered>
        <Query query={ALL_ITEMS_QUERY}>
          {({ loading, error, data }) => {
            if (loading) {
              return <p>Loading</p>;
            }
            if (error) {
              return <p>Error: {error.message}</p>;
            }

            return (
              <ItemsList>
                {data.items.map(item => {
                  return <Item item={item} key={item.id} />;
                })}
              </ItemsList>
            );
          }}
        </Query>
      </Centered>
    );
  }
}

export default Items;
export { ALL_ITEMS_QUERY };

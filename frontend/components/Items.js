import React, { Component } from "react";
import { Query } from "react-apollo";
import gql from "graphql-tag";
import styled from "styled-components";
import Pagination from "./Pagination";
import { perPage } from "../config";
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
  query ALL_ITEMS_QUERY($skip: Int = 0, $first: Int = ${perPage} ) {
    items(skip: $skip, first: $first, orderBy: createdAt_DESC) {
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
        <Pagination page={this.props.page} />
        <Query
          query={ALL_ITEMS_QUERY}
          variables={{
            skip: this.props.page * perPage - perPage,
            first: perPage
          }}
        >
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
        <Pagination page={this.props.page} />
      </Centered>
    );
  }
}

export default Items;
export { ALL_ITEMS_QUERY };

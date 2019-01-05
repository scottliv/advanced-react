import React from "react";
import { Mutation } from "react-apollo";
import gql from "graphql-tag";
import styled from "styled-components";
import PropTypes from "prop-types";
import { CURRENT_USER_QUERY } from "./User";

const BigButton = styled.button`
  font-size: 3rem;
  background: none;
  border: none;
  &:hover {
    color: ${props => props.theme.red};
    cursor: pointer;
  }
`;
const REMOVE_FROM_CART_MUTATION = gql`
  mutation removeFromCart($id: ID!) {
    removeFromCart(id: $id) {
      id
    }
  }
`;
const update = (cache, payload) => {
  const data = cache.readQuery({ query: CURRENT_USER_QUERY });
  const cartItemId = payload.data.removeFromCart.id;
  data.me.cart = data.me.cart.filter(cartItem => cartItem.id !== cartItemId);
  cache.writeQuery({ query: CURRENT_USER_QUERY, data });
};

const RemoveFromCart = id => (
  <Mutation
    mutation={REMOVE_FROM_CART_MUTATION}
    variables={id}
    update={update}
    optimisticResponse={{
      __typename: "Mutation",
      removeFromCart: {
        __typename: "CartItem",
        id: id
      }
    }}
    // refetchQueries={[{ query: CURRENT_USER_QUERY }]}
  >
    {(removeFromCart, { loading }) => (
      <BigButton
        disabled={loading}
        onClick={removeFromCart}
        title="Delete Item"
      >
        &times;
      </BigButton>
    )}
  </Mutation>
);

RemoveFromCart.propTypes = {
  id: PropTypes.string.isRequired
};

export default RemoveFromCart;

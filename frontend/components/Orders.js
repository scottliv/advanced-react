import React, { Component } from "react";
import { Query } from "react-apollo";
import Link from "next/link";
import styled from "styled-components";
import { formatDistance } from "date-fns";
import gql from "graphql-tag";
import Error from "./ErrorMessage";
import OrderItemStyles from "./styles/OrderItemStyles";
import formatMoney from "../lib/formatMoney";

const ORDERS_QUERY = gql`
  query ORDERS_QUERY {
    orders(orderBy: createdAt_DESC) {
      id
      total
      createdAt
      items {
        id
        title
        description
        price
        quantity
        image
      }
    }
  }
`;

const OrdersUl = styled.ul`
  display: grid;
  grid-gap: 4rem;
  grid-template-columns: repeat(auto-fit, minmax(40%, 1fr));
`;

class Orders extends Component {
  render() {
    return (
      <Query query={ORDERS_QUERY}>
        {({ data: { orders }, error, loading }) => {
          if (error) return <Error error={error} />;
          if (loading) return <p>Loading...</p>;
          return (
            <div>
              <h2>You have {orders.length} orders.</h2>
              <OrdersUl>
                {orders.map(order => (
                  <OrderItemStyles key={order.id}>
                    <Link
                      href={{
                        pathname: "/order",
                        query: { id: order.id }
                      }}
                    >
                      <a>
                        <div className="order-meta">
                          <p>
                            {order.items.reduce((a, b) => a + b.quantity, 0)}{" "}
                            Items
                          </p>
                          <p>{order.items.lenth} Products</p>
                          <p>{formatDistance(order.createdAt, new Date())}</p>
                          <p>{formatMoney(order.total)}</p>
                        </div>
                        <div className="images">
                          {order.items.map(item => (
                            <img
                              src={item.image}
                              alt={item.title}
                              key={item.id}
                            />
                          ))}
                        </div>
                      </a>
                    </Link>
                  </OrderItemStyles>
                ))}
              </OrdersUl>
            </div>
          );
        }}
      </Query>
    );
  }
}

export default Orders;

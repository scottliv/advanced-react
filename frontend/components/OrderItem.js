import React, { Component } from "react";
import PropTypes from "prop-types";
import formatMoney from "../lib/formatMoney";

class OrderItem extends Component {
  render() {
    const { item } = this.props;
    return (
      <div className="order-item">
        {item.image && <img src={item.image} alt={item.title} />}

        <div className="item-details">
          <h2>{item.title}</h2>
          <p>QTY: {item.quantity}</p>
          <p>Each: {formatMoney(item.price)}</p>
          <p>Subtotal: {formatMoney(item.price)}</p>
          <p>{item.description}</p>
        </div>
      </div>
    );
  }
}

OrderItem.propTypes = {
  item: PropTypes.object.isRequired
};

export default OrderItem;

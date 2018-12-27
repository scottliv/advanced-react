import React, { Component } from "react";
import { Mutation, Query } from "react-apollo";
import gql from "graphql-tag";
import Router from "next/router";
import Form from "./styles/Form";
import Error from "./ErrorMessage";
import formatMoney from "../lib/formatMoney";

const SINGLE_ITEM_QUERY = gql`
  query SINGLE_ITEM_QUERY($id: ID!) {
    item(where: { id: $id }) {
      id
      title
      description
      price
      image
    }
  }
`;

const UPDATE_ITEM_MUTATION = gql`
  mutation UPDATE_ITEM_MUTATION($data: updateItemInput, $id: ID!) {
    updateItem(data: $data, id: $id) {
      id
      title
      description
      price
      image
    }
  }
`;

class UpdateItem extends Component {
  state = {
    updateItemInput: {},
    imageLoading: false,
    changedImage: false
  };
  handleChange = e => {
    const { name, type, value } = e.target;
    let val = type === "number" ? parseFloat(value) : value;
    this.setState({
      ...this.state,
      updateItemInput: { ...this.state.updateItemInput, [name]: val }
    });
  };

  uploadImage = async e => {
    this.setState({ ...this.state, imageLoading: true });
    e.preventDefault();
    const cloudName = "dxev349q4";
    const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
    const files = e.target.files;
    const formData = new FormData();
    formData.append("file", files[0]);
    formData.append("upload_preset", "sickfits");
    const res = await fetch(url, {
      method: "POST",
      body: formData
    });
    const file = await res.json();
    this.setState({
      ...this.state,
      updateItemInput: {
        ...this.state.updateItemInput,
        image: file.secure_url,
        largeImage: file.eager[0].secure_url
      },
      imageLoading: false,
      changedImage: true
    });
  };

  updateItem = async (e, updateItemMutation) => {
    e.preventDefault();
    console.log(this.state);
    const res = await updateItemMutation({
      variables: {
        data: {
          ...this.state.updateItemInput
        },
        id: this.props.id
      }
    });
  };
  render() {
    return (
      <Query query={SINGLE_ITEM_QUERY} variables={{ id: this.props.id }}>
        {({ data, loading }) => {
          if (loading) return <p>Loading...</p>;
          if (!data.item) return <p>No Item Found for ID: '{this.props.id}'</p>;
          return (
            <Mutation mutation={UPDATE_ITEM_MUTATION}>
              {(updateItem, { error, loading }) => {
                return (
                  <Form onSubmit={e => this.updateItem(e, updateItem)}>
                    <h2>Update An Item</h2>
                    <Error error={error} />
                    <fieldset
                      disabled={loading && this.state.imageLoading}
                      aria-busy={loading}
                    >
                      <label htmlFor="file">
                        Image
                        <input
                          type="file"
                          id="file"
                          name="file"
                          placeholder="Upload a new image"
                          onChange={this.uploadImage}
                        />
                        {this.state.changedImage
                          ? this.state.updateItemInput.image && (
                              <img
                                width="200"
                                src={this.state.updateItemInput.image}
                                alt="Item Image"
                              />
                            )
                          : data.item.image && (
                              <img
                                width="200"
                                src={data.item.image}
                                alt="Item Image"
                              />
                            )}
                      </label>
                      <label htmlFor="title">
                        Title
                        <input
                          type="text"
                          id="title"
                          name="title"
                          placeholder="Title"
                          required
                          defaultValue={data.item.title}
                          onChange={this.handleChange}
                        />
                      </label>
                      <label htmlFor="price">
                        Price
                        <input
                          type="number"
                          id="price"
                          name="price"
                          placeholder="price"
                          required
                          defaultValue={data.item.price}
                          onChange={this.handleChange}
                        />
                      </label>
                      <label htmlFor="description">
                        Description
                        <textarea
                          type="text"
                          id="description"
                          name="description"
                          placeholder="description"
                          required
                          defaultValue={data.item.description}
                          onChange={this.handleChange}
                        />
                      </label>
                      <button type="submit">Save Changes</button>
                    </fieldset>
                  </Form>
                );
              }}
            </Mutation>
          );
        }}
      </Query>
    );
  }
}

export default UpdateItem;
export { UPDATE_ITEM_MUTATION };

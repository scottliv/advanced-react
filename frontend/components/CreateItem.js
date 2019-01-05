import React, { Component } from "react";
import { Mutation } from "react-apollo";
import gql from "graphql-tag";
import Router from "next/router";
import Form from "./styles/Form";
import Error from "./ErrorMessage";
import formatMoney from "../lib/formatMoney";

const CREATE_ITEM_MUTATION = gql`
  mutation CREATE_ITEM_MUTATION($data: createItemInput) {
    createItem(data: $data) {
      id
      title
      description
      image
      largeImage
      price
    }
  }
`;

class CreateItem extends Component {
  state = {
    createItemInput: {
      title: "",
      description: "",
      price: 0,
      image: "",
      largeImage: ""
    },
    imageLoading: false
  };
  handleChange = e => {
    const { name, type, value } = e.target;
    let val = type === "number" ? parseFloat(value) : value;
    this.setState({
      ...this.state,
      createItemInput: { ...this.state.createItemInput, [name]: val }
    });
  };

  uploadImage = async e => {
    this.setState({ ...this.state, imageLoading: true });
    e.preventDefault();
    const cloudName = "dxev349q4";
    const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
    const files = e.target.files;
    const formData = new FormData();

    if (files.length) {
      formData.append("file", files[0]);
      formData.append("upload_preset", "sickfits");
      try {
        const res = await fetch(url, {
          method: "POST",
          body: formData
        });
        const file = await res.json();
        this.setState({
          ...this.state,
          createItemInput: {
            ...this.state.createItemInput,
            image: file.secure_url,
            largeImage: file.eager[0].secure_url
          },
          imageLoading: false
        });
      } catch {
        throw new Error("There was a problem updloading your image");
      }
    } else {
      this.setState({ createItemInput: { image: "" } });
    }
  };
  render() {
    return (
      <Mutation
        mutation={CREATE_ITEM_MUTATION}
        variables={{ data: { ...this.state.createItemInput } }}
      >
        {(createItem, { error, loading }) => {
          return (
            <Form
              onSubmit={async e => {
                e.preventDefault();
                const res = await createItem();
                console.log(res);
                Router.push({
                  pathname: "/item",
                  query: { id: res.data.createItem.id }
                });
              }}
            >
              <h2>Sell An Item</h2>
              <Error error={error} />
              <fieldset
                disabled={loading && this.state.imageLoading}
                aria-busy={loading && this.state.imageLoading}
              >
                <label htmlFor="file">
                  Image
                  <input
                    type="file"
                    id="file"
                    name="file"
                    placeholder="Upload an image"
                    onChange={this.uploadImage}
                  />
                  {this.state.createItemInput.image && (
                    <img
                      width="200"
                      src={this.state.createItemInput.image}
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
                    value={this.state.createItemInput.title}
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
                    value={this.state.createItemInput.price}
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
                    value={this.state.createItemInput.description}
                    onChange={this.handleChange}
                  />
                </label>
                <button type="submit">Submit</button>
              </fieldset>
            </Form>
          );
        }}
      </Mutation>
    );
  }
}

export default CreateItem;
export { CREATE_ITEM_MUTATION };

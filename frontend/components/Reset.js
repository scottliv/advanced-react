import React, { Component } from "react";
import { Mutation } from "react-apollo";
import PropTypes from "prop-types";
import gql from "graphql-tag";
import Form from "./styles/Form";
import Error from "./ErrorMessage";
import { CURRENT_USER_QUERY } from "./User";

const RESET_MUTATION = gql`
  mutation RESET_MUTATION(
    $resetToken: String!
    $password: String!
    $passwordConfirm: String!
  ) {
    resetPassword(
      resetToken: $resetToken
      password: $password
      passwordConfirm: $passwordConfirm
    ) {
      id
      email
      name
    }
  }
`;
class Reset extends Component {
  static propTypes = {
    resetToken: PropTypes.string.isRequired
  };
  state = {
    password: "",
    passwordConfirm: ""
  };
  saveToState = e => {
    this.setState({ [e.target.name]: e.target.value });
  };
  render() {
    return (
      <Mutation
        mutation={RESET_MUTATION}
        variables={{
          resetToken: this.props.resetToken,
          password: this.state.password,
          passwordConfirm: this.state.passwordConfirm
        }}
        refetchQueries={[{ query: CURRENT_USER_QUERY }]}
      >
        {(resetPassword, { error, loading, called }) => (
          <Form
            method="post"
            onSubmit={async e => {
              e.preventDefault();
              const res = await resetPassword();
              this.setState({ password: "", passwordConfirm: "" });
            }}
          >
            <fieldset disabled={loading} aria-busy={loading}>
              <h2>Set a new password</h2>
              <Error error={error} />
              <label htmlFor="password">
                Password
                <input
                  type="password"
                  name="password"
                  placeholder="password"
                  value={this.state.password}
                  onChange={this.saveToState}
                />
              </label>
              <label htmlFor="password">
                Confirm Your Password
                <input
                  type="password"
                  name="passwordConfirm"
                  placeholder="passwordConfirm"
                  value={this.state.passwordConfirm}
                  onChange={this.saveToState}
                />
              </label>
            </fieldset>
            <button type="submit">Reset Your Password</button>
          </Form>
        )}
      </Mutation>
    );
  }
}

export default Reset;

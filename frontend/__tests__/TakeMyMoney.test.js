import { mount } from "enzyme";
import toJson from "enzyme-to-json";
import { MockedProvider } from "react-apollo/test-utils";
import wait from "waait";
import NProgress from "NProgress";
import Router from "next/router";
import TakeMyMoney, { CREATE_ORDER_MUTATION } from "../components/TakeMyMoney";
import { CURRENT_USER_QUERY } from "../components/User";
import { fakeUser, fakeCartItem } from "../lib/testUtils";

Router.router = { push() {} };
NProgress.start = {};

const mocks = [
  {
    request: { query: CURRENT_USER_QUERY },
    result: {
      data: {
        me: {
          ...fakeUser(),
          cart: [fakeCartItem()]
        }
      }
    }
  }
];

describe("<TakeMyMoney/>", () => {
  it("renders and matches snapshot", async () => {
    const wrapper = mount(
      <MockedProvider mocks={mocks}>
        <TakeMyMoney />
      </MockedProvider>
    );
    await wait();
    wrapper.update();
    expect(toJson(wrapper.find("ReactStripeCheckout"))).toMatchSnapshot();
  });

  it("creates an order ontoken", async () => {
    const createOrderMock = jest.fn().mockResolvedValue({
      data: { createOrder: { id: "xyz789" } }
    });
    const wrapper = mount(
      <MockedProvider mocks={mocks}>
        <TakeMyMoney />
      </MockedProvider>
    );
    await wait();
    wrapper.update();
    const component = wrapper.find("TakeMyMoney").instance();
    component.onToken({ id: "abc123" }, createOrderMock);
    expect(createOrderMock).toHaveBeenCalled();
    expect(createOrderMock).toHaveBeenCalledWith({
      variables: { token: "abc123" }
    });
  });

  // it("turns the progress bar on", async () => {
  //   NProgress.start = jest.fn();
  //   const wrapper = mount(
  //     <MockedProvider mocks={mocks}>
  //       <TakeMyMoney />
  //     </MockedProvider>
  //   );
  //   await wait();
  //   wrapper.update();
  //   const createOrderMock = jest.fn().mockResolvedValue({
  //     data: { createOrder: { id: "xyz789" } }
  //   });
  //   const component = wrapper.find("TakeMyMoney").instance();
  //   component.onToken({ id: "abc123" }, createOrderMock);
  //   console.log(NProgress.start);
  //   //expect(NProgress.start).toHaveBeenCalled();
  // });

  it("routes to the order page when completed", async () => {
    const wrapper = mount(
      <MockedProvider mocks={mocks}>
        <TakeMyMoney />
      </MockedProvider>
    );
    await wait();
    wrapper.update();
    const createOrderMock = jest.fn().mockResolvedValue({
      data: { createOrder: { id: "xyz789" } }
    });
    Router.router.push = jest.fn();
    const component = wrapper.find("TakeMyMoney").instance();
    component.onToken({ id: "abc123" }, createOrderMock);
    await wait();
    wrapper.update();
    expect(Router.router.push).toHaveBeenCalledWith({
      pathname: "/order",
      query: { id: "xyz789" }
    });
  });
});

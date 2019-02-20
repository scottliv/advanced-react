import { mount } from "enzyme";
import toJson from "enzyme-to-json";
import { MockedProvider } from "react-apollo/test-utils";
import Router from "next/router";
import wait from "waait";
import Pagination, { PAGINATION_QUERY } from "../components/Pagination";
Router.router = {
  push() {},
  prefetch() {}
};
function makeMocksFor(length) {
  return [
    {
      request: { query: PAGINATION_QUERY },
      result: {
        data: {
          itemsConnection: {
            __typename: "aggregate",
            aggregate: {
              __typename: "count",
              count: length
            }
          }
        }
      }
    }
  ];
}

describe("<Pagination/>", () => {
  it("displays a loading state", () => {
    const wrapper = mount(
      <MockedProvider mocks={makeMocksFor(1)}>
        <Pagination page={1} />
      </MockedProvider>
    );
    const pagination = wrapper.find('[data-test="pagination"]');
    expect(wrapper.text()).toContain("Loading");
  });

  it("renders pagination for 18 items", async () => {
    const wrapper = mount(
      <MockedProvider mocks={makeMocksFor(18)}>
        <Pagination page={1} />
      </MockedProvider>
    );
    await wait();
    wrapper.update();
    expect(wrapper.find(".totalPages").text()).toEqual("5");
    const pagination = wrapper.find('div[data-test="pagination"]');

    expect(toJson(pagination)).toMatchSnapshot();
  });

  it("disables prev button on first page", async () => {
    const wrapper = mount(
      <MockedProvider mocks={makeMocksFor(18)}>
        <Pagination page={1} />
      </MockedProvider>
    );
    await wait();
    wrapper.update();
    expect(wrapper.find("a.prev").prop("aria-disabled")).toBe(true);
  });
  it("disables next button on last page", async () => {
    const wrapper = mount(
      <MockedProvider mocks={makeMocksFor(1)}>
        <Pagination page={1} />
      </MockedProvider>
    );
    await wait();
    wrapper.update();
    expect(wrapper.find("a.next").prop("aria-disabled")).toBe(true);
  });
  it("enables both buttons on middle page", async () => {
    const wrapper = mount(
      <MockedProvider mocks={makeMocksFor(18)}>
        <Pagination page={3} />
      </MockedProvider>
    );
    await wait();
    wrapper.update();
    expect(wrapper.find("a.next").prop("aria-disabled")).toBe(false);
    expect(wrapper.find("a.prev").prop("aria-disabled")).toBe(false);
  });
});

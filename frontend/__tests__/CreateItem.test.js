import { mount } from "enzyme";
import toJson from "enzyme-to-json";
import Router from "next/router";
import { MockedProvider } from "react-apollo/test-utils";
import wait from "waait";
import CreateItem, { CREATE_ITEM_MUTATION } from "../components/CreateItem";
import { fakeItem } from "../lib/testUtils";

const dogImage = "https://dog.com/dog.png";
//Mock fetch api call
global.fetch = jest.fn().mockResolvedValue({
  json: () => ({
    secure_url: dogImage,
    eager: [
      {
        secure_url: dogImage
      }
    ]
  })
});

describe("<CreateItem/>", () => {
  it("renders and matches snapshot", async () => {
    const wrapper = mount(
      <MockedProvider>
        <CreateItem />
      </MockedProvider>
    );
    const form = wrapper.find('form[data-test="form"]');
    expect(toJson(form)).toMatchSnapshot();
  });

  it("uploads a file when changed", async () => {
    const wrapper = mount(
      <MockedProvider>
        <CreateItem />
      </MockedProvider>
    );
    const input = wrapper.find('input[type="file"]');
    input.simulate("change", { target: { files: ["fakedog.jpg"] } });
    await wait();
    const component = wrapper.find("CreateItem").instance();

    expect(component.state.createItemInput.image).toEqual(dogImage);
    expect(component.state.createItemInput.largeImage).toEqual(dogImage);
    expect(global.fetch).toHaveBeenCalled();
    global.fetch.mockReset();
  });

  it("handles state update", async () => {
    const wrapper = mount(
      <MockedProvider>
        <CreateItem />
      </MockedProvider>
    );

    wrapper
      .find("#title")
      .simulate("change", { target: { name: "title", value: "Test Name" } });
    wrapper.find("#price").simulate("change", {
      target: { name: "price", value: 3000, type: "number" }
    });
    wrapper.find("#description").simulate("change", {
      target: { name: "description", value: "Test Description" }
    });

    expect(
      wrapper.find("CreateItem").instance().state.createItemInput
    ).toMatchObject({
      title: "Test Name",
      description: "Test Description",
      price: 3000
    });
  });

  it("creates an item when the form is submitted", async () => {
    const item = fakeItem();
    const mocks = [
      {
        request: {
          query: CREATE_ITEM_MUTATION,
          variables: {
            data: {
              title: item.title,
              description: item.description,
              image: "",
              largeImage: "",
              price: item.price
            }
          }
        },
        result: {
          data: {
            createItem: {
              ...item,
              id: "abc123",
              __typename: "Item"
            }
          }
        }
      }
    ];

    const wrapper = mount(
      <MockedProvider mocks={mocks}>
        <CreateItem />
      </MockedProvider>
    );
    // simulate form
    wrapper
      .find("#title")
      .simulate("change", { target: { name: "title", value: item.title } });
    wrapper.find("#price").simulate("change", {
      target: { name: "price", value: item.price, type: "number" }
    });
    wrapper.find("#description").simulate("change", {
      target: { name: "description", value: item.description }
    });
    // mock the router
    Router.router = { push: jest.fn() };
    wrapper.find("form").simulate("submit");
    await wait(50);
    expect(Router.router.push).toHaveBeenCalled();
    expect(Router.router.push).toHaveBeenCalledWith({
      pathname: "/item",
      query: { id: "abc123" }
    });
  });
});

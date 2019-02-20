import { mount } from "enzyme";
import toJson from "enzyme-to-json";
import { MockedProvider } from "react-apollo/test-utils";
import wait from "waait";
import RequestReset, {
  REQUEST_RESET_MUTATION
} from "../components/RequestReset";

const mocks = [
  {
    request: {
      query: REQUEST_RESET_MUTATION,
      variables: { email: "scottdlivingstone@gmail.com" }
    },
    result: {
      data: {
        requestReset: { message: "success", __typename: "Message" }
      }
    }
  }
];

describe("<RequestReset/>", () => {
  it("renders and matches snapshot", async () => {
    const wrapper = mount(
      <MockedProvider>
        <RequestReset />
      </MockedProvider>
    );
    const form = wrapper.find('form[data-test="form"]');
    expect(toJson(form)).toMatchSnapshot();
  });

  it("calls the mutation", async () => {
    const wrapper = mount(
      <MockedProvider mocks={mocks}>
        <RequestReset />
      </MockedProvider>
    );

    wrapper.find("input").simulate("change", {
      target: { name: "email", value: "scottdlivingstone@gmail.com" }
    });
    await wait();
    wrapper.update();
    wrapper.find("form").simulate("submit");
    await wait();
    wrapper.update();

    expect(wrapper.find("p").text()).toContain("Success! Check your email!");
  });
});

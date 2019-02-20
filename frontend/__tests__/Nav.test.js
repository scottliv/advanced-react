import { mount } from "enzyme";
import toJson from "enzyme-to-json";
import { MockedProvider } from "react-apollo/test-utils";
import wait from "waait";
import Nav from "../components/Nav";
import { CURRENT_USER_QUERY } from "../components/User";
import { fakeUser } from "../lib/testUtils";

const notSignedInMocks = [
  {
    request: { query: CURRENT_USER_QUERY },
    result: { data: { me: null } }
  }
];

const signedInMocks = [
  {
    request: { query: CURRENT_USER_QUERY },
    result: { data: { me: fakeUser() } }
  }
];

describe("<Nav>", () => {
  it("renders a minimal nav when signed out", async () => {
    const wrapper = mount(
      <MockedProvider mocks={notSignedInMocks}>
        <Nav />
      </MockedProvider>
    );

    await wait();
    wrapper.update();
    const nav = wrapper.find("ul[data-test='nav']");
    expect(nav.length <= 2).toBe(true);
  });

  it("renders full nav when signed in", async () => {
    const wrapper = mount(
      <MockedProvider mocks={signedInMocks}>
        <Nav />
      </MockedProvider>
    );
    await wait();
    wrapper.update();
    const nav = wrapper.find("ul[data-test='nav']");
    expect(nav.children().length > 2).toBe(true);
  });
});

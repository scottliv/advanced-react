import { mount } from "enzyme";
import toJson from "enzyme-to-json";
import { MockedProvider } from "react-apollo/test-utils";
import wait from "waait";
import PleaseSignIn from "../components/PleaseSignIn";
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

describe("<PleaseSignIn/>", () => {
  it("renders login component when user not signed in", async () => {
    const wrapper = mount(
      <MockedProvider mocks={notSignedInMocks}>
        <PleaseSignIn />
      </MockedProvider>
    );
    expect(wrapper.text()).toContain("Loading...");
    await wait();
    wrapper.update();
    expect(toJson(wrapper.find("p"))).toMatchSnapshot();
    expect(toJson(wrapper.find("SignIn"))).toMatchSnapshot();
  });

  it("renders the child component when the user is signed in", async () => {
    const Hey = () => <p>Hey!</p>;
    const user = fakeUser();

    const wrapper = mount(
      <MockedProvider mocks={signedInMocks}>
        <PleaseSignIn>
          <Hey />
        </PleaseSignIn>
      </MockedProvider>
    );

    await wait();
    wrapper.update();
    expect(wrapper.contains(<Hey />)).toBe(true);
  });
});

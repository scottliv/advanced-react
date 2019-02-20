import Item from "../components/Item";
import { shallow } from "enzyme";
import { wrap } from "module";
import toJson from "enzyme-to-json";

const fakeItem = {
  id: "4321",
  title: "An Item",
  description: "lookin good!",
  price: 350,
  image: "dog.jpg",
  largeImage: "bigDog.jpg"
};

describe("<Item/>", () => {
  it("renders and matches the snapshot", () => {
    const wrapper = shallow(<Item item={fakeItem} />);
    expect(toJson(wrapper)).toMatchSnapshot();
  });
});

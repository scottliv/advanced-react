import PleaseSignIn from "../components/PleaseSignIn.js";
import Order from "../components/Order";
const OrderPage = props => (
  <PleaseSignIn>
    <Order id={props.query.id} />
  </PleaseSignIn>
);
export default OrderPage;

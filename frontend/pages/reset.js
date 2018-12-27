import Reset from "../components/Reset";

const reset = props => {
  return (
    <div>
      <Reset resetToken={props.query.resetToken} />
    </div>
  );
};

export default reset;

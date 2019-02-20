import formatMoney from "../lib/formatMoney";

describe("Format Money Function", () => {
  it("Works with fractions of dollars", () => {
    expect(formatMoney(1)).toEqual("$0.01");
    expect(formatMoney(66)).toEqual("$0.66");
    expect(formatMoney(10)).toEqual("$0.10");
  });

  it("leaves cents off for whole dollars", () => {
    expect(formatMoney(5000)).toEqual("$50");
    expect(formatMoney(100)).toEqual("$1");
    expect(formatMoney(100000000)).toEqual("$1,000,000");
  });

  it("Works with whole and fractions", () => {
    expect(formatMoney(5012)).toEqual("$50.12");
    expect(formatMoney(105)).toEqual("$1.05");
    expect(formatMoney(100000011)).toEqual("$1,000,000.11");
  });
});

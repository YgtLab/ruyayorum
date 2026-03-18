jest.mock("uuid", () => ({
  v4: () => "mock-device-id"
}));

const {
  parseCookies,
  hashToken
} = require("../server/utils/authToken");

describe("authToken utils", () => {
  test("parseCookies cookie header'ını doğru parse etmeli", () => {
    const parsed = parseCookies("a=1; b=iki; c=%C3%A7");
    expect(parsed.a).toBe("1");
    expect(parsed.b).toBe("iki");
    expect(parsed.c).toBe("ç");
  });

  test("hashToken aynı girişte sabit çıktı vermeli", () => {
    const one = hashToken("deneme-token");
    const two = hashToken("deneme-token");
    expect(one).toBe(two);
    expect(one.length).toBe(64);
  });
});

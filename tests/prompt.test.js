const { buildPrompt } = require("../server/utils/prompt");

describe("buildPrompt", () => {
  test("psikolojik prompt Türkçe yapı alanlarını içermeli", () => {
    const out = buildPrompt("Rüyamda deniz gördüm", "psikolojik");
    expect(out).toContain("Ana Sembol");
    expect(out).toContain("Psikolojik Anlam");
    expect(out).toContain("Hayatına Yansıması");
    expect(out).toContain("Kullanıcı Rüyası");
  });

  test("dini prompt dini yapı alanlarını içermeli", () => {
    const out = buildPrompt("Rüyamda cami gördüm", "dini");
    expect(out).toContain("Rüyanın Anlamı");
    expect(out).toContain("Dini Kaynak");
    expect(out).toContain("Hayatına Yansıması");
    expect(out).toContain("Kullanıcı Rüyası");
  });
});


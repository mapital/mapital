import { MaputnikDriver } from "./maputnik-driver";

describe("local file", () => {
  const { when, get } = new MaputnikDriver();

  beforeEach(() => {
    when.setStyle("");
  });

  describe("PMTiles", () => {
    it("valid file loads without error", () => {
      const fileName = "polygon-z0.pmtiles"; // a small polygon located at Null Island

      const stub = cy.stub();
      cy.on('window:alert', stub);

      get
        .bySelector("file", "type")
        .selectFile(`cypress/fixtures/${fileName}`, { force: true });
      when.wait(200);
      cy.then(() => {
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        expect(stub).to.not.have.been.called;
      });
    });

    it("invalid file results in error", () => {
      const fileName = "example-style.json";

      const stub = cy.stub();
      cy.on('window:alert', stub);

      get
        .bySelector("file", "type")
        .selectFile(`cypress/fixtures/${fileName}`, { force: true });
      when.wait(200);
      cy.then(() => {
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        expect(stub).to.be.called;
        expect(stub.getCall(0).args[0]).to.contain('File type is not supported');
      });
    })
  });
});

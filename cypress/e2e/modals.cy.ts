import { MaputnikDriver } from "./maputnik-driver";
import tokens from "../../src/config/tokens.json" with {type: "json"};

describe("modals", () => {
  const { beforeAndAfter, when, get, then } = new MaputnikDriver();
  beforeAndAfter();

  beforeEach(() => {
    when.setStyle("");
  });
  describe("open", () => {
    beforeEach(() => {
      when.click("nav:open");
    });

    it("close", () => {
      when.modal.close("modal:open");
      then(get.elementByTestId("modal:open")).shouldNotExist();
    });

    it.skip("upload", () => {
      // HM: I was not able to make the following choose file actually to select a file and close the modal...
      when.chooseExampleFile();
      then(get.responseBody("example-style.json")).shouldEqualToStoredStyle();
    });

    describe("when click open url", () => {
      beforeEach(() => {
        const styleFileUrl = get.exampleFileUrl();

        when.setValue("modal:open.url.input", styleFileUrl);
        when.click("modal:open.url.button");
        when.wait(200);
      });
      it("load from url", () => {
        then(get.responseBody("example-style.json")).shouldEqualToStoredStyle();
      });
    });
  });

  describe("shortcuts", () => {
    it("open/close", () => {
      when.setStyle("");
      when.typeKeys("?");
      when.modal.close("modal:shortcuts");
      then(get.elementByTestId("modal:shortcuts")).shouldNotExist();
    });
  });

  describe("export", () => {
    beforeEach(() => {
      when.click("nav:export");
    });

    it("close", () => {
      when.modal.close("modal:export");
      then(get.elementByTestId("modal:export")).shouldNotExist();
    });

    // TODO: Work out how to download a file and check the contents
    it("download");
  });

  describe("sources", () => {
    beforeEach(() => {
      when.setStyle("layer");
      when.click("nav:sources");
    });

    it("active sources");
    it("public source");

    it("add new source", () => {
      const sourceId = "n1z2v3r";
      when.setValue("modal:sources.add.source_id", sourceId);
      when.select("modal:sources.add.source_type", "tile_vector");
      when.select("modal:sources.add.scheme_type", "tms");
      when.click("modal:sources.add.add_source");
      when.wait(200);
      then(
        get.styleFromLocalStorage().then((style) => style.sources[sourceId])
      ).shouldInclude({
        scheme: "tms",
      });
    });

    it("add new pmtiles source", () => {
      const sourceId = "pmtilestest";
      when.setValue("modal:sources.add.source_id", sourceId);
      when.select("modal:sources.add.source_type", "pmtiles_vector");
      when.setValue("modal:sources.add.source_url", "https://data.source.coop/protomaps/openstreetmap/v4.pmtiles");
      when.click("modal:sources.add.add_source");
      when.click("modal:sources.add.add_source");
      when.wait(200);
      then(get.styleFromLocalStorage()).shouldDeepNestedInclude({
        sources: {
          pmtilestest: {
            type: "vector",
            url: "pmtiles://https://data.source.coop/protomaps/openstreetmap/v4.pmtiles",
          },
        },
      });
    });

    it("add new raster source", () => {
      const sourceId = "rastertest";
      when.setValue("modal:sources.add.source_id", sourceId);
      when.select("modal:sources.add.source_type", "tile_raster");
      when.select("modal:sources.add.scheme_type", "xyz");
      when.setValue("modal:sources.add.tile_size", "128");
      when.click("modal:sources.add.add_source");
      when.wait(200);
      then(
        get.styleFromLocalStorage().then((style) => style.sources[sourceId])
      ).shouldInclude({
        tileSize: 128,
      });
    });
  });

  describe("inspect", () => {
    it("toggle", () => {
      // There is no assertion in this test
      when.setStyle("geojson");
      when.select("maputnik-select", "inspect");
    });
  });

  describe("style settings", () => {
    beforeEach(() => {
      when.click("nav:settings");
    });

    describe("when click name filed spec information", () => {
      beforeEach(() => {
        when.click("field-doc-button-Name");
      });

      it("should show the spec information", () => {
        then(get.elementsText("spec-field-doc")).shouldInclude(
          "name for the style"
        );
      });
    });

    describe("when set name and click owner", () => {
      beforeEach(() => {
        when.setValue("modal:settings.name", "foobar");
        when.click("modal:settings.owner");
        when.wait(200);
      });

      it("show name specifications", () => {
        then(get.styleFromLocalStorage()).shouldDeepNestedInclude({
          name: "foobar",
        });
      });
    });

    describe("when set owner and click name", () => {
      beforeEach(() => {
        when.setValue("modal:settings.owner", "foobar");
        when.click("modal:settings.name");
        when.wait(200);
      });
      it("should update owner in local storage", () => {
        then(get.styleFromLocalStorage()).shouldDeepNestedInclude({
          owner: "foobar",
        });
      });
    });

    it("sprite url", () => {
      when.setValue("modal:settings.sprite", "http://example.com");
      when.click("modal:settings.name");
      then(get.styleFromLocalStorage()).shouldDeepNestedInclude({
        sprite: "http://example.com",
      });
    });
    it("glyphs url", () => {
      const glyphsUrl = "http://example.com/{fontstack}/{range}.pbf";
      when.setValue("modal:settings.glyphs", glyphsUrl);
      when.click("modal:settings.name");
      then(get.styleFromLocalStorage()).shouldDeepNestedInclude({
        glyphs: glyphsUrl,
      });
    });

    it("maptiler access token", () => {
      const apiKey = "testing123";
      when.setValue(
        "modal:settings.maputnik:openmaptiles_access_token",
        apiKey
      );
      when.click("modal:settings.name");
      then(
        get.styleFromLocalStorage().then((style) => style.metadata)
      ).shouldInclude({
        "maputnik:openmaptiles_access_token": apiKey,
      });
    });

    it("thunderforest access token", () => {
      const apiKey = "testing123";
      when.setValue(
        "modal:settings.maputnik:thunderforest_access_token",
        apiKey
      );
      when.click("modal:settings.name");
      then(
        get.styleFromLocalStorage().then((style) => style.metadata)
      ).shouldInclude({ "maputnik:thunderforest_access_token": apiKey });
    });

    it("stadia access token", () => {
      const apiKey = "testing123";
      when.setValue(
        "modal:settings.maputnik:stadia_access_token",
        apiKey
      );
      when.click("modal:settings.name");
      then(
        get.styleFromLocalStorage().then((style) => style.metadata)
      ).shouldInclude({ "maputnik:stadia_access_token": apiKey });
    });

    it("style renderer", () => {
      cy.on("uncaught:exception", () => false); // this is due to the fact that this is an invalid style for openlayers
      when.select("modal:settings.maputnik:renderer", "ol");
      then(get.inputValue("modal:settings.maputnik:renderer")).shouldEqual(
        "ol"
      );

      when.click("modal:settings.name");
      then(get.styleFromLocalStorage()).shouldDeepNestedInclude({
        metadata: { "maputnik:renderer": "ol" },
      });
    });



    it("inlcude API key when change renderer", () => {

      
      
      when.click("modal:settings.close-modal")
      when.click("nav:open");


      // when.click("aria-label="MapTiler Basic"

      cy.get('[aria-label="MapTiler Basic"]').should('exist').click();

      
      when.click("nav:settings");

      
      // cy.on("uncaught:exception", () => false); // this is due to the fact that this is an invalid style for openlayers
      when.select("modal:settings.maputnik:renderer", "mlgljs");
      then(get.inputValue("modal:settings.maputnik:renderer")).shouldEqual(
        "mlgljs"
      );

      // cy.on("uncaught:exception", () => false);
      when.select("modal:settings.maputnik:renderer", "ol");
      then(get.inputValue("modal:settings.maputnik:renderer")).shouldEqual(
        "ol"
      );

      cy.intercept("GET", "https://api.maptiler.com/tiles/v3-openmaptiles/tiles.json?key=*").as("tileRequest");
      // then(get.waitForRequest("@tileRequest")).shouldHaveStatus(403);


      // cy.on("uncaught:exception", () => false);
      when.select("modal:settings.maputnik:renderer", "mlgljs");
      then(get.inputValue("modal:settings.maputnik:renderer")).shouldEqual(
        "mlgljs"
      );

      cy.wait("@tileRequest").its("request").its("url").should("include", `https://api.maptiler.com/tiles/v3-openmaptiles/tiles.json?key=${tokens.openmaptiles}`);
      cy.wait("@tileRequest").its("request").its("url").should("include", `https://api.maptiler.com/tiles/v3-openmaptiles/tiles.json?key=${tokens.openmaptiles}`);
      cy.wait("@tileRequest").its("request").its("url").should("include", `https://api.maptiler.com/tiles/v3-openmaptiles/tiles.json?key=${tokens.openmaptiles}`);
    });
    
  });

  describe("sources", () => {
    it("toggle");
  });
});

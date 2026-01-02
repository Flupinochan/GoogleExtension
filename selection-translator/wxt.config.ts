import { defineConfig } from "wxt";

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ["@wxt-dev/module-react"],
  manifest: {
    name: "SelectionTranslator",
    short_name: "TransTool",
    version: "0.0.3",
    version_name: "0.0.3",
    description: "A tool that translates selected text!",
    // description: "A tool that translates selected text and performs OCR on clicked images!",
    author: { email: "flupino@metalmental.net" },
    key: "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAqsqQBqenHt9mmqSotfIo436FqN48TLUkrmLXU/x22xp44PR8z1qNmjAAqVj98oxsteXPbEcGXd8mOlSzKljtrFRiReXyo0MvfDn4UpDMQ6ZfqrMjccXTOOv7ygOPdCpBuFT2PmD+PiJWThzXOQcegvbliyNo1giH0BhtEyuWL7AN3iIW46YiLodrkTvG9EIXn81MjQa3HSLxf3MFTWPHMpxbCTAaG08utydcHOxzwqSvUK/uMtBWcWyHTttnTyxwdoQu2E1P7wK6/bvpNiniD/RAyoXtgjEShMs2IXTGoDU+E66fT+SNfilLR7gcvsOXiVhSNEFzRCOWZwJ8Eny/dQIDAQAB",
    permissions: ["storage"],
  },
});

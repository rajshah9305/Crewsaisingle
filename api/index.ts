// This file re-exports the server index for compatibility
// with deployment platforms that expect an api/index.ts file
import "dotenv/config";
export * from "../server/index.js";

/* eslint-disable */
/**
 * Checked-in stub so TypeScript and `next dev` work before `npx convex dev` links a deployment.
 * Convex overwrites this folder when you run codegen against a real project.
 */
import { anyApi, componentsGeneric } from "convex/server";

export const api = anyApi;
export const internal = anyApi;
export const components = componentsGeneric();

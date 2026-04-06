/// <reference types="vite/client" />
import { test } from "vitest";
import { convexTest } from "convex-test";
import type { GenericSchema, SchemaDefinition } from "convex/server";
import { type ComponentApi } from "../component/_generated/component.js";
import { componentsGeneric } from "convex/server";
import componentSchema from "../component/schema.js";

export const modules = import.meta.glob("../component/**/*.ts");

export function initConvexTest() {
  return convexTest(
    componentSchema as unknown as SchemaDefinition<GenericSchema, boolean>,
    modules,
  );
}

export const components = componentsGeneric() as unknown as {
  blogCms: ComponentApi;
};

test("setup", () => {});

import { defineApp } from "convex/server";
import blogCms from "@basic-blog/convex-blog-cms/convex.config.js";

const app = defineApp();
app.use(blogCms);

export default app;

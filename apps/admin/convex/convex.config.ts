import { defineApp } from "convex/server";
import blogCms from "@basic-blog/convex-blog-cms/convex.config.js";
import r2 from "@convex-dev/r2/convex.config.js";

const app = defineApp();
app.use(blogCms);
app.use(r2);

export default app;

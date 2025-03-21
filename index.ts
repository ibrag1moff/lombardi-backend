import express from "express";
import http from "http";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

import { authRouter } from "./routes/auth";
import { productRouter } from "./routes/product";
import { adminRouter } from "./routes/admin";
import { cartRouter } from "./routes/cart";
import { stripeRouter } from "./routes/payment";
import { newsletterRouter } from "./routes/newsletter";
import { startNewsletter } from "./utils/newsletterCron";

// Load environment variables
dotenv.config();

const app = express();

// Middlewares
app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/auth", authRouter);
app.use("/product", productRouter);
app.use("/admin", adminRouter);
app.use("/cart", cartRouter);
app.use("/payment", stripeRouter);
app.use("/newsletter", newsletterRouter);

// Newsletter
startNewsletter();

const server = http.createServer(app);

app.get("/", (req, res) => {
  res.send("Hello World from Lombardi API🚀");
});

server.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});

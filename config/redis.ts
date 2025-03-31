import { createClient } from "redis";

const redis = createClient({
  url: process.env.REDIS_URL,
});

redis.on("error", (err) => {
  console.error("❌ Redis error:", err);
});

redis.on("connect", () => {
  console.log("✅ Connected to Redis");
});

redis.connect();

export default redis;

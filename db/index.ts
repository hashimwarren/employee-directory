import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
import { HttpsProxyAgent } from "https-proxy-agent";
import * as schema from "./schema";
// Honor explicit enterprise proxy settings; Vercel uses a direct WebSocket connection.
const proxyUrl = process.env.HTTPS_PROXY || process.env.https_proxy;
if (proxyUrl) {
  const proxyAgent = new HttpsProxyAgent(proxyUrl);
  neonConfig.webSocketConstructor = class ProxyWebSocket extends ws {
    constructor(address: string, protocols?: string | string[]) {
      super(address, protocols, { agent: proxyAgent });
    }
  };
} else {
  neonConfig.webSocketConstructor = ws;
}
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 5,
});
export const db = drizzle(pool, { schema });

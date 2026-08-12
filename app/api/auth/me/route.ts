import { authenticate } from "@/lib/api/auth";
import { apiHandler, json } from "@/lib/api/response";

export const GET = apiHandler(async (request: Request) => json(await authenticate(request)));

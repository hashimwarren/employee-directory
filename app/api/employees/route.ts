import { apiActor, apiError } from "@/lib/api";
import { saveEmployee } from "@/lib/employee-service";
export async function POST(request: Request) {
  try {
    return Response.json(
      await saveEmployee(await apiActor(request), await request.json()),
      { status: 201 },
    );
  } catch (e) {
    return apiError(e);
  }
}

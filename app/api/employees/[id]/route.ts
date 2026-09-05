import { apiActor, apiError } from "@/lib/api";
import { saveEmployee, deleteEmployee } from "@/lib/employee-service";
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    return Response.json(
      await saveEmployee(
        await apiActor(request),
        await request.json(),
        (await params).id,
      ),
    );
  } catch (e) {
    return apiError(e);
  }
}
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await deleteEmployee(await apiActor(request), (await params).id);
    return Response.json({ ok: true });
  } catch (e) {
    return apiError(e);
  }
}

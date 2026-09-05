import Dexie from "dexie";
import { blankState, stateSchema } from "./model";

export const db = new Dexie("offerflow");
db.version(1).stores({ workspace: "id" });
export async function readState() {
  const row = await db.workspace.get("main");
  return row ? stateSchema.parse(row.data) : blankState();
}
export async function changeState(transform) {
  return db.transaction("rw", db.workspace, async () => {
    const current = await readState();
    const next = stateSchema.parse(transform(current));
    await db.workspace.put({ id: "main", data: next });
    return next;
  });
}

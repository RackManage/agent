import { getConfigData } from "../db"

type RealtimeContext = {
  agentUid: null | string,
  clientId: string,
  workspaceId: string,
  workspaceType: "team" | "user",
}

async function getRealtimeContext(db: any): Promise<RealtimeContext> {
  const clientId = (await getConfigData(db, "clientId")) || (await getConfigData(db, "deviceId"));
  const legacyTeamId = await getConfigData(db, "teamId");
  const workspaceId = (await getConfigData(db, "workspaceId")) || legacyTeamId;
  const workspaceType = (await getConfigData(db, "workspaceType")) || (legacyTeamId ? "team" : null);
  const agentUid = await getConfigData(db, "agentUid");

  if (!clientId || !workspaceId || (workspaceType !== "team" && workspaceType !== "user")) {
    throw new Error("Missing realtime context. Please log in again.");
  }

  return {
    agentUid,
    clientId,
    workspaceId,
    workspaceType,
  };
}

function workspaceRoot(context: RealtimeContext) {
  return `${context.workspaceType === "team" ? "teams" : "users"}/${context.workspaceId}`;
}

function agentPresencePath(context: RealtimeContext) {
  return `${workspaceRoot(context)}/agents/${context.clientId}`;
}

function monitorPath(context: RealtimeContext, statusId: string) {
  return `${workspaceRoot(context)}/monitor/${statusId}`;
}

function commandsPath(context: RealtimeContext) {
  return `${agentPresencePath(context)}/commands`;
}

function commandPath(context: RealtimeContext, commandId: string) {
  return `${commandsPath(context)}/${commandId}`;
}

export {
  agentPresencePath,
  commandPath,
  commandsPath,
  getRealtimeContext,
  monitorPath,
};

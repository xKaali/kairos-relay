import { supabaseAdmin } from './supabase'

export type RelayEventType =
  | 'CAPABILITY_REGISTERED'
  | 'CAPABILITY_UPDATED'
  | 'CAPABILITY_DEACTIVATED'
  | 'DELEGATION_ISSUED'
  | 'DELEGATION_USED'
  | 'DELEGATION_REVOKED'
  | 'HANDSHAKE_INITIATED'
  | 'HANDSHAKE_ACCEPTED'
  | 'HANDSHAKE_REJECTED'

interface LogEventParams {
  eventType: RelayEventType
  fromDid?: string
  toDid?: string
  capabilityId?: string
  delegationId?: string
  handshakeId?: string
  metadata?: Record<string, unknown>
}

export async function logRelayEvent(params: LogEventParams): Promise<void> {
  const { error } = await supabaseAdmin.from('relay_events').insert({
    event_type: params.eventType,
    from_did: params.fromDid ?? null,
    to_did: params.toDid ?? null,
    capability_id: params.capabilityId ?? null,
    delegation_id: params.delegationId ?? null,
    handshake_id: params.handshakeId ?? null,
    metadata: params.metadata ?? null,
  })

  if (error) {
    console.error('[RelayEvent] Failed to log event:', params.eventType, error.message)
  }
}

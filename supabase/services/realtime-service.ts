import { RealtimeChannel } from "@supabase/supabase-js";
import { SupabaseServiceV2 } from "./supabaseServicev2";

/**
 * Interface for the callbacks
 */
export interface RealtimeCallbacks<T> {
	onInsert?: (newRecord: T) => void;
	onUpdate?: (newRecord: T, oldRecord: Partial<T>) => void;
	onDelete?: (oldRecord: Partial<T>) => void;
}

/**
 * Subscribes to a realtime service for a table
 *
 * the class is not at all a singleton as it needs a specfic state that is table name and realtime callbacks
 *
 * This is a generic class because each table already has a fix schema so T is a valid choice here
 * Also this works in minimal form too because minimal form are just stripped down version of big schema
 */
export class SupabaseRealtimeService<T> {
	private tablename: string;
	private callbacks: RealtimeCallbacks<T>;

	public constructor(tableName: string, callbacks: RealtimeCallbacks<T>) {
		// initialize the subscription here using the tableName and callbacks
		this.tablename = tableName;
		this.callbacks = callbacks;
	}

	private channel!: RealtimeChannel;

	async subscribe() {
		const client = await SupabaseServiceV2.getClient();
		this.channel = client
			.channel(`public:${this.tablename}`)
			.on(
				"postgres_changes",
				{
					event: "*",
					schema: "public",
					table: this.tablename,
				},
				(payload) => {
					const {
						eventType,
						new: newRecord,
						old: oldRecord,
					} = payload;
					console.log(
						`Realtime event received: ${eventType} for table ${this.tablename}`,
						payload,
					);

					switch (eventType) {
						case "INSERT":
							this.callbacks.onInsert?.(newRecord as T);
							break;
						case "UPDATE":
							this.callbacks.onUpdate?.(
								newRecord as T,
								oldRecord as Partial<T>,
							);
							break;
						case "DELETE":
							this.callbacks.onDelete?.(oldRecord as Partial<T>);
							break;
					}
				},
			)
			.subscribe();
	}

	/**
	 * Helper to unsubscribe a specific channel
	 */
	async unsubscribe() {
		const client = await SupabaseServiceV2.getClient();
		client.removeChannel(this.channel);
	}
}

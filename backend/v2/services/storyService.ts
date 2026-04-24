/**
 * Legacy compat alias. Minimal storage upload helper used by story and photo
 * editors. Prefer calling Supabase storage directly from new code.
 */

import { createBrowserClient } from "@/supabase/client";

export const storyService = {
	async uploadPublicFile(
		bucket: string,
		path: string,
		file: File,
	): Promise<{ publicUrl: string } | null> {
		try {
			const supabase = createBrowserClient();
			const { error } = await supabase.storage
				.from(bucket)
				.upload(path, file, { upsert: true });
			if (error) return null;
			const { data } = supabase.storage.from(bucket).getPublicUrl(path);
			return { publicUrl: data.publicUrl };
		} catch {
			return null;
		}
	},
};

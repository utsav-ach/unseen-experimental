/**
 * LEGACY SHIM: storyService
 * See backend/v2/stores/useStoryStore.ts header for migration guidance.
 */

export const storyService = {
	async uploadPublicFile(
		_bucket: string,
		_path: string,
		_file: any,
	): Promise<{ publicUrl: string } | null> {
		return null;
	},
};

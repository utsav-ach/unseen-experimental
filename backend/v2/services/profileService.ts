/**
 * LEGACY SHIM: profileService
 * See backend/v2/stores/useProfileStore.ts header for migration guidance.
 */

export const profileService = {
	async update(_userId: string, _payload: any): Promise<any> {
		return undefined;
	},
	async updateWithFiles(
		_userId: string,
		_payload: any,
		_files: any,
	): Promise<any> {
		return undefined;
	},
};

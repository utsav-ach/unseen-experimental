/**
 * LEGACY SHIM: guideService
 * See backend/v2/stores/useGuideStore.ts header for migration guidance.
 * Prefer importing GuideService (PascalCase static class) from guide-services.ts.
 */

export const guideService = {
	async getByUserId(_userId: string): Promise<any> {
		return undefined;
	},
	async updateGuide(_userId: string, _payload: any): Promise<any> {
		return undefined;
	},
};

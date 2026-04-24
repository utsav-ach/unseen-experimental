import { SupabaseClient } from "@supabase/supabase-js";
import { ServiceFailure, SupabaseServiceV2 } from "./supabaseServicev2";

export interface FilePayload {
	confidential?: File | File[] | undefined;
	public?: File | File[] | undefined;
}

export interface FileUploadResult {
	public: string[]; // array of public URLs
	confidential: string[]; // array of paths for private files
}

export class SupabaseStorageService {
	private static instance: SupabaseStorageService;
	private constructor() {}

	protected static async getClient(): Promise<SupabaseClient> {
		return SupabaseServiceV2.getClient();
	}

	private static extractPayload(filePayload: FilePayload): {
		public: File[];
		confidential: File[];
	} {
		const { confidential, public: publicFiles } = filePayload;

		return {
			public: publicFiles
				? Array.isArray(publicFiles)
					? publicFiles
					: [publicFiles]
				: [],
			confidential: confidential
				? Array.isArray(confidential)
					? confidential
					: [confidential]
				: [],
		};
	}

	public static async upload(
		bucket: string,
		pathPrefix: string,
		filePayload: FilePayload,
	): Promise<FileUploadResult> {
		const { public: publicFiles, confidential: confidentialFiles } =
			this.extractPayload(filePayload);

		const [publicUrls, confidentialPaths] = await Promise.all([
			this._uploadPublic(publicFiles, bucket, pathPrefix),
			this._uploadPrivate(confidentialFiles, bucket, pathPrefix),
		]);

		return {
			public: publicUrls,
			confidential: confidentialPaths,
		};
	}

	/**
	 * Unified upload method that handles both public and private types
	 * Returns array of URLs
	 */
	private static async _upload(
		files: File[],
		bucket: string,
		pathPrefix: string = "",
		isPublic: boolean = true,
	): Promise<string[]> {
		const client = await this.getClient();

		const uploadPromises = files.map(async (file) => {
			try {
				const fileName = `${crypto.randomUUID()}.${file.name.split(".").pop()}`;
				const filePath = pathPrefix
					? `${pathPrefix}/${fileName}`
					: fileName;

				const { error } = await client.storage
					.from(bucket)
					.upload(filePath, file);

				if (error) {
					throw new ServiceFailure(
						"SUPABASE",
						"File upload failed",
						error,
						"STORAGE:UPLOAD",
					);
				}

				if (isPublic) {
					const { data } = client.storage
						.from(bucket)
						.getPublicUrl(filePath);

					if (!data?.publicUrl) {
						throw new ServiceFailure(
							"SUPABASE",
							"Failed to generate public URL",
							null,
							"STORAGE:PUBLIC_URL",
						);
					}

					return data.publicUrl;
				}

				return filePath;
			} catch (err) {
				// normalize EVERYTHING into ServiceFailure
				if (err instanceof ServiceFailure) throw err;

				throw new ServiceFailure(
					"UNKNOWN",
					"Unexpected storage error",
					err,
					"STORAGE:UPLOAD",
				);
			}
		});

		return Promise.all(uploadPromises);
	}

	/**
	 * Upload is by default public and returns array of urls
	 *
	 * for more secure method refer to,  uploadPrivate method
	 */
	private static async _uploadPublic(
		files: File[],
		bucket: string,
		pathPrefix = "",
	): Promise<string[]> {
		return this._upload(files, bucket, pathPrefix, true);
	}

	private static async _uploadPrivate(
		files: File[],
		bucket: string,
		pathPrefix = "",
	): Promise<string[]> {
		return this._upload(files, bucket, pathPrefix, false);
	}

	public static async getSignedUrl(path: string, expiresIn = 60) {
		const client = await this.getClient();

		const { data, error } = await client.storage
			.from("vault")
			.createSignedUrl(path, expiresIn);

		if (error) {
			throw new ServiceFailure(
				"SUPABASE",
				"Failed to create signed URL",
				error,
				"STORAGE:SIGNED_URL",
			);
		}

		return data.signedUrl;
	}

	public static async getPublicUrl(bucket: string, path: string) {
		const client = await this.getClient();

		const { data } = client.storage.from(bucket).getPublicUrl(path);

		if (data.publicUrl === null) {
			throw new ServiceFailure(
				"SUPABASE",
				"Failed to get public URL",
				null,
				"STORAGE:PUBLIC_URL",
			);
		}

		return data.publicUrl;
	}

	public static async downloadFile(
		bucket: string,
		path: string,
	): Promise<Blob> {
		const client = await this.getClient();

		const { data, error } = await client.storage
			.from(bucket)
			.download(path);

		if (error) {
			throw new ServiceFailure(
				"SUPABASE",
				"Failed to download file",
				error,
				"STORAGE:DOWNLOAD",
			);
		}

		return data;
	}

	public static async deleteFiles(bucket: string, paths: string[]) {
		const client = await this.getClient();

		const { error } = await client.storage.from(bucket).remove(paths);

		if (error) {
			throw new ServiceFailure(
				"SUPABASE",
				"Failed to delete files",
				error,
				"STORAGE:DELETE",
			);
		}
	}
}

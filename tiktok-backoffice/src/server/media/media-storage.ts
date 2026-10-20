/** Port for object storage. Returns the public URL of the stored object. */
export interface MediaStorage {
  put(params: { key: string; body: Buffer; contentType: string }): Promise<string>;
}

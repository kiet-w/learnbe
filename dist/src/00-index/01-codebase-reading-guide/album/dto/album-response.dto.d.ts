export declare class AlbumResponseDto {
    id: string;
    title: string;
    artist?: string | null;
    coverUrl?: string | null;
    isDefault: boolean;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
}

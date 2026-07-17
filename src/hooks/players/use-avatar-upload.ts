import { useState } from "react";
import * as ImagePicker from "expo-image-picker";
import { createAvatarUploadUrl } from "@/api/generated/hooks/playersHooks";
import type { CreateAvatarUploadUrlMutationRequest } from "@/api/generated/types/CreateAvatarUploadUrl";
import { useUpdateMyPlayer } from "./use-update-my-player";

const CONTENT_TYPE_BY_EXT: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

function resolveContentType(asset: ImagePicker.ImagePickerAsset): string {
  if (asset.mimeType && CONTENT_TYPE_BY_EXT[asset.mimeType.split("/")[1] ?? ""]) {
    return asset.mimeType;
  }
  const ext = asset.uri.split(".").pop()?.toLowerCase() ?? "jpg";
  return CONTENT_TYPE_BY_EXT[ext] ?? "image/jpeg";
}

/**
 * Fluxo de foto de perfil: abre a galeria (expo-image-picker), pede um
 * presigned PUT ao backend (`createAvatarUploadUrl`), sobe o arquivo direto pro
 * R2, e persiste a `publicUrl` via `PATCH /players/me { avatarUrl }`. Retorna
 * `pickAndUpload` (no-op se o usuário cancelar) e `uploading`.
 */
export function useAvatarUpload() {
  const updateMyPlayer = useUpdateMyPlayer();
  const [uploading, setUploading] = useState(false);

  const pickAndUpload = async (): Promise<void> => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;

    const picked = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (picked.canceled || !picked.assets[0]) return;

    const asset = picked.assets[0];
    const contentType = resolveContentType(asset);

    setUploading(true);
    try {
      const { uploadUrl, publicUrl } = await createAvatarUploadUrl({
        contentType: contentType as CreateAvatarUploadUrlMutationRequest["contentType"],
      });

      const blob = await (await fetch(asset.uri)).blob();
      const put = await fetch(uploadUrl, {
        method: "PUT",
        body: blob,
        headers: { "Content-Type": contentType },
      });
      if (!put.ok) throw new Error(`avatar_upload_failed_${put.status}`);

      await updateMyPlayer.mutateAsync({ avatarUrl: publicUrl });
    } finally {
      setUploading(false);
    }
  };

  return { pickAndUpload, uploading };
}

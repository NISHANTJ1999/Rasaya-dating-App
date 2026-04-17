import { View, Text, Pressable, Alert } from "react-native";
import { router } from "expo-router";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { StepContainer } from "@/components/onboarding/StepContainer";
import { useAuthStore } from "@/lib/stores/auth-store";

const MAX_PHOTOS = 6;
const MIN_PHOTOS = 2;

export default function PhotosStep() {
  const { onboardingData, updateOnboarding } = useAuthStore();
  const photos = onboardingData.photos;

  const pickImage = async (index: number) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const newPhotos = [...photos];
      const existing = newPhotos.findIndex((p) => p.order === index);
      const photo = {
        id: `photo_${index}`,
        uri: result.assets[0].uri,
        order: index,
      };

      if (existing >= 0) {
        newPhotos[existing] = photo;
      } else {
        newPhotos.push(photo);
      }

      updateOnboarding({ photos: newPhotos });
    }
  };

  const removePhoto = (index: number) => {
    const newPhotos = photos.filter((p) => p.order !== index);
    updateOnboarding({ photos: newPhotos });
  };

  const getPhotoForSlot = (index: number) => {
    return photos.find((p) => p.order === index);
  };

  return (
    <StepContainer
      step={4}
      title="Add your best photos"
      subtitle={`At least ${MIN_PHOTOS} photos required. Add up to ${MAX_PHOTOS}.`}
      canContinue={photos.length >= MIN_PHOTOS}
      onContinue={() => router.push("/(onboarding)/city")}
    >
      <View className="mt-6">
        <View className="flex-row flex-wrap gap-3">
          {Array.from({ length: MAX_PHOTOS }).map((_, index) => {
            const photo = getPhotoForSlot(index);
            const isRequired = index < MIN_PHOTOS;

            return (
              <View
                key={index}
                className="relative"
                style={{ width: "30.5%", aspectRatio: 3 / 4 }}
              >
                {photo ? (
                  <Pressable
                    onLongPress={() => {
                      Alert.alert("Remove photo?", "", [
                        { text: "Cancel", style: "cancel" },
                        { text: "Remove", style: "destructive", onPress: () => removePhoto(index) },
                      ]);
                    }}
                    className="flex-1 rounded-card overflow-hidden"
                  >
                    <Image
                      source={{ uri: photo.uri }}
                      style={{ width: "100%", height: "100%" }}
                      contentFit="cover"
                    />
                    <View className="absolute top-2 right-2 w-6 h-6 bg-black/50 rounded-full items-center justify-center">
                      <Pressable onPress={() => removePhoto(index)}>
                        <Ionicons name="close" size={14} color="#FFFFFF" />
                      </Pressable>
                    </View>
                  </Pressable>
                ) : (
                  <Pressable
                    onPress={() => pickImage(index)}
                    className={`flex-1 rounded-card border-2 border-dashed items-center justify-center ${
                      isRequired ? "border-primary-300 bg-primary-50" : "border-neutral-300 dark:border-neutral-600 bg-neutral-50 dark:bg-neutral-800"
                    }`}
                  >
                    <View className="w-10 h-10 rounded-full bg-primary-500 items-center justify-center mb-1">
                      <Ionicons name="add" size={24} color="#FFFFFF" />
                    </View>
                    {isRequired && (
                      <Text className="text-xs text-primary-500 font-medium">Required</Text>
                    )}
                  </Pressable>
                )}

                {/* Photo number badge */}
                <View className="absolute top-2 left-2 w-6 h-6 bg-black/50 rounded-full items-center justify-center">
                  <Text className="text-xs text-white font-bold">{index + 1}</Text>
                </View>
              </View>
            );
          })}
        </View>

        <Text className="text-xs text-neutral-400 text-center mt-4">
          Tip: Photos with your face clearly visible get 3x more likes
        </Text>
      </View>
    </StepContainer>
  );
}

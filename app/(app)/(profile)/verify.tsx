import { View, Text, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useState, useRef } from "react";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Image } from "expo-image";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "@/components/ui/Button";
import { useAuthStore } from "@/lib/stores/auth-store";

type VerificationStep = "intro" | "camera" | "review" | "processing" | "complete";

const POSE_INSTRUCTIONS = [
  "Look straight at the camera",
  "Turn your head slightly to the left",
  "Smile naturally",
];

export default function VerifyScreen() {
  const [step, setStep] = useState<VerificationStep>("intro");
  const [currentPose, setCurrentPose] = useState(0);
  const [photos, setPhotos] = useState<string[]>([]);
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const user = useAuthStore((s) => s.user);

  const takeSelfie = async () => {
    if (!cameraRef.current) return;

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
      });

      if (photo?.uri) {
        const newPhotos = [...photos, photo.uri];
        setPhotos(newPhotos);

        if (currentPose < POSE_INSTRUCTIONS.length - 1) {
          setCurrentPose(currentPose + 1);
        } else {
          setStep("review");
        }
      }
    } catch (error) {
      console.error("Failed to take photo:", error);
    }
  };

  const handleSubmit = async () => {
    setStep("processing");
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Simulate verification processing
    await new Promise((resolve) => setTimeout(resolve, 3000));

    setStep("complete");
  };

  const handleRetry = () => {
    setPhotos([]);
    setCurrentPose(0);
    setStep("camera");
  };

  // Permission not granted yet
  if (!permission?.granted && step === "camera") {
    return (
      <SafeAreaView className="flex-1 bg-white dark:bg-neutral-900">
        <View className="flex-1 items-center justify-center px-8">
          <Ionicons name="camera-outline" size={64} color="#A3A3A3" />
          <Text className="text-xl font-bold text-neutral-900 dark:text-white text-center mt-4 mb-2">
            Camera Access Needed
          </Text>
          <Text className="text-base text-neutral-500 text-center mb-6">
            We need access to your camera to verify your identity with a selfie.
          </Text>
          <Button title="Grant Camera Access" onPress={requestPermission} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-neutral-900">
      {/* Header */}
      <View className="flex-row items-center px-5 py-4">
        <Pressable onPress={() => router.back()} className="mr-3 p-1">
          <Ionicons name="arrow-back" size={24} color="#171717" />
        </Pressable>
        <Text className="text-xl font-bold text-neutral-900 dark:text-white">
          Verify Your Profile
        </Text>
      </View>

      {/* Intro Step */}
      {step === "intro" && (
        <View className="flex-1 px-6 items-center justify-center">
          <View className="w-24 h-24 rounded-full bg-blue-100 items-center justify-center mb-6">
            <Ionicons name="shield-checkmark" size={48} color="#3B82F6" />
          </View>
          <Text className="text-2xl font-bold text-neutral-900 dark:text-white text-center mb-3">
            Get Verified
          </Text>
          <Text className="text-base text-neutral-500 text-center leading-6 mb-2">
            Verified profiles get 40% more matches. We'll ask you to take 3 quick selfies to confirm you match your photos.
          </Text>

          <View className="w-full mt-8 gap-4">
            {POSE_INSTRUCTIONS.map((instruction, i) => (
              <View key={i} className="flex-row items-center gap-3">
                <View className="w-8 h-8 rounded-full bg-primary-100 items-center justify-center">
                  <Text className="text-sm font-bold text-primary-500">{i + 1}</Text>
                </View>
                <Text className="text-base text-neutral-700 dark:text-neutral-300">
                  {instruction}
                </Text>
              </View>
            ))}
          </View>

          <View className="w-full mt-auto pb-6">
            <Button
              title="Start Verification"
              onPress={async () => {
                if (!permission?.granted) {
                  await requestPermission();
                }
                setStep("camera");
              }}
              icon="camera"
            />
          </View>
        </View>
      )}

      {/* Camera Step */}
      {step === "camera" && permission?.granted && (
        <View className="flex-1">
          <CameraView
            ref={cameraRef}
            facing="front"
            style={{ flex: 1 }}
          >
            {/* Overlay */}
            <View className="flex-1 items-center justify-between py-8">
              {/* Instruction */}
              <View className="bg-black/60 px-6 py-3 rounded-full">
                <Text className="text-base font-semibold text-white">
                  {POSE_INSTRUCTIONS[currentPose]}
                </Text>
              </View>

              {/* Face guide oval */}
              <View
                className="w-64 h-80 rounded-full border-4 border-white/40"
                style={{ borderStyle: "dashed" }}
              />

              {/* Bottom controls */}
              <View className="items-center gap-3">
                <Text className="text-sm text-white/80">
                  Photo {currentPose + 1} of {POSE_INSTRUCTIONS.length}
                </Text>
                <Pressable
                  onPress={takeSelfie}
                  className="w-20 h-20 rounded-full border-4 border-white items-center justify-center"
                >
                  <View className="w-16 h-16 rounded-full bg-white" />
                </Pressable>
              </View>
            </View>
          </CameraView>
        </View>
      )}

      {/* Review Step */}
      {step === "review" && (
        <View className="flex-1 px-6">
          <Text className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
            Review your selfies
          </Text>
          <View className="flex-row gap-3 mb-6">
            {photos.map((uri, i) => (
              <View key={i} className="flex-1 aspect-square rounded-card overflow-hidden">
                <Image
                  source={{ uri }}
                  style={{ width: "100%", height: "100%" }}
                  contentFit="cover"
                />
              </View>
            ))}
          </View>
          <Text className="text-sm text-neutral-500 text-center mb-8">
            Make sure your face is clearly visible in all photos. These will be used to verify your identity and won't be shown on your profile.
          </Text>
          <View className="mt-auto pb-6 gap-3">
            <Button title="Submit for Verification" onPress={handleSubmit} />
            <Pressable onPress={handleRetry} className="py-3 items-center">
              <Text className="text-base font-medium text-primary-500">Retake Photos</Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* Processing Step */}
      {step === "processing" && (
        <View className="flex-1 items-center justify-center px-8">
          <View className="w-20 h-20 rounded-full bg-primary-100 items-center justify-center mb-6">
            <Ionicons name="hourglass" size={36} color="#FF6B35" />
          </View>
          <Text className="text-xl font-bold text-neutral-900 dark:text-white text-center mb-2">
            Verifying...
          </Text>
          <Text className="text-base text-neutral-500 text-center">
            We're comparing your selfies with your profile photos. This usually takes a few seconds.
          </Text>
        </View>
      )}

      {/* Complete Step */}
      {step === "complete" && (
        <View className="flex-1 items-center justify-center px-8">
          <View className="w-24 h-24 rounded-full bg-green-100 items-center justify-center mb-6">
            <Ionicons name="checkmark-circle" size={56} color="#22C55E" />
          </View>
          <Text className="text-2xl font-bold text-neutral-900 dark:text-white text-center mb-2">
            You're Verified!
          </Text>
          <Text className="text-base text-neutral-500 text-center leading-6">
            Your profile now shows a verification badge. Verified profiles get significantly more matches!
          </Text>
          <View className="w-full mt-8">
            <Button title="Back to Profile" onPress={() => router.back()} />
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

import { View, Text, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useState, useRef } from "react";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Image } from "expo-image";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Button } from "@/components/ui/Button";
import { useAuthStore } from "@/lib/stores/auth-store";

type Step = "intro" | "camera" | "review" | "processing" | "complete";

const POSE_INSTRUCTIONS = [
  { text: "Look straight at the camera", icon: "person" as const },
  { text: "Turn your head slightly left", icon: "arrow-back" as const },
  { text: "Smile naturally", icon: "happy" as const },
];

export default function MandatoryVerifyScreen() {
  const [step, setStep] = useState<Step>("intro");
  const [currentPose, setCurrentPose] = useState(0);
  const [photos, setPhotos] = useState<string[]>([]);
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const { completeVerification } = useAuthStore();

  const takeSelfie = async () => {
    if (!cameraRef.current) return;

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.8 });

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

    try {
      await completeVerification(photos);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setStep("complete");
    } catch (error) {
      console.error("Verification failed:", error);
      setStep("review");
    }
  };

  const handleRetry = () => {
    setPhotos([]);
    setCurrentPose(0);
    setStep("camera");
  };

  const handleEnterApp = () => {
    router.replace("/(app)/(discover)");
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-neutral-900">
      {/* Progress Header - Step 9 of 9 */}
      {step !== "camera" && (
        <View className="px-6 pt-2 pb-4">
          <View className="flex-row items-center mb-4">
            <View className="flex-1">
              <ProgressBar current={9} total={9} />
            </View>
            <Text className="ml-3 text-sm text-neutral-400 font-medium">9/9</Text>
          </View>
        </View>
      )}

      {/* INTRO */}
      {step === "intro" && (
        <View className="flex-1 px-6">
          <Text className="text-2xl font-bold text-neutral-900 dark:text-white">
            Verify your identity
          </Text>
          <Text className="text-base text-neutral-500 mt-1 mb-6">
            This is required to protect our community. No bots, no fakes.
          </Text>

          {/* Shield Icon */}
          <View className="items-center my-6">
            <View className="w-28 h-28 rounded-full bg-blue-50 items-center justify-center">
              <Ionicons name="shield-checkmark" size={56} color="#3B82F6" />
            </View>
          </View>

          {/* Why Verification */}
          <View className="bg-neutral-50 dark:bg-neutral-800 rounded-card p-5 mb-6">
            <Text className="text-base font-semibold text-neutral-900 dark:text-white mb-3">
              Why is this required?
            </Text>
            {[
              { icon: "people" as const, text: "Keeps the community safe and real" },
              { icon: "ban" as const, text: "Blocks bots and fake profiles" },
              { icon: "heart" as const, text: "Verified profiles get 40% more matches" },
              { icon: "lock-closed" as const, text: "Your selfies are private and encrypted" },
            ].map((item) => (
              <View key={item.text} className="flex-row items-center gap-3 mb-2.5 last:mb-0">
                <Ionicons name={item.icon} size={18} color="#FF6B35" />
                <Text className="text-sm text-neutral-700 dark:text-neutral-300 flex-1">
                  {item.text}
                </Text>
              </View>
            ))}
          </View>

          {/* Steps Preview */}
          <Text className="text-sm font-semibold text-neutral-600 dark:text-neutral-400 mb-2">
            You'll take 3 quick selfies:
          </Text>
          {POSE_INSTRUCTIONS.map((pose, i) => (
            <View key={i} className="flex-row items-center gap-3 mb-2">
              <View className="w-7 h-7 rounded-full bg-primary-100 items-center justify-center">
                <Text className="text-xs font-bold text-primary-500">{i + 1}</Text>
              </View>
              <Text className="text-sm text-neutral-600 dark:text-neutral-400">
                {pose.text}
              </Text>
            </View>
          ))}

          <View className="mt-auto pb-6">
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

      {/* CAMERA */}
      {step === "camera" && (
        <>
          {!permission?.granted ? (
            <View className="flex-1 items-center justify-center px-8">
              <Ionicons name="camera-outline" size={64} color="#A3A3A3" />
              <Text className="text-xl font-bold text-neutral-900 dark:text-white text-center mt-4 mb-2">
                Camera Access Required
              </Text>
              <Text className="text-base text-neutral-500 text-center mb-6">
                Verification requires camera access. This is mandatory to use Rasaya.
              </Text>
              <Button title="Grant Camera Access" onPress={requestPermission} />
            </View>
          ) : (
            <View className="flex-1">
              <CameraView ref={cameraRef} facing="front" style={{ flex: 1 }}>
                <View className="flex-1 items-center justify-between py-8">
                  {/* Instruction Banner */}
                  <View className="bg-black/60 px-6 py-3 rounded-full flex-row items-center gap-2">
                    <Ionicons
                      name={POSE_INSTRUCTIONS[currentPose].icon}
                      size={18}
                      color="#FFFFFF"
                    />
                    <Text className="text-base font-semibold text-white">
                      {POSE_INSTRUCTIONS[currentPose].text}
                    </Text>
                  </View>

                  {/* Face Guide */}
                  <View
                    className="w-64 h-80 rounded-full border-4 border-white/40"
                    style={{ borderStyle: "dashed" }}
                  />

                  {/* Bottom Controls */}
                  <View className="items-center gap-3">
                    {/* Dots Progress */}
                    <View className="flex-row gap-2">
                      {POSE_INSTRUCTIONS.map((_, i) => (
                        <View
                          key={i}
                          className={`w-2.5 h-2.5 rounded-full ${
                            i < currentPose
                              ? "bg-green-400"
                              : i === currentPose
                                ? "bg-white"
                                : "bg-white/40"
                          }`}
                        />
                      ))}
                    </View>
                    <Text className="text-sm text-white/80">
                      Selfie {currentPose + 1} of {POSE_INSTRUCTIONS.length}
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
        </>
      )}

      {/* REVIEW */}
      {step === "review" && (
        <View className="flex-1 px-6">
          <Text className="text-2xl font-bold text-neutral-900 dark:text-white mb-1">
            Review your selfies
          </Text>
          <Text className="text-base text-neutral-500 mb-4">
            Make sure your face is clearly visible in all photos.
          </Text>

          <View className="flex-row gap-3 mb-6">
            {photos.map((uri, i) => (
              <View key={i} className="flex-1 aspect-square rounded-card overflow-hidden relative">
                <Image
                  source={{ uri }}
                  style={{ width: "100%", height: "100%" }}
                  contentFit="cover"
                />
                <View className="absolute top-2 left-2 w-6 h-6 rounded-full bg-green-500 items-center justify-center">
                  <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                </View>
              </View>
            ))}
          </View>

          <View className="bg-blue-50 dark:bg-blue-900/20 rounded-card p-4 mb-4">
            <View className="flex-row items-start gap-2">
              <Ionicons name="lock-closed" size={16} color="#3B82F6" />
              <Text className="text-sm text-blue-700 dark:text-blue-300 flex-1">
                Your verification selfies are private and will never appear on your profile. They are only used to confirm your identity.
              </Text>
            </View>
          </View>

          <View className="mt-auto pb-6 gap-3">
            <Button title="Submit & Verify" onPress={handleSubmit} />
            <Pressable onPress={handleRetry} className="py-3 items-center">
              <Text className="text-base font-medium text-primary-500">Retake Photos</Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* PROCESSING */}
      {step === "processing" && (
        <View className="flex-1 items-center justify-center px-8">
          <View className="w-24 h-24 rounded-full bg-primary-100 items-center justify-center mb-6">
            <Ionicons name="hourglass" size={44} color="#FF6B35" />
          </View>
          <Text className="text-xl font-bold text-neutral-900 dark:text-white text-center mb-2">
            Verifying your identity...
          </Text>
          <Text className="text-base text-neutral-500 text-center">
            We're comparing your selfies with your profile photos. This usually takes a few seconds.
          </Text>
        </View>
      )}

      {/* COMPLETE */}
      {step === "complete" && (
        <View className="flex-1 items-center justify-center px-8">
          <View className="w-28 h-28 rounded-full bg-green-100 items-center justify-center mb-6">
            <Ionicons name="checkmark-circle" size={64} color="#22C55E" />
          </View>
          <Text className="text-3xl font-bold text-neutral-900 dark:text-white text-center mb-2">
            You're Verified!
          </Text>
          <Text className="text-base text-neutral-500 text-center leading-6 mb-2">
            Welcome to Rasaya. Your profile now has a verification badge. You can start discovering real people in your city.
          </Text>

          <View className="w-full mt-8">
            <Button title="Start Exploring" onPress={handleEnterApp} icon="flame" />
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

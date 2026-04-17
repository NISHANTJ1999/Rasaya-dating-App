import { View, Text, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useState, useRef } from "react";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { Button } from "@/components/ui/Button";
import { useAuthStore } from "@/lib/stores/auth-store";
import { validateSelfie } from "@/lib/photo-validation";

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
  const [captureError, setCaptureError] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const completeVerification = useAuthStore((s) => s.completeVerification);

  const takeSelfie = async () => {
    if (!cameraRef.current || isCapturing) return;

    try {
      setIsCapturing(true);
      setCaptureError(null);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const photo = await cameraRef.current.takePictureAsync({ quality: 0.8 });
      if (!photo?.uri) return;

      // Validate with real face detection
      const result = await validateSelfie(photo.uri);

      if (!result.valid) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        setCaptureError(result.reason ?? "Selfie validation failed. Try again.");
        return;
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      const newPhotos = [...photos, photo.uri];
      setPhotos(newPhotos);

      if (currentPose < POSE_INSTRUCTIONS.length - 1) {
        setCurrentPose(currentPose + 1);
      } else {
        setStep("review");
      }
    } catch (error) {
      console.error("Failed to take photo:", error);
      setCaptureError("Camera error. Please try again.");
    } finally {
      setIsCapturing(false);
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
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setStep("review");
    }
  };

  const handleRetry = () => {
    setPhotos([]);
    setCurrentPose(0);
    setCaptureError(null);
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
          <Button title="Grant Camera Access" onPress={requestPermission} variant="gradient" />
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
          <Animated.View
            entering={FadeIn.duration(500)}
            className="w-24 h-24 rounded-full items-center justify-center mb-6 overflow-hidden"
          >
            <LinearGradient
              colors={["#3B82F6", "#7C3AED"]}
              style={{ width: 96, height: 96, borderRadius: 48, alignItems: "center", justifyContent: "center" }}
            >
              <Ionicons name="shield-checkmark" size={48} color="#FFFFFF" />
            </LinearGradient>
          </Animated.View>

          <Animated.Text
            entering={FadeInDown.delay(200).duration(400)}
            className="text-2xl font-bold text-neutral-900 dark:text-white text-center mb-3"
          >
            Get Verified
          </Animated.Text>
          <Animated.Text
            entering={FadeInDown.delay(300).duration(400)}
            className="text-base text-neutral-500 text-center leading-6 mb-2"
          >
            Verified profiles get 40% more matches. We'll ask you to take 3 quick selfies to confirm you match your photos.
          </Animated.Text>

          <View className="w-full mt-8 gap-4">
            {POSE_INSTRUCTIONS.map((instruction, i) => (
              <Animated.View
                key={i}
                entering={FadeInDown.delay(400 + i * 100).duration(400)}
                className="flex-row items-center gap-3"
              >
                <View className="w-8 h-8 rounded-full overflow-hidden">
                  <LinearGradient
                    colors={["#FF6B35", "#7C3AED"]}
                    style={{ width: 32, height: 32, alignItems: "center", justifyContent: "center" }}
                  >
                    <Text className="text-sm font-bold text-white">{i + 1}</Text>
                  </LinearGradient>
                </View>
                <Text className="text-base text-neutral-700 dark:text-neutral-300">
                  {instruction}
                </Text>
              </Animated.View>
            ))}
          </View>

          <View className="w-full mt-auto pb-6">
            <Button
              title="Start Verification"
              onPress={async () => {
                if (!permission?.granted) await requestPermission();
                setStep("camera");
              }}
              variant="gradient"
              icon="camera"
            />
          </View>
        </View>
      )}

      {/* Camera Step */}
      {step === "camera" && permission?.granted && (
        <View className="flex-1">
          <CameraView ref={cameraRef} facing="front" style={{ flex: 1 }}>
            <View className="flex-1 items-center justify-between py-8">
              {/* Instruction */}
              <View className="bg-black/60 px-6 py-3 rounded-full">
                <Text className="text-base font-semibold text-white">
                  {POSE_INSTRUCTIONS[currentPose]}
                </Text>
              </View>

              {/* Face guide oval — green when no error, red when error */}
              <View
                className="w-64 h-80 rounded-full"
                style={{
                  borderWidth: 4,
                  borderStyle: "dashed",
                  borderColor: captureError ? "rgba(239,68,68,0.8)" : "rgba(34,197,94,0.6)",
                }}
              />

              {/* Error message */}
              {captureError && (
                <View className="absolute top-1/2 mx-8 bg-red-500/90 px-4 py-2 rounded-xl">
                  <Text className="text-sm font-medium text-white text-center">{captureError}</Text>
                </View>
              )}

              {/* Bottom controls */}
              <View className="items-center gap-3">
                {/* Progress dots */}
                <View className="flex-row gap-2">
                  {POSE_INSTRUCTIONS.map((_, i) => (
                    <View
                      key={i}
                      className={`w-3 h-3 rounded-full ${
                        i < currentPose
                          ? "bg-green-500"
                          : i === currentPose
                            ? "bg-white"
                            : "bg-white/30"
                      }`}
                    />
                  ))}
                </View>
                <Text className="text-sm text-white/80">
                  Photo {currentPose + 1} of {POSE_INSTRUCTIONS.length}
                </Text>
                <Pressable
                  onPress={takeSelfie}
                  disabled={isCapturing}
                  className="w-20 h-20 rounded-full border-4 border-white items-center justify-center"
                  style={{ opacity: isCapturing ? 0.5 : 1 }}
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
              <View key={i} className="flex-1 aspect-square rounded-2xl overflow-hidden">
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
            <Button title="Submit for Verification" onPress={handleSubmit} variant="gradient" />
            <Pressable onPress={handleRetry} className="py-3 items-center">
              <Text className="text-base font-medium text-primary-500">Retake Photos</Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* Processing Step */}
      {step === "processing" && (
        <View className="flex-1 items-center justify-center px-8">
          <Animated.View entering={FadeIn.duration(500)} className="w-20 h-20 rounded-full overflow-hidden mb-6">
            <LinearGradient
              colors={["#FF6B35", "#7C3AED"]}
              style={{ width: 80, height: 80, borderRadius: 40, alignItems: "center", justifyContent: "center" }}
            >
              <Ionicons name="hourglass" size={36} color="#FFFFFF" />
            </LinearGradient>
          </Animated.View>
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
          <Animated.View entering={FadeIn.duration(500)} className="w-24 h-24 rounded-full overflow-hidden mb-6">
            <LinearGradient
              colors={["#22C55E", "#16A34A"]}
              style={{ width: 96, height: 96, borderRadius: 48, alignItems: "center", justifyContent: "center" }}
            >
              <Ionicons name="checkmark-circle" size={56} color="#FFFFFF" />
            </LinearGradient>
          </Animated.View>
          <Animated.Text
            entering={FadeInDown.delay(200).duration(400)}
            className="text-2xl font-bold text-neutral-900 dark:text-white text-center mb-2"
          >
            You're Verified!
          </Animated.Text>
          <Text className="text-base text-neutral-500 text-center leading-6">
            Your profile now shows a verification badge. Verified profiles get significantly more matches!
          </Text>
          <View className="w-full mt-8">
            <Button title="Back to Profile" onPress={() => router.back()} variant="gradient" />
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

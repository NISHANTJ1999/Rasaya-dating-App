import { View, Platform } from "react-native";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { COLORS } from "@/lib/constants";

function TabBarBackground() {
  if (Platform.OS === "ios") {
    return (
      <BlurView
        intensity={80}
        tint="light"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          overflow: "hidden",
        }}
      />
    );
  }
  return (
    <View
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(255,255,255,0.97)",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
      }}
    />
  );
}

function ActiveIndicator() {
  return (
    <LinearGradient
      colors={["#FF6B35", "#7C3AED"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={{ width: 20, height: 3, borderRadius: 2, marginTop: 4 }}
    />
  );
}

export default function AppLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: "#A3A3A3",
        tabBarStyle: {
          backgroundColor: "transparent",
          borderTopWidth: 0,
          height: 85,
          paddingBottom: 25,
          paddingTop: 10,
          elevation: 0,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.08,
          shadowRadius: 12,
        },
        tabBarBackground: TabBarBackground,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
        },
      }}
    >
      <Tabs.Screen
        name="(discover)"
        options={{
          title: "Discover",
          tabBarIcon: ({ color, size, focused }) => (
            <View className="items-center">
              <Ionicons name="flame" size={size} color={color} />
              {focused && <ActiveIndicator />}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="(likes)"
        options={{
          title: "Likes",
          tabBarIcon: ({ color, size, focused }) => (
            <View className="items-center">
              <Ionicons name="heart" size={size} color={color} />
              {focused && <ActiveIndicator />}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="(matches)"
        options={{
          title: "Chat",
          tabBarIcon: ({ color, size, focused }) => (
            <View className="items-center">
              <Ionicons name="chatbubbles" size={size} color={color} />
              {focused && <ActiveIndicator />}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="(profile)"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size, focused }) => (
            <View className="items-center">
              <Ionicons name="person" size={size} color={color} />
              {focused && <ActiveIndicator />}
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

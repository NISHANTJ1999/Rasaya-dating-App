export type SwipeAction = "like" | "nope" | "superlike";
export type LikeTargetType = "profile" | "photo" | "prompt";

export interface LikeTarget {
  type: LikeTargetType;
  photoIndex?: number;
  promptId?: string;
  comment?: string;
}

export interface Swipe {
  swiperId: string;
  targetId: string;
  action: SwipeAction;
  likeTarget?: LikeTarget;
  createdAt: string;
}

export interface MatchUser {
  firstName: string;
  photoUrl: string;
  age: number;
}

export interface Match {
  matchId: string;
  userIds: [string, string];
  users: Record<string, MatchUser>;
  initialLike?: LikeTarget & { likerId: string };
  lastMessage?: {
    text: string;
    senderId: string;
    sentAt: string;
  };
  matchedAt: string;
  isActive: boolean;
}

export interface Message {
  messageId: string;
  senderId: string;
  text: string;
  type: "text" | "image";
  imageUrl?: string;
  createdAt: string;
  readAt?: string;
}

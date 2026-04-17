import * as admin from "firebase-admin";
admin.initializeApp();

export { verifyPhotosOnSubmit } from "./moderation/verifyPhotos";
export { scanMessageOnCreate } from "./moderation/scanMessage";
export { reviewReportsOnCreate } from "./moderation/reviewReports";

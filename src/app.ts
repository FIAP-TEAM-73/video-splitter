import { uploadVideoHandler, splitVideoHandler, findVideoProcessingHandler, loginHandler, signupHandler, downloadVideoHandler } from "./handlers";

export const handler = {
  uploadVideo: uploadVideoHandler,
  splitVideo: splitVideoHandler,
  findVideo: findVideoProcessingHandler,
  login: loginHandler,
  signup: signupHandler,
  downloadVideo: downloadVideoHandler
};
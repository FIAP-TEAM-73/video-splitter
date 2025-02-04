import { uploadVideoHandler, splitVideoHandler, findVideoProcessingHandler, loginHandler, signupHandler } from "./handlers";

export const handler = {
  uploadVideo: uploadVideoHandler,
  splitVideo: splitVideoHandler,
  findVideo: findVideoProcessingHandler,
  login: loginHandler,
  signup: signupHandler
};
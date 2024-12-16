import multer, { Multer } from "multer";

export const uploader = (): Multer => {
  return multer({
    storage: multer.memoryStorage(),
  });
};

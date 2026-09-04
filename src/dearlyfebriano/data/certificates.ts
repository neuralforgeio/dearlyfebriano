import type { Certificate } from "@/dearlyfebriano/types";
import { DRIVE_FOLDER_URL, driveImageUrl, driveViewUrl } from "@/dearlyfebriano/lib/drive";

/* ============================================================
 * CERTIFICATES DATA
 * ------------------------------------------------------------
 * Sumber UTAMA sertifikat adalah folder Google Drive user
 * (live-sync via /api/certificates — file baru otomatis muncul).
 * Data statis di bawah ini dipakai sebagai FALLBACK bila Drive
 * tidak terjangkau, sekaligus metadata kurated (issuer, tanggal,
 * kategori) untuk file yang sudah dikenal.
 *
 * Folder Drive: 1mfKr3F1EITWK6cXEfybwE4obZD5FEppj
 * ============================================================ */

export const DRIVE_FOLDER_LINK = DRIVE_FOLDER_URL;

export const certificates: Certificate[] = [
  {
    id: "drive-1uSSFOyvLoRhioEVXaTi494uGHyPMmZqx",
    title: "Intermediate Machine Learning",
    issuer: "Kaggle",
    issueDate: "2026-09-03",
    imageUrl: driveImageUrl("1uSSFOyvLoRhioEVXaTi494uGHyPMmZqx"),
    category: "ai",
    driveFileId: "1uSSFOyvLoRhioEVXaTi494uGHyPMmZqx",
    verifyUrl: driveViewUrl("1uSSFOyvLoRhioEVXaTi494uGHyPMmZqx"),
    source: "drive",
    description:
      "Intermediate-level Kaggle Learn certificate covering feature engineering, model ensembling, cross-validation strategy, and leakage prevention.",
  },
  {
    id: "drive-1e5HYPQLgXvE1Da4GVtbpqG9MzzN8LgXv",
    title: "Intro to Deep Learning",
    issuer: "Kaggle",
    issueDate: "2026-09-03",
    imageUrl: driveImageUrl("1e5HYPQLgXvE1Da4GVtbpqG9MzzN8LgXv"),
    category: "ai",
    driveFileId: "1e5HYPQLgXvE1Da4GVtbpqG9MzzN8LgXv",
    verifyUrl: driveViewUrl("1e5HYPQLgXvE1Da4GVtbpqG9MzzN8LgXv"),
    source: "drive",
    description:
      "Kaggle Learn certificate covering neural networks with TensorFlow and Keras, stochastic gradient descent, and overfitting mitigation with dropout.",
  },
  {
    id: "drive-1z73WAMV_XvIzjanAsclUE-FgQoYDRCC2",
    title: "Intro to Machine Learning",
    issuer: "Kaggle",
    issueDate: "2026-09-03",
    imageUrl: driveImageUrl("1z73WAMV_XvIzjanAsclUE-FgQoYDRCC2"),
    category: "ai",
    driveFileId: "1z73WAMV_XvIzjanAsclUE-FgQoYDRCC2",
    verifyUrl: driveViewUrl("1z73WAMV_XvIzjanAsclUE-FgQoYDRCC2"),
    source: "drive",
    description:
      "Kaggle Learn certificate covering core ML concepts: model validation, underfitting/overfitting, random forests, and gradient boosting with XGBoost.",
  },
  {
    id: "drive-1R-d-aEZTqT4_GymkOELK6WvJZgfIkT7Q",
    title: "Intro to Programming",
    issuer: "Kaggle",
    issueDate: "2026-09-03",
    imageUrl: driveImageUrl("1R-d-aEZTqT4_GymkOELK6WvJZgfIkT7Q"),
    category: "web",
    driveFileId: "1R-d-aEZTqT4_GymkOELK6WvJZgfIkT7Q",
    verifyUrl: driveViewUrl("1R-d-aEZTqT4_GymkOELK6WvJZgfIkT7Q"),
    source: "drive",
    description:
      "Kaggle Learn certificate covering Python fundamentals — variables, functions, booleans, lists, loops, and string operations.",
  },
  {
    id: "drive-1Xljth-_QYFpicfCbBy__1wRUEnxODteY",
    title: "Belajar Dasar Pemrograman JavaScript",
    issuer: "Dicoding Indonesia",
    issueDate: "2024-09-28",
    credentialId: "3494738",
    imageUrl: driveImageUrl("1Xljth-_QYFpicfCbBy__1wRUEnxODteY"),
    category: "web",
    driveFileId: "1Xljth-_QYFpicfCbBy__1wRUEnxODteY",
    verifyUrl: driveViewUrl("1Xljth-_QYFpicfCbBy__1wRUEnxODteY"),
    source: "drive",
    description:
      "Dicoding certificate covering JavaScript fundamentals — variables, data types, functions, DOM manipulation, and asynchronous programming.",
  },
];

export const certificateCategories = [
  "all",
  "web",
  "ai",
  "backend",
  "cloud",
  "data",
] as const;

export type CertificateCategory = (typeof certificateCategories)[number];

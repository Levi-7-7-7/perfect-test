export type Certificate = {
  _id: string;
  studentName: string;
  studentRegisterNumber: string;
  category: string;
  subCategory: string;
  fileUrl: string;
  status: string;
};

export type RootStackParamList = {
  TutorPending: undefined;
  CertificateReview: { certificate: Certificate };
};

export type RegisterBody = {
  email: string;
  name: string;
  password: string;
};

export type LoginBody = {
  email: string;
  password: string;
};

export type VerifyOtpBody = {
  userId: string;
  otp: string;
};

export type ResetPasswordBody = {
  userId: string;
  password: string;
  otp: string;
};

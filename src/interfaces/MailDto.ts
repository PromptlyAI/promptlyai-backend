export interface MailDto {
  to: string;
  body: string;
}

export interface VerifyAccountDto extends MailDto {
  token: string;
}
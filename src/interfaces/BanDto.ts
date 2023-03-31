import { UUID } from "crypto";

export default interface BanDto {
    userId: UUID
    email?: string,
    name?: string,
    banExpartionDate? : Date
}

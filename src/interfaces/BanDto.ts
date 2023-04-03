import { UUID } from "crypto";

export default interface BanDto {
    userId: UUID
    banExpartionDate? : Date
}

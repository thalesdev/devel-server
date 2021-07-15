import { Company } from "../models/Company";
import { User } from "../models/User";
import { ServiceError } from "./ServiceError";


export function AssertUserIsOwnerOfCompany(userId: String, company: Company, error?: ServiceError) {
  const selfError = error || new ServiceError({
    message: "you are not allowed to complete this action",
    code: 'assert.company.U403',
    status: 403
  })
  if (company.ownerId.toString() !== userId) throw selfError;
}

export function AssertUserIsEmployeeOfCompany(user: User, companyId: string, error?: ServiceError) {
  const selfError = error || new ServiceError({
    message: "you are not part of this company",
    code: 'assert.company.U403',
    status: 403
  })
  if (user.companyId?.toString() !== companyId) throw selfError;
}

export function AssertUserIsPartOfCompany(user: User | undefined, company: Company | undefined, error?: ServiceError) {
  const selfError = error || new ServiceError({
    message: "you are not part of this company",
    code: 'assert.company.U403',
    status: 403
  })
  if (!user || !company ||
    user.companyId?.toString() !== company.id.toString() && company.ownerId.toString() !== user.id.toString()) throw selfError;
}


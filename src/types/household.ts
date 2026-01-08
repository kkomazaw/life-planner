/**
 * 家族構成メンバーの関係性
 */
export type MemberRelation = 'self' | 'spouse' | 'child' | 'parent' | 'other';

/**
 * 家族構成メンバーの雇用状態
 */
export type EmploymentStatus = 'employed' | 'self-employed' | 'unemployed' | 'student' | 'retired';

/**
 * 家族構成メンバー
 */
export interface HouseholdMember {
  id: string;
  name: string;
  relation: MemberRelation;
  birthDate: Date;
  employmentStatus: EmploymentStatus;
  retirementAge?: number; // 退職予定年齢（デフォルト65歳）
  pensionStartAge?: number; // 年金開始年齢（デフォルト65歳）
  expectedPensionAmount?: number; // 予定年金月額
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 家族構成メンバーの作成パラメータ
 */
export interface CreateHouseholdMemberParams {
  name: string;
  relation: MemberRelation;
  birthDate: Date;
  employmentStatus: EmploymentStatus;
  retirementAge?: number;
  pensionStartAge?: number;
  expectedPensionAmount?: number;
}

/**
 * 家族構成メンバーの更新パラメータ
 */
export interface UpdateHouseholdMemberParams {
  name?: string;
  relation?: MemberRelation;
  birthDate?: Date;
  employmentStatus?: EmploymentStatus;
  retirementAge?: number;
  pensionStartAge?: number;
  expectedPensionAmount?: number;
}

/**
 * 年齢を計算するヘルパー関数
 */
export function calculateAge(birthDate: Date, referenceDate: Date = new Date()): number {
  const age = referenceDate.getFullYear() - birthDate.getFullYear();
  const monthDiff = referenceDate.getMonth() - birthDate.getMonth();
  const dayDiff = referenceDate.getDate() - birthDate.getDate();

  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    return age - 1;
  }

  return age;
}

/**
 * 指定した年齢になる日付を計算するヘルパー関数
 */
export function calculateDateAtAge(birthDate: Date, targetAge: number): Date {
  const targetDate = new Date(birthDate);
  targetDate.setFullYear(targetDate.getFullYear() + targetAge);
  return targetDate;
}

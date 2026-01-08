import { useLiveQuery } from 'dexie-react-hooks';
import { v4 as uuidv4 } from 'uuid';
import { db } from '@/lib/db';
import type {
  HouseholdMember,
  CreateHouseholdMemberParams,
  UpdateHouseholdMemberParams,
} from '@/types/household';

/**
 * 家族構成メンバーを管理するカスタムフック
 */
export function useHousehold() {
  // 全メンバーを取得（作成日時でソート）
  const members = useLiveQuery(
    () => db.householdMembers.orderBy('createdAt').toArray(),
    []
  );

  /**
   * メンバーを作成
   */
  const createMember = async (params: CreateHouseholdMemberParams): Promise<HouseholdMember> => {
    const now = new Date();
    const member: HouseholdMember = {
      id: uuidv4(),
      ...params,
      retirementAge: params.retirementAge ?? 65,
      pensionStartAge: params.pensionStartAge ?? 65,
      createdAt: now,
      updatedAt: now,
    };

    await db.householdMembers.add(member);
    return member;
  };

  /**
   * メンバーを更新
   */
  const updateMember = async (
    id: string,
    params: UpdateHouseholdMemberParams
  ): Promise<void> => {
    await db.householdMembers.update(id, {
      ...params,
      updatedAt: new Date(),
    });
  };

  /**
   * メンバーを削除
   */
  const deleteMember = async (id: string): Promise<void> => {
    await db.householdMembers.delete(id);
  };

  /**
   * IDでメンバーを取得
   */
  const getMember = async (id: string): Promise<HouseholdMember | undefined> => {
    return await db.householdMembers.get(id);
  };

  /**
   * 特定の関係性のメンバーを取得
   */
  const getMembersByRelation = async (relation: HouseholdMember['relation']) => {
    return await db.householdMembers
      .where('relation')
      .equals(relation)
      .toArray();
  };

  return {
    members: members ?? [],
    createMember,
    updateMember,
    deleteMember,
    getMember,
    getMembersByRelation,
  };
}

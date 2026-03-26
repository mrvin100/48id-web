import { OperatorUsersPage } from '@/components/modules/operator'

export default async function OperatorUsersPageRoute({
  searchParams,
}: {
  searchParams: Promise<{ accountId?: string }>
}) {
  const { accountId } = await searchParams
  return <OperatorUsersPage accountId={accountId ?? ''} />
}

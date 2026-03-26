import { OperatorApiKeyPage } from '@/components/modules/operator'

export default async function OperatorApiKeyPageRoute({
  searchParams,
}: {
  searchParams: Promise<{ accountId?: string; memberRole?: string }>
}) {
  const { accountId, memberRole } = await searchParams
  return (
    <OperatorApiKeyPage
      accountId={accountId ?? ''}
      isOwner={memberRole === 'OWNER'}
    />
  )
}

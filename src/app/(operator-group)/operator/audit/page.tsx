import { OperatorAuditPage } from '@/components/modules/operator'

export default async function OperatorAuditPageRoute({
  searchParams,
}: {
  searchParams: Promise<{ accountId?: string }>
}) {
  const { accountId } = await searchParams
  return <OperatorAuditPage accountId={accountId ?? ''} />
}

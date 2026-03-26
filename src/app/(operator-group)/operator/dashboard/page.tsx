import { OperatorDashboardModule } from '@/components/modules/operator'

export default async function OperatorDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ accountId?: string }>
}) {
  const { accountId } = await searchParams
  return <OperatorDashboardModule accountId={accountId ?? ''} />
}

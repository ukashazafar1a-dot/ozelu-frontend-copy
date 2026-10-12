import TrackOrderClient from '../_components/TrackOrderClient';

export const runtime = 'edge';

type Props = {
  params: Promise<{ orderId: string }> | { orderId: string };
};

export default async function TrackOrderPage({ params }: Props) {
  const resolved = await Promise.resolve(params);
  const orderId = resolved?.orderId || '';

  return <TrackOrderClient orderId={orderId} />;
}

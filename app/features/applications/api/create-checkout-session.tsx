import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
// console.log("🚀 [stripe] stripe", stripe);

export async function action({ request }: { request: Request }) {
  const body = await request.json();
  console.log("🚀 [body] body in create-checkout-session.tsx", body);

  const paymentIntent = await stripe.paymentIntents.create({
    amount: 20000, // 단위: cent
    currency: "usd",
    automatic_payment_methods: { enabled: true },
    metadata: {
      user_id: body.user_id,
    },
  });
  console.log("🚀 [paymentIntent] paymentIntent", paymentIntent);

  return new Response(
    JSON.stringify({ client_secret: paymentIntent.client_secret }),
    { status: 200 },
  );
}

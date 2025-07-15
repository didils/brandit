// 📁 app/routes/checkout.tsx 또는 routes 내부 페이지 컴포넌트
import {
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { useCallback } from "react";
import { Form } from "react-router";

import { Button } from "./ui/button";

export default function CheckoutForm() {
  const stripe = useStripe(); // Stripe.js 객체 가져오기
  const elements = useElements(); // Stripe Elements 객체 가져오기
  console.log("🧩 stripe:", stripe);
  console.log("🧩 elements:", elements);

  // ✅ React Router 프레임워크 모드에선 굳이 FormEvent import 안 해도 됨
  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      if (!stripe || !elements) return;

      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url:
            "http://localhost:5173/applications/provisional-application/success", // ✅ 결제 성공 후 이동할 URL
        },
      });

      if (error) {
        console.error("❌ 결제 실패:", error.message);
      }
    },
    [stripe, elements],
  );

  return (
    <Form onSubmit={handleSubmit} className="w-full">
      <PaymentElement />
      <Button type="submit" disabled={!stripe} className="mt-4 w-full">
        Checkout
      </Button>
    </Form>
  );
}

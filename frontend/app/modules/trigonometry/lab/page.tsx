import type { Metadata } from "next";
import MathStepModule3Entry from "@/app/components/mathstep-module3/MathStepModule3Entry";

export const metadata: Metadata = {
  title: "Phòng thí nghiệm lượng giác",
  description:
    "Khám phá 13 hoạt động lượng giác qua đường tròn đơn vị, đồ thị đồng bộ và các trạm tự kiến tạo.",
};

export default function TrigonometryLabPage() {
  return <MathStepModule3Entry />;
}

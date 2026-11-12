import React, { useState, useMemo, useEffect } from 'react';
import { OptimizationResult, Point2D, RealWorldScenario, StepNumber } from '@/app/types/math';
import { formatBoundaryLine, formatInequality } from '@/app/lib/optimath/mathEngine';
import { formatCoord, formatPointCoord, formatValueWithApprox } from '@/app/lib/optimath/systemMathEngine';
import { OptimizationGraphCanvas } from '@/app/components/optimath/graph/OptimizationGraphCanvas';
import { VertexObjectiveTable } from './VertexObjectiveTable';
import { OptiMascot } from '@/app/components/optimath/mascot/OptiMascot';
import {
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Sparkles,
  Copy,
  Layers,
  Compass,
  Volume2,
  VolumeX,
  Award,
  Calculator,
  Eye,
  EyeOff,
  SlidersHorizontal
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface OptimizationSevenStepWizardProps {
  scenario: RealWorldScenario;
  result: OptimizationResult;
  onSwitchToSandbox: () => void;
}

const OPTI_STEP_TITLES = [
  { num: 1, title: 'Đọc & Hiểu tình huống thực tế', desc: 'Phân tích bảng số liệu & mục tiêu bài toán', short: '1. Tình huống' },
  { num: 2, title: 'Chọn hai biến x, y & Đơn vị', desc: 'Xác định ý nghĩa và điều kiện biến số', short: '2. Chọn biến' },
  { num: 3, title: 'Lập hệ bất phương trình ràng buộc', desc: 'Chuyển đổi các giới hạn tài nguyên thành hệ BPT', short: '3. Lập hệ BPT' },
  { num: 4, title: 'Biểu diễn miền phương án khả thi', desc: 'Dựng các nửa mặt phẳng và miền đa giác lồi', short: '4. Miền khả thi' },
  { num: 5, title: 'Xác định các đỉnh & Điểm nguyên', desc: 'Tìm tọa độ các đỉnh và các phương án ứng viên', short: '5. Các đỉnh' },
  { num: 6, title: 'Tối ưu hóa hàm mục tiêu', desc: 'Quét đường mức và tính giá trị tại các đỉnh', short: '6. Tối ưu hóa' },
  { num: 7, title: 'Kết luận bằng ngôn ngữ thực tế', desc: 'Trả lời câu hỏi thực tiễn và bài học tối ưu', short: '7. Kết luận' }
];

interface LinearExpressionValue {
  x: number;
  y: number;
  constant: number;
}

const parseLinearExpression = (raw: string): LinearExpressionValue | null => {
  const normalized = raw.toLowerCase().replace(/−/g, '-').replace(/,/g, '.').replace(/\s|\*/g, '');
  if (!normalized) return null;

  const terms = normalized.match(/[+-]?[^+-]+/g);
  if (!terms) return null;

  const value: LinearExpressionValue = { x: 0, y: 0, constant: 0 };
  for (const term of terms) {
    const variableTerm = term.match(/^([+-]?(?:\d+(?:\.\d*)?|\.\d+)?)([xy])$/);
    if (variableTerm) {
      const coefficientText = variableTerm[1];
      const coefficient = coefficientText === '' || coefficientText === '+'
        ? 1
        : coefficientText === '-'
        ? -1
        : Number(coefficientText);
      if (!Number.isFinite(coefficient)) return null;
      value[variableTerm[2] as 'x' | 'y'] += coefficient;
      continue;
    }

    const constant = Number(term);
    if (!Number.isFinite(constant)) return null;
    value.constant += constant;
  }

  return value;
};

const flipComparison = (comparison: string) => ({ '<=': '>=', '>=': '<=', '<': '>', '>': '<' }[comparison] || comparison);

const matchesConstraint = (raw: string, expected: { a: number; b: number; c: number; op: string }) => {
  const normalized = raw.replace(/≤/g, '<=').replace(/≥/g, '>=').replace(/−/g, '-');
  const relation = normalized.match(/<=|>=|<|>/);
  if (!relation || (normalized.match(/<=|>=|<|>/g) || []).length !== 1) return false;

  const [leftText, rightText] = normalized.split(relation[0]);
  const left = parseLinearExpression(leftText);
  const right = parseLinearExpression(rightText);
  if (!left || !right) return false;

  const expectedCoefficients = [expected.a, expected.b, expected.c];
  const directCoefficients = [left.x - right.x, left.y - right.y, right.constant - left.constant];
  const reverseCoefficients = [right.x - left.x, right.y - left.y, left.constant - right.constant];
  const approxScaled = (actual: number[], comparison: string) => {
    if (comparison !== expected.op) return false;
    const anchor = expectedCoefficients.findIndex(value => Math.abs(value) > 1e-9);
    if (anchor < 0) return false;
    const scale = actual[anchor] / expectedCoefficients[anchor];
    return scale > 0 && actual.every((value, index) => Math.abs(value - expectedCoefficients[index] * scale) < 1e-6);
  };

  return approxScaled(directCoefficients, relation[0]) ||
    approxScaled(reverseCoefficients, flipComparison(relation[0]));
};

const matchesObjective = (raw: string, expectedX: number, expectedY: number) => {
  const withoutGoal = raw.split(/→|->/)[0];
  const expression = withoutGoal.replace(/^\s*[a-z](?:\([^)]*\))?\s*=/i, '');
  const parsed = parseLinearExpression(expression);
  return Boolean(
    parsed &&
    Math.abs(parsed.x - expectedX) < 1e-6 &&
    Math.abs(parsed.y - expectedY) < 1e-6 &&
    Math.abs(parsed.constant) < 1e-6
  );
};

export const OptimizationSevenStepWizard: React.FC<OptimizationSevenStepWizardProps> = ({
  scenario,
  result,
  onSwitchToSandbox
}) => {
  const [currentStep, setCurrentStep] = useState<StepNumber>(1);
  const [completedSteps, setCompletedSteps] = useState<Set<StepNumber>>(new Set());

  // Interactive Level curve k value
  const [kValue, setKValue] = useState<number>(() => {
    return result.optimalValue !== null ? Math.round(result.optimalValue * 0.65) : 50;
  });

  // Step 1: Comprehension state
  const [step1GoalChoice, setStep1GoalChoice] = useState<'max' | 'min' | null>(null);
  const [step1Feedback, setStep1Feedback] = useState<{ isCorrect: boolean; message: string } | null>(null);

  // Step 2: Variable condition choice
  const [step2IntegerChoice, setStep2IntegerChoice] = useState<boolean | null>(null);
  const [step2Feedback, setStep2Feedback] = useState<{ isCorrect: boolean; message: string } | null>(null);

  // Step 3: Student writes the constraints and objective before seeing the model.
  const [step3ConstraintInputs, setStep3ConstraintInputs] = useState<Record<string, string>>({});
  const [step3ObjectiveInput, setStep3ObjectiveInput] = useState('');
  const [step3Feedback, setStep3Feedback] = useState<{ isCorrect: boolean; message: string } | null>(null);
  const [step3Complete, setStep3Complete] = useState(false);

  // Steps 4–5 require an answer before the next step is unlocked.
  const [step4RegionChoice, setStep4RegionChoice] = useState<'bounded' | 'unbounded' | 'empty' | null>(null);
  const [step4Feedback, setStep4Feedback] = useState<{ isCorrect: boolean; message: string } | null>(null);
  const [step4Complete, setStep4Complete] = useState(false);
  const [step5VertexCountInput, setStep5VertexCountInput] = useState('');
  const [step5Feedback, setStep5Feedback] = useState<{ isCorrect: boolean; message: string } | null>(null);
  const [step5Complete, setStep5Complete] = useState(false);

  // Step 5: Selected vertex candidate
  const [highlightVertex, setHighlightVertex] = useState<Point2D | null>(null);

  // Step 6: Student predicted optimal vertex
  const [predictedOptVertex, setPredictedOptVertex] = useState<string | null>(null);
  const [step6Feedback, setStep6Feedback] = useState<{ isCorrect: boolean; message: string } | null>(null);

  // Assistant voice and hints
  const [optiHintTier, setOptiHintTier] = useState<1 | 2 | 3>(1);
  const [speechEnabled, setSpeechEnabled] = useState(false);
  const [copyToast, setCopyToast] = useState<string | null>(null);
  const [showGuidance, setShowGuidance] = useState(true);

  // Mobile viewport view mode for screens < xl ('step' | 'graph' | 'table' | 'all')
  const [mobileStepView, setMobileStepView] = useState<'step' | 'graph' | 'table' | 'all'>('step');

  const { objective, system, variables } = scenario;
  const { vertexEvaluations, optimalPoints, optimalValue, integerOptimalPoint, integerOptimalValue } = result;

  // Reset wizard states when scenario changes
  useEffect(() => {
    setCurrentStep(1);
    setCompletedSteps(new Set());
    setStep1GoalChoice(null);
    setStep1Feedback(null);
    setStep2IntegerChoice(null);
    setStep2Feedback(null);
    setStep3ConstraintInputs({});
    setStep3ObjectiveInput('');
    setStep3Feedback(null);
    setStep3Complete(false);
    setStep4RegionChoice(null);
    setStep4Feedback(null);
    setStep4Complete(false);
    setStep5VertexCountInput('');
    setStep5Feedback(null);
    setStep5Complete(false);
    setHighlightVertex(null);
    setPredictedOptVertex(null);
    setStep6Feedback(null);
    setKValue(result.optimalValue !== null ? Math.round(result.optimalValue * 0.65) : 50);
  }, [scenario.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const invalidateProgressFrom = (firstStep: StepNumber) => {
    setCompletedSteps(previous => {
      const next = new Set(previous);
      for (let step = firstStep; step <= 6; step += 1) next.delete(step as StepNumber);
      return next;
    });
    if (firstStep < 2) {
      setStep2IntegerChoice(null);
      setStep2Feedback(null);
    }
    if (firstStep < 3) {
      setStep3ConstraintInputs({});
      setStep3ObjectiveInput('');
      setStep3Feedback(null);
      setStep3Complete(false);
    }
    if (firstStep < 4) {
      setStep4RegionChoice(null);
      setStep4Feedback(null);
      setStep4Complete(false);
    }
    if (firstStep < 5) {
      setStep5VertexCountInput('');
      setStep5Feedback(null);
      setStep5Complete(false);
    }
    if (firstStep < 6) {
      setPredictedOptVertex(null);
      setStep6Feedback(null);
    }
  };

  // Navigation handlers
  const handleNextStep = () => {
    if (currentStep < 7) {
      setCurrentStep(s => (s + 1) as StepNumber);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(s => (s - 1) as StepNumber);
    }
  };

  // STEP 1: Verify reading comprehension
  const handleVerifyStep1 = () => {
    if (!step1GoalChoice) {
      setStep1Feedback({ isCorrect: false, message: 'Vui lòng chọn mục tiêu của bài toán (MAX hay MIN)!' });
      return;
    }
    const isCorrect = step1GoalChoice === objective.goal;
    if (isCorrect) {
      setStep1Feedback({
        isCorrect: true,
        message: 'Chính xác! Em đã xác định đúng mục tiêu cần hướng tới. Hãy tiếp tục phân tích các đại lượng của bài toán.'
      });
      setCompletedSteps(prev => new Set(prev).add(1));
      confetti({ particleCount: 30, spread: 50, origin: { y: 0.7 } });
    } else {
      invalidateProgressFrom(1);
      setStep1Feedback({
        isCorrect: false,
        message: 'Chưa đúng. Đọc lại câu hỏi cuối của đề và chú ý các từ chỉ mức cao nhất hoặc thấp nhất. Mở Gợi ý Socrates nếu cần.'
      });
    }
  };

  // STEP 2: Verify variable condition
  const handleVerifyStep2 = () => {
    if (step2IntegerChoice === null) {
      setStep2Feedback({ isCorrect: false, message: 'Vui lòng chọn xem bài toán có yêu cầu số nguyên hay không!' });
      return;
    }
    const isCorrect = step2IntegerChoice === scenario.integerRequired;
    if (isCorrect) {
      setStep2Feedback({
        isCorrect: true,
        message: scenario.integerRequired
          ? 'Chính xác! Do sản phẩm/xe là vật thể nguyên chiếc nên điều kiện biến thực tế là x, y ∈ ℕ (số tự nhiên).'
          : 'Chính xác! Do khối lượng/thời gian/diện tích có thể chia nhỏ nên biến số nhận giá trị thực x, y ≥ 0.'
      });
      setCompletedSteps(prev => new Set(prev).add(2));
      confetti({ particleCount: 35, spread: 55, origin: { y: 0.7 } });
    } else {
      invalidateProgressFrom(2);
      setStep2Feedback({
        isCorrect: false,
        message: scenario.integerRequired
          ? 'Chưa chính xác. Hãy nghĩ xem có thể sản xuất hoặc thuê một phần của sản phẩm/chiếc xe hay không.'
          : 'Chưa chính xác. Hãy nghĩ xem thời gian hoặc khối lượng có thể được chia nhỏ hay không.'
      });
    }
  };

  // STEP 3: Verify the model the student entered, without exposing the expected values on errors.
  const handleVerifyStep3 = () => {
    const constraintsCorrect = system.every(ineq =>
      matchesConstraint(step3ConstraintInputs[ineq.id] || '', ineq)
    );
    const objectiveCorrect = matchesObjective(step3ObjectiveInput, objective.cx, objective.cy);

    if (!constraintsCorrect || !objectiveCorrect) {
      setStep3Complete(false);
      invalidateProgressFrom(3);
      setStep3Feedback({
        isCorrect: false,
        message: 'Mô hình chưa khớp với dữ kiện hoặc còn thiếu. Hãy đọc lại từng giới hạn nguồn lực và mức thu/chi cho mỗi đơn vị; nếu cần, mở Gợi ý Socrates để nhận gợi mở từng cấp.'
      });
      return false;
    }

    setStep3Complete(true);
    setCompletedSteps(prev => new Set(prev).add(3));
    setStep3Feedback({
      isCorrect: true,
      message: 'Em đã lập đúng hệ ràng buộc và hàm mục tiêu. Hãy đối chiếu đường biên rồi sang bước tiếp theo.'
    });
    confetti({ particleCount: 40, spread: 60, origin: { y: 0.7 } });
    return true;
  };

  const handleStep3InputChange = (update: () => void) => {
    update();
    setStep3Complete(false);
    setStep3Feedback(null);
    invalidateProgressFrom(3);
  };

  // STEP 4: Check the type of feasible region selected by the student.
  const handleVerifyStep4 = () => {
    if (!step4RegionChoice) {
      setStep4Feedback({ isCorrect: false, message: 'Hãy chọn nhận định của em về miền phương án khả thi trước.' });
      return;
    }

    const actualRegion = result.regionType === 'bounded_polygon' || result.regionType === 'degenerate_segment' || result.regionType === 'degenerate_point'
      ? 'bounded'
      : result.regionType === 'unbounded' || result.regionType === 'degenerate_line'
      ? 'unbounded'
      : 'empty';
    if (step4RegionChoice !== actualRegion) {
      setStep4Complete(false);
      invalidateProgressFrom(4);
      setStep4Feedback({
        isCorrect: false,
        message: 'Chưa đúng. Quan sát vùng được tô trên đồ thị: vùng đó có phần chung không, và có kéo dài vô hạn không? Dùng gợi ý Socrates nếu cần.'
      });
      return;
    }

    setStep4Complete(true);
    setStep4Feedback({ isCorrect: true, message: 'Đúng rồi. Em đã phân loại được miền phương án khả thi.' });
    setCompletedSteps(previous => new Set(previous).add(4));
    confetti({ particleCount: 40, spread: 60, origin: { y: 0.7 } });
  };

  // STEP 5: Check the vertex count before revealing their coordinates.
  const handleVerifyStep5 = () => {
    const enteredCount = Number(step5VertexCountInput);
    if (!step5VertexCountInput || !Number.isInteger(enteredCount)) {
      setStep5Feedback({ isCorrect: false, message: 'Nhập số đỉnh em đếm được trên biên miền khả thi.' });
      return;
    }
    if (enteredCount !== vertexEvaluations.length) {
      setStep5Complete(false);
      invalidateProgressFrom(5);
      setStep5Feedback({
        isCorrect: false,
        message: 'Chưa khớp. Hãy đếm các giao điểm trên biên của miền tím; một đỉnh là nơi hai đường biên gặp nhau.'
      });
      return;
    }

    setStep5Complete(true);
    setStep5Feedback({ isCorrect: true, message: 'Đếm đúng. Các tọa độ đỉnh đã được mở để em đối chiếu với đồ thị.' });
    setCompletedSteps(previous => new Set(previous).add(5));
    confetti({ particleCount: 45, spread: 65, origin: { y: 0.7 } });
  };

  // STEP 6: Verify student predicted optimal vertex
  const handleVerifyStep6 = () => {
    if (!predictedOptVertex) {
      setStep6Feedback({ isCorrect: false, message: 'Vui lòng chọn một đỉnh ứng viên mà bạn dự đoán là tối ưu!' });
      return;
    }

    const optVertexLabels = vertexEvaluations.filter(ve => ve.isOptimal).map(ve => ve.label);
    const isCorrect = optVertexLabels.includes(predictedOptVertex);
    const selectedVe = vertexEvaluations.find(ve => ve.label === predictedOptVertex);

    if (isCorrect && selectedVe) {
      setStep6Feedback({
        isCorrect: true,
        message: `Dự đoán đúng: đỉnh ${selectedVe.label} là điểm tối ưu liên tục. Hãy sang Bước 7 để xem kết luận và đối chiếu với phương án nguyên.`
      });
      if (optimalValue !== null) {
        setKValue(optimalValue);
      }
      setCompletedSteps(prev => new Set(prev).add(6));
      confetti({ particleCount: 50, spread: 65, origin: { y: 0.7 } });
    } else {
      setStep6Feedback({
        isCorrect: false,
        message: `Chưa chính xác! Tại đỉnh ${predictedOptVertex}${
          selectedVe ? formatPointCoord(selectedVe.vertex) : ''
        }, hàm mục tiêu chưa đạt cực trị. Hãy tự tính giá trị tại tất cả các đỉnh trong bảng bên dưới hoặc kéo thanh trượt đường mức k!`
      });
    }
  };

  // STEP 7: Copy Practical Answer
  const handleCopyConclusion = () => {
    const text = `KẾT LUẬN BÀI TOÁN TỐI ƯU HÓA TUYẾN TÍNH THỰC TẾ:
Tình huống: ${scenario.title}
Hàm mục tiêu: ${objective.label} (${objective.goal.toUpperCase()})

KẾT QUẢ TÍNH TOÁN:
${result.summarySGK}

PHƯƠNG ÁN THỰC TIỄN:
${result.practicalAnswer}`;

    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text);
      setCopyToast('Đã sao chép lời giải thực tiễn vào bộ nhớ tạm!');
      setTimeout(() => setCopyToast(null), 3000);
    }
  };

  // Assistant voice synthesis
  const handleSpeak = () => {
    if (!('speechSynthesis' in window)) return;
    if (speechEnabled) {
      window.speechSynthesis.cancel();
      setSpeechEnabled(false);
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(result.practicalAnswer);
    utterance.lang = 'vi-VN';
    utterance.onend = () => setSpeechEnabled(false);
    setSpeechEnabled(true);
    window.speechSynthesis.speak(utterance);
  };

  const canRevealOptimal = currentStep >= 7 || completedSteps.has(6);

  // Socratic guidance for each step
  const optiGuidance = useMemo(() => {
    switch (currentStep) {
      case 1:
        return {
          text: 'Chào bạn! Trong thực tế, việc quan trọng nhất là đọc kỹ đề và phân định rõ: Ta muốn TỐI ĐA HÓA (lợi nhuận, điểm số) hay TỐI THIỂU HÓA (chi phí, thời gian)? Có những nguồn lực nào bị giới hạn?',
          hints: {
            tier1: 'Đọc kỹ câu hỏi cuối cùng của bài toán thực tế.',
            tier2: 'Tìm các cụm từ: "lớn nhất", "cao nhất" (MAX) hoặc "nhỏ nhất", "thấp nhất" (MIN).',
            tier3: 'Hãy tự diễn đạt mục tiêu bằng một câu ngắn: đại lượng nào cần đạt mức cao nhất hoặc thấp nhất? Chỉ chọn sau khi đối chiếu với câu hỏi cuối của đề.'
          }
        };
      case 2:
        return {
          text: 'Hãy đặt hai biến x và y đại diện cho hai đại lượng cần tìm quyết định. Hãy suy nghĩ: biến số này có thể nhận giá trị phân số/thập phân hay bắt buộc phải là số nguyên?',
          hints: {
            tier1: 'Đại lượng nào ta có quyền tự quyết định số lượng?',
            tier2: 'Nếu là sản phẩm, con người, xe cộ thì không thể chia lẻ (phải là số nguyên không âm x, y ∈ ℕ).',
            tier3: `Đặt x là ${variables.x.name} (${variables.x.unit}) và y là ${variables.y.name} (${variables.y.unit}).`
          }
        };
      case 3:
        return {
          text: 'Hãy tự chuyển từng dòng dữ kiện thành một ràng buộc. Đề bài và bảng số liệu vẫn được giữ ở trên để em đối chiếu trong lúc làm.',
          hints: {
            tier1: 'Bắt đầu từ mỗi nguồn lực: xác định lượng dùng cho một đơn vị x và một đơn vị y, rồi tìm tổng khả năng sử dụng.',
            tier2: 'Nhân mức tiêu hao mỗi đơn vị với số lượng tương ứng, cộng lại; “không quá” cho dấu ≤, còn “ít nhất” cho dấu ≥.',
            tier3: 'Bổ sung điều kiện không âm cho x và y. Với đường biên, giữ nguyên hai vế rồi thay dấu bất phương trình bằng dấu bằng.'
          }
        };
      case 4:
        return {
          text: 'Miền phương án khả thi là giao của tất cả các nửa mặt phẳng trên hệ trục tọa độ Oxy. Hãy quan sát miền đa giác nghiệm được tô màu tím!',
          hints: {
            tier1: 'Miền phương án khả thi là tập hợp tất cả các cặp (x; y) thỏa mãn đồng thời toàn bộ các ràng buộc.',
            tier2: 'Nếu miền khả thi là một đa giác lồi bị chặn, bài toán chắc chắn có phương án tối ưu!',
            tier3: 'Các điểm nằm ngoài miền tô màu tím đều là phương án bất khả thi (vi phạm nguồn lực).'
          }
        };
      case 5:
        return {
          text: 'Vì miền phương án là đa giác lồi bị chặn, giá trị lớn nhất hoặc nhỏ nhất của hàm mục tiêu đạt tại ít nhất một đỉnh. Hãy kiểm tra tất cả các đỉnh thỏa mãn hệ.',
          hints: {
            tier1: 'Các đỉnh là giao điểm của các cặp đường thẳng biên bờ thỏa mãn toàn bộ hệ.',
            tier2: 'Giao điểm của hai đường thẳng biên có thể có tọa độ phân số. Hãy giữ dạng chính xác khi giải hệ, rồi kiểm tra giao điểm đó có thỏa mọi ràng buộc không.',
            tier3: 'Lần lượt xét giao điểm của các cặp đường biên; loại giao điểm không thỏa một trong các bất phương trình. Đừng bỏ sót các giao điểm nằm trên trục tọa độ.'
          }
        };
      case 6:
        return {
          text: 'Hãy kéo thanh trượt đường mức k hoặc tự tính giá trị tại từng đỉnh ở bảng dưới để dự đoán chính xác đỉnh tối ưu!',
          hints: {
            tier1: 'Đường mức P = ax + by = k là tập hợp các điểm có cùng giá trị hàm mục tiêu k.',
            tier2: `Tịnh tiến đường mức theo chiều làm giá trị hàm mục tiêu ${objective.goal === 'max' ? 'tăng' : 'giảm'}; điểm cuối cùng còn chạm miền khả thi là ứng viên tối ưu.`,
            tier3: 'Thay tọa độ từng đỉnh vào hàm mục tiêu ở bảng tính bên dưới để kiểm chứng giá trị chính xác.'
          }
        };
      case 7:
        return {
          text: 'Xuất sắc! Bây giờ hãy chuyển ngôn ngữ Toán học thành câu trả lời thực tế để tư vấn cho người quản lý cơ sở nhé!',
          hints: {
            tier1: 'Không trả lời chung chung "nghiệm là (x; y)", hãy nói rõ số lượng cụ thể kèm đơn vị.',
            tier2: 'Nếu bài toán yêu cầu nguyên, hãy phân biệt rõ nghiệm liên tục (VD: 8/3; 8/3) và phương án sản xuất nguyên (VD: 2; 3).',
            tier3: 'Bấm nút "Sao chép kết luận" để lưu lại toàn bộ lời giải chuẩn sư phạm nhé!'
          }
        };
      default:
        return {
          text: 'Khám phá bài toán tối ưu thực tế cùng MathSTEP!',
          hints: { tier1: '', tier2: '', tier3: '' }
        };
    }
  }, [currentStep, objective, variables]);

  return (
    <div className="flex flex-col gap-3.5 w-full">
      {/* Toast Notification */}
      {copyToast && (
        <div className="fixed top-16 right-4 z-50 bg-emerald-600 text-white px-4 py-2 rounded-xl shadow-lg text-xs font-bold flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4" />
          <span>{copyToast}</span>
        </div>
      )}

      {/* 1. COMPACT STEPPER BAR */}
      <div className="bg-white rounded-2xl border border-slate-200 p-3 sm:p-4 shadow-xs">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-600 animate-pulse shrink-0" />
            <h2 className="font-extrabold text-xs sm:text-sm md:text-base text-slate-900 truncate">
              Quy Trình 7 Bước Mô Hình Hóa & Tối Ưu Hóa Tuyến Tính
            </h2>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 hidden sm:inline shrink-0">
              Bước {currentStep}/7
            </span>
          </div>

          <span className="text-xs font-mono font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200 shrink-0">
            {Math.round((currentStep / 7) * 100)}%
          </span>
        </div>

        {/* 7 Step Buttons */}
        <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
          {OPTI_STEP_TITLES.map(st => {
            const isCurr = currentStep === st.num;
            const isComp = completedSteps.has(st.num as StepNumber);
            const isLocked = st.num > currentStep && !Array.from(
              { length: st.num - 1 },
              (_, index) => (index + 1) as StepNumber
            ).every(step => completedSteps.has(step));
            return (
              <button
                key={st.num}
                type="button"
                onClick={() => setCurrentStep(st.num as StepNumber)}
                disabled={isLocked}
                aria-disabled={isLocked}
                title={isLocked ? 'Hoàn thành bước trước để mở bước này.' : st.title}
                className={`flex flex-col items-center justify-center p-1.5 sm:p-2 rounded-xl border text-center transition ${
                  isLocked
                    ? 'bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed'
                    : isCurr
                    ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                    : isComp
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 cursor-pointer'
                }`}
              >
                <span className="text-[11px] font-extrabold">{isComp && !isCurr ? '✓' : st.num}</span>
                <span className="text-[10px] truncate hidden md:inline font-medium">{st.short}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. OPTI SOCRATES GUIDANCE BANNER */}
      {showGuidance ? (
        <div
          id="optimization-step-guidance"
          className="bg-gradient-to-r from-purple-50/90 to-indigo-50/90 rounded-2xl border border-purple-200 p-3 shadow-xs flex flex-col gap-2"
        >
          <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <OptiMascot expression="thinking" actionState="nod" size={36} />
            <div className="min-w-0">
              <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-purple-600 text-white block w-fit mb-0.5">
                MathSTEP · Hướng dẫn bước {currentStep}
              </span>
              <p className="text-xs text-slate-800 font-medium line-clamp-2">
                {optiGuidance.text}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={handleSpeak}
              className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-purple-600 cursor-pointer shadow-xs min-h-[36px] min-w-[36px] flex items-center justify-center"
              title="Đọc kết luận thực tiễn"
            >
              {speechEnabled ? <VolumeX className="w-3.5 h-3.5 text-purple-600 animate-pulse" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>
            <button
              type="button"
              onClick={() => setShowGuidance(false)}
              aria-expanded={showGuidance}
              aria-controls="optimization-step-guidance"
              className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-purple-600 cursor-pointer shadow-xs min-h-[36px] min-w-[36px] flex items-center justify-center"
              title="Ẩn hướng dẫn và gợi ý"
              aria-label="Ẩn hướng dẫn và gợi ý"
            >
              <EyeOff className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 3-Tier Hints Selector */}
        <div className="pt-2 border-t border-purple-100 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1">
            <span className="text-[11px] text-purple-900 font-bold flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" />
              Gợi ý Socrates:
            </span>
            <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-purple-200">
              <button
                type="button"
                onClick={() => setOptiHintTier(1)}
                className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition ${
                  optiHintTier === 1 ? 'bg-purple-600 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Cấp 1: Định hướng
              </button>
              <button
                type="button"
                onClick={() => setOptiHintTier(2)}
                className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition ${
                  optiHintTier === 2 ? 'bg-purple-600 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Cấp 2: Phương pháp
              </button>
              <button
                type="button"
                onClick={() => setOptiHintTier(3)}
                className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition ${
                  optiHintTier === 3 ? 'bg-purple-600 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Cấp 3: Chi tiết
              </button>
            </div>
          </div>

          <div className="text-[11px] text-slate-700 italic bg-white/70 px-2 py-0.5 rounded-md border border-purple-100 max-w-full">
            {optiHintTier === 1 && optiGuidance.hints.tier1}
            {optiHintTier === 2 && optiGuidance.hints.tier2}
            {optiHintTier === 3 && optiGuidance.hints.tier3}
          </div>
        </div>
      </div>
      ) : (
        <button
          type="button"
          onClick={() => setShowGuidance(true)}
          aria-expanded={showGuidance}
          className="self-start inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border border-purple-200 bg-purple-50 px-3 py-1.5 text-xs font-semibold text-purple-800 transition hover:bg-purple-100"
          aria-label={`Hiện hướng dẫn và gợi ý bước ${currentStep}`}
        >
          <Eye className="h-3.5 w-3.5" />
          Hiện hướng dẫn và gợi ý bước {currentStep}
        </button>
      )}

      {/* MOBILE VIEWPORT SWITCHER BAR (Visible only on < xl) */}
      <div className="xl:hidden flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => setMobileStepView('step')}
          className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition cursor-pointer min-h-[38px] shrink-0 ${
            mobileStepView === 'step'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span>1. Nhiệm vụ Bước {currentStep}</span>
        </button>
        <button
          type="button"
          onClick={() => setMobileStepView('graph')}
          className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition cursor-pointer min-h-[38px] shrink-0 ${
            mobileStepView === 'graph'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>2. Đồ thị & k={formatCoord(kValue)}</span>
        </button>
        <button
          type="button"
          onClick={() => currentStep >= 6 && setMobileStepView('table')}
          disabled={currentStep < 6}
          aria-disabled={currentStep < 6}
          title={currentStep < 6 ? 'Hoàn thành đến Bước 6 để mở bảng tính' : 'Mở bảng tính các đỉnh'}
          className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition min-h-[38px] shrink-0 ${currentStep < 6 ? 'cursor-not-allowed opacity-45' : 'cursor-pointer'} ${
            mobileStepView === 'table'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Calculator className="w-3.5 h-3.5" />
          <span>3. Bảng tính đỉnh</span>
        </button>
        <button
          type="button"
          onClick={() => setMobileStepView('all')}
          className={`p-2 rounded-lg text-xs font-semibold transition cursor-pointer min-h-[38px] shrink-0 ${
            mobileStepView === 'all'
              ? 'bg-purple-100 text-purple-900 font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
          title="Hiển thị tất cả"
        >
          <Eye className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 3. MULTI-COLUMN WORKSPACE */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-start">
        {/* LEFT COLUMN: Active Step Controller (xl: 5 cols) */}
        <div
          className={`xl:col-span-5 flex flex-col gap-3.5 order-1 ${
            mobileStepView === 'step' || mobileStepView === 'all' ? 'flex' : 'hidden xl:flex'
          }`}
        >
          <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div>
                <span className="text-[10px] font-extrabold uppercase text-purple-600">Bước {currentStep} của 7</span>
                <h3 className="text-sm sm:text-base font-bold text-slate-900">{OPTI_STEP_TITLES[currentStep - 1].title}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{OPTI_STEP_TITLES[currentStep - 1].desc}</p>
              </div>
              <span className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 font-extrabold flex items-center justify-center font-mono text-sm border border-purple-100">
                0{currentStep}
              </span>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-xs text-slate-700 space-y-2">
              <div className="font-bold text-sm text-slate-900">Đề bài · {scenario.title}</div>
              <p className="leading-relaxed">{scenario.storyText}</p>
              {scenario.tableData && (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse border border-slate-200 rounded-lg bg-white">
                    <thead>
                      <tr className="bg-purple-50/70 text-purple-900 text-[11px] font-bold border-b border-slate-200">
                        {scenario.tableData.headers.map((header, index) => (
                          <th key={index} className="p-2 border-r border-slate-200 last:border-r-0">{header}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-[11px]">
                      {scenario.tableData.rows.map((row, rowIndex) => (
                        <tr key={rowIndex} className="hover:bg-slate-50">
                          {row.map((cell, cellIndex) => (
                            <td key={cellIndex} className="p-2 border-r border-slate-200 last:border-r-0 font-medium">{cell}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* STEP 1: ĐỌC VÀ HIỂU TÌNH HUỐNG THỰC TẾ */}
            {currentStep === 1 && (
              <div className="space-y-3.5">
                {/* Question: What is the optimization goal? */}
                <div className="space-y-2 pt-1">
                  <label className="text-xs font-bold text-slate-800 block">
                    Nhiệm vụ 1: Mục tiêu của người ra quyết định trong bài toán này là gì?
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        invalidateProgressFrom(1);
                        setStep1GoalChoice('max');
                        setStep1Feedback(null);
                      }}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition cursor-pointer text-center ${
                        step1GoalChoice === 'max'
                          ? 'border-purple-600 bg-purple-50 text-purple-900 ring-2 ring-purple-300'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      Tối đa hóa (MAX)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        invalidateProgressFrom(1);
                        setStep1GoalChoice('min');
                        setStep1Feedback(null);
                      }}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition cursor-pointer text-center ${
                        step1GoalChoice === 'min'
                          ? 'border-purple-600 bg-purple-50 text-purple-900 ring-2 ring-purple-300'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      Tối thiểu hóa (MIN)
                    </button>
                  </div>
                </div>

                {step1Feedback && (
                  <div
                    className={`p-3 rounded-xl border text-xs flex items-start gap-2 ${
                      step1Feedback.isCorrect ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-rose-50 border-rose-200 text-rose-900'
                    }`}
                  >
                    {step1Feedback.isCorrect ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" /> : <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />}
                    <span>{step1Feedback.message}</span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2">
                  <div className="text-[11px] text-slate-500 italic">
                    Trả lời đúng để sang Bước 2
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleVerifyStep1}
                      className="px-3.5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition min-h-[44px] cursor-pointer"
                    >
                      Kiểm chứng mục tiêu
                    </button>
                    {completedSteps.has(1) && (
                      <button
                        type="button"
                        onClick={handleNextStep}
                        className="flex items-center gap-1.5 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-xs transition min-h-[44px] cursor-pointer"
                      >
                        <span>Sang Bước 2</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: CHỌN HAI BIẾN X, Y & ĐIỀU KIỆN */}
            {currentStep === 2 && (
              <div className="space-y-3.5">
                <p className="text-xs text-slate-600 leading-relaxed">
                  Thiết lập hai biến quyết định cho bài toán:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="p-3 rounded-xl bg-purple-50/70 border border-purple-200 text-xs">
                    <span className="font-mono font-bold text-purple-900 text-sm">Biến x:</span>
                    <div className="font-bold text-slate-800 mt-1">{variables.x.name}</div>
                    <div className="text-[11px] text-slate-600 mt-0.5">{variables.x.meaning}</div>
                    <div className="text-[10px] text-purple-700 font-semibold mt-1">Đơn vị: {variables.x.unit}</div>
                  </div>

                  <div className="p-3 rounded-xl bg-purple-50/70 border border-purple-200 text-xs">
                    <span className="font-mono font-bold text-purple-900 text-sm">Biến y:</span>
                    <div className="font-bold text-slate-800 mt-1">{variables.y.name}</div>
                    <div className="text-[11px] text-slate-600 mt-0.5">{variables.y.meaning}</div>
                    <div className="text-[10px] text-purple-700 font-semibold mt-1">Đơn vị: {variables.y.unit}</div>
                  </div>
                </div>

                {/* Question: Integer constraint */}
                <div className="space-y-2 pt-1">
                  <label className="text-xs font-bold text-slate-800 block">
                    Nhiệm vụ 2: Biến số x và y trong bài toán thực tế này có bắt buộc phải là số nguyên (x, y ∈ ℕ) hay không?
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        invalidateProgressFrom(2);
                        setStep2IntegerChoice(true);
                        setStep2Feedback(null);
                      }}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition cursor-pointer text-center ${
                        step2IntegerChoice === true
                          ? 'border-purple-600 bg-purple-50 text-purple-900 ring-2 ring-purple-300'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      Bắt buộc là số nguyên (x, y ∈ ℕ)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        invalidateProgressFrom(2);
                        setStep2IntegerChoice(false);
                        setStep2Feedback(null);
                      }}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition cursor-pointer text-center ${
                        step2IntegerChoice === false
                          ? 'border-purple-600 bg-purple-50 text-purple-900 ring-2 ring-purple-300'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      Nhận giá trị thực bất kỳ (x, y ≥ 0)
                    </button>
                  </div>
                </div>

                {step2Feedback && (
                  <div
                    className={`p-3 rounded-xl border text-xs flex items-start gap-2 ${
                      step2Feedback.isCorrect ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-rose-50 border-rose-200 text-rose-900'
                    }`}
                  >
                    {step2Feedback.isCorrect ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" /> : <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />}
                    <span>{step2Feedback.message}</span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2">
                  <button type="button" onClick={handlePrevStep} className="flex items-center gap-1 text-xs font-semibold text-slate-600 min-h-[44px] cursor-pointer">
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Quay lại</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleVerifyStep2}
                      className="px-3.5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition min-h-[44px] cursor-pointer"
                    >
                      Kiểm chứng điều kiện
                    </button>
                    {completedSteps.has(2) && (
                      <button
                        type="button"
                        onClick={handleNextStep}
                        className="flex items-center gap-1.5 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-xs transition min-h-[44px] cursor-pointer"
                      >
                        <span>Sang Bước 3</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: LẬP HỆ BẤT PHƯƠNG TRÌNH RÀNG BUỘC */}
            {currentStep === 3 && (
              <div className="space-y-3.5">
                <p className="text-xs text-slate-600 leading-relaxed">
                  Dựa vào đề bài và bảng số liệu phía trên, tự lập các bất phương trình ràng buộc và viết hàm mục tiêu. Chưa chắc thì mở Gợi ý Socrates theo từng cấp.
                </p>

                <div className="flex flex-col gap-2">
                  {system.map((ineq, idx) => (
                    <div
                      key={ineq.id}
                      className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2"
                    >
                      <label htmlFor={`constraint-${ineq.id}`} className="font-bold text-slate-800 flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: ineq.color }} />
                        Ràng buộc ({idx + 1})
                      </label>
                      <input
                        id={`constraint-${ineq.id}`}
                        type="text"
                        value={step3ConstraintInputs[ineq.id] || ''}
                        onChange={event => handleStep3InputChange(() =>
                          setStep3ConstraintInputs(previous => ({ ...previous, [ineq.id]: event.target.value }))
                        )}
                        placeholder="Tự nhập bất phương trình"
                        aria-label={`Bất phương trình ràng buộc ${idx + 1}`}
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-sm text-slate-900 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                      />
                      {step3Complete && (
                        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-emerald-800">
                          <span>Đường biên: <strong className="font-mono">{formatBoundaryLine(ineq.a, ineq.b, ineq.c)}</strong></span>
                          <span className="font-mono">{formatInequality(ineq)}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="p-3 rounded-xl bg-purple-50/70 border border-purple-200 text-xs space-y-2">
                  <label htmlFor="objective-function-input" className="font-bold text-purple-900 block">
                    Hàm mục tiêu · nhập biểu thức theo x và y
                  </label>
                  <input
                    id="objective-function-input"
                    type="text"
                    value={step3ObjectiveInput}
                    onChange={event => handleStep3InputChange(() => setStep3ObjectiveInput(event.target.value))}
                    placeholder="Ví dụ dạng: ax + by"
                    aria-label="Biểu thức hàm mục tiêu"
                    className="w-full rounded-lg border border-purple-200 bg-white px-3 py-2 font-mono text-sm text-slate-900 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                  />
                  <p className="text-[11px] text-slate-600">
                    Dùng {objective.name.toLowerCase()} của mỗi đơn vị trong bảng làm hệ số; mục tiêu {objective.goal === 'max' ? 'tối đa hóa' : 'tối thiểu hóa'} đã xác định ở Bước 1.
                  </p>
                  {step3Complete && (
                    <p className="font-mono font-extrabold text-emerald-800">
                      {objective.label} → {objective.goal.toUpperCase()} ({objective.unit})
                    </p>
                  )}
                </div>

                {step3Feedback && (
                  <div className={`p-3 rounded-xl border text-xs ${
                    step3Feedback.isCorrect
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                      : 'bg-amber-50 border-amber-200 text-amber-950'
                  }`} role="status">
                    {step3Feedback.message}
                  </div>
                )}

                <div className="flex items-center justify-between pt-2">
                  <button type="button" onClick={handlePrevStep} className="flex items-center gap-1 text-xs font-semibold text-slate-600 min-h-[44px] cursor-pointer">
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Quay lại</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleVerifyStep3}
                      className="px-3.5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition min-h-[44px] cursor-pointer"
                    >
                      Kiểm chứng mô hình
                    </button>
                    {step3Complete && (
                      <button
                        type="button"
                        onClick={handleNextStep}
                        className="flex items-center gap-1.5 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-xs transition min-h-[44px] cursor-pointer"
                      >
                        <span>Sang Bước 4</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: BIỂU DIỄN MIỀN PHƯƠNG ÁN KHẢ THI */}
            {currentStep === 4 && (
              <div className="space-y-3.5">
                <p className="text-xs text-slate-600 leading-relaxed">
                  Quan sát phần tô màu trên đồ thị. Miền phương án khả thi có phần chung nào, và miền đó có bị chặn không?
                </p>

                <div className="space-y-2" role="group" aria-label="Phân loại miền phương án khả thi">
                  {[
                    { id: 'bounded', label: 'Có miền nghiệm và bị chặn' },
                    { id: 'unbounded', label: 'Có miền nghiệm nhưng kéo dài vô hạn' },
                    { id: 'empty', label: 'Không có điểm nào thỏa mãn đồng thời các ràng buộc' }
                  ].map(choice => (
                    <button
                      key={choice.id}
                      type="button"
                      onClick={() => {
                        invalidateProgressFrom(4);
                        setStep4RegionChoice(choice.id as 'bounded' | 'unbounded' | 'empty');
                        setStep4Feedback(null);
                        setStep4Complete(false);
                      }}
                      aria-pressed={step4RegionChoice === choice.id}
                      className={`w-full rounded-xl border px-3 py-2.5 text-left text-xs font-semibold transition ${
                        step4RegionChoice === choice.id
                          ? 'border-purple-500 bg-purple-50 text-purple-900 ring-2 ring-purple-200'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-purple-300 hover:bg-purple-50/40'
                      }`}
                    >
                      {choice.label}
                    </button>
                  ))}
                </div>

                {step4Feedback && (
                  <div className={`rounded-xl border p-3 text-xs ${
                    step4Feedback.isCorrect
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
                      : 'border-amber-200 bg-amber-50 text-amber-950'
                  }`} role="status">
                    {step4Feedback.message}
                  </div>
                )}

                {step4Complete && (
                  <div className="rounded-xl border border-purple-200 bg-purple-50 p-3.5 text-xs text-purple-950 space-y-1.5">
                    <div className="flex items-center gap-1.5 font-bold text-purple-900">
                      <Layers className="h-4 w-4 text-purple-600" />
                      Đặc điểm miền phương án
                    </div>
                    <p className="leading-relaxed">
                      {result.regionType === 'bounded_polygon'
                        ? `Miền khả thi là đa giác lồi bị chặn, có ${vertexEvaluations.length} đỉnh.`
                        : result.regionType === 'unbounded' || result.regionType === 'degenerate_line'
                        ? `Miền phương án kéo dài vô hạn; có ${vertexEvaluations.length} đỉnh hữu hạn cần xét.`
                        : `Miền phương án khả thi rỗng hoặc suy biến; số đỉnh hữu hạn là ${vertexEvaluations.length}.`}
                    </p>
                  </div>
                )}

                <div className="xl:hidden">
                  <button
                    type="button"
                    onClick={() => setMobileStepView('graph')}
                    className="w-full py-2.5 px-3 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-900 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    <span>Mở xem Đồ thị Miền Khả Thi</span>
                  </button>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button type="button" onClick={handlePrevStep} className="flex items-center gap-1 text-xs font-semibold text-slate-600 min-h-[44px] cursor-pointer">
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Quay lại</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleVerifyStep4}
                      className="rounded-xl bg-slate-900 px-3.5 py-2.5 text-xs font-bold text-white transition hover:bg-slate-800"
                    >
                      Kiểm chứng
                    </button>
                    {step4Complete && (
                      <button
                        type="button"
                        onClick={handleNextStep}
                        className="flex min-h-[44px] items-center gap-1.5 rounded-xl bg-purple-600 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-purple-700"
                      >
                        Sang Bước 5
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 5: XÁC ĐỊNH CÁC ĐỈNH & PHƯƠNG ÁN ỨNG VIÊN */}
            {currentStep === 5 && (
              <div className="space-y-3.5">
                <p className="text-xs text-slate-600 leading-relaxed">
                  Đếm số đỉnh của miền trên đồ thị rồi nhập kết quả. Đỉnh là giao điểm trên biên thỏa mãn đồng thời các ràng buộc.
                </p>

                <label className="block space-y-1.5 text-xs font-bold text-slate-800">
                  Số đỉnh em đếm được
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={step5VertexCountInput}
                    onChange={event => {
                      invalidateProgressFrom(5);
                      setStep5VertexCountInput(event.target.value);
                      setStep5Feedback(null);
                      setStep5Complete(false);
                    }}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-sm font-normal text-slate-900 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                  />
                </label>

                {step5Feedback && (
                  <div className={`rounded-xl border p-3 text-xs ${
                    step5Feedback.isCorrect
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
                      : 'border-amber-200 bg-amber-50 text-amber-950'
                  }`} role="status">
                    {step5Feedback.message}
                  </div>
                )}

                {step5Complete && (
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      {vertexEvaluations.map(ve => (
                        <button
                          key={ve.label}
                          type="button"
                          onMouseEnter={() => setHighlightVertex(ve.vertex)}
                          onMouseLeave={() => setHighlightVertex(null)}
                          onClick={() => {
                            setHighlightVertex(ve.vertex);
                            setKValue(ve.value);
                          }}
                          className="flex items-center justify-between rounded-xl border border-slate-300 bg-slate-50 p-2.5 text-left font-mono text-xs font-bold text-purple-950 shadow-2xs transition hover:border-purple-500 hover:bg-purple-50"
                        >
                          <span>Đỉnh {ve.label}{formatPointCoord(ve.vertex)}</span>
                          <span className="rounded bg-purple-100 px-1.5 py-0.5 font-sans text-[10px] font-semibold text-purple-700">Soi đỉnh</span>
                        </button>
                      ))}
                    </div>
                    {scenario.integerRequired && (
                      <p className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-relaxed text-amber-950">
                        Với mô hình nguyên, trên đồ thị còn có các điểm nguyên không âm nằm trong miền khả thi.
                      </p>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between pt-2">
                  <button type="button" onClick={handlePrevStep} className="flex items-center gap-1 text-xs font-semibold text-slate-600 min-h-[44px] cursor-pointer">
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Quay lại</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleVerifyStep5}
                      className="rounded-xl bg-slate-900 px-3.5 py-2.5 text-xs font-bold text-white transition hover:bg-slate-800"
                    >
                      Kiểm chứng
                    </button>
                    {step5Complete && (
                      <button
                        type="button"
                        onClick={handleNextStep}
                        className="flex min-h-[44px] items-center gap-1.5 rounded-xl bg-purple-600 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-purple-700"
                      >
                        Sang Bước 6
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 6: TỐI ƯU HÓA HÀM MỤC TIÊU (LEVEL CURVE & PREDICTION) */}
            {currentStep === 6 && (
              <div className="space-y-3.5">
                <p className="text-xs text-slate-600 leading-relaxed">
                  Tự tính giá trị hàm mục tiêu tại các đỉnh trong <strong>Bảng tính bên dưới</strong> hoặc kéo <strong>thanh trượt đường mức k</strong> trên đồ thị, sau đó dự đoán đỉnh đạt cực trị liên tục:
                </p>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-800 block">
                    Nhiệm vụ 6: Trên miền liên tục, hàm mục tiêu {objective.label} đạt {objective.goal.toUpperCase()} tại đỉnh nào?
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {vertexEvaluations.map(ve => (
                      <button
                        key={ve.label}
                        type="button"
                        onClick={() => {
                          setPredictedOptVertex(ve.label);
                          setHighlightVertex(ve.vertex);
                        }}
                        className={`p-2.5 rounded-xl border text-xs font-mono font-bold transition cursor-pointer text-center ${
                          predictedOptVertex === ve.label
                            ? 'border-purple-600 bg-purple-50 text-purple-900 ring-2 ring-purple-300'
                            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {ve.label}
                        {formatPointCoord(ve.vertex)}
                      </button>
                    ))}
                  </div>
                </div>

                {step6Feedback && (
                  <div
                    className={`p-3 rounded-xl border text-xs flex items-start gap-2 ${
                      step6Feedback.isCorrect ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-rose-50 border-rose-200 text-rose-900'
                    }`}
                  >
                    {step6Feedback.isCorrect ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" /> : <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />}
                    <span className="leading-relaxed">{step6Feedback.message}</span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2">
                  <button type="button" onClick={handlePrevStep} className="flex items-center gap-1 text-xs font-semibold text-slate-600 min-h-[44px] cursor-pointer">
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Quay lại</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleVerifyStep6}
                      className="px-3.5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition min-h-[44px] cursor-pointer"
                    >
                      Kiểm chứng đỉnh tối ưu
                    </button>
                    {completedSteps.has(6) && (
                      <button
                        type="button"
                        onClick={handleNextStep}
                        className="flex items-center gap-1.5 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-xs transition min-h-[44px] cursor-pointer"
                      >
                        <span>Sang Bước 7 (Kết luận)</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 7: KẾT LUẬN THỰC TIỄN & BÀI HỌC TỐI ƯU */}
            {currentStep === 7 && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-purple-50/90 border border-purple-200 text-purple-950 text-xs space-y-2.5">
                  <div className="flex items-center gap-2 font-bold text-sm text-purple-900">
                    <Award className="w-5 h-5 text-purple-600 shrink-0" />
                    <span>Bản Kết Luận Thực Tiễn Chuẩn SGK Toán 10</span>
                  </div>

                  <p className="leading-relaxed font-medium whitespace-pre-wrap text-slate-800">
                    {result.practicalAnswer}
                  </p>

                  <div className="p-2.5 rounded-lg bg-white/80 border border-purple-200 font-mono text-[11px] text-purple-900 space-y-1">
                    <div>
                      • Cực trị mô hình liên tục: {objective.label} ={' '}
                      <strong>
                        {optimalValue !== null ? formatValueWithApprox(optimalValue) : 'Không đạt'} {objective.unit}
                      </strong>{' '}
                      tại{' '}
                      <strong>
                        {vertexEvaluations
                          .filter(ve => ve.isOptimal)
                          .map(ve => `${ve.label}${formatPointCoord(ve.vertex)}`)
                          .join(', ') || optimalPoints.map(p => formatPointCoord(p)).join(', ')}
                      </strong>
                      .
                    </div>
                    {scenario.integerRequired && integerOptimalPoint && integerOptimalValue !== null && (
                      <div className="text-rose-800">
                        • Phương án nguyên tối ưu (x, y ∈ ℕ):{' '}
                        <strong>
                          ({integerOptimalPoint.x}; {integerOptimalPoint.y})
                        </strong>{' '}
                        đạt{' '}
                        <strong>
                          {formatValueWithApprox(integerOptimalValue)} {objective.unit}
                        </strong>
                        .
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={handleCopyConclusion}
                    className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 font-semibold text-xs text-slate-700 flex items-center justify-center gap-1.5 shadow-xs transition min-h-[44px] cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5 text-purple-600" />
                    <span>Sao chép kết luận</span>
                  </button>

                  <button
                    type="button"
                    onClick={onSwitchToSandbox}
                    className="p-2.5 rounded-xl border border-purple-200 bg-purple-50 hover:bg-purple-100 font-semibold text-xs text-purple-800 flex items-center justify-center gap-1.5 transition min-h-[44px] cursor-pointer"
                  >
                    <Compass className="w-3.5 h-3.5 text-purple-600" />
                    <span>Khám phá tự do</span>
                  </button>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentStep(1);
                      setCompletedSteps(new Set());
                      setStep1GoalChoice(null);
                      setStep1Feedback(null);
                      setStep2IntegerChoice(null);
                      setStep2Feedback(null);
                      setPredictedOptVertex(null);
                      setStep6Feedback(null);
                    }}
                    className="flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-purple-600 min-h-[44px] cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Làm lại từ Bước 1</span>
                  </button>

                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="flex items-center gap-1 text-xs font-semibold text-slate-600 min-h-[44px] cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Xem lại Bước 6</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* CENTER COLUMN: Interactive Optimization Graph Canvas */}
        <div
          className={`flex flex-col gap-3 order-2 xl:col-span-7 ${
            mobileStepView === 'graph' || mobileStepView === 'all' ? 'flex' : 'hidden xl:flex'
          }`}
        >
          <div className="bg-white rounded-2xl border border-slate-200 p-3 sm:p-4 shadow-xs">
            <OptimizationGraphCanvas
              scenario={scenario}
              result={result}
              kValue={kValue}
              onKValueChange={setKValue}
              showLevelCurve={currentStep >= 4}
              showIntegerPoints={scenario.integerRequired && currentStep >= 5}
              showOptimalPoint={canRevealOptimal}
              revealOptimalAnswers={canRevealOptimal}
              highlightVertex={highlightVertex}
              onHighlightVertex={setHighlightVertex}
              isPresentationMode
            />
          </div>
        </div>
      </div>

      {/* 4. BOTTOM SECTION: VERTEX OBJECTIVE CALCULATION TABLE */}
      {currentStep >= 6 && (
        <div
          className={`mt-1 w-full ${
            mobileStepView === 'table' || mobileStepView === 'all' ? 'block' : 'hidden xl:block'
          }`}
        >
          <VertexObjectiveTable
            scenario={scenario}
            result={result}
            onHighlightVertex={setHighlightVertex}
            onSelectKValue={setKValue}
            defaultRevealed={currentStep >= 7}
            finalResultsUnlocked={currentStep >= 7}
          />
        </div>
      )}
    </div>
  );
};

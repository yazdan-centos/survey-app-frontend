import React from "react";
import styled, { keyframes } from "styled-components";

// ── Tokens ──────────────────────────────────────────────────────────────────
const tokens = {
  navy900: "#0c1445",
  navy700: "#1e3a8a",
  navy500: "#3b82f6",
  navy200: "#bfdbfe",
  navy100: "#dbeafe",
  navy50: "#eff6ff",
  violet500: "#8b5cf6",
  violet100: "#ede9fe",
  violet50: "#f5f3ff",
  rose500: "#f43f5e",
  rose100: "#ffe4e6",
  rose50: "#fff1f2",
  slate700: "#334155",
  slate600: "#475569",
  slate500: "#64748b",
  slate200: "#e2e8f0",
  white: "#ffffff",
};

// ── Animations ───────────────────────────────────────────────────────────────
const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
`;

// ── Styled Components ─────────────────────────────────────────────────────────
const Wrapper = styled.div`
  direction: rtl;
  font-family: "Vazirmatn", "IRANSans", Tahoma, sans-serif;
  background: ${tokens.white};
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`;

const Header = styled.header`
  background: linear-gradient(135deg, ${tokens.navy900} 0%, ${tokens.navy700} 100%);
  padding: 2.5rem 3rem 2rem;
  position: relative;
  overflow: hidden;

  &::after {
    content: "۱۴۱۰";
    position: absolute;
    left: 2rem;
    top: 50%;
    transform: translateY(-50%);
    font-size: 5rem;
    font-weight: 900;
    color: ${tokens.white};
    opacity: 0.06;
    letter-spacing: -0.05em;
    pointer-events: none;
    user-select: none;
  }
`;

const Tag = styled.span`
  display: inline-block;
  background: ${tokens.violet50};
  color: ${tokens.violet500};
  border: 1px solid ${tokens.violet100};
  border-radius: 4px;
  padding: 0.2rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 600;
  margin-bottom: 1rem;
`;

const Title = styled.h1`
  color: ${tokens.white};
  font-size: clamp(1.3rem, 3vw, 1.9rem);
  font-weight: 700;
  margin: 0 0 0.5rem;
  line-height: 1.35;
`;

const Subtitle = styled.p`
  color: ${tokens.navy200};
  font-size: 0.88rem;
  margin: 0;
  opacity: 0.9;
`;

const Body = styled.main`
  flex: 1;
  max-width: 780px;
  width: 100%;
  margin: 0 auto;
  padding: 2.5rem 2rem;
  animation: ${fadeUp} 0.5s ease both;
`;

const Paragraph = styled.p`
  font-size: 0.91rem;
  line-height: 1.9;
  color: ${tokens.slate700};
  margin: 0 0 0.85rem;
`;

const TimelineWrapper = styled.div`
  display: flex;
  gap: 0;
  margin: 1.5rem 0;
  position: relative;
`;

const TimelineItem = styled.div`
  flex: 1;
  background: ${({ active }) => (active ? tokens.navy50 : tokens.white)};
  border: 1px solid ${({ active }) => (active ? tokens.navy200 : tokens.slate200)};
  border-radius: 8px;
  padding: 0.9rem 1rem;
  position: relative;
  margin-left: 0.5rem;

  &:last-child {
    margin-left: 0;
  }
`;

const TimelineYear = styled.div`
  font-size: 1rem;
  font-weight: 700;
  color: ${({ active }) => (active ? tokens.navy700 : tokens.slate500)};
  margin-bottom: 0.25rem;
`;

const TimelineLabel = styled.div`
  font-size: 0.78rem;
  color: ${tokens.slate600};
  line-height: 1.5;
`;

const SectionTitle = styled.h2`
  font-size: 1rem;
  font-weight: 700;
  color: ${tokens.navy700};
  border-right: 3px solid ${tokens.navy500};
  padding-right: 0.75rem;
  margin: 2rem 0 1rem;
`;

const Dimensions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.55rem;
  margin: 1rem 0;
`;

const Dim = styled.span`
  background: ${tokens.navy50};
  color: ${tokens.navy700};
  border: 1px solid ${tokens.navy100};
  border-radius: 6px;
  padding: 0.3rem 0.85rem;
  font-size: 0.82rem;
  font-weight: 600;
`;

const GuideSteps = styled.ol`
  margin: 1rem 0;
  padding: 0;
  list-style: none;
  counter-reset: steps;
`;

const GuideStep = styled.li`
  display: flex;
  gap: 1rem;
  align-items: flex-start;
  margin-bottom: 0.85rem;
  counter-increment: steps;

  &::before {
    content: counter(steps);
    flex-shrink: 0;
    width: 1.75rem;
    height: 1.75rem;
    background: ${tokens.navy700};
    color: ${tokens.white};
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.78rem;
    font-weight: 700;
    margin-top: 0.1rem;
  }
`;

const StepText = styled.span`
  font-size: 0.88rem;
  line-height: 1.8;
  color: ${tokens.slate700};
`;

const AlertBox = styled.div`
  background: ${tokens.violet50};
  border: 1px solid ${tokens.violet100};
  border-radius: 8px;
  padding: 1rem 1.25rem;
  font-size: 0.88rem;
  color: ${tokens.slate700};
  line-height: 1.8;

  strong {
    color: ${tokens.violet500};
  }
`;

const Divider = styled.hr`
  border: none;
  border-top: 1px solid ${tokens.slate200};
  margin: 1.75rem 0;
`;

const Footer = styled.footer`
  text-align: center;
  font-size: 0.8rem;
  color: ${tokens.slate500};
  padding: 1.5rem 2rem;
  border-top: 1px solid ${tokens.slate200};
`;

const ContinueButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  margin-top: 1.5rem;
  border: 0;
  border-radius: 8px;
  background: ${tokens.navy700};
  color: ${tokens.white};
  padding: 0.85rem 1.5rem;
  font: inherit;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 160ms ease, transform 160ms ease;

  &:hover {
    background: ${tokens.navy900};
    transform: translateY(-1px);
  }

  &:focus-visible {
    outline: 2px solid ${tokens.navy500};
    outline-offset: 3px;
  }
`;

// ── Data ─────────────────────────────────────────────────────────────────────
const dimensions = [
  "تمرکز بر مشتری",
  "منابع و قابلیت‌ها",
  "چشم‌انداز استراتژیک",
  "ارزش‌آفرینی",
  "تمرکز بر کیفیت",
];

const steps = [
  "شرکت را به‌عنوان یک مجموعه یکپارچه و در سطح کلان در نظر بگیرید.",
  "مصادیق هر چهار سطح از هر معیار را به دقت مطالعه کنید.",
  "نزدیک‌ترین سطح به وضعیت واقعی امروز شرکت را بر اساس شناخت و شواهد موجود انتخاب نمایید.",
  "آنچه مبنای قضاوت است، وضعیت و عملکرد فعلی است؛ نه برنامه‌ها یا اهداف آینده.",
];

// ── Component ─────────────────────────────────────────────────────────────────
export default function ManagerGuide({ onContinue }) {
  return (
    <Wrapper>
      <Header>
        <Tag>معاونین و مدیران</Tag>
        <Title>پیمایش ارزیابی شرکت در کلاس جهانی</Title>
        <Subtitle>معاونت سیستم‌ها و برنامه‌ریزی راهبردی</Subtitle>
      </Header>

      <Body>
        <Paragraph>
          با توجه به چشم‌انداز شرکت در افق ۱۴۱۰، حرکت به سوی کلاس جهانی
          مستلزم آن است که در مقاطع مختلف، وضعیت شرکت در برابر ویژگی‌ها و
          الزامات چنین سازمانی مورد بازنگری قرار گیرد.
        </Paragraph>

        <TimelineWrapper>
          <TimelineItem>
            <TimelineYear>۱۴۰۰</TimelineYear>
            <TimelineLabel>نخستین پیمایش کلاس جهانی</TimelineLabel>
          </TimelineItem>
          <TimelineItem active>
            <TimelineYear active>امروز</TimelineYear>
            <TimelineLabel>پیمایش دوم — سنجش تغییرات</TimelineLabel>
          </TimelineItem>
          <TimelineItem>
            <TimelineYear>۱۴۱۰</TimelineYear>
            <TimelineLabel>چشم‌انداز کلاس جهانی</TimelineLabel>
          </TimelineItem>
        </TimelineWrapper>

        <Paragraph>
          پیمایش حاضر با هدف ارزیابی وضعیت امروز شرکت و سنجش تغییرات ایجاد
          شده طی این سال‌ها انجام می‌شود — اینکه در کدام حوزه‌ها توانمندی
          ارتقا یافته، در کدام زمینه‌ها فاصله وجود دارد و در کجا نیازمند توجه
          بیشتری هستیم.
        </Paragraph>

        <Paragraph>
          پرسشنامه پیش‌رو، وضعیت شرکت را در پنج بُعد اصلی مورد ارزیابی قرار
          می‌دهد:
        </Paragraph>

        <Dimensions>
          {dimensions.map((d) => (
            <Dim key={d}>{d}</Dim>
          ))}
        </Dimensions>

        <Divider />

        <SectionTitle>راهنمای ارزیابی</SectionTitle>

        <Paragraph>
          برای هر معیار، چهار سطح عملکرد تعریف شده و مصادیق و نشانه‌های قابل
          مشاهده هر سطح ارائه شده است. مبنای ارزیابی، میزان انطباق عملکرد و
          قابلیت‌های موجود شرکت با این مصادیق است.
        </Paragraph>

        <GuideSteps>
          {steps.map((step, i) => (
            <GuideStep key={i}>
              <StepText>{step}</StepText>
            </GuideStep>
          ))}
        </GuideSteps>

        <AlertBox>
          <strong>یادآوری:</strong> در این ارزیابی، وضعیت موجود و عملکرد واقعی
          شرکت مدنظر است. در مواردی که امکان ارزیابی وجود ندارد، گزینه
          «اطلاعات کافی برای ارزیابی ندارم» قابل انتخاب است.
        </AlertBox>

        <Divider />

        <Paragraph style={{ textAlign: "center", color: tokens.slate500 }}>
          از مشارکت و دیدگاه ارزشمند شما سپاسگزاریم.
        </Paragraph>

        <ContinueButton type="button" onClick={onContinue}>
          شروع پیمایش
        </ContinueButton>
      </Body>

      <Footer>معاونت سیستم‌ها و برنامه‌ریزی راهبردی</Footer>
    </Wrapper>
  );
}
